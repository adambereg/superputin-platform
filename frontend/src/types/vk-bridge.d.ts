declare module '@vkontakte/vk-bridge' {
  export interface VKBridge {
    send<T>(method: string, params?: any): Promise<T>;
  }

  export interface UserInfo {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
    photo_100?: string;
    photo_200?: string;
  }

  const bridge: VKBridge;
  export default bridge;
} 