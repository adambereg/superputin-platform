import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import { Star, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { api } from '../api/client';
import { Comic } from '../models/Content';

const breakpointColumns = {
  default: 3,
  1100: 2,
  700: 1
};

const comicsList: Comic[] = [
  {
    id: "1",
    title: "SuperPutin: Origins",
    cover: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&h=1200&q=80",
    author: "Alex Smith",
    episodes: 12,
    rating: 4.8,
    category: "Action",
    status: "Ongoing",
    views: "125K"
  },
  {
    id: 2,
    title: "Crypto Warriors",
    cover: "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=800&h=1200&q=80",
    author: "Maria Johnson",
    episodes: 8,
    rating: 4.6,
    category: "Sci-Fi",
    status: "Ongoing",
    views: "98K"
  },
  {
    id: 3,
    title: "Digital Legends",
    cover: "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=800&h=1200&q=80",
    author: "John Doe",
    episodes: 15,
    rating: 4.9,
    category: "Fantasy",
    status: "Completed",
    views: "203K"
  },
  {
    id: 4,
    title: "Blockchain Chronicles",
    cover: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&h=1200&q=80",
    author: "Sarah Wilson",
    episodes: 6,
    rating: 4.7,
    category: "Sci-Fi",
    status: "Ongoing",
    views: "76K"
  },
  {
    id: 5,
    title: "Web3 Heroes",
    cover: "https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?w=800&h=1200&q=80",
    author: "Mike Chen",
    episodes: 20,
    rating: 4.9,
    category: "Action",
    status: "Ongoing",
    views: "167K"
  },
  {
    id: 6,
    title: "Metaverse Tales",
    cover: "https://images.unsplash.com/photo-1604537466158-719b1972feb8?w=800&h=1200&q=80",
    author: "Emma Davis",
    episodes: 10,
    rating: 4.5,
    category: "Fantasy",
    status: "Completed",
    views: "145K"
  }
];

const categories = ["All", "Action", "Sci-Fi", "Fantasy"];

export function Comics() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");

  useEffect(() => {
    api.content.getComics()
      .then(response => {
        setComics(response.content);
        setLoading(false);
      })
      .catch(err => {
        setError('Ошибка загрузки комиксов');
        setLoading(false);
      });
  }, []);

  const filteredComics = comics
    .filter(comic => selectedCategory === "All" || comic.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === "popular") return parseInt(b.views) - parseInt(a.views);
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="font-poppins font-bold text-4xl">Comics Gallery</h1>
        <p className="text-text/70 max-w-2xl mx-auto">
          Explore our collection of exclusive digital comics. New episodes released weekly.
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
            onClick={() => setSortBy("popular")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              sortBy === "popular"
                ? "bg-primary text-white"
                : "bg-text/5 text-text hover:bg-text/10"
            }`}
          >
            <TrendingUp size={18} />
            Popular
          </button>
          <button
            onClick={() => setSortBy("rating")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              sortBy === "rating"
                ? "bg-primary text-white"
                : "bg-text/5 text-text hover:bg-text/10"
            }`}
          >
            <Star size={18} />
            Top Rated
          </button>
        </div>
      </div>

      <Masonry
        breakpointCols={breakpointColumns}
        className="flex -ml-4 w-auto"
        columnClassName="pl-4 bg-clip-padding"
      >
        {filteredComics.map((comic) => (
          <div key={comic.id} className="mb-4 break-inside-avoid">
            <div className="bg-background border border-text/10 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative group">
                <img
                  src={comic.cover}
                  alt={comic.title}
                  className="w-full h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2 right-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {comic.status}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 text-white w-full">
                    <p className="font-medium">Preview Available</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-poppins font-semibold text-xl">{comic.title}</h3>
                  <p className="text-text/70">by {comic.author}</p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span>{comic.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-text/70">
                    <BookOpen size={16} />
                    <span>{comic.episodes} Episodes</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary font-medium">{comic.category}</span>
                  <div className="flex items-center gap-1 text-text/70">
                    <Clock size={16} />
                    <span>Updated 2h ago</span>
                  </div>
                </div>
                <Link
                  to={`/comics/${comic.id}`}
                  className="block w-full bg-primary text-white py-2.5 rounded-lg hover:bg-primary/90 transition-colors font-medium text-center"
                >
                  Read Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </Masonry>
    </div>
  );
}