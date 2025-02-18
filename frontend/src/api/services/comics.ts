import { api } from '../client';
import { Comic, ApiResponse } from '../../types/api';

export const comicsService = {
  getAll: () => api.get<ApiResponse<Comic[]>>('/comics'),
  
  getById: (id: string) => api.get<ApiResponse<Comic>>(`/comics/${id}`),
  
  create: (data: FormData) => 
    api.post<ApiResponse<Comic>>('/comics', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
  update: (id: string, data: FormData) =>
    api.put<ApiResponse<Comic>>(`/comics/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
  delete: (id: string) => api.delete<ApiResponse<void>>(`/comics/${id}`),
}; 