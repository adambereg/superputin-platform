import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Ошибка от сервера
      throw new Error(error.response.data.error || 'An error occurred');
    } else if (error.request) {
      // Ошибка сети
      throw new Error('Network error');
    } else {
      // Другие ошибки
      throw new Error('An error occurred');
    }
  }
); 