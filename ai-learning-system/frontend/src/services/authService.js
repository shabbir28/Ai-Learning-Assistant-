import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

export const authService = {
  register: async (data) => {
    const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, data);
    return response.data;
  },

  login: async (data) => {
    const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, data);
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get(API_PATHS.AUTH.PROFILE);
    return response.data;
  },
};
