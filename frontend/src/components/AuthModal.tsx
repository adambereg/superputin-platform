import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../api/client';
import { useUser } from '../contexts/UserContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'forgotPassword' | '2fa';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useUser();
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [tempUserId, setTempUserId] = useState<string | null>(null);

  const handleVerify2FA = async () => {
    console.log('handleVerify2FA called with code:', twoFactorCode);
    try {
      setError('');
      console.log('Verifying 2FA code:', { userId: tempUserId, code: twoFactorCode });
      
      const verifyResult = await api.auth.verify2FA(tempUserId!, twoFactorCode);
      console.log('Verify result:', verifyResult);
      
      if (verifyResult.success && verifyResult.token) {
        // Получаем сохраненные данные пользователя
        const userStr = localStorage.getItem('tempUser');
        if (!userStr) {
          throw new Error('User data not found');
        }
        
        const user = JSON.parse(userStr);
        console.log('Logging in user:', user);
        
        // Выполняем вход
        login(user, verifyResult.token);
        
        // Очищаем временные данные
        localStorage.removeItem('tempEmail');
        localStorage.removeItem('tempPassword');
        localStorage.removeItem('tempUser');
        
        onClose();
      } else {
        setError('Verification failed');
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      setError(err instanceof Error ? err.message : 'Invalid verification code');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const formData = new FormData(e.currentTarget);
    
    try {
      if (mode === 'login') {
        const loginData = {
          email: formData.get('email') as string,
          password: formData.get('password') as string
        };

        const result = await api.auth.login(loginData);
        
        if (result.requiresTwoFactor) {
          setTempUserId(result.user.id);
          setMode('2fa');
          return;
        }

        if (result.token) {
          login(result.user, result.token);
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
    } catch (error) {
      console.error('Auth error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  useEffect(() => {
    // Проверяем URL параметры при монтировании
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      setSuccess('Email verified successfully. You can now log in.');
    } else if (params.get('error') === 'verification-failed') {
      setError('Email verification failed. Please try again or contact support.');
    }
  }, []);

  if (!isOpen) return null;

  if (mode === '2fa') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-background p-6 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="font-poppins font-bold text-2xl mb-4">
            Two-Factor Authentication
          </h2>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <p className="text-text/70 mb-4">
            Please enter the verification code sent to your email
          </p>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleVerify2FA();
          }}>
            <input
              type="text"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="Enter code"
              className="w-full px-4 py-2 rounded-lg border border-text/10 bg-text/5 mb-4"
            />
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Verify
            </button>
          </form>
        </div>
      </div>
    );
  }

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