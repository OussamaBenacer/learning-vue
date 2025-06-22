import api from "../api";

export const getProductsApi = () => {
  return api.get("/products");
};

export const addProductApi = (product) => {
  return api.post("/products", product);
};

export const updateProductApi = (productId, changes) => {
  return api.put(`/products/${productId}`, changes);
};

export const deleteProductApi = (productId) => {
  return api.delete(`/products/${productId}`);
};

export const getProductsFilterApi = (params) => {
  return api.get("/products", { params });
};
