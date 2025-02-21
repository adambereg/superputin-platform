import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Image, Coins, Heart, Eye, Wallet, ChevronLeft, ChevronRight, Clock, MessageCircle, Share2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { Collection } from '../models/Collection';
import { AuthModal } from '../components/AuthModal';

const featuredCollections: Collection[] = [
  {
    id: 1,
    name: "Cosmic Legends",
    creator: {
      name: "CryptoArtist",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80"
    },
    cover: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=400&q=80",
    items: 10,
    floor: "100 TON",
    volume: "1,234 TON",
    likes: 1234,
    views: "45K",
    description: "A collection of cosmic-themed digital artworks exploring the boundaries of space and time."
  },
  {
    id: 2,
    name: "Digital Dreams",
    creator: {
      name: "BlockMaster",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&q=80"
    },
    cover: "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=800&h=400&q=80",
    items: 15,
    floor: "75 TON",
    volume: "2,345 TON",
    likes: 2345,
    views: "89K",
    description: "Immerse yourself in a world of digital dreams and surreal experiences."
  },
  {
    id: 3,
    name: "Crypto Punks TON",
    creator: {
      name: "DigitalDreamer",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&q=80"
    },
    cover: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&q=80",
    items: 20,
    floor: "150 TON",
    volume: "3,456 TON",
    likes: 3456,
    views: "123K",
    description: "The original crypto punks reimagined for the TON blockchain."
  },
  {
    id: 4,
    name: "Metaverse Artifacts",
    creator: {
      name: "VirtualArchitect",
      avatar: "https://images.unsplash.com/photo-1628157588553-5eeea00af15c?w=100&h=100&q=80"
    },
    cover: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&h=400&q=80",
    items: 12,
    floor: "200 TON",
    volume: "4,567 TON",
    likes: 4567,
    views: "178K",
    description: "Rare artifacts from the metaverse, each with its own unique history."
  }
];

const latestComics = [
  {
    id: 1,
    title: "SuperPutin: Origins",
    cover: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&h=1200&q=80",
    author: "CryptoArtist",
    description: "The beginning of the legendary story. Discover how it all started.",
    episode: 1,
    views: "45K",
    lastUpdated: "2 hours ago"
  },
  {
    id: 2,
    title: "Digital Revolution",
    cover: "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=800&h=1200&q=80",
    author: "BlockMaster",
    description: "A new era of digital transformation begins.",
    episode: 5,
    views: "32K",
    lastUpdated: "5 hours ago"
  },
  {
    id: 3,
    title: "Crypto Warriors",
    cover: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=800&h=1200&q=80",
    author: "DigitalDreamer",
    description: "Join the battle for the future of blockchain.",
    episode: 3,
    views: "28K",
    lastUpdated: "1 day ago"
  }
];

const trendingMemes = [
  {
    id: 1,
    title: "When TON hits ATH",
    image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&h=800&q=80",
    author: {
      name: "MemeLord",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&q=80"
    },
    likes: 1234,
    comments: 89,
    shares: 45,
    category: "Crypto",
    timestamp: "1 hour ago"
  },
  {
    id: 2,
    title: "Web3 Developer Life",
    image: "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=800&h=800&q=80",
    author: {
      name: "CryptoJester",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&q=80"
    },
    likes: 892,
    comments: 56,
    shares: 34,
    category: "Dev Life",
    timestamp: "3 hours ago"
  },
  {
    id: 3,
    title: "NFT Market Be Like",
    image: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=800&h=800&q=80",
    author: {
      name: "BlockchainBro",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&q=80"
    },
    likes: 567,
    comments: 34,
    shares: 21,
    category: "NFTs",
    timestamp: "5 hours ago"
  }
];

export function Home() {
  const { user, isAuthenticated } = useUser();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [likedCollections, setLikedCollections] = useState<number[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentComicSlide, setCurrentComicSlide] = useState(0);
  const [currentMemeSlide, setCurrentMemeSlide] = useState(0);
  const slidesToShow = 3;
  const comicsToShow = 2;
  const memesToShow = 3;

  const handleLike = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    setLikedCollections(prev => 
      prev.includes(id) ? prev.filter(collectionId => collectionId !== id) : [...prev, id]
    );
  };

  const nextSlide = () => {
    setCurrentSlide(prev => 
      prev + slidesToShow >= featuredCollections.length ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide(prev => 
      prev === 0 ? featuredCollections.length - slidesToShow : prev - 1
    );
  };

  const nextComicSlide = () => {
    setCurrentComicSlide(prev => 
      prev + comicsToShow >= latestComics.length ? 0 : prev + 1
    );
  };

  const prevComicSlide = () => {
    setCurrentComicSlide(prev => 
      prev === 0 ? latestComics.length - comicsToShow : prev - 1
    );
  };

  const nextMemeSlide = () => {
    setCurrentMemeSlide(prev => 
      prev + memesToShow >= trendingMemes.length ? 0 : prev + 1
    );
  };

  const prevMemeSlide = () => {
    setCurrentMemeSlide(prev => 
      prev === 0 ? trendingMemes.length - memesToShow : prev - 1
    );
  };

  const visibleCollections = featuredCollections.slice(currentSlide, currentSlide + slidesToShow);

  return (
    <div className="space-y-16">
      <section className="text-center space-y-4">
        <h1 className="font-poppins font-bold text-5xl animate-fade-in">
          {isAuthenticated 
            ? `Welcome back, ${user?.username}!`
            : 'Welcome to SuperPutin Platform'}
        </h1>
        
        {isAuthenticated && (
          <div className="text-text/70 animate-fade-in-up">
            <p>Email: {user?.email}</p>
            <p>Role: {user?.role}</p>
            <p>Points: {user?.points}</p>
          </div>
        )}

        <p className="text-text/70 max-w-2xl mx-auto animate-fade-in-up">
          Discover and collect unique digital art, comics, and memes in the
          ultimate content hub powered by TON blockchain.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            to="/nfts"
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105"
          >
            Explore NFTs
          </Link>
          <Link
            to="/comics"
            className="bg-text/5 text-text px-8 py-3 rounded-lg font-semibold hover:bg-text/10 transition-all hover:scale-105"
          >
            Read Comics
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        <div className="text-center space-y-2">
          <div className="bg-primary/5 p-4 rounded-2xl inline-block">
            <Rocket className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-xl">NFT Marketplace</h3>
          <p className="text-text/70">Trade unique digital collectibles on the TON blockchain</p>
        </div>
        <div className="text-center space-y-2">
          <div className="bg-primary/5 p-4 rounded-2xl inline-block">
            <Image className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-xl">Digital Comics</h3>
          <p className="text-text/70">Explore our collection of exclusive digital comics</p>
        </div>
        <div className="text-center space-y-2">
          <div className="bg-primary/5 p-4 rounded-2xl inline-block">
            <Coins className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-xl">Rewards System</h3>
          <p className="text-text/70">Earn points and unlock exclusive content</p>
        </div>
      </section>

      <section className="bg-primary/5 -mx-4 px-4 py-16">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="font-poppins font-bold text-3xl">Featured Collections</h2>
            <p className="text-text/70 max-w-2xl mx-auto">
              Explore our handpicked selection of top-performing NFT collections on the TON blockchain
            </p>
          </div>

          <div className="relative">
            <div className="flex gap-6 overflow-hidden">
              {visibleCollections.map((collection) => (
                <Link
                  key={collection.id}
                  to={`/nfts?collection=${collection.id}`}
                  className="flex-1 bg-background rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={collection.cover}
                      alt={collection.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-3 mb-2">
                          <img
                            src={collection.creator.avatar}
                            alt={collection.creator.name}
                            className="w-8 h-8 rounded-full border-2 border-white"
                          />
                          <span className="text-white font-medium">
                            {collection.creator.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{collection.name}</h3>
                      <p className="text-sm text-text/70 mt-1">{collection.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-text/70">Floor Price</p>
                        <p className="font-semibold">{collection.floor}</p>
                      </div>
                      <div>
                        <p className="text-sm text-text/70">Total Volume</p>
                        <p className="font-semibold">{collection.volume}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={(e) => handleLike(collection.id, e)}
                          className="flex items-center gap-1 text-text/70 hover:text-red-500 transition-colors"
                        >
                          <Heart
                            size={18}
                            className={likedCollections.includes(collection.id) ? "fill-red-500 text-red-500" : ""}
                          />
                          {collection.likes + (likedCollections.includes(collection.id) ? 1 : 0)}
                        </button>
                        <div className="flex items-center gap-1 text-text/70">
                          <Wallet size={18} />
                          {collection.items} items
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-text/70">
                        <Eye size={18} />
                        {collection.views}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-background text-text p-2 rounded-full shadow-lg hover:bg-text/5 transition-colors"
              disabled={currentSlide === 0}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-background text-text p-2 rounded-full shadow-lg hover:bg-text/5 transition-colors"
              disabled={currentSlide + slidesToShow >= featuredCollections.length}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/nfts"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              View All Collections
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-text/5 py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center space-y-2 mb-12">
            <h2 className="font-poppins font-bold text-4xl">Latest Comics</h2>
            <p className="text-text/70">
              Explore our newest digital comic releases
            </p>
          </div>

          <div className="relative">
            <div className="flex gap-8">
              {latestComics
                .slice(currentComicSlide, currentComicSlide + comicsToShow)
                .map(comic => (
                  <div 
                    key={comic.id}
                    className="flex-1 bg-background rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="relative aspect-[3/4]">
                      <img 
                        src={comic.cover} 
                        alt={comic.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="p-6 text-white">
                          <h3 className="font-poppins font-semibold text-2xl mb-2">
                            {comic.title}
                          </h3>
                          <p className="text-white/80 mb-4">
                            {comic.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Eye size={16} />
                              {comic.views}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={16} />
                              {comic.lastUpdated}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-text/70">Episode {comic.episode}</p>
                        <p className="text-text/70">By {comic.author}</p>
                      </div>
                      <Link
                        to={`/comics/${comic.id}`}
                        className="block w-full bg-primary text-white py-3 rounded-lg text-center font-medium hover:bg-primary/90 transition-colors"
                      >
                        Read Now
                      </Link>
                    </div>
                  </div>
                ))}
            </div>

            <button
              onClick={prevComicSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-background text-text p-2 rounded-full shadow-lg hover:bg-text/5 transition-colors"
              disabled={currentComicSlide === 0}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextComicSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-background text-text p-2 rounded-full shadow-lg hover:bg-text/5 transition-colors"
              disabled={currentComicSlide + comicsToShow >= latestComics.length}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="text-center mt-8">
            <Link
              to="/comics"
              className="inline-flex items-center gap-2 bg-text/5 text-text px-8 py-3 rounded-lg font-semibold hover:bg-text/10 transition-colors"
            >
              View All Comics
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center space-y-2 mb-12">
            <h2 className="font-poppins font-bold text-4xl">Trending Memes</h2>
            <p className="text-text/70">
              Check out the most viral memes of the day
            </p>
          </div>

          <div className="relative">
            <div className="flex gap-6">
              {trendingMemes
                .slice(currentMemeSlide, currentMemeSlide + memesToShow)
                .map(meme => (
                  <div 
                    key={meme.id}
                    className="flex-1 bg-background rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    <div className="relative aspect-square">
                      <img 
                        src={meme.image} 
                        alt={meme.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img 
                          src={meme.author.avatar} 
                          alt={meme.author.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{meme.author.name}</p>
                          <p className="text-sm text-text/70">{meme.timestamp}</p>
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">{meme.title}</h3>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-text/70 hover:text-red-500 transition-colors">
                            <Heart size={18} />
                            {meme.likes}
                          </button>
                          <div className="flex items-center gap-1 text-text/70">
                            <MessageCircle size={18} />
                            {meme.comments}
                          </div>
                          <div className="flex items-center gap-1 text-text/70">
                            <Share2 size={18} />
                            {meme.shares}
                          </div>
                        </div>
                        <span className="text-primary">{meme.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <button
              onClick={prevMemeSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-background text-text p-2 rounded-full shadow-lg hover:bg-text/5 transition-colors"
              disabled={currentMemeSlide === 0}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextMemeSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-background text-text p-2 rounded-full shadow-lg hover:bg-text/5 transition-colors"
              disabled={currentMemeSlide + memesToShow >= trendingMemes.length}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="text-center mt-8">
            <Link
              to="/memes"
              className="inline-flex items-center gap-2 bg-text/5 text-text px-8 py-3 rounded-lg font-semibold hover:bg-text/10 transition-colors"
            >
              View All Memes
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}