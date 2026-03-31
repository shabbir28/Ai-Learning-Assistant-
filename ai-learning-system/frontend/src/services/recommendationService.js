import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

export const recommendationService = {
  // Get recommendations (returns cached if < 24h old, otherwise generates fresh)
  get: async () => {
    const response = await axiosInstance.get(API_PATHS.RECOMMENDATIONS.GET);
    return response.data;
  },

  // Force refresh recommendations from Gemini AI
  refresh: async () => {
    const response = await axiosInstance.post(API_PATHS.RECOMMENDATIONS.REFRESH);
    return response.data;
  },
};
