import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react';

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

export function ModerationPage() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moderationComment, setModerationComment] = useState('');

  useEffect(() => {
    fetchPendingContent();
  }, []);

  const fetchPendingContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Требуется авторизация');
        return;
      }

      console.log('Fetching pending content with token:', token);

      const response = await fetch('http://localhost:3000/api/content/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      if (data.success && Array.isArray(data.content)) {
        setContent(data.content);
      } else {
        console.error('Invalid response format:', data);
        setError('Неверный формат данных');
      }
    } catch (err) {
      console.error('Error fetching content:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки контента');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (contentId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`http://localhost:3000/api/content/${contentId}/moderate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status,
          comment: moderationComment
        })
      });

      if (!response.ok) {
        throw new Error('Ошибка модерации');
      }

      // Обновляем список после модерации
      await fetchPendingContent();
      setModerationComment('');
    } catch (err) {
      console.error(err);
      setError('Ошибка при модерации контента');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Модерация контента</h1>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map(item => (
          <div key={item._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <img 
              src={item.fileUrl} 
              alt={item.title}
              className="w-full h-48 object-cover"
            />
            
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-500">
                  Автор: {item.authorId.username}
                </p>
                <p className="text-sm text-gray-500">
                  Тип: {item.type}
                </p>
              </div>

              <div className="space-y-2">
                <textarea
                  placeholder="Комментарий модератора"
                  className="w-full p-2 border rounded-lg text-sm"
                  value={moderationComment}
                  onChange={(e) => setModerationComment(e.target.value)}
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
          <MessageSquare size={40} className="mx-auto mb-4 opacity-50" />
          <p>Нет контента на модерации</p>
        </div>
      )}
    </div>
  );
} 