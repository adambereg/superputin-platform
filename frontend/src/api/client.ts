import type { User } from '@/models/User';

const API_URL = 'http://localhost:3000/api';

interface AuthResponse {
  user: User | null;
  error?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface LoginResponse {
  user: User;
  token?: string;
  requiresTwoFactor?: boolean;
  message?: string;
}

interface TwoFactorResponse {
  success: boolean;
  token?: string;
  message?: string;
  error?: string;
}

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  auth: {
    register: async (data: { username: string; email: string; password: string }): Promise<ApiResponse<void>> => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      
      return response.json();
    },

    login: async (data: { email: string; password: string }): Promise<LoginResponse> => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid credentials');
      }

      const result = await response.json();
      
      if (result.token) {
        localStorage.setItem('token', result.token);
      }
      
      if (result.requiresTwoFactor) {
        await api.auth.send2FACode(data.email);
      }

      return result;
    },

    forgotPassword: async (data: { email: string }): Promise<ApiResponse<void>> => {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Password reset request failed');
      }
      
      return result;
    },

    resetPassword: async (data: { token: string; newPassword: string }): Promise<ApiResponse<void>> => {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Password reset failed');
      }
      
      return result;
    },

    verifyEmail: async (token: string): Promise<ApiResponse<void>> => {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Email verification failed');
      }
      
      return result;
    },

    loginWithVK: async (userId: string): Promise<AuthResponse> => {
      // Временная заглушка для тестирования
      return {
        user: {
          id: userId,
          address: '0x123...abc',
          username: 'VK User',
          email: 'vk@example.com',
          role: 'user',
          points: 0,
          isEmailVerified: true,
          twoFactorEnabled: false
        }
      };
    },

    checkToken: async (): Promise<AuthResponse> => {
      const response = await fetch('/api/auth/check-token', {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }

      return response.json();
    },

    enable2FA: async (userId: string): Promise<TwoFactorResponse> => {
      const response = await fetch(`${API_URL}/auth/2fa/enable`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enable 2FA');
      }

      return response.json();
    },

    verify2FA: async (userId: string, code: string): Promise<TwoFactorResponse> => {
      const response = await fetch(`${API_URL}/auth/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, token: code })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify 2FA code');
      }

      return response.json();
    },

    send2FACode: async (email: string): Promise<ApiResponse<void>> => {
      const response = await fetch(`${API_URL}/auth/2fa/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send 2FA code');
      }

      return response.json();
    },

    verify: async (): Promise<{ success: boolean }> => {
      try {
        const response = await fetch(`${API_URL}/auth/verify`, {
          headers: getHeaders()
        });
        return response.json();
      } catch (error) {
        return { success: false };
      }
    }
  },

  content: {
    getComics: () => 
      fetch(`${API_URL}/content/list?type=comic`).then(res => res.json()),
    
    getMemes: () => 
      fetch(`${API_URL}/content/list?type=meme`).then(res => res.json()),
    
    getNFTs: () => 
      fetch(`${API_URL}/content/list?type=nft`).then(res => res.json()),
    
    getMy: async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token');
        }

        const response = await fetch(`${API_URL}/content/user/content`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch content');
        }

        return response.json();
      } catch (error) {
        console.error('API error:', error);
        throw error;
      }
    },

    upload: async (formData: FormData): Promise<ApiResponse<Content>> => {
      try {
        console.log('Uploading content with FormData:', {
          title: formData.get('title'),
          type: formData.get('type'),
          filesCount: formData.getAll('files').length
        });
        
        const response = await fetch(`${API_URL}/content/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        const data = await response.json();
        console.log('Upload response:', data);
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to upload content');
        }
        
        return {
          success: true,
          content: data.content
        };
      } catch (error) {
        console.error('Error uploading content:', error);
        return {
          success: false,
          error: error.message || 'Failed to upload content'
        };
      }
    },

    getPending: () => 
      fetch(`${API_URL}/content/pending`, {
        headers: getHeaders()
      }).then(res => res.json()),
    
    moderate: (contentId: string, data: { status: string; comment: string }) =>
      fetch(`${API_URL}/content/${contentId}/moderate`, {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(res => res.json()),

    getByType: async (type: string, params: { page?: number; limit?: number; } = {}) => {
      try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        
        const response = await fetch(`${API_URL}/content/type/${type}?${queryParams}`, {
          headers: getHeaders()
        });
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error(`Ошибка получения контента типа ${type}:`, error);
        throw error;
      }
    },

    getById: async (contentId: string) => {
      try {
        const response = await fetch(`${API_URL}/content/${contentId}`, {
          headers: getHeaders()
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching content by ID:', error);
        throw error;
      }
    },

    update: async (contentId: string, data: { title: string; tags: string[] }) => {
      try {
        const response = await fetch(`${API_URL}/content/${contentId}`, {
          method: 'PUT',
          headers: {
            ...getHeaders(),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          throw new Error('Failed to update content');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error updating content:', error);
        throw error;
      }
    },

    delete: async (contentId: string) => {
      try {
        const response = await fetch(`${API_URL}/content/${contentId}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete content');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error deleting content:', error);
        throw error;
      }
    },

    getTrending: async () => {
      try {
        const response = await fetch(`${API_URL}/content/trending`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        return {
          success: true,
          content: data.content
        };
      } catch (error) {
        console.error('Error fetching trending content:', error);
        return {
          success: false,
          error: 'Failed to fetch trending content'
        };
      }
    }
  },

  likes: {
    like: async (contentId: string) => {
      try {
        const response = await fetch(`${API_URL}/content/${contentId}/like`, {
          method: 'POST',
          headers: getHeaders()
        });
        
        if (!response.ok) {
          throw new Error('Failed to like content');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error liking content:', error);
        throw error;
      }
    },
    
    unlike: (contentId: string) =>
      fetch(`${API_URL}/content/${contentId}/unlike`, {
        method: 'POST'
      }).then(res => res.json()),

    checkLikeStatus: async (contentId: string) => {
      try {
        const response = await fetch(`${API_URL}/content/${contentId}/like-status`, {
          headers: getHeaders()
        });
        
        if (!response.ok) {
          throw new Error('Failed to check like status');
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error checking like status:', error);
        throw error;
      }
    }
  },

  notifications: {
    getUnread: () =>
      fetch(`${API_URL}/notifications/unread`).then(res => res.json()),
    
    markAsRead: (notificationId: string) =>
      fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'POST'
      }).then(res => res.json())
  },

  admin: {
    getStats: () => 
      fetch(`${API_URL}/admin/stats`, {
        headers: getHeaders()
      }).then(res => res.json()),
    
    getUsers: (params: { page?: number; limit?: number; search?: string }) =>
      fetch(`${API_URL}/admin/users?${new URLSearchParams(params as any)}`, {
        headers: getHeaders()
      }).then(res => res.json()),
    
    updateUserRole: (userId: string, role: string) =>
      fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ role })
      }).then(res => res.json()),
    
    deleteUser: async (userId: string) => {
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }
      
      return data;
    },
    
    getContent: (params: { 
      page?: number; 
      limit?: number; 
      status?: string;
      type?: string;
    }) =>
      fetch(`${API_URL}/admin/content?${new URLSearchParams(params as any)}`, {
        headers: getHeaders()
      }).then(res => res.json()),
    
    deleteContent: (contentId: string) =>
      fetch(`${API_URL}/admin/content/${contentId}`, {
        method: 'DELETE',
        headers: getHeaders()
      }).then(res => res.json())
  },

  moderator: {
    getStats: () => 
      fetch(`${API_URL}/moderator/stats`, {
        headers: getHeaders()
      }).then(res => res.json()),
    
    getHistory: () => 
      fetch(`${API_URL}/moderator/history`, {
        headers: getHeaders()
      }).then(res => res.json())
  }
};
