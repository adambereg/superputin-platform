import { api } from '../client';
import { Meme, ApiResponse } from '../../types/api';

export const memesService = {
  getAll: () => api.get<ApiResponse<Meme[]>>('/memes'),
  
  getById: (id: string) => api.get<ApiResponse<Meme>>(`/memes/${id}`),
  
  create: (data: FormData) =>
    api.post<ApiResponse<Meme>>('/memes', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
  like: (id: string) => api.post<ApiResponse<void>>(`/memes/${id}/like`),
  
  unlike: (id: string) => api.delete<ApiResponse<void>>(`/memes/${id}/like`),
}; 