// API route constants
const API_BASE = "/api";

export const API_PATHS = {
  AUTH: {
    REGISTER: `${API_BASE}/auth/register`,
    LOGIN: `${API_BASE}/auth/login`,
    PROFILE: `${API_BASE}/auth/profile`,
  },
  DOCUMENTS: {
    UPLOAD: `${API_BASE}/documents/upload`,
    LIST: `${API_BASE}/documents`,
    BY_ID: (id) => `${API_BASE}/documents/${id}`,
    SUMMARY: (id) => `${API_BASE}/documents/${id}/summary`,
    CHAT: (id) => `${API_BASE}/documents/${id}/chat`,
    DELETE: (id) => `${API_BASE}/documents/${id}`,
  },
  FLASHCARDS: {
    LIST: `${API_BASE}/flashcards`,
    GENERATE: (documentId) => `${API_BASE}/flashcards/generate/${documentId}`,
    BY_ID: (id) => `${API_BASE}/flashcards/${id}`,
    BY_DOCUMENT: (documentId) =>
      `${API_BASE}/flashcards/document/${documentId}`,
  },
  QUIZZES: {
    LIST: `${API_BASE}/quizzes`,
    GENERATE: (documentId) => `${API_BASE}/quizzes/generate/${documentId}`,
    BY_ID: (id) => `${API_BASE}/quizzes/${id}`,
    SUBMIT: (id) => `${API_BASE}/quizzes/${id}/submit`,
    RESULTS: (id) => `${API_BASE}/quizzes/${id}/results`,
  },
  DASHBOARD: `${API_BASE}/dashboard`,
};
