import axios from 'axios';

// Get base URL from env or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const NOTIFICATION_URL = `${API_URL}/api/notifications`;

const getNotifications = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(NOTIFICATION_URL, config);
  return response.data;
};

const markAsRead = async (token, id = null) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(`${NOTIFICATION_URL}/mark-read`, { id }, config);
  return response.data;
};

export const notificationService = {
  getNotifications,
  markAsRead,
};
