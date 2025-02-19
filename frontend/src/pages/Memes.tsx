import React, { useState } from 'react';
import Masonry from 'react-masonry-css';
import { Heart, Share2, Download, TrendingUp, Clock, Siren as Fire, MessageCircle, Bookmark, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';

const breakpointColumns = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

const categories = ["All", "Trending", "Latest", "Most Liked", "Crypto", "NFT", "Web3"];

const memesList = [
  {
    id: 1,
    title: "When your NFT finally moons",
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=600&q=80",
    author: {
      name: "CryptoMemer",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80"
    },
    likes: 1234,
    shares: 456,
    comments: 89,
    views: "45K",
    category: "Crypto",
    timestamp: "2 hours ago",
    bookmarked: false
  },
  {
    id: 2,
    title: "Web3 expectations vs reality",
    image: "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=800&h=600&q=80",
    author: {
      name: "BlockchainBro",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&q=80"
    },
    likes: 2345,
    shares: 789,
    comments: 167,
    views: "89K",
    category: "Web3",
    timestamp: "5 hours ago",
    bookmarked: false
  },
  {
    id: 3,
    title: "POV: Watching your portfolio",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&q=80",
    author: {
      name: "NFTartist",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&q=80"
    },
    likes: 3456,
    shares: 234,
    comments: 256,
    views: "123K",
    category: "NFT",
    timestamp: "1 day ago",
    bookmarked: false
  },
  {
    id: 4,
    title: "Smart contract debugging be like",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&h=600&q=80",
    author: {
      name: "DevMaster",
      avatar: "https://images.unsplash.com/photo-1628157588553-5eeea00af15c?w=100&h=100&q=80"
    },
    likes: 4567,
    shares: 890,
    comments: 345,
    views: "178K",
    category: "Web3",
    timestamp: "2 days ago",
    bookmarked: false
  },
  {
    id: 5,
    title: "To the moon!",
    image: "https://images.unsplash.com/photo-1614064642639-e398cf05badb?w=800&h=600&q=80",
    author: {
      name: "MoonBoy",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&q=80"
    },
    likes: 5678,
    shares: 1234,
    comments: 432,
    views: "234K",
    category: "Crypto",
    timestamp: "3 days ago",
    bookmarked: false
  }
];

export function Memes() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("trending");
  const [likedMemes, setLikedMemes] = useState<number[]>([]);
  const [bookmarkedMemes, setBookmarkedMemes] = useState<number[]>([]);
  const [selectedMeme, setSelectedMeme] = useState<typeof memesList[0] | null>(null);

  const filteredMemes = memesList
    .filter(meme => selectedCategory === "All" || meme.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === "trending") return parseInt(b.views) - parseInt(a.views);
      if (sortBy === "latest") return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      if (sortBy === "mostLiked") return b.likes - a.likes;
      return 0;
    });

  const handleLike = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setLikedMemes(prev => 
      prev.includes(id) ? prev.filter(memeId => memeId !== id) : [...prev, id]
    );
  };

  const handleBookmark = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarkedMemes(prev => 
      prev.includes(id) ? prev.filter(memeId => memeId !== id) : [...prev, id]
    );
  };

  const currentMemeIndex = selectedMeme ? filteredMemes.findIndex(meme => meme.id === selectedMeme.id) : -1;

  const handlePrevMeme = () => {
    if (currentMemeIndex > 0) {
      setSelectedMeme(filteredMemes[currentMemeIndex - 1]);
    }
  };

  const handleNextMeme = () => {
    if (currentMemeIndex < filteredMemes.length - 1) {
      setSelectedMeme(filteredMemes[currentMemeIndex + 1]);
    }
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedMeme) return;

      if (e.key === 'Escape') {
        setSelectedMeme(null);
      } else if (e.key === 'ArrowLeft') {
        handlePrevMeme();
      } else if (e.key === 'ArrowRight') {
        handleNextMeme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMeme, currentMemeIndex]);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="font-poppins font-bold text-4xl">Trending Memes</h1>
        <p className="text-text/70 max-w-2xl mx-auto">
          The freshest and funniest memes from our community. Share, like, and create your own!
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
            <Clock size={18} />
            Latest
          </button>
          <button
            onClick={() => setSortBy("mostLiked")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              sortBy === "mostLiked"
                ? "bg-primary text-white"
                : "bg-text/5 text-text hover:bg-text/10"
            }`}
          >
            <Fire size={18} />
            Most Liked
          </button>
        </div>
      </div>

      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {filteredMemes.map((meme) => (
          <div 
            key={meme.id} 
            className="mb-4 break-inside-avoid cursor-pointer"
            onClick={() => setSelectedMeme(meme)}
          >
            <div className="bg-background border border-text/10 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-4 border-b border-text/10">
                <div className="flex items-center gap-3">
                  <img
                    src={meme.author.avatar}
                    alt={meme.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{meme.author.name}</h3>
                    <p className="text-sm text-text/70">{meme.timestamp}</p>
                  </div>
                </div>
              </div>
              
              <div className="relative group">
                <img
                  src={meme.image}
                  alt={meme.title}
                  className="w-full"
                />
                <div className="absolute top-2 right-2">
                  <span className="bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {meme.category}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-medium text-lg">{meme.title}</h3>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => handleLike(meme.id, e)}
                      className="flex items-center gap-1 text-text/70 hover:text-red-500 transition-colors"
                    >
                      <Heart
                        size={18}
                        className={likedMemes.includes(meme.id) ? "fill-red-500 text-red-500" : ""}
                      />
                      {meme.likes + (likedMemes.includes(meme.id) ? 1 : 0)}
                    </button>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-text/70 hover:text-primary transition-colors"
                    >
                      <MessageCircle size={18} />
                      {meme.comments}
                    </button>
                    <button 
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-text/70 hover:text-primary transition-colors"
                    >
                      <Share2 size={18} />
                      {meme.shares}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-text/70">
                      <Eye size={18} />
                      {meme.views}
                    </div>
                    <button
                      onClick={(e) => handleBookmark(meme.id, e)}
                      className="text-text/70 hover:text-primary transition-colors"
                    >
                      <Bookmark
                        size={18}
                        className={bookmarkedMemes.includes(meme.id) ? "fill-primary text-primary" : ""}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Masonry>

      {/* Modal */}
      {selectedMeme && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="relative w-full max-w-5xl p-4">
            <button
              onClick={() => setSelectedMeme(null)}
              className="absolute top-2 right-2 z-10 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="bg-background rounded-xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-text/10">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedMeme.author.avatar}
                    alt={selectedMeme.author.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{selectedMeme.author.name}</h3>
                    <p className="text-sm text-text/70">{selectedMeme.timestamp}</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <img
                  src={selectedMeme.image}
                  alt={selectedMeme.title}
                  className="w-full"
                />
                
                {/* Navigation buttons */}
                <button
                  onClick={handlePrevMeme}
                  disabled={currentMemeIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNextMeme}
                  disabled={currentMemeIndex === filteredMemes.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="font-medium text-lg">{selectedMeme.title}</h3>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(selectedMeme.id)}
                      className="flex items-center gap-1 text-text/70 hover:text-red-500 transition-colors"
                    >
                      <Heart
                        size={18}
                        className={likedMemes.includes(selectedMeme.id) ? "fill-red-500 text-red-500" : ""}
                      />
                      {selectedMeme.likes + (likedMemes.includes(selectedMeme.id) ? 1 : 0)}
                    </button>
                    <button className="flex items-center gap-1 text-text/70 hover:text-primary transition-colors">
                      <MessageCircle size={18} />
                      {selectedMeme.comments}
                    </button>
                    <button className="flex items-center gap-1 text-text/70 hover:text-primary transition-colors">
                      <Share2 size={18} />
                      {selectedMeme.shares}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-text/70">
                      <Eye size={18} />
                      {selectedMeme.views}
                    </div>
                    <button
                      onClick={() => handleBookmark(selectedMeme.id)}
                      className="text-text/70 hover:text-primary transition-colors"
                    >
                      <Bookmark
                        size={18}
                        className={bookmarkedMemes.includes(selectedMeme.id) ? "fill-primary text-primary" : ""}
                      />
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