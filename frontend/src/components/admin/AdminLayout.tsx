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
    <div className="flex min-h-screen">
      {/* Боковое меню */}
      <div className="w-64 bg-white border-r">
        <nav className="p-4 space-y-2">
          <NavLink 
            to="/admin" 
            end
            className={({ isActive }) => 
              `flex items-center gap-2 p-2 rounded ${
                isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <LayoutDashboard size={20} />
            <span>Дашборд</span>
          </NavLink>
          
          <NavLink 
            to="/admin/users"
            className={({ isActive }) => 
              `flex items-center gap-2 p-2 rounded ${
                isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <Users size={20} />
            <span>Пользователи</span>
          </NavLink>
          
          <NavLink 
            to="/admin/content"
            className={({ isActive }) => 
              `flex items-center gap-2 p-2 rounded ${
                isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <FileText size={20} />
            <span>Контент</span>
          </NavLink>
        </nav>
      </div>

      {/* Основной контент */}
      <div className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
} 