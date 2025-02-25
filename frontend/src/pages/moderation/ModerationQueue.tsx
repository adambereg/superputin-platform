import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { 
  CheckCircle, XCircle, AlertCircle, 
  MessageSquare, Clock, Filter 
} from 'lucide-react';

interface Content {
  _id: string;
  title: string;
  type: 'meme' | 'comic' | 'nft';
  fileUrl: string;
  authorId: {
    username: string;
    email: string;
  };
  createdAt: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
}

interface ModerationComment {
  status: 'approved' | 'rejected';
  comment: string;
}

export function ModerationQueue() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchModerationQueue();
  }, []);

  const fetchModerationQueue = async () => {
    try {
      setLoading(true);
      const response = await api.content.getModerationQueue();
      setContent(response.content);
    } catch (err) {
      setError('Ошибка загрузки очереди модерации');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (contentId: string, status: 'approved' | 'rejected') => {
    try {
      await api.content.moderate(contentId, {
        status,
        comment
      });
      
      // Обновляем список после модерации
      setContent(content.filter(item => item._id !== contentId));
      setSelectedContent(null);
      setComment('');
    } catch (err) {
      console.error('Moderation error:', err);
      setError('Ошибка модерации контента');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Очередь модерации</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {content.length} {content.length === 1 ? 'элемент' : 'элементов'} на модерации
          </span>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Filter size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map(item => (
          <div key={item._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              <img 
                src={item.fileUrl} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white rounded text-xs">
                {item.type.toUpperCase()}
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-sm text-gray-500">
                  Автор: {item.authorId.username}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-2">
                <textarea
                  placeholder="Комментарий модератора..."
                  value={selectedContent?._id === item._id ? comment : ''}
                  onChange={(e) => {
                    setSelectedContent(item);
                    setComment(e.target.value);
                  }}
                  className="w-full text-sm p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={2}
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleModerate(item._id, 'approved')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle size={16} />
                    Одобрить
                  </button>
                  <button
                    onClick={() => handleModerate(item._id, 'rejected')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <XCircle size={16} />
                    Отклонить
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {content.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <Clock size={40} className="mx-auto mb-4 opacity-50" />
          <p>Очередь модерации пуста</p>
        </div>
      )}
    </div>
  );
} 