import React, { useState, useEffect } from 'react';
import { X, Upload, Image, FileText, Palette, Tag } from 'lucide-react';
import { CONTENT_TAGS, ContentType } from '../constants/contentTags';
import { useUser } from '../contexts/UserContext';

interface UploadContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => Promise<void>;
  defaultType?: ContentType;
  simplified?: boolean; // Упрощенный режим для модераторов/админов
}

export function UploadContentModal({ 
  isOpen, 
  onClose, 
  onUpload, 
  defaultType = 'meme',
  simplified = false 
}: UploadContentModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ContentType>(defaultType);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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
    }
  }, [isOpen, defaultType]);

  // Обновляем превью при выборе файла
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('type', type);
    
    if (description) {
      formData.append('description', description);
    }
    
    // Добавляем теги только если они выбраны и не в упрощенном режиме
    if (!simplified && selectedTags.length > 0) {
      formData.append('tags', JSON.stringify(selectedTags));
    } else if (simplified) {
      // В упрощенном режиме добавляем дефолтный тег в зависимости от типа
      const defaultTag = type === 'meme' ? 'Trending' : 
                         type === 'comic' ? 'Action' : 'Art';
      formData.append('tags', JSON.stringify([defaultTag]));
    }

    try {
      setIsUploading(true);
      await onUpload(formData);
      onClose();
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Загрузка контента</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Название</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          {!simplified && (
            <div>
              <label className="block text-sm font-medium mb-1">Описание</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Тип контента</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ContentType)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="meme">Мем</option>
              <option value="comic">Комикс</option>
              <option value="nft">NFT</option>
            </select>
          </div>

          {!simplified && (
            <div>
              <label className="block text-sm font-medium mb-1">Теги</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {CONTENT_TAGS[type].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
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
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Файл</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/gif"
              className="hidden"
              id="file-upload"
              required
            />
            <label
              htmlFor="file-upload"
              className="block w-full px-3 py-2 border border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50"
            >
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