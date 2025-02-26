import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Search, Eye, Trash2, AlertCircle, Filter, Upload } from 'lucide-react';
import { UploadContent } from '../../components/UploadContent';
import { UploadContentModal } from '../../components/UploadContentModal';
import { EditContentModal } from '../../components/EditContentModal';
import { Edit2 } from 'lucide-react';

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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);

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
    try {
      const token = localStorage.getItem('token');
      console.log('Deleting content:', contentId);
      
      const response = await fetch(`http://localhost:3000/api/content/${contentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Delete response status:', response.status);
      const data = await response.json();
      console.log('Delete response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || `Ошибка удаления: ${response.status}`);
      }

      // Обновляем список контента после успешного удаления
      setContent(prevContent => prevContent.filter(item => item._id !== contentId));
      
      // Показываем уведомление об успехе
      alert('Контент успешно удален');
    } catch (err) {
      console.error('Error deleting content:', err);
      setError(err instanceof Error ? err.message : 'Ошибка удаления контента');
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

  const handleUpload = async (formData: FormData) => {
    try {
      const xhr = new XMLHttpRequest();
      
      xhr.onload = () => {
        if (xhr.status === 201) {
          fetchContent(); // Обновляем список контента
          setIsUploadModalOpen(false);
        } else {
          console.error('Upload failed');
        }
      };
      
      xhr.open('POST', 'http://localhost:3000/api/content/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleUpdateContent = async (contentId: string, data: { title: string; tags: string[] }) => {
    try {
      await api.content.update(contentId, data);
      // Обновляем список контента
      fetchContent();
    } catch (error) {
      console.error('Failed to update content:', error);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    try {
      await api.content.delete(contentId);
      // Обновляем список контента
      fetchContent();
    } catch (error) {
      console.error('Failed to delete content:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Управление контентом</h1>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg"
        >
          <Upload size={20} />
          Загрузить контент
        </button>
      </div>

      <UploadContent onSuccess={fetchContent} />

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
                          onClick={() => {
                            if (window.confirm('Вы уверены, что хотите удалить этот контент?')) {
                              handleDeleteContent(item._id);
                            }
                          }}
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

      <UploadContentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        simplified={true} // Упрощенный режим для админов
      />

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