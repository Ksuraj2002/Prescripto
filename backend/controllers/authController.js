import { OAuth2Client } from 'google-auth-library';
import UserModel from '../models/userModel.js'
import jwt from 'jsonwebtoken';
import validator from 'validator'
import bcrypt from 'bcrypt'
// Assuming your utility functions are defined elsewhere
// import { hashPassword, comparePassword } from '../utils/authUtils.js'; 

// Initialize Google OAuth2 Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Placeholder for your existing JWT creation function
const createToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// --- 1. Traditional Registration (Logic from your original userController) ---
const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.json({ success: false, message: "Missing Details" })
        }

        // validating email format

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "enter a valid email" })
        }

        // validating strong password

        if (password.length < 8) {
            return res.json({ success: false, message: "enter a strong password" })
        }

        // hashing user password

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newUser = new UserModel(userData)

        const user = await newUser.save()

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })





    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })

    }
}

// --- 2. Traditional Login (Logic from your original userController) ---
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body
        const user = await UserModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: 'User does not exist' })


        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid Credentials" })
        }


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}
// --- 3. Google Token Verification (The new logic) ---
const googleVerify = async (req, res) => {
    try {
        const { idToken } = req.body;
        // ... (Verification and Database logic as provided before) ...
        if (!idToken) {
            return res.status(400).json({ success: false, message: 'Google ID Token is missing.' });
        }

        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const googleId = payload['sub']; 
        const email = payload['email'];
        const name = payload['name'];
        
        
        if (!email) {
            return res.status(400).json({ success: false, message: 'Google profile missing email.' });
        }

        let user = await UserModel.findOne({ googleId });

        if (!user) {
            user = await UserModel.findOne({ email });

            if (user) {
                user.googleId = googleId;
                user.isGoogleUser = true;
                await user.save();
            } else {
                const newUser = new UserModel({
                    name:  name,
                    email: email,
                    googleId: googleId,
                    isGoogleUser: true,
                    
                });
                user = await newUser.save();
            }
        }
        
        const token = createToken(user._id);

        return res.json({ 
            success: true, 
            message: 'Google login successful!',
            token: token,
        });

    } catch (error) {
        console.error('Google Token Verification Error:', error);
        return res.status(500).json({ success: false, message: 'Token verification failed on the server.' });
    }
}

export {registerUser, loginUser, googleVerify}