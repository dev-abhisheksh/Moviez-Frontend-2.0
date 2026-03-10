import API from "./axiosInstance";

export const addToHistory = (id, type) => API.post(`/history/add/${id}/${type}`);

export const getWatchHistory = () => API.get('/history');

// Sync watch progress to backend (future endpoint)
export const updateWatchProgress = (id, type, progressData) =>
    API.post(`/history/progress/${id}/${type}`, progressData);
