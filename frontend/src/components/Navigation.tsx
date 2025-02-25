import { Link } from 'react-router-dom';
import { Shield, LayoutDashboard, Home, Book, Image, Palette } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export function Navigation() {
  const { user } = useUser();
  
  console.log('Current user:', user); // Проверим пользователя
  console.log('User permissions:', user?.permissions); // Проверим права

  return (
    <nav className="flex items-center gap-4">
      {/* Основная навигация */}
      <Link 
        to="/"
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Home size={20} />
        <span className="hidden sm:inline">Главная</span>
      </Link>

      <Link 
        to="/comics"
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Book size={20} />
        <span className="hidden sm:inline">Комиксы</span>
      </Link>

      <Link 
        to="/memes"
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Image size={20} />
        <span className="hidden sm:inline">Мемы</span>
      </Link>

      <Link 
        to="/nfts"
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Palette size={20} />
        <span className="hidden sm:inline">NFT</span>
      </Link>

      {/* Кнопка модератора с проверкой */}
      {user?.role === 'moderator' && (
        <Link 
          to="/moderation"
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Shield size={20} />
          <span className="hidden sm:inline">Модерация</span>
        </Link>
      )}

      {/* Кнопка админа */}
      {user?.role === 'admin' && (
        <Link 
          to="/admin"
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          <LayoutDashboard size={20} />
          <span className="hidden sm:inline">Админ-панель</span>
        </Link>
      )}
    </nav>
  );
} 