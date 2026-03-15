import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

export const documentService = {
  upload: async (formData) => {
    const response = await axiosInstance.post(
      API_PATHS.DOCUMENTS.UPLOAD,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  getAll: async () => {
    const response = await axiosInstance.get(API_PATHS.DOCUMENTS.LIST);
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(API_PATHS.DOCUMENTS.BY_ID(id));
    return response.data;
  },

  generateSummary: async (id) => {
    const response = await axiosInstance.post(API_PATHS.DOCUMENTS.SUMMARY(id));
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(API_PATHS.DOCUMENTS.DELETE(id));
    return response.data;
  },

  chat: async (id, message, history = []) => {
    const response = await axiosInstance.post(API_PATHS.DOCUMENTS.CHAT(id), {
      message,
      history,
    });
    return response.data;
  },
};
