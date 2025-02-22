import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Clock, Star, TrendingUp } from 'lucide-react';

interface Comic {
  id: string;
  title: string;
  cover: string;
  author: string;
  rating: number;
  episodes: number;
  views: string;
  lastUpdated: string;
  category: string;
}

const comics: Comic[] = [
  {
    id: "1",
    title: "SuperPutin: Origins",
    cover: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&h=1200&q=80",
    author: "CryptoArtist",
    rating: 4.8,
    episodes: 12,
    views: "45K",
    lastUpdated: "2h ago",
    category: "Action"
  },
  {
    id: "2",
    title: "Digital Revolution",
    cover: "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=800&h=1200&q=80",
    author: "BlockMaster",
    rating: 4.6,
    episodes: 8,
    views: "32K",
    lastUpdated: "5h ago",
    category: "Sci-Fi"
  },
  {
    id: "3",
    title: "Crypto Warriors",
    cover: "https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=800&h=1200&q=80",
    author: "DigitalDreamer",
    rating: 4.9,
    episodes: 15,
    views: "89K",
    lastUpdated: "1 day ago",
    category: "Fantasy"
  },
  {
    id: "4",
    title: "Blockchain Chronicles",
    cover: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=1200&q=80",
    author: "TechArtist",
    rating: 4.7,
    episodes: 6,
    views: "28K",
    lastUpdated: "3h ago",
    category: "Sci-Fi"
  },
  {
    id: "5",
    title: "Web3 Heroes",
    cover: "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=800&h=1200&q=80",
    author: "CryptoMaster",
    rating: 4.5,
    episodes: 10,
    views: "56K",
    lastUpdated: "6h ago",
    category: "Action"
  },
  {
    id: "6",
    title: "Metaverse Tales",
    cover: "https://images.unsplash.com/photo-1604537466158-719b1972feb8?w=800&h=1200&q=80",
    author: "VirtualArtist",
    rating: 4.4,
    episodes: 7,
    views: "41K",
    lastUpdated: "12h ago",
    category: "Fantasy"
  }
];

export function Comics() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Popular');

  const categories = ['All', 'Action', 'Sci-Fi', 'Fantasy'];
  const sortOptions = ['Popular', 'Top Rated'];

  // Фильтруем комиксы по выбранной категории
  const filteredComics = comics.filter(comic => 
    selectedCategory === 'All' ? true : comic.category === selectedCategory
  );

  // Сортируем комиксы
  const sortedComics = [...filteredComics].sort((a, b) => {
    if (sortBy === 'Popular') {
      // Сортировка по просмотрам (убираем 'K' и конвертируем в число)
      return parseInt(b.views.replace('K', '000')) - parseInt(a.views.replace('K', '000'));
    } else {
      // Сортировка по рейтингу
      return b.rating - a.rating;
    }
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-poppins font-bold text-4xl">Comics Gallery</h1>
        <p className="text-text/70">
          Explore our collection of exclusive digital comics. New episodes released weekly.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-text/5 text-text hover:bg-text/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {sortOptions.map(option => (
            <button
              key={option}
              onClick={() => setSortBy(option)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                sortBy === option
                  ? 'bg-primary text-white'
                  : 'bg-text/5 text-text hover:bg-text/10'
              }`}
            >
              {option === 'Popular' ? <TrendingUp size={18} /> : <Star size={18} />}
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedComics.map(comic => (
          <div
            key={comic.id}
            className="bg-background rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
          >
            <div className="relative aspect-[3/4]">
              <img
                src={comic.cover}
                alt={comic.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
            
            <div className="p-6 space-y-4">
              <h3 className="font-poppins font-semibold text-xl">{comic.title}</h3>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-text/70">
                    <Star size={18} className="text-yellow-500" />
                    {comic.rating}
                  </div>
                  <div className="flex items-center gap-1 text-text/70">
                    <Eye size={18} />
                    {comic.views}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-text/70">
                  <Clock size={18} />
                  {comic.lastUpdated}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-text/70">Episodes: {comic.episodes}</p>
                <p className="text-primary">{comic.category}</p>
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
    </div>
  );
}