export const CONTENT_TAGS = {
  comic: ['Action', 'Sci-Fi', 'Fantasy'] as const,
  meme: ['Trending', 'Latest', 'Most Liked', 'Crypto', 'NFT', 'Web3'] as const,
  nft: ['Art', 'Collectibles', 'Photography', 'Gaming', 'Music', 'Virtual Worlds'] as const
} as const;

export type ContentType = 'meme' | 'comic' | 'nft';

// Типы для тегов каждой категории
export type ComicTag = typeof CONTENT_TAGS.comic[number];
export type MemeTag = typeof CONTENT_TAGS.meme[number];
export type NFTTag = typeof CONTENT_TAGS.nft[number]; 