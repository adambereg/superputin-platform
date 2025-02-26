import React, { useState, useEffect } from 'react';
import { X, Upload, Image, FileText, Palette, Tag } from 'lucide-react';
import { CONTENT_TAGS, ContentType } from '../constants/contentTags';
import { useUser } from '../contexts/UserContext';

interface UploadContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => void;
  simplified?: boolean;
}

export function UploadContentModal({ isOpen, onClose, onUpload, simplified = false }: UploadContentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'meme'
  });
  const [file, setFile] = useState<File | null>(null);
  const [comicFiles, setComicFiles] = useState<File[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  useEffect(() => {
    if (isOpen) {
      setFormData({ title: '', description: '', type: 'meme' });
      setFile(null);
      setComicFiles([]);
      setSelectedTags([]);
      setError(null);
    }
  }, [isOpen]);

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
    setIsUploading(true);
    setError(null);
    
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('type', formData.type);
      
      if (selectedTags.length > 0) {
        uploadFormData.append('tags', JSON.stringify(selectedTags));
      }
      
      if (formData.type === 'comic') {
        comicFiles.forEach(file => {
          uploadFormData.append('files', file);
        });
      } else {
        if (file) {
          uploadFormData.append('files', file);
        }
      }
      
      console.log('Uploading content with form data:', {
        title: formData.title,
        type: formData.type,
        tagsCount: selectedTags.length,
        filesCount: formData.type === 'comic' ? comicFiles.length : (file ? 1 : 0)
      });
      
      await onUpload(uploadFormData);
      onClose();
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (formData.type === 'comic') {
        setComicFiles(Array.from(e.target.files));
      } else {
        setFile(e.target.files[0]);
      }
    }
  };

  const handleClose = () => {
    setFormData({ title: '', description: '', type: 'meme' });
    setFile(null);
    setComicFiles([]);
    setSelectedTags([]);
    onClose();
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
            onClick={handleClose}
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
                onClick={() => setFormData(prev => ({ ...prev, type: 'meme' }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  formData.type === 'meme' ? 'bg-primary text-white' : 'bg-white text-gray-700'
                }`}
              >
                <Image size={20} />
                Мем
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'comic' }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  formData.type === 'comic' ? 'bg-primary text-white' : 'bg-white text-gray-700'
                }`}
              >
                <FileText size={20} />
                Комикс
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'nft' }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                  formData.type === 'nft' ? 'bg-primary text-white' : 'bg-white text-gray-700'
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
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Введите название"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание (опционально)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Введите описание комикса..."
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-1">
              <Tag size={16} />
              Теги
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {CONTENT_TAGS[formData.type].map(tag => (
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
            <label className="block text-sm font-medium mb-2">Файл</label>
            {formData.type === 'comic' ? (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="comic-files"
                />
                <label
                  htmlFor="comic-files"
                  className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-primary transition-colors"
                >
                  {comicFiles.length > 0 ? (
                    <div>
                      <p>Выбрано файлов: {comicFiles.length}</p>
                      <p className="text-sm text-gray-500">Нажмите, чтобы изменить</p>
                    </div>
                  ) : (
                    <p>Выберите страницы комикса</p>
                  )}
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Вы можете выбрать несколько изображений для страниц комикса.
                  Первое изображение будет использовано как обложка.
                </p>
              </div>
            ) : (
              <input
                type="file"
                accept={formData.type === 'nft' ? 'image/*,.gif' : 'image/*'}
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-white
                  hover:file:bg-primary/90"
              />
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isUploading || 
              (!file && formData.type !== 'comic') || 
              (formData.type === 'comic' && comicFiles.length === 0) || 
              !formData.title}
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