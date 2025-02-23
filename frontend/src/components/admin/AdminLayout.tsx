import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, LogOut } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

export function AdminLayout() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Панель управления' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Пользователи' },
    { path: '/admin/content', icon: <FileText size={20} />, label: 'Контент' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Боковая панель */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <h2 className="font-poppins font-bold text-xl text-primary">
            Админ-панель
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {user?.username}
          </p>
        </div>

        <nav className="mt-6">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-gray-600 hover:bg-gray-50 transition-colors ${
                  isActive ? 'text-primary border-r-2 border-primary bg-primary/5' : ''
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-3 text-red-500 hover:bg-red-50 transition-colors w-full mt-6"
          >
            <LogOut size={20} />
            <span>Выйти</span>
          </button>
        </nav>
      </div>

      {/* Основной контент */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
} 