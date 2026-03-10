import API from "./axiosInstance";

export const addToHistory = (id, type) => API.post(`/history/add/${id}/${type}`);

export const getWatchHistory = () => API.get('/history');

export const removeFromHistory = (id, type) => API.delete(`/history/remove/${id}/${type}`);

export const clearAllHistory = () => API.delete('/history/clear');

// Sync watch progress to backend (future endpoint)
export const updateWatchProgress = (id, type, progressData) =>
    API.post(`/history/progress/${id}/${type}`, progressData);
