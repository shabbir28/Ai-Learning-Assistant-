import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

export const aiService = {
  getDashboard: async () => {
    const response = await axiosInstance.get(API_PATHS.DASHBOARD);
    return response.data;
  },
};
