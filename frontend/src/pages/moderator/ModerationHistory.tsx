import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface ModeratedContent {
  _id: string;
  title: string;
  type: string;
  moderationStatus: string;
  moderationComment: string;
  moderatedAt: string;
  authorId: {
    username: string;
  };
}

export function ModerationHistory() {
  const [history, setHistory] = useState<ModeratedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/moderator/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      setError('Ошибка загрузки истории');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" />;
      case 'rejected':
        return <XCircle className="text-red-500" />;
      default:
        return <Clock className="text-yellow-500" />;
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
      <h1 className="text-2xl font-bold mb-6">История модерации</h1>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                Комментарий
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {history.map((item) => (
              <tr key={item._id}>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-gray-500">{item.type}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {item.authorId.username}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.moderationStatus)}
                    <span className="capitalize">{item.moderationStatus}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {item.moderationComment || '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                  {new Date(item.moderatedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {history.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            История модерации пуста
          </div>
        )}
      </div>
    </div>
  );
} 