import axios from "axios";

const getToken = () => localStorage.getItem("token")

const API = axios.create({
    baseURL: "https://moviez-backend-yc5w.onrender.com/api/v1",
});

API.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default API;
