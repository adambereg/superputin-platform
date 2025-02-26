import React, { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import { Heart, Share2, Download, TrendingUp, Clock, Siren as Fire, MessageCircle, Bookmark, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api/client';
import { Pagination } from '../components/Pagination';

const breakpointColumns = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

const categories = ["All", "Trending", "Latest", "Most Liked", "Crypto", "NFT", "Web3"];

interface Meme {
  id?: string;
  _id?: string;
  title: string;
  image?: string;
  fileUrl?: string;
  author?: {
    name: string;
    avatar: string;
  };
  authorId?: {
    username: string;
  };
  likes?: number;
  likesCount?: number;
  shares?: number;
  comments?: number;
  views?: string;
  category?: string;
  tags?: string[];
  timestamp?: string;
  createdAt?: string;
  bookmarked?: boolean;
}

export function Memes() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null);
  const [bookmarkedMemes, setBookmarkedMemes] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMemes(currentPage);
  }, [currentPage]);

  const fetchMemes = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.content.getByType('meme', page);
      
      if (response.success) {
        // Преобразуем данные в нужный формат
        const formattedMemes = response.content.map((meme: any) => ({
          id: meme._id,
          _id: meme._id,
          title: meme.title,
          image: meme.fileUrl,
          fileUrl: meme.fileUrl,
          author: {
            name: meme.authorId?.username || 'Неизвестный автор',
            avatar: 'https://via.placeholder.com/40'
          },
          authorId: meme.authorId,
          likes: meme.likesCount || 0,
          likesCount: meme.likesCount || 0,
          shares: 0,
          comments: 0,
          views: '1K',
          category: meme.tags?.[0] || 'Trending',
          tags: meme.tags,
          timestamp: new Date(meme.createdAt).toLocaleDateString(),
          createdAt: meme.createdAt
        }));
        
        setMemes(formattedMemes);
        setTotalPages(response.pagination.pages);
        setCurrentPage(response.pagination.page);
      } else {
        setError(response.error || 'Не удалось загрузить мемы');
      }
    } catch (error) {
      setError('Произошла ошибка при загрузке мемов');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleMemeClick = (meme: Meme) => {
    setSelectedMeme(meme);
  };

  const handleBookmark = (memeId: string) => {
    if (bookmarkedMemes.includes(memeId)) {
      setBookmarkedMemes(bookmarkedMemes.filter(id => id !== memeId));
    } else {
      setBookmarkedMemes([...bookmarkedMemes, memeId]);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Фильтрация мемов по категории
  const filteredMemes = activeCategory === 'All' 
    ? memes 
    : memes.filter(meme => meme.category === activeCategory || meme.tags?.includes(activeCategory));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Memes Gallery</h1>
      
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-4 py-2 rounded-full ${
              activeCategory === category ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">Загрузка...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : (
        <>
          <Masonry
            breakpointCols={breakpointColumns}
            className="flex w-auto -ml-4"
            columnClassName="pl-4 bg-clip-padding"
          >
            {filteredMemes.map((meme) => (
              <div 
                key={meme.id || meme._id} 
                className="mb-4 break-inside-avoid"
                onClick={() => handleMemeClick(meme)}
              >
                <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow cursor-pointer">
                  <img 
                    src={meme.image || meme.fileUrl} 
                    alt={meme.title}
                    className="w-full h-auto"
                  />
                  <div className="p-4">
                    <h3 className="font-medium mb-2">{meme.title}</h3>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <img 
                          src={meme.author?.avatar || 'https://via.placeholder.com/40'} 
                          alt={meme.author?.name || meme.authorId?.username || 'Автор'} 
                          className="w-6 h-6 rounded-full"
                        />
                        <span>{meme.author?.name || meme.authorId?.username || 'Автор'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Heart size={16} className={bookmarkedMemes.includes(meme.id || meme._id || '') ? "fill-primary text-primary" : ""} />
                          <span>{meme.likes || meme.likesCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle size={16} />
                          <span>{meme.comments || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Masonry>

          {!loading && memes.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {selectedMeme && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-semibold">Просмотр мема</h2>
              <button 
                onClick={() => setSelectedMeme(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-auto flex-grow">
              <div className="p-4">
                <h3 className="font-medium mb-4">{selectedMeme.title}</h3>
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={selectedMeme.image || selectedMeme.fileUrl} 
                    alt={selectedMeme.title} 
                    className="w-full h-auto"
                  />
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors">
                      <Heart size={18} className={bookmarkedMemes.includes(selectedMeme.id || selectedMeme._id || '') ? "fill-primary text-primary" : ""} />
                      <span>{selectedMeme.likes || selectedMeme.likesCount || 0}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors">
                      <MessageCircle size={18} />
                      <span>{selectedMeme.comments || 0}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-primary transition-colors">
                      <Share2 size={18} />
                      <span>{selectedMeme.shares || 0}</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Eye size={18} />
                      <span>{selectedMeme.views || '1K'}</span>
                    </div>
                    <button
                      onClick={() => handleBookmark(selectedMeme.id || selectedMeme._id || '')}
                      className="text-gray-600 hover:text-primary transition-colors"
                    >
                      <Bookmark
                        size={18}
                        className={bookmarkedMemes.includes(selectedMeme.id || selectedMeme._id || '') ? "fill-primary text-primary" : ""}
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