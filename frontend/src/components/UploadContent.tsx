import React, { useState } from 'react';
import { Upload, Image, Book, Palette } from 'lucide-react';
import { api } from '../api/client';

interface UploadContentProps {
  onSuccess?: () => void;
}

export function UploadContent({ onSuccess }: UploadContentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'meme' | 'comic' | 'nft'>('meme');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('type', type);

      console.log('Sending formData:', {
        file: file.name,
        title,
        type
      });

      const response = await fetch('http://localhost:3000/api/content/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload response:', data);

      setFile(null);
      setTitle('');
      setError(null);
      onSuccess?.();
    } catch (err) {
      console.error('Upload error:', err);
      setError('Ошибка загрузки контента');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold">Загрузить контент</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('meme')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              type === 'meme' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            <Image size={16} />
            Мем
          </button>
          <button
            type="button"
            onClick={() => setType('comic')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              type === 'comic' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            <Book size={16} />
            Комикс
          </button>
          <button
            type="button"
            onClick={() => setType('nft')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
              type === 'nft' ? 'bg-primary text-white' : 'bg-gray-100'
            }`}
          >
            <Palette size={16} />
            NFT
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Название
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder="Введите название..."
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Файл
        </label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <Upload size={20} />
            {file ? file.name : 'Выберите файл'}
          </label>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        <Upload size={20} />
        {loading ? 'Загрузка...' : 'Загрузить'}
      </button>
    </form>
  );
} 