import api from "../api";

export const getProductsApi = (offset = 0, limit = 5, filterParams = {}) => {
  return api.get("/products", {
    params: {
      offset,
      limit,
      ...filterParams,
    },
  });
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
