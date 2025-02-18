export interface Comic {
  id: string;
  title: string;
  coverUrl: string;
  author: string;
  episode: number;
  totalEpisodes: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Meme {
  id: string;
  title: string;
  imageUrl: string;
  author: string;
  likes: number;
  createdAt: string;
}

export interface NFT {
  id: string;
  title: string;
  imageUrl: string;
  price: string;
  owner: string;
  description: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
} 