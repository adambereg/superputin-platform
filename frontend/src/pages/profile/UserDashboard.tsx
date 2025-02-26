import React, { useState, useEffect } from 'react';
import { User, Settings, FileText, Award, Bell, Shield, LogOut } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { api } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { UploadContentModal } from '../../components/UploadContentModal';

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
          fetchUserContent(); // Обновляем список контента
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
      
      <UploadContentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        simplified={false}
      />
    </div>
  );
} 