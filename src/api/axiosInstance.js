import axios from "axios";

const getToken = () => localStorage.getItem("token")

const API = axios.create({
    baseURL: "http://localhost:3000/api/v1",
});

API.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default API;
