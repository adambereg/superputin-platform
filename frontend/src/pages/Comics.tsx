import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Clock, Star, TrendingUp } from 'lucide-react';
import { api } from '../api/client';
import { Pagination } from '../components/Pagination';

interface Comic {
  id: string;
  _id?: string; // Добавляем для совместимости с API
  title: string;
  cover?: string;
  fileUrl?: string; // Добавляем для совместимости с API
  author?: string;
  authorId?: { username: string }; // Добавляем для совместимости с API
  rating?: number;
  episodes?: number;
  views?: string;
  lastUpdated?: string;
  category?: string;
  tags?: string[]; // Добавляем для совместимости с API
  createdAt?: string; // Добавляем для совместимости с API
  moderationStatus?: string;
}

export function Comics() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const categories = ["All", "Action", "Sci-Fi", "Fantasy"];

  useEffect(() => {
    fetchComics(currentPage);
  }, [currentPage]);

  const fetchComics = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.content.getByType('comic', page);
      
      if (response.success) {
        // Преобразуем данные в нужный формат
        const formattedComics = response.content.map((comic: any) => ({
          id: comic._id,
          _id: comic._id,
          title: comic.title,
          cover: comic.fileUrl,
          fileUrl: comic.fileUrl,
          author: comic.authorId?.username || 'Неизвестный автор',
          authorId: comic.authorId,
          rating: 4.5, // Временное значение
          episodes: 10, // Временное значение
          views: '1K', // Временное значение
          lastUpdated: new Date(comic.createdAt).toLocaleDateString(),
          category: comic.tags?.[0] || 'Action',
          tags: comic.tags,
          createdAt: comic.createdAt,
          moderationStatus: comic.moderationStatus
        }));
        
        setComics(formattedComics);
        setTotalPages(response.pagination.pages);
        setCurrentPage(response.pagination.page);
      } else {
        setError(response.error || 'Не удалось загрузить комиксы');
      }
    } catch (error) {
      setError('Произошла ошибка при загрузке комиксов');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация комиксов по категории
  const filteredComics = activeCategory === 'All' 
    ? comics 
    : comics.filter(comic => comic.category === activeCategory || comic.tags?.includes(activeCategory));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Comics Gallery</h1>
      
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory('All')}
          className={`px-4 py-2 rounded-full ${
            activeCategory === 'All' ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveCategory('Action')}
          className={`px-4 py-2 rounded-full ${
            activeCategory === 'Action' ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
        >
          Action
        </button>
        <button
          onClick={() => setActiveCategory('Sci-Fi')}
          className={`px-4 py-2 rounded-full ${
            activeCategory === 'Sci-Fi' ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
        >
          Sci-Fi
        </button>
        <button
          onClick={() => setActiveCategory('Fantasy')}
          className={`px-4 py-2 rounded-full ${
            activeCategory === 'Fantasy' ? 'bg-primary text-white' : 'bg-gray-100'
          }`}
        >
          Fantasy
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">Загрузка...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredComics.map((comic) => (
              <div key={comic.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
                <div className="relative aspect-[2/3]">
                  <img 
                    src={comic.cover || comic.fileUrl} 
                    alt={comic.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-xs">
                    {comic.category || comic.tags?.[0] || 'Comic'}
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <h3 className="font-poppins font-semibold text-xl">{comic.title}</h3>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-text/70">
                        <Star size={18} className="text-yellow-500" />
                        {comic.rating || '4.5'}
                      </div>
                      <div className="flex items-center gap-1 text-text/70">
                        <Eye size={18} />
                        {comic.views || '1K'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-text/70">
                      <Clock size={18} />
                      {comic.lastUpdated || new Date(comic.createdAt || '').toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-text/70">Автор: {comic.author || comic.authorId?.username || 'Неизвестный'}</p>
                    <p className="text-primary">{comic.category || comic.tags?.[0] || 'Comic'}</p>
                  </div>

                  <Link
                    to={`/comics/${comic.id}`}
                    className="block w-full bg-primary text-white py-3 rounded-lg text-center font-medium hover:bg-primary/90 transition-colors"
                  >
                    Читать
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {!loading && comics.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
}