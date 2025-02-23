import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

export function AdminLayout() {
  const { logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Боковая панель */}
      <aside className="w-64 bg-white shadow-sm">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-primary">Админ-панель</h1>
        </div>
        
        <nav className="p-4 space-y-2">
          <NavLink 
            to="/admin" 
            end
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
              ${isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}
            `}
          >
            <LayoutDashboard size={20} />
            <span>Дашборд</span>
          </NavLink>

          <NavLink 
            to="/admin/users"
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
              ${isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}
            `}
          >
            <Users size={20} />
            <span>Пользователи</span>
          </NavLink>

          <NavLink 
            to="/admin/content"
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
              ${isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}
            `}
          >
            <FileText size={20} />
            <span>Контент</span>
          </NavLink>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
} 