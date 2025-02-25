import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import { api } from '../../api/client';

interface Content {
  _id: string;
  title: string;
  type: string;
  fileUrl: string;
  authorId: {
    _id: string;
    username: string;
  };
  createdAt: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
}

export function ModerationPage() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [moderationComment, setModerationComment] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPendingContent();
  }, []);

  const fetchPendingContent = async () => {
    try {
      setLoading(true);
      const response = await api.content.getPending();
      
      if (response.success) {
        setContent(response.content);
      } else {
        setError(response.error || 'Не удалось загрузить контент');
      }
    } catch (err) {
      setError('Ошибка загрузки контента');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (status: 'approved' | 'rejected') => {
    if (!selectedContent) return;
    
    try {
      const response = await api.content.moderate(selectedContent._id, {
        status,
        comment: moderationComment
      });
      
      if (response.message) {
        setContent(prevContent => 
          prevContent.filter(item => item._id !== selectedContent._id)
        );
        setIsModalOpen(false);
        setSelectedContent(null);
        setModerationComment('');
      } else {
        alert(response.error || 'Ошибка модерации');
      }
    } catch (err) {
      console.error(err);
      alert('Произошла ошибка при модерации');
    }
  };

  const openModerationModal = (item: Content) => {
    setSelectedContent(item);
    setModerationComment('');
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Модерация контента</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Модерация контента</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Модерация контента</h1>
      
      {content.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map(item => (
            <div key={item._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="relative aspect-video bg-gray-100">
                {item.type === 'meme' || item.type === 'comic' ? (
                  <img 
                    src={item.fileUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <AlertCircle size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span>Автор: {item.authorId?.username || 'Неизвестно'}</span>
                  <span className="mx-2">•</span>
                  <span>Тип: {item.type}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  
                  <button
                    onClick={() => openModerationModal(item)}
                    className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
                  >
                    Модерировать
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p>Нет контента на модерации</p>
        </div>
      )}
      
      {/* Модальное окно модерации */}
      {isModalOpen && selectedContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">Модерация контента</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <h4 className="font-medium mb-2">{selectedContent.title}</h4>
                <p className="text-sm text-gray-500">
                  Автор: {selectedContent.authorId?.username || 'Неизвестно'} • 
                  Тип: {selectedContent.type} • 
                  Создано: {new Date(selectedContent.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="mb-4 aspect-video bg-gray-100 rounded overflow-hidden">
                {selectedContent.type === 'meme' || selectedContent.type === 'comic' ? (
                  <img 
                    src={selectedContent.fileUrl} 
                    alt={selectedContent.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <AlertCircle size={48} className="text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Комментарий модератора
                </label>
                <textarea
                  value={moderationComment}
                  onChange={(e) => setModerationComment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Введите комментарий (опционально)"
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleModerate('rejected')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  <XCircle size={18} />
                  Отклонить
                </button>
                <button
                  onClick={() => handleModerate('approved')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  <CheckCircle size={18} />
                  Одобрить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 