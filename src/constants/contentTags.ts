export const CONTENT_TAGS = {
  comic: ['Action', 'Sci-Fi', 'Fantasy'],
  meme: ['Trending', 'Latest', 'Most Liked', 'Crypto', 'NFT', 'Web3'],
  nft: ['Art', 'Collectibles', 'Photography', 'Gaming', 'Music', 'Virtual Worlds']
} as const;

export type ContentType = 'meme' | 'comic' | 'nft'; 