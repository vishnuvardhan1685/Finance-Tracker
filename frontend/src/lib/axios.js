import axios from 'axios';

// In production, frontend is served from same domain as backend
// So we can use relative URLs (/api)
// In development, use VITE_API_URL or fallback to /api (handled by Vite proxy)
const baseURL = import.meta.env.VITE_API_URL || '/api';

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
})

export default axiosInstance;