import React, { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import { Wallet, Tag, Eye, Heart, Share2, Clock, TrendingUp, Siren as Fire, Bookmark, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api/client';
import { Pagination } from '../components/Pagination';

const breakpointColumns = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

const categories = ["All", "Art", "Collectibles", "Photography", "Gaming", "Music", "Virtual Worlds"];
const sortOptions = ["trending", "latest", "price-high", "price-low"];

interface NFT {
  id?: string;
  _id?: string;
  title: string;
  image?: string;
  fileUrl?: string;
  price?: string;
  creator?: {
    name: string;
    avatar: string;
    address: string;
  };
  authorId?: {
    username: string;
  };
  views?: string;
  likes?: number;
  likesCount?: number;
  shares?: number;
  category?: string;
  tags?: string[];
  lastBid?: string;
  endTime?: string;
  description?: string;
  createdAt?: string;
}

export function NFTs() {
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('trending');
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [bookmarkedNFTs, setBookmarkedNFTs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNFTs(currentPage);
  }, [currentPage]);

  const fetchNFTs = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.content.getByType('nft', page);
      
      if (response.success) {
        // Преобразуем данные в нужный формат
        const formattedNFTs = response.content.map((nft: any) => ({
          id: nft._id,
          _id: nft._id,
          title: nft.title,
          image: nft.fileUrl,
          fileUrl: nft.fileUrl,
          price: '10 TON',
          creator: {
            name: nft.authorId?.username || 'Неизвестный автор',
            avatar: 'https://via.placeholder.com/40',
            address: '0x1234...5678'
          },
          authorId: nft.authorId,
          views: '1K',
          likes: nft.likesCount || 0,
          likesCount: nft.likesCount || 0,
          shares: 0,
          category: nft.tags?.[0] || 'Art',
          tags: nft.tags,
          lastBid: '8 TON',
          endTime: '24h',
          description: nft.description || 'Описание отсутствует',
          createdAt: nft.createdAt
        }));
        
        setNFTs(formattedNFTs);
        setTotalPages(response.pagination.pages);
        setCurrentPage(response.pagination.page);
      } else {
        setError(response.error || 'Не удалось загрузить NFT');
      }
    } catch (error) {
      setError('Произошла ошибка при загрузке NFT');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
  };

  const handleNFTClick = (nft: NFT) => {
    setSelectedNFT(nft);
  };

  const handleBookmark = (nftId: string) => {
    if (bookmarkedNFTs.includes(nftId)) {
      setBookmarkedNFTs(bookmarkedNFTs.filter(id => id !== nftId));
    } else {
      setBookmarkedNFTs([...bookmarkedNFTs, nftId]);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Фильтрация NFT по категории
  const filteredNFTs = activeCategory === 'All' 
    ? nfts 
    : nfts.filter(nft => nft.category === activeCategory || nft.tags?.includes(activeCategory));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">NFT Marketplace</h1>
      
      <div className="flex flex-wrap justify-between items-center mb-8">
        <div className="flex flex-wrap gap-2">
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
        
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <span className="text-gray-500">Сортировать:</span>
          <select 
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="trending">По популярности</option>
            <option value="latest">Новые</option>
            <option value="price-high">Цена (выс-низ)</option>
            <option value="price-low">Цена (низ-выс)</option>
          </select>
        </div>
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
            {filteredNFTs.map((nft) => (
              <div 
                key={nft.id || nft._id} 
                className="mb-4 break-inside-avoid"
                onClick={() => handleNFTClick(nft)}
              >
                <div className="bg-white rounded-xl overflow-hidden shadow hover:shadow-md transition-shadow cursor-pointer">
                  <div className="relative">
                    <img 
                      src={nft.image || nft.fileUrl} 
                      alt={nft.title}
                      className="w-full h-auto"
                    />
                    <div className="absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded text-xs">
                      {nft.category || nft.tags?.[0] || 'NFT'}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium mb-2">{nft.title}</h3>
                    
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <img 
                          src={nft.creator?.avatar || 'https://via.placeholder.com/40'} 
                          alt={nft.creator?.name || nft.authorId?.username || 'Создатель'} 
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm">{nft.creator?.name || nft.authorId?.username || 'Создатель'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary font-medium">
                        <Wallet size={16} />
                        <span>{nft.price}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Heart size={16} className={bookmarkedNFTs.includes(nft.id || nft._id || '') ? "fill-primary text-primary" : ""} />
                        <span>{nft.likes || nft.likesCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>Ends in {nft.endTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Masonry>

          {!loading && nfts.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {selectedNFT && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="font-semibold">Детали NFT</h2>
              <button 
                onClick={() => setSelectedNFT(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-auto flex-grow">
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={selectedNFT.image || selectedNFT.fileUrl} 
                    alt={selectedNFT.title} 
                    className="w-full h-auto"
                  />
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">{selectedNFT.title}</h3>
                    <p className="text-gray-600">{selectedNFT.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedNFT.creator?.avatar || 'https://via.placeholder.com/40'} 
                      alt={selectedNFT.creator?.name || selectedNFT.authorId?.username || 'Создатель'} 
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{selectedNFT.creator?.name || selectedNFT.authorId?.username || 'Создатель'}</p>
                      <p className="text-sm text-gray-500">{selectedNFT.creator?.address || '0x1234...5678'}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <p className="text-gray-500">Текущая цена</p>
                      <p className="font-semibold text-primary">{selectedNFT.price}</p>
                    </div>
                    <div className="flex justify-between mb-2">
                      <p className="text-gray-500">Последняя ставка</p>
                      <p>{selectedNFT.lastBid || '10 TON'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Просмотры</p>
                      <p>{selectedNFT.views || '1K'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Создан</p>
                      <p>{new Date(selectedNFT.createdAt || '').toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors">
                      <Heart size={18} className={bookmarkedNFTs.includes(selectedNFT.id || selectedNFT._id || '') ? "fill-primary text-primary" : ""} />
                      <span>{selectedNFT.likes || selectedNFT.likesCount || 0}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-600 hover:text-primary transition-colors">
                      <Share2 size={18} />
                      <span>{selectedNFT.shares || 0}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Eye size={18} />
                      <span>{selectedNFT.views || '1K'}</span>
                    </div>
                    <button
                      onClick={() => handleBookmark(selectedNFT.id || selectedNFT._id || '')}
                      className="text-gray-600 hover:text-primary transition-colors"
                    >
                      <Bookmark
                        size={18}
                        className={bookmarkedNFTs.includes(selectedNFT.id || selectedNFT._id || '') ? "fill-primary text-primary" : ""}
                      />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-600">Аукцион заканчивается через:</p>
                    <p className="font-medium">{selectedNFT.endTime || '24h'}</p>
                  </div>
                  <button className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium">
                    Сделать ставку
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}