import api from "../api";

export const getProfile = () => {
  return api.get("/auth/profile");
};
