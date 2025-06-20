import api from "../api";

export const getUsers = () => api.get("/users");
export const deleteUser = (id) => api.delete(`/users/${id}`);

export const addUser = (newUser) => api.post("/users", newUser);
export const updateUser = (id, updatedUser) => api.put(`/users/${id}`, updatedUser);
