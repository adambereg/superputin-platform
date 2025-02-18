import { api } from '../client';
import { NFT, ApiResponse } from '../../types/api';

export const nftsService = {
  getAll: () => api.get<ApiResponse<NFT[]>>('/nfts'),
  
  getById: (id: string) => api.get<ApiResponse<NFT>>(`/nfts/${id}`),
  
  create: (data: FormData) =>
    api.post<ApiResponse<NFT>>('/nfts', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
  buy: (id: string) => api.post<ApiResponse<void>>(`/nfts/${id}/buy`),
}; 