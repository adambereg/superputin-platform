import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileUp, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../api/client';

interface ModeratorStats {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalModerated: number;
}

export function ModeratorDashboard() {
  const [stats, setStats] = useState<ModeratorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    description: '',
    type: 'meme'
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.moderator.getStats();
      
      if (response.success) {
        setStats(response.stats);
      } else {
        setError(response.error || 'Не удалось загрузить статистику');
      }
    } catch (err) {
      setError('Ошибка загрузки статистики');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUploadFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setUploadError('Пожалуйста, выберите файл');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('title', uploadFormData.title);
      formData.append('description', uploadFormData.description);
      formData.append('type', uploadFormData.type);
      formData.append('file', file);
      
      // Имитация прогресса загрузки
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);
      
      const response = await api.content.upload(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.success) {
        setUploadSuccess(true);
        // Сбрасываем форму
        setUploadFormData({
          title: '',
          description: '',
          type: 'meme'
        });
        setFile(null);
        
        // Закрываем модальное окно через 2 секунды
        setTimeout(() => {
          setIsUploadModalOpen(false);
          setUploadSuccess(false);
        }, 2000);
      } else {
        setUploadError(response.error || 'Ошибка загрузки');
      }
    } catch (err) {
      setUploadError('Произошла ошибка при загрузке');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Обзор модератора</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Обзор модератора</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Обзор модератора</h1>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <FileUp size={18} />
          Загрузить контент
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Ожидает модерации</h3>
            <AlertTriangle size={24} className="text-amber-500" />
          </div>
          <p className="text-3xl font-bold">{stats?.pendingCount || 0}</p>
          <Link 
            to="/moderator/queue" 
            className="mt-4 inline-block text-primary hover:underline"
          >
            Перейти к очереди
          </Link>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Одобрено</h3>
            <CheckCircle size={24} className="text-green-500" />
          </div>
          <p className="text-3xl font-bold">{stats?.approvedCount || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Отклонено</h3>
            <XCircle size={24} className="text-red-500" />
          </div>
          <p className="text-3xl font-bold">{stats?.rejectedCount || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Всего проверено</h3>
            <Clock size={24} className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold">{stats?.totalModerated || 0}</p>
          <Link 
            to="/moderator/history" 
            className="mt-4 inline-block text-primary hover:underline"
          >
            История модерации
          </Link>
        </div>
      </div>
      
      {/* Модальное окно загрузки контента */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">Загрузка контента</h3>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isUploading}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-4">
              {uploadSuccess ? (
                <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
                  Контент успешно загружен и отправлен на модерацию!
                </div>
              ) : (
                <>
                  {uploadError && (
                    <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
                      {uploadError}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={uploadFormData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Описание
                    </label>
                    <textarea
                      name="description"
                      value={uploadFormData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Тип контента
                    </label>
                    <select
                      name="type"
                      value={uploadFormData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="meme">Мем</option>
                      <option value="comic">Комикс</option>
                      <option value="nft">NFT</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Файл
                    </label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      accept="image/jpeg,image/png,image/gif"
                      required
                    />
                    {file && (
                      <p className="mt-1 text-sm text-gray-500">
                        Выбран файл: {file.name} ({Math.round(file.size / 1024)} KB)
                      </p>
                    )}
                  </div>
                  
                  {isUploading && (
                    <div className="mb-4">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-center text-sm mt-1">
                        {uploadProgress}% загружено
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors disabled:bg-gray-400"
                    >
                      {isUploading ? 'Загрузка...' : 'Загрузить'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 