import React, { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../api/client';
import { useUser } from '../contexts/UserContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const { login } = useUser();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      if (isLogin) {
        const response = await api.auth.login({
          email: formData.get('email') as string,
          password: formData.get('password') as string
        });
        
        if (response.user) {
          login(response.user);
          onClose();
        } else {
          setError(response.error || 'Authentication failed');
        }
      } else {
        const response = await api.auth.register({
          username: formData.get('username') as string,
          email: formData.get('email') as string,
          password: formData.get('password') as string
        });
        
        if (response.user) {
          login(response.user);
          onClose();
        } else {
          setError(response.error || 'Registration failed');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background p-6 rounded-lg shadow-xl max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text/60 hover:text-text"
        >
          <X size={24} />
        </button>
        <h2 className="font-poppins font-bold text-2xl mb-4">Sign In</h2>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              name="username"
              type="text"
              placeholder="Username"
              required
              className="w-full px-4 py-2 rounded-lg border border-text/10 bg-text/5"
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-2 rounded-lg border border-text/10 bg-text/5"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-2 rounded-lg border border-text/10 bg-text/5"
          />
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-primary hover:underline"
        >
          {isLogin ? 'Create an account' : 'Already have an account?'}
        </button>
      </div>
    </div>
  );
} 