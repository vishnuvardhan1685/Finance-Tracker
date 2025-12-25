import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}`
    : '/api';

const axiosInstance = axios.create({
        baseURL,
    withCredentials: true,
})

export default axiosInstance;