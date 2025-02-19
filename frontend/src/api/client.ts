const API_URL = 'https://superputin-platform.vercel.app/api';

interface AuthResponse {
  user: {
    id: string;
    address: string;
    username: string;
  } | null;
  error?: string;
}

export const api = {
  auth: {
    register: async (userData: { username: string; email: string; password: string }): Promise<AuthResponse> => {
      // Временная заглушка для тестирования
      return {
        user: {
          id: '1',
          address: '0x123...abc',
          username: userData.username
        }
      };
    },
    
    login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
      // Временная заглушка для тестирования
      return {
        user: {
          id: '1',
          address: '0x123...abc',
          username: 'testuser'
        }
      };
    }
  },

  content: {
    getComics: () => 
      fetch(`${API_URL}/content/list?type=comic`).then(res => res.json()),
    
    getMemes: () => 
      fetch(`${API_URL}/content/list?type=meme`).then(res => res.json()),
    
    getNFTs: () => 
      fetch(`${API_URL}/content/list?type=nft`).then(res => res.json()),
    
    upload: (file: File, type: 'comic' | 'meme' | 'nft', metadata: any) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('metadata', JSON.stringify(metadata));
      
      return fetch(`${API_URL}/content/upload`, {
        method: 'POST',
        body: formData
      }).then(res => res.json());
    }
  },

  likes: {
    like: (contentId: string) =>
      fetch(`${API_URL}/content/${contentId}/like`, {
        method: 'POST'
      }).then(res => res.json()),
    
    unlike: (contentId: string) =>
      fetch(`${API_URL}/content/${contentId}/unlike`, {
        method: 'POST'
      }).then(res => res.json())
  },

  notifications: {
    getUnread: () =>
      fetch(`${API_URL}/notifications/unread`).then(res => res.json()),
    
    markAsRead: (notificationId: string) =>
      fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'POST'
      }).then(res => res.json())
  }
};
