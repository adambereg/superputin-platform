import { api } from '../api/client';

interface LikeResponse {
  success: boolean;
  likesCount: number;
}

export function useLike() {
  const handleLike = async (contentId: string) => {
    try {
      const response: LikeResponse = await api.likes.like(contentId);
      return response;
    } catch (error) {
      console.error('Like error:', error);
      throw error;
    }
  };

  return { handleLike };
} 