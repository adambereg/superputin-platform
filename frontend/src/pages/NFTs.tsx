import React, { useState } from 'react';
import Masonry from 'react-masonry-css';
import { Wallet, Tag, Eye, Heart, Share2, Clock, TrendingUp, Siren as Fire, Bookmark, X, ChevronLeft, ChevronRight } from 'lucide-react';

const breakpointColumns = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

const categories = ["All", "Art", "Collectibles", "Photography", "Gaming", "Music", "Virtual Worlds"];
const sortOptions = ["trending", "latest", "price-high", "price-low"];

const nftsList = [
  {
    id: 1,
    title: "Cosmic Putin #1",
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=800&q=80",
    price: "100 TON",
    creator: {
      name: "CryptoArtist",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80",
      address: "0x1234...5678"
    },
    views: "125K",
    likes: 1234,
    shares: 456,
    category: "Art",
    lastBid: "95 TON",
    endTime: "2 days",
    description: "A unique digital artwork featuring a cosmic interpretation of leadership and power in the digital age."
  },
  {
    id: 2,
    title: "Digital Revolution #42",
    image: "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=800&h=800&q=80",
    price: "75 TON",
    creator: {
      name: "BlockMaster",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&q=80",
      address: "0x8765...4321"
    },
    views: "98K",
    likes: 892,
    shares: 234,
    category: "Virtual Worlds",
    lastBid: "70 TON",
    endTime: "5 hours",
    description: "An immersive digital experience showcasing the evolution of blockchain technology."
  },
  {
    id: 3,
    title: "Crypto Dreams #7",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=800&q=80",
    price: "150 TON",
    creator: {
      name: "DigitalDreamer",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&q=80",
      address: "0x2468...1357"
    },
    views: "203K",
    likes: 1567,
    shares: 678,
    category: "Art",
    lastBid: "145 TON",
    endTime: "1 day",
    description: "A mesmerizing piece that captures the essence of cryptocurrency dreams and aspirations."
  },
  {
    id: 4,
    title: "Metaverse Mansion",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&h=800&q=80",
    price: "500 TON",
    creator: {
      name: "VirtualArchitect",
      avatar: "https://images.unsplash.com/photo-1628157588553-5eeea00af15c?w=100&h=100&q=80",
      address: "0x9876...5432"
    },
    views: "156K",
    likes: 2345,
    shares: 890,
    category: "Virtual Worlds",
    lastBid: "480 TON",
    endTime: "3 days",
    description: "A luxurious virtual mansion in the heart of the metaverse, complete with unique digital amenities."
  },
  {
    id: 5,
    title: "Blockchain Beats",
    image: "https://images.unsplash.com/photo-1614064642639-e398cf05badb?w=800&h=800&q=80",
    price: "50 TON",
    creator: {
      name: "CryptoMusician",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&q=80",
      address: "0x1357...2468"
    },
    views: "78K",
    likes: 678,
    shares: 123,
    category: "Music",
    lastBid: "45 TON",
    endTime: "12 hours",
    description: "An exclusive music track minted as an NFT, featuring blockchain-inspired rhythms."
  }
];

export function NFTs() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("trending");
  const [likedNFTs, setLikedNFTs] = useState<number[]>([]);
  const [bookmarkedNFTs, setBookmarkedNFTs] = useState<number[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<typeof nftsList[0] | null>(null);

  const filteredNFTs = nftsList
    .filter(nft => selectedCategory === "All" || nft.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === "trending") return parseInt(b.views) - parseInt(a.views);
      if (sortBy === "latest") return b.likes - a.likes;
      if (sortBy === "price-high") return parseInt(b.price) - parseInt(a.price);
      if (sortBy === "price-low") return parseInt(a.price) - parseInt(b.price);
      return 0;
    });

  const handleLike = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLikedNFTs(prev => 
      prev.includes(id) ? prev.filter(nftId => nftId !== id) : [...prev, id]
    );
  };

  const handleBookmark = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarkedNFTs(prev => 
      prev.includes(id) ? prev.filter(nftId => nftId !== id) : [...prev, id]
    );
  };

  const currentNFTIndex = selectedNFT ? filteredNFTs.findIndex(nft => nft.id === selectedNFT.id) : -1;

  const handlePrevNFT = () => {
    if (currentNFTIndex > 0) {
      setSelectedNFT(filteredNFTs[currentNFTIndex - 1]);
    }
  };

  const handleNextNFT = () => {
    if (currentNFTIndex < filteredNFTs.length - 1) {
      setSelectedNFT(filteredNFTs[currentNFTIndex + 1]);
    }
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedNFT) return;

      if (e.key === 'Escape') {
        setSelectedNFT(null);
      } else if (e.key === 'ArrowLeft') {
        handlePrevNFT();
      } else if (e.key === 'ArrowRight') {
        handleNextNFT();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNFT, currentNFTIndex]);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="font-poppins font-bold text-4xl">NFT Marketplace</h1>
        <p className="text-text/70 max-w-2xl mx-auto">
          Discover, collect, and trade unique digital collectibles on the TON blockchain.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex justify-center gap-2 flex-wrap">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-white"
                  : "bg-text/5 text-text hover:bg-text/10"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setSortBy("trending")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              sortBy === "trending"
                ? "bg-primary text-white"
                : "bg-text/5 text-text hover:bg-text/10"
            }`}
          >
            <TrendingUp size={18} />
            Trending
          </button>
          <button
            onClick={() => setSortBy("latest")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              sortBy === "latest"
                ? "bg-primary text-white"
                : "bg-text/5 text-text hover:bg-text/10"
            }`}
          >
            <Fire size={18} />
            Hot
          </button>
          <button
            onClick={() => setSortBy("price-high")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              sortBy === "price-high"
                ? "bg-primary text-white"
                : "bg-text/5 text-text hover:bg-text/10"
            }`}
          >
            <Wallet size={18} />
            Price: High to Low
          </button>
        </div>
      </div>

      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {filteredNFTs.map((nft) => (
          <div 
            key={nft.id} 
            className="mb-4 break-inside-avoid cursor-pointer"
            onClick={() => setSelectedNFT(nft)}
          >
            <div className="bg-background border border-text/10 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-4 border-b border-text/10">
                <div className="flex items-center gap-3">
                  <img
                    src={nft.creator.avatar}
                    alt={nft.creator.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{nft.creator.name}</h3>
                    <p className="text-sm text-text/70">{nft.creator.address}</p>
                  </div>
                </div>
              </div>

              <div className="relative group">
                <img
                  src={nft.image}
                  alt={nft.title}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {nft.category}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-medium text-lg">{nft.title}</h3>
                  <p className="text-sm text-text/70 mt-1">{nft.description}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => handleLike(nft.id, e)}
                      className="flex items-center gap-1 text-text/70 hover:text-red-500 transition-colors"
                    >
                      <Heart
                        size={18}
                        className={likedNFTs.includes(nft.id) ? "fill-red-500 text-red-500" : ""}
                      />
                      {nft.likes + (likedNFTs.includes(nft.id) ? 1 : 0)}
                    </button>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-text/70 hover:text-primary transition-colors"
                    >
                      <Share2 size={18} />
                      {nft.shares}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-text/70">
                      <Eye size={18} />
                      {nft.views}
                    </div>
                    <button
                      onClick={(e) => handleBookmark(nft.id, e)}
                      className="text-text/70 hover:text-primary transition-colors"
                    >
                      <Bookmark
                        size={18}
                        className={bookmarkedNFTs.includes(nft.id) ? "fill-primary text-primary" : ""}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text/70">Current Price</p>
                    <p className="font-semibold text-lg">{nft.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text/70">Ends in</p>
                    <p className="font-medium">{nft.endTime}</p>
                  </div>
                </div>

                <button className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium">
                  Place Bid
                </button>
              </div>
            </div>
          </div>
        ))}
      </Masonry>

      {/* Modal */}
      {selectedNFT && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="relative w-full max-w-5xl p-4">
            <button
              onClick={() => setSelectedNFT(null)}
              className="absolute top-2 right-2 z-10 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="bg-background rounded-xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-text/10">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedNFT.creator.avatar}
                    alt={selectedNFT.creator.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{selectedNFT.creator.name}</h3>
                    <p className="text-sm text-text/70">{selectedNFT.creator.address}</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 p-6">
                <div className="relative">
                  <img
                    src={selectedNFT.image}
                    alt={selectedNFT.title}
                    className="w-full rounded-xl"
                  />
                  
                  {/* Navigation buttons */}
                  <button
                    onClick={handlePrevNFT}
                    disabled={currentNFTIndex === 0}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNextNFT}
                    disabled={currentNFTIndex === filteredNFTs.length - 1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h2 className="font-poppins font-bold text-2xl mb-2">{selectedNFT.title}</h2>
                    <p className="text-text/70">{selectedNFT.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-text/5 rounded-lg p-4">
                      <p className="text-sm text-text/70">Current Price</p>
                      <p className="font-semibold text-xl">{selectedNFT.price}</p>
                    </div>
                    <div className="bg-text/5 rounded-lg p-4">
                      <p className="text-sm text-text/70">Last Bid</p>
                      <p className="font-semibold text-xl">{selectedNFT.lastBid}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(selectedNFT.id)}
                        className="flex items-center gap-1 text-text/70 hover:text-red-500 transition-colors"
                      >
                        <Heart
                          size={18}
                          className={likedNFTs.includes(selectedNFT.id) ? "fill-red-500 text-red-500" : ""}
                        />
                        {selectedNFT.likes + (likedNFTs.includes(selectedNFT.id) ? 1 : 0)}
                      </button>
                      <button className="flex items-center gap-1 text-text/70 hover:text-primary transition-colors">
                        <Share2 size={18} />
                        {selectedNFT.shares}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-text/70">
                        <Eye size={18} />
                        {selectedNFT.views}
                      </div>
                      <button
                        onClick={() => handleBookmark(selectedNFT.id)}
                        className="text-text/70 hover:text-primary transition-colors"
                      >
                        <Bookmark
                          size={18}
                          className={bookmarkedNFTs.includes(selectedNFT.id) ? "fill-primary text-primary" : ""}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-text/70">Auction ends in:</p>
                      <p className="font-medium">{selectedNFT.endTime}</p>
                    </div>
                    <button className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium">
                      Place Bid
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}