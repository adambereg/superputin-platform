import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Search, Eye, Trash2, AlertCircle, Filter } from 'lucide-react';

interface Content {
  _id: string;
  title: string;
  type: 'meme' | 'comic' | 'nft';
  fileUrl: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  authorId: {
    username: string;
    email: string;
  };
  createdAt: string;
  moderatedAt?: string;
  moderatedBy?: {
    username: string;
  };
}

interface ContentResponse {
  content: Content[];
  total: number;
  pages: number;
}

export function ContentManagement() {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    fetchContent();
  }, [page, statusFilter, typeFilter]);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const response: ContentResponse = await api.admin.getContent({ 
        page,
        limit: 10,
        status: statusFilter,
        type: typeFilter
      });
      
      setContent(response.content);
      setTotalPages(response.pages);
    } catch (err) {
      setError('Ошибка загрузки контента');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contentId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот контент?')) {
      try {
        await api.admin.deleteContent(contentId);
        setContent(content.filter(item => item._id !== contentId));
      } catch (err) {
        setError('Ошибка удаления контента');
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'На модерации';
      case 'approved':
        return 'Одобрено';
      case 'rejected':
        return 'Отклонено';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Управление контентом</h1>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Все статусы</option>
            <option value="pending">На модерации</option>
            <option value="approved">Одобрено</option>
            <option value="rejected">Отклонено</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Все типы</option>
            <option value="meme">Мемы</option>
            <option value="comic">Комиксы</option>
            <option value="nft">NFT</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64 text-red-500">
          <AlertCircle className="mr-2" />
          {error}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Контент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Автор
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата создания
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {content.map(item => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-20 w-20 flex-shrink-0">
                          <img 
                            src={item.fileUrl} 
                            alt={item.title}
                            className="h-20 w-20 object-cover rounded-lg"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-gray-500 uppercase">{item.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{item.authorId.username}</div>
                      <div className="text-sm text-gray-500">{item.authorId.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(item.moderationStatus)}`}>
                        {getStatusText(item.moderationStatus)}
                      </span>
                      {item.moderatedBy && (
                        <div className="text-xs text-gray-500 mt-1">
                          Модератор: {item.moderatedBy.username}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => window.open(item.fileUrl, '_blank')}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Просмотреть"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Назад
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Вперед
            </button>
          </div>
        </>
      )}
    </div>
  );
} 