import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import {toast} from 'react-toastify'



export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = '$'
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    
    
    const [doctors,setDoctors] = useState([])
    const [token,setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):false)
    const [userData, setUserData] = useState(false)
    

    const getDoctorsData = async () => {

        try {

            const {data} = await axios.get(backendUrl + '/api/doctor/list')
        if(data.success){
            setDoctors(data.doctors)
        }else {
            toast.error(data.message)
        }
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
            
        }


    }

    const loadUserProfileData = async () => {
        try {

            const {data} = await axios.get(backendUrl + '/api/user/get-profile',{headers:{token}})
            if(data.success){
                setUserData(data.userData)
                
            }else {
                toast.error(data.message)
            }

            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }


   
    const logout = async () => {
        try {
            
            // 2. Clear local token (needed for traditional Auth)
            localStorage.removeItem('token'); 

            setToken(false);
            setUserData(false);
            toast.success('Logged out successfully.');

        } catch (error) {
            console.error('Logout failed:', error);
            toast.error('Logout failed.');
        }
    };
    // === END: NEW FUNCTION FOR UNIFIED LOGOUT ===

    const value = {
        doctors,getDoctorsData,
        currencySymbol,
        token,setToken,
        backendUrl,
        userData,setUserData,
        loadUserProfileData,
        logout,
    }

    

    useEffect(() => {
        getDoctorsData()
    },[])

    useEffect(()=> {

        if(token){
            loadUserProfileData()
        }else {
        setUserData(false)
        }

    },[token])

   

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider