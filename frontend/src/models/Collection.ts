export interface Collection {
  id: number;
  name: string;
  creator: {
    name: string;
    avatar: string;
  };
  cover: string;
  items: number;
  floor: string;
  volume: string;
  likes: number;
  views: string;
  description: string;
}