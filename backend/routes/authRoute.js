import express from 'express';
// Import the core authentication functions from the new controller
import { registerUser, loginUser, googleVerify } from '../controllers/authController.js'; 


const authRouter = express.Router();

// 1. Traditional Auth Routes
authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);

// 2. Google OAuth Route (Token Verification)
// Note: We rename it to 'google-verify' to reflect its purpose.
authRouter.post('/google-verify', googleVerify); 


export default authRouter;