import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Shield, Clock, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

export function ModeratorLayout() {
  const { logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Боковое меню */}
      <aside className="w-64 bg-white shadow-sm">
        <div className="p-4">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <Shield size={24} />
            Модерация
          </h2>
        </div>

        <nav className="mt-4">
          <NavLink
            to="/moderator"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 ${
                isActive ? 'bg-primary/5 text-primary font-medium' : ''
              }`
            }
          >
            <Shield size={20} />
            <span>Обзор</span>
          </NavLink>

          <NavLink
            to="/moderator/queue"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 ${
                isActive ? 'bg-primary/5 text-primary font-medium' : ''
              }`
            }
          >
            <Clock size={20} />
            <span>Очередь модерации</span>
          </NavLink>

          <NavLink
            to="/moderator/history"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 ${
                isActive ? 'bg-primary/5 text-primary font-medium' : ''
              }`
            }
          >
            <CheckCircle size={20} />
            <span>История модерации</span>
          </NavLink>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-700 hover:text-red-500"
          >
            <LogOut size={20} />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
} 