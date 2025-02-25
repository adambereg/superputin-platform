import React, { useState, useEffect } from 'react';
import { User, Settings, FileText, Award, Bell, Shield, LogOut } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { api } from '../../api/client';
import { useNavigate } from 'react-router-dom';

interface UserContent {
  _id: string;
  title: string;
  type: string;
  fileUrl: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  moderationComment?: string;
}

export function UserDashboard() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [userContent, setUserContent] = useState<UserContent[]>([]);
  const [loading, setLoading] = useState(false);
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
    if (activeTab === 'content') {
      fetchUserContent();
    }
  }, [activeTab]);

  const fetchUserContent = async () => {
    try {
      setLoading(true);
      const response = await api.content.getMy();
      
      if (response.success) {
        setUserContent(response.content);
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
          // Обновляем список контента
          if (activeTab === 'content') {
            fetchUserContent();
          }
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getModerationStatusClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getModerationStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Одобрено';
      case 'rejected':
        return 'Отклонено';
      default:
        return 'На модерации';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="md:flex">
            {/* Боковая панель */}
            <div className="md:w-64 bg-gray-50 p-6 border-r">
              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <User size={40} className="text-primary" />
                </div>
                <h2 className="text-xl font-semibold">{user?.username}</h2>
                <p className="text-gray-500">{user?.email}</p>
              </div>
              
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'profile' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <User size={18} />
                  <span>Профиль</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('content')}
                  className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'content' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FileText size={18} />
                  <span>Мой контент</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'achievements' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Award size={18} />
                  <span>Достижения</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'notifications' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Bell size={18} />
                  <span>Уведомления</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'settings' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings size={18} />
                  <span>Настройки</span>
                </button>
                
                {(user?.role === 'admin' || user?.role === 'moderator') && (
                  <button
                    onClick={() => navigate(user.role === 'admin' ? '/admin' : '/moderator')}
                    className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                  >
                    <Shield size={18} />
                    <span>{user.role === 'admin' ? 'Админ-панель' : 'Модерация'}</span>
                  </button>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Выйти</span>
                </button>
              </nav>
            </div>
            
            {/* Основной контент */}
            <div className="flex-1 p-6">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Профиль пользователя</h2>
                  
                  <div className="bg-white rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Личная информация</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Имя пользователя</p>
                            <p className="font-medium">{user?.username}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium">{user?.email}</p>
                            {user?.isEmailVerified ? (
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1">
                                Подтвержден
                              </span>
                            ) : (
                              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-1">
                                Не подтвержден
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Роль</p>
                            <p className="font-medium capitalize">{user?.role}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Статистика</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500">Баллы</p>
                            <p className="font-medium">{user?.points || 0}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Дата регистрации</p>
                            <p className="font-medium">
                              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Н/Д'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'content' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Мой контент</h2>
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Загрузить новый
                    </button>
                  </div>
                  
                  {loading ? (
                    <div className="flex justify-center items-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      <p>{error}</p>
                    </div>
                  ) : userContent.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userContent.map(item => (
                        <div key={item._id} className="bg-white rounded-lg shadow overflow-hidden">
                          <div className="aspect-video bg-gray-100">
                            {item.fileUrl && (
                              <img 
                                src={item.fileUrl} 
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg">{item.title}</h3>
                              <span className={`text-xs px-2 py-1 rounded ${getModerationStatusClass(item.moderationStatus)}`}>
                                {getModerationStatusText(item.moderationStatus)}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-500 mb-2">
                              <span className="capitalize">{item.type}</span>
                              <span className="mx-2">•</span>
                              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                            
                            {item.moderationComment && item.moderationStatus === 'rejected' && (
                              <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded">
                                <p className="font-medium">Комментарий модератора:</p>
                                <p>{item.moderationComment}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow p-6 text-center">
                      <p className="text-gray-500 mb-4">У вас пока нет загруженного контента</p>
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
                      >
                        Загрузить первый контент
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'achievements' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Достижения</h2>
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-500">Раздел в разработке</p>
                  </div>
                </div>
              )}
              
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Уведомления</h2>
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-500">Раздел в разработке</p>
                  </div>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Настройки</h2>
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-500">Раздел в разработке</p>
                  </div>
                </div>
              )}
            </div>
          </div>
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