import React, { useState } from 'react';
import { X, Upload, Image, FileText, Palette } from 'lucide-react';

interface UploadContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => Promise<void>;
}

export function UploadContentModal({ isOpen, onClose, onUpload }: UploadContentModalProps) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'meme' | 'comic' | 'nft'>('meme');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('type', type);

      await onUpload(formData);
      onClose();
      setTitle('');
      setFile(null);
    } catch (error) {
      setError('Ошибка при загрузке файла');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Загрузить контент</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тип контента
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setType('meme')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border ${
                  type === 'meme' ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
              >
                <Image size={24} className={type === 'meme' ? 'text-primary' : ''} />
                <span className="text-sm">Мем</span>
              </button>
              <button
                type="button"
                onClick={() => setType('comic')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border ${
                  type === 'comic' ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
              >
                <FileText size={24} className={type === 'comic' ? 'text-primary' : ''} />
                <span className="text-sm">Комикс</span>
              </button>
              <button
                type="button"
                onClick={() => setType('nft')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border ${
                  type === 'nft' ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}
              >
                <Palette size={24} className={type === 'nft' ? 'text-primary' : ''} />
                <span className="text-sm">NFT</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Введите название"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
      </div>
    </div>
  );
} 