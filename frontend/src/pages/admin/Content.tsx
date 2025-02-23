import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Search, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Content {
  id: string;
  title: string;
  type: 'meme' | 'comic' | 'nft';
  fileUrl: string;
  authorId: {
    username: string;
    email: string;
  };
  moderationStatus: 'pending' | 'approved' | 'rejected';
  moderationComment?: string;
  createdAt: string;
}

export function ContentManagement() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    fetchContent();
  }, [page, selectedType, selectedStatus]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await api.admin.getContent({
        page,
        type: selectedType,
        status: selectedStatus
      });
      setContent(response.content);
      setTotalPages(response.pagination.pages);
    } catch (err) {
      setError('Ошибка загрузки контента');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contentId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот контент?')) {
      return;
    }

    try {
      await api.admin.deleteContent(contentId);
      setContent(content.filter(item => item.id !== contentId));
    } catch (err) {
      console.error('Ошибка удаления контента:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <Clock className="text-yellow-500" size={20} />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Управление контентом</h1>
        <div className="flex gap-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Все типы</option>
            <option value="meme">Мемы</option>
            <option value="comic">Комиксы</option>
            <option value="nft">NFT</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="">Все статусы</option>
            <option value="pending">На проверке</option>
            <option value="approved">Одобрено</option>
            <option value="rejected">Отклонено</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div>Загрузка...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <img
                  src={item.fileUrl}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-gray-500">
                        Автор: {item.authorId.username}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.moderationStatus)}
                      <span className="text-sm capitalize">
                        {item.moderationStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
            >
              Назад
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
            >
              Вперед
            </button>
          </div>
        </>
      )}
    </div>
  );
} 