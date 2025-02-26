import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, BookOpen, Share2, Download, Heart, Eye, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api/client';

interface Comic {
  _id: string;
  title: string;
  fileUrl: string;
  pages: string[];
  authorId: {
    username: string;
  };
  metadata: {
    description?: string;
  };
  createdAt: string;
  likesCount: number;
  tags: string[];
}

export function ComicDetails() {
  const { id } = useParams<{ id: string }>();
  const [comic, setComic] = useState<Comic | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchComic = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/content/${id}`);
        const data = await response.json();
        setComic(data);
        // Проверяем, лайкнул ли пользователь этот комикс
        const likeStatus = await api.likes.checkLikeStatus(data._id);
        setIsLiked(likeStatus.isLiked);
      } catch (error) {
        setError('Ошибка загрузки комикса');
        console.error('Error fetching comic:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchComic();
    }
  }, [id]);

  const handleLike = async () => {
    if (!comic) return;
    
    try {
      const response = await api.likes.like(comic._id);
      if (response.success) {
        setIsLiked(!isLiked);
        setComic(prev => prev ? {
          ...prev,
          likesCount: isLiked ? prev.likesCount - 1 : prev.likesCount + 1
        } : null);
      }
    } catch (err) {
      console.error('Error liking comic:', err);
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;
  if (!comic) return <div>Комикс не найден</div>;

  // Получаем все страницы комикса
  const pages = [comic.fileUrl, ...(comic.pages || [])];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/comics" className="flex items-center gap-2 text-gray-600 hover:text-primary">
            <ArrowLeft size={20} />
            Назад к комиксам
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Информация о комиксе */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold mb-2">{comic.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Автор: {comic.authorId.username}</span>
              <span>•</span>
              <span>{new Date(comic.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Просмотр страниц */}
          <div className="relative">
            <img 
              src={pages[currentPage]} 
              alt={`Страница ${currentPage + 1}`}
              className="w-full h-auto"
            />

            {/* Навигация по страницам */}
            <div className="flex items-center justify-between p-4 bg-white border-t">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="flex items-center gap-2 text-gray-600 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
                Назад
              </button>
              
              <div className="font-medium">
                Страница {currentPage + 1} из {pages.length}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(pages.length - 1, prev + 1))}
                disabled={currentPage === pages.length - 1}
                className="flex items-center gap-2 text-gray-600 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Вперед
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}