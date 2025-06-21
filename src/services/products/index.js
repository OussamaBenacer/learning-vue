import api from "../api";

export const getProducts = () => {
  return api.get("/products");
};

export const addProduct = (product) => {
  return api.post("/products", product);
};

export const updateProduct = (productId, changes) => {
  return api.put(`/products/${productId}`, changes);
};

export const deleteProduct = (productId) => {
  return api.delete(`/products/${productId}`);
};

export const getProductsFilter = (params) => {
  return api.get("/products", { params });
};
