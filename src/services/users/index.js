import api from "../api";

export const getUsersApi = () => api.get("/users");
export const deleteUserApi = (id) => api.delete(`/users/${id}`);

export const addUserApi = (newUser) => api.post("/users", newUser);
export const updateUserApi = (id, updatedUser) => api.put(`/users/${id}`, updatedUser);
