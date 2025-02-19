import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Image, Coins, Heart, Eye, Wallet, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const featuredCollections = [
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

export function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [likedCollections, setLikedCollections] = useState<number[]>([]);
  const slidesToShow = 3;

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

  const visibleCollections = featuredCollections.slice(currentSlide, currentSlide + slidesToShow);

  return (
    <div className="space-y-16">
      <section className="text-center space-y-6 py-16">
        <h1 className="font-poppins font-bold text-5xl md:text-6xl">
          Welcome to <span className="text-primary">SuperPutin</span>
        </h1>
        <p className="text-xl text-text/80 max-w-2xl mx-auto">
          Discover and collect unique digital art, comics, and memes in the ultimate content hub powered by TON blockchain.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/nfts"
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Explore NFTs
          </Link>
          <Link
            to="/comics"
            className="bg-text/5 text-text px-8 py-3 rounded-lg font-semibold hover:bg-text/10 transition-colors"
          >
            Read Comics
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-background border border-text/10 rounded-xl p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Rocket className="text-primary" size={24} />
          </div>
          <h3 className="font-poppins font-semibold text-xl">NFT Marketplace</h3>
          <p className="text-text/70">Trade unique digital collectibles on the TON blockchain</p>
        </div>
        <div className="bg-background border border-text/10 rounded-xl p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
            <Image className="text-secondary" size={24} />
          </div>
          <h3 className="font-poppins font-semibold text-xl">Digital Comics</h3>
          <p className="text-text/70">Explore our collection of exclusive digital comics</p>
        </div>
        <div className="bg-background border border-text/10 rounded-xl p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto">
            <Coins className="text-success" size={24} />
          </div>
          <h3 className="font-poppins font-semibold text-xl">Rewards System</h3>
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
    </div>
  );
}