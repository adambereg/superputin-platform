import axios from 'axios';

interface VKUserResponse {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
}

export class VKAuthProvider {
  constructor(
    private clientId: string,
    private clientSecret: string
  ) {}

  async getUserData(code: string): Promise<VKUserResponse> {
    try {
      // Получаем access token
      const tokenResponse = await axios.get('https://oauth.vk.com/access_token', {
        params: {
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code,
          redirect_uri: process.env.VK_REDIRECT_URI
        }
      });

      const { access_token, user_id } = tokenResponse.data;

      // Получаем данные пользователя
      const userResponse = await axios.get('https://api.vk.com/method/users.get', {
        params: {
          user_ids: user_id,
          fields: 'email',
          access_token,
          v: '5.131'
        }
      });

      return userResponse.data.response[0];
    } catch (error) {
      console.error('VK API error:', error);
      throw new Error('Ошибка получения данных из VK');
    }
  }
} 