import api from "../api"; // your existing axios instance

export const getCategoriesApi = () => {
  return api.get("/categories");
};

export const addCategoryApi = (category) => {
  return api.post("/categories", category);
};

export const updateCategoryApi = (categoryId, changes) => {
  return api.put(`/categories/${categoryId}`, changes);
};

export const deleteCategoryApi = (categoryId) => {
  return api.delete(`/categories/${categoryId}`);
};
