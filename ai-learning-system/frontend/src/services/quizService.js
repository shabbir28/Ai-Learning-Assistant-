import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

export const quizService = {
  getAll: async () => {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.LIST);
    return response.data;
  },

  generate: async (documentId) => {
    const response = await axiosInstance.post(
      API_PATHS.QUIZZES.GENERATE(documentId),
    );
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.BY_ID(id));
    return response.data;
  },

  submit: async (id, answers) => {
    const response = await axiosInstance.post(API_PATHS.QUIZZES.SUBMIT(id), {
      answers,
    });
    return response.data;
  },

  getResults: async (id) => {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.RESULTS(id));
    return response.data;
  },
};
