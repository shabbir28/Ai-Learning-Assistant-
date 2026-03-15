import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

export const flashcardService = {
  getAll: async () => {
    const response = await axiosInstance.get(API_PATHS.FLASHCARDS.LIST);
    return response.data;
  },

  generate: async (documentId) => {
    const response = await axiosInstance.post(
      API_PATHS.FLASHCARDS.GENERATE(documentId),
    );
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(API_PATHS.FLASHCARDS.BY_ID(id));
    return response.data;
  },

  getByDocument: async (documentId) => {
    const response = await axiosInstance.get(
      API_PATHS.FLASHCARDS.BY_DOCUMENT(documentId),
    );
    return response.data;
  },
};
