export interface Comic {
  id: string;
  title: string;
  cover: string;
  author: string;
  episodes: number;
  rating: number;
  category: string;
  status: 'Ongoing' | 'Completed';
  views: string;
}

export interface Meme {
  id: string;
  title: string;
  image: string;
  author: {
    name: string;
    avatar: string;
  };
  likes: number;
  shares: number;
  comments: number;
  views: string;
  category: string;
  timestamp: string;
  bookmarked: boolean;
}

export interface NFT {
  id: string;
  title: string;
  image: string;
  price: string;
  creator: {
    name: string;
    avatar: string;
    address: string;
  };
  views: string;
  likes: number;
  shares: number;
  category: string;
  lastBid: string;
  endTime: string;
  description: string;
} 