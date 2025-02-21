import React, { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../api/client';
import { useUser } from '../contexts/UserContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'forgotPassword';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useUser();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const formData = new FormData(e.currentTarget);
    
    try {
      if (mode === 'login') {
        const response = await api.auth.login({
          email: formData.get('email') as string,
          password: formData.get('password') as string
        });
        
        if (response.user) {
          login(response.user);
          localStorage.setItem('token', response.token);
          onClose();
        }
      } else if (mode === 'register') {
        const result = await api.auth.register({
          username: formData.get('username') as string,
          email: formData.get('email') as string,
          password: formData.get('password') as string
        });
        
        setSuccess(result.message || 'Registration successful');
        setTimeout(() => setMode('login'), 3000);
      } else if (mode === 'forgotPassword') {
        const result = await api.auth.forgotPassword({
          email: formData.get('email') as string
        });
        
        setSuccess(result.message || 'Password reset email sent');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background p-6 rounded-lg shadow-xl max-w-md w-full">
        <button onClick={onClose} className="absolute top-4 right-4 text-text/60 hover:text-text">
          <X size={24} />
        </button>
        
        <h2 className="font-poppins font-bold text-2xl mb-4">
          {mode === 'login' ? 'Sign In' : 
           mode === 'register' ? 'Create Account' : 
           'Reset Password'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-500 p-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
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
          
          {mode !== 'forgotPassword' && (
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full px-4 py-2 rounded-lg border border-text/10 bg-text/5"
            />
          )}

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90"
          >
            {mode === 'login' ? 'Sign In' : 
             mode === 'register' ? 'Create Account' : 
             'Send Reset Link'}
          </button>
        </form>

        <div className="mt-4 space-y-2 text-center">
          {mode === 'login' ? (
            <>
              <button
                onClick={() => setMode('register')}
                className="text-primary hover:underline"
              >
                Create Account
              </button>
              <br />
              <button
                onClick={() => setMode('forgotPassword')}
                className="text-text/70 hover:underline"
              >
                Forgot Password?
              </button>
            </>
          ) : (
            <button
              onClick={() => setMode('login')}
              className="text-primary hover:underline"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 