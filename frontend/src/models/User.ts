export interface User {
  id: string;
  address: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  points: number;
  createdContent?: string[];
  ownedNFTs?: string[];
  isEmailVerified: boolean;
} 