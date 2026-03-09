import API from "./axiosInstance";

export const addToHistory = (id, type) => API.post(`/history/add/${id}/${type}`);

export const getWatchHistory = () => API.get('/history');
