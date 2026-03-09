import API from "./axiosInstance";

export const toggleFavourite = (id, type) => API.post(`/favourite/add/${id}/${type}`);

export const getFavourites = () => API.get('/favourite');

export const checkFavouriteStatus = (id, type) => API.get(`/favourite/status/${id}/${type}`);
