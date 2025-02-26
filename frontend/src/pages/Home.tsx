import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Image, Coins, Heart, Eye, Wallet, ChevronLeft, ChevronRight, Clock, MessageCircle, Share2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { AuthModal } from '../components/AuthModal';
import { api } from '../api/client';

interface Content {
  _id: string;
  title: string;
  type: string;
  fileUrl: string;
  authorId: {
    username: string;
  };
  createdAt: string;
  likesCount: number;
  tags: string[];
}

export function Home() {
  const { isAuthenticated } = useUser();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentComicSlide, setCurrentComicSlide] = useState(0);
  const [currentMemeSlide, setCurrentMemeSlide] = useState(0);
  const [currentNFTSlide, setCurrentNFTSlide] = useState(0);
  const [comics, setComics] = useState<Content[]>([]);
  const [memes, setMemes] = useState<Content[]>([]);
  const [nfts, setNfts] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const comicsToShow = 3;
  const memesToShow = 4;
  const nftsToShow = 3;

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const [comicsResponse, memesResponse, nftsResponse] = await Promise.all([
          api.content.getByType('comic', { limit: 9 }),
          api.content.getByType('meme', { limit: 12 }),
          api.content.getByType('nft', { limit: 9 })
        ]);

        if (comicsResponse.success) {
          setComics(comicsResponse.content);
        }

        if (memesResponse.success) {
          setMemes(memesResponse.content);
        }

        if (nftsResponse.success) {
          setNfts(nftsResponse.content);
        }
      } catch (err) {
        setError('Ошибка загрузки контента');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const prevComicSlide = () => {
    setCurrentComicSlide(prev => Math.max(0, prev - 1));
  };

  const nextComicSlide = () => {
    setCurrentComicSlide(prev => Math.min(comics.length - comicsToShow, prev + 1));
  };

  const prevMemeSlide = () => {
    setCurrentMemeSlide(prev => Math.max(0, prev - 1));
  };

  const nextMemeSlide = () => {
    setCurrentMemeSlide(prev => Math.min(memes.length - memesToShow, prev + 1));
  };

  const prevNFTSlide = () => {
    setCurrentNFTSlide(prev => Math.max(0, prev - 1));
  };

  const nextNFTSlide = () => {
    setCurrentNFTSlide(prev => Math.min(nfts.length - nftsToShow, prev + 1));
  };

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="pb-16">
      {/* Hero секция */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Платформа для создателей и коллекционеров цифрового контента
            </h1>
            <p className="text-xl mb-8 text-text/80">
              Создавайте, делитесь и коллекционируйте уникальные цифровые активы на блокчейне TON
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Начать
                </button>
              ) : (
                <Link
                  to="/profile"
                  className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Мой профиль
                </Link>
              )}
              <Link
                to="/nfts"
                className="px-8 py-3 bg-text/5 text-text rounded-lg font-semibold hover:bg-text/10 transition-colors"
              >
                Исследовать NFT
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Секция комиксов */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Популярные комиксы</h2>
            <Link
              to="/comics"
              className="text-primary hover:underline flex items-center gap-1"
            >
              Смотреть все
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-96"></div>
                ))
              ) : comics.length > 0 ? (
                comics.slice(currentComicSlide, currentComicSlide + comicsToShow).map((comic) => (
                  <div key={comic._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <Link to={`/comics/${comic._id}`}>
                      <img
                        src={comic.fileUrl}
                        alt={comic.title}
                        className="w-full h-96 object-cover"
                      />
                    </Link>
                    <div className="p-4">
                      <Link to={`/comics/${comic._id}`} className="block">
                        <h3 className="text-md font-semibold mb-2 hover:text-primary transition-colors">{comic.title}</h3>
                      </Link>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-text/70">
                            <Heart size={16} />
                            <span>{comic.likesCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-text/70">
                            <Eye size={16} />
                            <span>0</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-text/70">
                          <Clock size={16} />
                          <span>{formatDate(comic.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-500">Комиксы не найдены</p>
                </div>
              )}
            </div>

            {comics.length > comicsToShow && (
              <>
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
                  disabled={currentComicSlide + comicsToShow >= comics.length}
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/comics"
              className="inline-flex items-center gap-2 bg-text/5 text-text px-8 py-3 rounded-lg font-semibold hover:bg-text/10 transition-colors"
            >
              Смотреть все комиксы
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Секция NFT */}
      <section className="py-16 bg-text/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Популярные NFT</h2>
            <Link
              to="/nfts"
              className="text-primary hover:underline flex items-center gap-1"
            >
              Смотреть все
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-96"></div>
                ))
              ) : nfts.length > 0 ? (
                nfts.slice(currentNFTSlide, currentNFTSlide + nftsToShow).map((nft) => (
                  <div key={nft._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <Link to={`/nfts/${nft._id}`}>
                      <img
                        src={nft.fileUrl}
                        alt={nft.title}
                        className="w-full h-48 object-cover"
                      />
                    </Link>
                    <div className="p-4">
                      <Link to={`/nfts/${nft._id}`} className="block">
                        <h3 className="text-lg font-semibold mb-2 hover:text-primary transition-colors">{nft.title}</h3>
                      </Link>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-text/70">
                            <Heart size={18} />
                            <span>{nft.likesCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-text/70">
                            <Eye size={18} />
                            <span>1K</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-text/70">
                          <Wallet size={18} />
                          <span>100 TON</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-text/70">Автор: {nft.authorId?.username || 'Неизвестный'}</p>
                        <p className="text-primary">{nft.tags?.[0] || 'Art'}</p>
                      </div>
                      <Link
                        to={`/nfts/${nft._id}`}
                        className="block w-full bg-primary text-white py-2 mt-4 rounded-lg text-center font-medium hover:bg-primary/90 transition-colors"
                      >
                        Подробнее
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-500">NFT не найдены</p>
                </div>
              )}
            </div>

            {nfts.length > nftsToShow && (
              <>
                <button
                  onClick={prevNFTSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-background text-text p-2 rounded-full shadow-lg hover:bg-text/5 transition-colors"
                  disabled={currentNFTSlide === 0}
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextNFTSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-background text-text p-2 rounded-full shadow-lg hover:bg-text/5 transition-colors"
                  disabled={currentNFTSlide + nftsToShow >= nfts.length}
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Секция мемов */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Популярные мемы</h2>
            <Link
              to="/memes"
              className="text-primary hover:underline flex items-center gap-1"
            >
              Смотреть все
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-64"></div>
                ))
              ) : memes.length > 0 ? (
                memes.slice(currentMemeSlide, currentMemeSlide + memesToShow).map((meme) => (
                  <div key={meme._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <Link to={`/memes/${meme._id}`}>
                      <img
                        src={meme.fileUrl}
                        alt={meme.title}
                        className="w-full h-40 object-cover"
                      />
                    </Link>
                    <div className="p-4">
                      <Link to={`/memes/${meme._id}`} className="block">
                        <h3 className="text-md font-semibold mb-2 hover:text-primary transition-colors">{meme.title}</h3>
                      </Link>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-text/70">
                            <Heart size={16} />
                            <span>{meme.likesCount || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-text/70">
                            <MessageCircle size={16} />
                            <span>0</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-text/70">
                          <Clock size={16} />
                          <span>{formatDate(meme.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center py-12">
                  <p className="text-gray-500">Мемы не найдены</p>
                </div>
              )}
            </div>

            {memes.length > memesToShow && (
              <>
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
                  disabled={currentMemeSlide + memesToShow >= memes.length}
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          <div className="text-center mt-8">
            <Link
              to="/memes"
              className="inline-flex items-center gap-2 bg-text/5 text-text px-8 py-3 rounded-lg font-semibold hover:bg-text/10 transition-colors"
            >
              Смотреть все мемы
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