import API from "./axiosInstance";

// ─── Media Management ───
export const getAllMedia = () => API.get("/media/");

export const createMedia = (formData) =>
    API.post("/media/admin/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const updateMedia = (id, formData) =>
    API.patch(`/media/admin/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const deleteMedia = (id) =>
    API.patch(`/media/admin/delete/${id}`);

// ─── User Management ───
export const getAllUsers = () => API.get("/admin/users");

export const banUser = (userId, reason = "Violation of platform rules") =>
    API.patch(`/admin/ban/${userId}`, { reason });

export const deleteUser = (userId) =>
    API.delete(`/admin/users/${userId}`);
