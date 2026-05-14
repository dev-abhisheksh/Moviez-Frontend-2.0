import API from "./axiosInstance";

export { API };

export const getTrendingMedia = (type = 'movie') => API.get(`/media/trending/${type}`);

// Fetch Search Results (Merged TMDB + Admin)
export const searchMedia = (query) => API.get(`/media/search?q=${query}`);

// Fetch Trailer
export const getMediaTrailer = (type, id) => API.get(`/media/trailer/${type}/${id}`);

// Fetch Single Details — type is 'movie', 'tv', or 'admin'
export const getMediaDetails = (id, type = 'movie') => API.get(`/media/${type}/${id}`);

// Fetch Cast / Credits
export const getMovieCredits = (type, id) => API.get(`/media/credits/${type}/${id}`);

// Fetch Recommendations (TMDB-powered)
export const getRecommendations = (type, id) => API.get(`/media/recommendations/${type}/${id}`);

// Admin
export const createMediaAdmin = (formData) => API.post('/media/admin/create', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Airing Anime
export const getAiringAnime = (page = 1) => API.get(`/media/anime/airing?page=${page}`);