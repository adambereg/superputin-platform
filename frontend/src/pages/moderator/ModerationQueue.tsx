import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Edit2, Trash2 } from 'lucide-react';
import { EditContentModal } from '../../components/EditContentModal';
import { api } from '../../api/client';

interface Content {
  _id: string;
  title: string;
  type: string;
  fileUrl: string;
  authorId: {
    username: string;
    email: string;
  };
  createdAt: string;
}

export function ModerationQueue() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moderationComment, setModerationComment] = useState('');
  const [editingContent, setEditingContent] = useState<any>(null);

  useEffect(() => {
    fetchPendingContent();
  }, []);

  const fetchPendingContent = async () => {
    try {
      const response = await api.content.getPending();
      if (response.success) {
        setContent(response.content);
      }
    } catch (error) {
      setError('Ошибка загрузки контента');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (contentId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await api.content.moderate(contentId, {
        status,
        comment: moderationComment
      });
      
      if (response.success) {
        setContent(content.filter(item => item._id !== contentId));
        setModerationComment('');
        alert(status === 'approved' ? 'Контент одобрен' : 'Контент отклонен');
      } else {
        alert(`Ошибка: ${response.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Ошибка модерации:', error);
      alert('Ошибка при выполнении модерации');
    }
  };

  const handleUpdateContent = async (contentId: string, data: { title: string; tags: string[] }) => {
    try {
      await api.content.update(contentId, data);
      // Обновляем список контента
      fetchPendingContent();
    } catch (error) {
      console.error('Failed to update content:', error);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      await api.content.delete(contentId);
      // Обновляем список контента
      fetchPendingContent();
    } catch (error) {
      console.error('Failed to delete content:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">{error}</div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Clock className="text-primary" />
        Очередь модерации
      </h1>

      <div className="grid gap-6">
        {content.map((item) => (
          <div key={item._id} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-500">
                  Автор: {item.authorId.username}
                </p>
                <p className="text-sm text-gray-500">
                  Создано: {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">
                {item.type}
              </span>
            </div>

            <div className="mt-4">
              <img 
                src={item.fileUrl} 
                alt={item.title}
                className="max-h-96 rounded-lg"
              />
            </div>

            <div className="mt-4">
              <textarea
                placeholder="Комментарий модератора..."
                className="w-full p-2 border rounded-lg"
                value={moderationComment}
                onChange={(e) => setModerationComment(e.target.value)}
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleModerate(item._id, 'approved')}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <CheckCircle size={20} />
                Одобрить
              </button>
              <button
                onClick={() => handleModerate(item._id, 'rejected')}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <XCircle size={20} />
                Отклонить
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditingContent(item)}
                className="p-2 text-gray-600 hover:text-primary transition-colors"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Вы уверены, что хотите удалить этот контент?')) {
                    handleDeleteContent(item._id);
                  }
                }}
                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {content.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Нет контента на модерации
          </div>
        )}
      </div>

      {editingContent && (
        <EditContentModal
          content={editingContent}
          onClose={() => setEditingContent(null)}
          onUpdate={handleUpdateContent}
          onDelete={handleDeleteContent}
        />
      )}
    </div>
  );
} 