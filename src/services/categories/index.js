import api from "../api"; // your existing axios instance

export const getCategories = () => {
  return api.get("/categories");
};

export const addCategory = (category) => {
  return api.post("/categories", category);
};

export const updateCategory = (categoryId, changes) => {
  return api.put(`/categories/${categoryId}`, changes);
};

export const deleteCategory = (categoryId) => {
  return api.delete(`/categories/${categoryId}`);
};
