import React, { useState, useEffect } from 'react';
import { X, Upload, Image, FileText, Palette, Tag } from 'lucide-react';
import { CONTENT_TAGS, ContentType } from '../constants/contentTags';
import { useUser } from '../contexts/UserContext';

interface UploadContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => Promise<void>;
  defaultType?: ContentType;
}

export function UploadContentModal({ 
  isOpen, 
  onClose, 
  onUpload, 
  defaultType = 'meme'
}: UploadContentModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ContentType>(defaultType);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Сбрасываем форму при открытии/закрытии
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setType(defaultType);
      setFile(null);
      setPreview(null);
      setSelectedTags([]);
      setError(null);
    }
  }, [isOpen, defaultType]);

  // Сбрасываем выбранные теги при изменении типа контента
  useEffect(() => {
    setSelectedTags([]);
  }, [type]);

  // Создаем превью при выборе файла
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Пожалуйста, выберите файл');
      return;
    }

    if (!title) {
      setError('Пожалуйста, введите название');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('type', type);
      formData.append('file', file);
      
      if (description) {
        formData.append('description', description);
      }
      
      // Добавляем выбранные теги
      selectedTags.forEach(tag => {
        formData.append('tags[]', tag);
      });
      
      await onUpload(formData);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      setError('Ошибка при загрузке файла');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Загрузка контента</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Тип контента</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('meme')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  type === 'meme' ? 'bg-primary text-white' : 'bg-white text-gray-700'
                }`}
              >
                <Image size={20} />
                Мем
              </button>
              <button
                type="button"
                onClick={() => setType('comic')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  type === 'comic' ? 'bg-primary text-white' : 'bg-white text-gray-700'
                }`}
              >
                <FileText size={20} />
                Комикс
              </button>
              <button
                type="button"
                onClick={() => setType('nft')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  type === 'nft' ? 'bg-primary text-white' : 'bg-white text-gray-700'
                }`}
              >
                <Palette size={20} />
                NFT
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Название</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Введите название"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Описание (опционально)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Введите описание"
              rows={3}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-1">
              <Tag size={16} />
              Теги
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {CONTENT_TAGS[type].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Файл</label>
            <label className="block w-full cursor-pointer border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="image/jpeg,image/png,image/gif"
              />
              {preview ? (
                <div className="flex flex-col items-center">
                  <img src={preview} alt="Preview" className="max-h-40 object-contain mb-2" />
                  <span className="text-sm text-gray-500">Нажмите, чтобы изменить</span>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <span>Выберите файл</span>
                </div>
              )}
            </label>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isUploading || !file || !title}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <span className="animate-spin">⏳</span>
                Загрузка...
              </>
            ) : (
              <>
                <Upload size={20} />
                Загрузить
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 