import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, MessageCircle, Clock, User, Filter, Image, Book, Palette } from 'lucide-react';
import { api } from '../api/client';
import { Link } from 'react-router-dom';

interface FeedItem {
  _id: string;
  type: 'meme' | 'comic' | 'nft';
  title: string;
  fileUrl: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  author: {
    _id: string;
    username: string;
    avatar?: string;
  };
}

type ContentFilter = 'all' | 'meme' | 'comic' | 'nft';

export function ActivityFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ContentFilter>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Реф для последнего элемента (для определения конца списка)
  const observer = useRef<IntersectionObserver>();
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    
    if (observer.current) {
      observer.current.disconnect();
    }
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    
    if (node) {
      observer.current.observe(node);
    }
  }, [loading, hasMore]);

  const fetchFeed = async (pageNum: number, isNewFilter = false) => {
    try {
      setLoading(true);
      const response = await api.follows.getFeed(activeFilter, pageNum);
      
      if (isNewFilter) {
        setFeed(response.feed);
      } else {
        setFeed(prev => [...prev, ...response.feed]);
      }
      
      setHasMore(response.hasMore);
    } catch (err) {
      setError('Ошибка загрузки ленты');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchFeed(1, true);
  }, [activeFilter]);

  useEffect(() => {
    if (page > 1) {
      fetchFeed(page);
    }
  }, [page]);

  const filterButtons: { type: ContentFilter; label: string; icon: React.ReactNode }[] = [
    { type: 'all', label: 'Все', icon: <Filter className="w-5 h-5" /> },
    { type: 'meme', label: 'Мемы', icon: <Image className="w-5 h-5" /> },
    { type: 'comic', label: 'Комиксы', icon: <Book className="w-5 h-5" /> },
    { type: 'nft', label: 'NFT', icon: <Palette className="w-5 h-5" /> },
  ];

  const renderFilters = () => (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {filterButtons.map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => setActiveFilter(type)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap
            ${activeFilter === type
              ? 'bg-primary text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          {icon}
          <span>{label}</span>
          {type !== 'all' && (
            <span className="text-sm">
              ({feed.filter(item => item.type === type).length})
            </span>
          )}
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <>
        {renderFilters()}
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {renderFilters()}
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </>
    );
  }

  if (feed.length === 0) {
    return (
      <>
        {renderFilters()}
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 mb-4">
            {activeFilter === 'all'
              ? 'Лента пуста. Подпишитесь на других пользователей, чтобы видеть их контент.'
              : `Нет контента типа "${filterButtons.find(b => b.type === activeFilter)?.label}" в вашей ленте.`
            }
          </p>
          <Link
            to="/users"
            className="text-primary hover:underline"
          >
            Найти пользователей
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      {renderFilters()}
      <div className="space-y-6">
        {feed.map((item, index) => (
          <div 
            key={item._id}
            ref={index === feed.length - 1 ? lastElementRef : undefined}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            {/* Шапка с информацией об авторе */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                  {item.author.avatar ? (
                    <img 
                      src={item.author.avatar} 
                      alt={item.author.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-full h-full p-2 text-gray-400" />
                  )}
                </div>
                <div>
                  <Link 
                    to={`/profile/${item.author._id}`}
                    className="font-medium hover:text-primary"
                  >
                    {item.author.username}
                  </Link>
                  <p className="text-sm text-gray-500">
                    <Clock className="inline-block w-4 h-4 mr-1" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Контент */}
            <div className="aspect-video bg-gray-100">
              <img 
                src={item.fileUrl} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Футер с действиями */}
            <div className="p-4">
              <h3 className="font-medium mb-2">{item.title}</h3>
              <div className="flex items-center gap-4 text-gray-500">
                <button className="flex items-center gap-1 hover:text-primary">
                  <Heart className="w-5 h-5" />
                  {item.likesCount}
                </button>
                <button className="flex items-center gap-1 hover:text-primary">
                  <MessageCircle className="w-5 h-5" />
                  {item.commentsCount}
                </button>
                <span className="text-sm capitalize">{item.type}</span>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        
        {!loading && !hasMore && feed.length > 0 && (
          <div className="text-center text-gray-500 py-4">
            Больше нет публикаций
          </div>
        )}
        
        {!loading && feed.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <Clock size={40} className="mx-auto mb-4 opacity-50" />
            <p>Лента пуста. Подпишитесь на других пользователей, чтобы видеть их публикации.</p>
          </div>
        )}
      </div>
    </>
  );
} 