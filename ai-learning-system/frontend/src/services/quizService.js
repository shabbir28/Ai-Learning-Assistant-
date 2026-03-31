import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPath";

export const quizService = {
  getAll: async () => {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.LIST);
    return response.data;
  },

  // difficulty: 'easy' | 'medium' | 'hard'
  // count: number of questions
  // timePerQuestion: seconds per question
  generate: async (documentId, difficulty = "medium", count = 5, timePerQuestion = 30) => {
    const response = await axiosInstance.post(
      API_PATHS.QUIZZES.GENERATE(documentId),
      { difficulty, count, timePerQuestion }
    );
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.BY_ID(id));
    return response.data;
  },

  // answers: { "0": "A. ...", "1": "B. ..." }
  // timeTaken: { "0": 12, "1": 28 } — seconds per question
  // timedOut: boolean
  submit: async (id, answers, timeTaken = {}, timedOut = false) => {
    const response = await axiosInstance.post(API_PATHS.QUIZZES.SUBMIT(id), {
      answers,
      timeTaken,
      timedOut,
    });
    return response.data;
  },

  getResults: async (id) => {
    const response = await axiosInstance.get(API_PATHS.QUIZZES.RESULTS(id));
    return response.data;
  },
};
