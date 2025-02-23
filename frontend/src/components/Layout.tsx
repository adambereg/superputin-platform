import React, { useState, useEffect } from 'react';
import { Link, Outlet, Navigate, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, Wallet, X, Shield } from 'lucide-react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { AuthModal } from './AuthModal';
import { useUser } from '../contexts/UserContext';

export function Layout() {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { isAuthenticated, logout, user } = useUser();
  const location = useLocation();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  if (!isAuthenticated && location.pathname !== '/') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-text/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="font-poppins font-bold text-2xl text-primary">
              SuperPutin
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/comics" className="hover:text-primary transition-colors">Comics</Link>
              <Link to="/memes" className="hover:text-primary transition-colors">Memes</Link>
              <Link to="/nfts" className="hover:text-primary transition-colors">NFTs</Link>
              {user?.role === 'admin' && (
                <Link 
                  to="/admin"
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
                >
                  <Shield size={20} />
                  <span>Админ-панель</span>
                </Link>
              )}
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 hover:bg-text/5 rounded-full"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => isAuthenticated ? logout() : setIsAuthModalOpen(true)}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Wallet size={20} />
                {isAuthenticated ? 'Sign Out' : 'Sign In'}
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-text/5 rounded-full"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-text/10 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-text/60">
          <p>&copy; 2024 SuperPutin. All rights reserved.</p>
        </div>
      </footer>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background">
          <div className="p-4 space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setIsMenuOpen(false)} className="p-2">
                <X size={24} />
              </button>
            </div>
            <Link to="/comics" className="block py-2 hover:text-primary">Comics</Link>
            <Link to="/memes" className="block py-2 hover:text-primary">Memes</Link>
            <Link to="/nfts" className="block py-2 hover:text-primary">NFTs</Link>
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="flex items-center gap-2 py-2 text-primary hover:text-primary/80"
              >
                <Shield size={20} />
                <span>Админ-панель</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}