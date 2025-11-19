import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { GoogleOAuthProvider,GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode"

const Login = () => {

  const { backendUrl, token, setToken } = useContext(AppContext)
  const navigate = useNavigate()
  const [state, setState] = useState('Sign Up')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const DisplayMessage = (message, type = 'error') => {
      if (type === 'error') {
          toast.error(message);
      } else {
          toast.success(message);
      }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {

      if(state === 'Sign Up'){
        const {data} = await axios.post(backendUrl + '/api/auth/register', {name,email,password})
        if(data.success){
          localStorage.setItem('token',data.token)
          setToken(data.token)
        }else {
          toast.error(data.message)
        }
      }else {


        const {data} = await axios.post(backendUrl + '/api/auth/login', {email,password})
        if(data.success){
          localStorage.setItem('token',data.token)
          setToken(data.token)
        }else {
          toast.error(data.message)
        }

      }
      
    } catch (error) {
      toast.error(error.message)
      
    }


  }

  const handleLoginSuccess = async (credentialResponse) => {

    // 1. Get the Google ID Token
    const idToken = credentialResponse.credential;
    
    // Optional: Decode and log user data for debugging
    try {
        const user = jwtDecode(idToken);
        console.log('Login Success! Decoded Google User Data:', user);
    } catch (e) {
        console.error('Error decoding JWT:', e);
        toast.error("Google authentication failed.");
        return; 
    }

    // 2. Send the ID Token to the Backend
    try {
        const url = `${backendUrl}/api/auth/google-verify`; // Ensure this is your correct backend endpoint
        
        const response = await axios.post(url, { 
            idToken: idToken 
        });

        const data = response.data;

        // 3. Handle Backend Response
        if (data.success) {
            // Your backend should return its own token (JWT or session ID)
            localStorage.setItem('token', data.token); 
            setToken(data.token); // Update state
            toast.success(data.message || "Google login successful!");
            // Navigate to the protected route
        } else {
            // Backend failed verification or registration
            toast.error(data.message || "Google authentication failed on server.");
        }
    } catch (error) {
        console.error('Error sending token to backend:', error);
        // Display a user-friendly error
        toast.error("An error occurred during Google sign-in. Please try again.");
    }
     
    };

  useEffect(()=> {
    if(token){

      navigate('/')

    }
  })


  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up'? "Create Account" : "Login"}</p>
        <p>Please {state === 'Sign Up'? "sign up" : "log in"} to book appointment</p>
        {
          state === 'Sign Up' && <div className='w-full'>
          <p>Full Name</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="text" onChange={(e)=> setName(e.target.value)} value={name} required />
        </div>
        }
        
        <div className='w-full'>
          <p>Email</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="email" onChange={(e)=> setEmail(e.target.value)} value={email}  required/>
        </div>
        <div className='w-full'>
          <p>Password</p>
          <input className='border border-zinc-300 rounded w-full p-2 mt-1' type="password" onChange={(e)=> setPassword(e.target.value)} value={password} required />
        </div>
        <button type='submit' className='bg-primary text-white w-full py-2 rounded-md text-base'>{state === 'Sign Up'? "Create Account" : "Login"}</button>
        {
          state === "Sign Up"?
          <p>Already have an account? <span onClick={()=> setState('Login')} className='text-primary underline cursor-pointer'>Login here</span> </p>
          : <p>Create a new account? <span onClick={()=> setState('Sign Up')} className='text-primary underline cursor-pointer'>click here</span></p>
        }

        <div className="mt-4 text-center text-sm">
          <span>or login with</span>
        </div>

        {/* <div className="flex justify-center mt-2">
          <GoogleLogin onSuccess={handleGoogleLogin} onError={() => DisplayMessage("Google login failed", "error")} />
        </div> */}
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <div className="App">
                <h2>Login with Google</h2>
                <GoogleLogin
                    onSuccess={handleLoginSuccess}
                    onError={() => DisplayMessage("Google login failed", "error")}
                    useOneTap
                />
                {/* <button onClick={() => googleLogout()}>Logout</button> */}
            </div>
        </GoogleOAuthProvider>

      </div>
    </form>
  )
}

export default Login