import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileUp, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../api/client';
import { UploadContentModal } from '../../components/UploadContentModal';

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

  const handleUpload = async (formData: FormData) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 201) {
          setUploadSuccess(true);
          fetchStats(); // Обновляем статистику
        } else {
          setUploadError('Ошибка при загрузке');
        }
        setIsUploading(false);
      };
      
      xhr.onerror = () => {
        setUploadError('Ошибка сети');
        setIsUploading(false);
      };
      
      xhr.open('POST', 'http://localhost:3000/api/content/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Ошибка при загрузке');
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
      <UploadContentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
} 