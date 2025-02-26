import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CONTENT_TAGS } from '../constants/contentTags';

interface EditContentModalProps {
  content: {
    _id: string;
    title: string;
    type: 'meme' | 'comic' | 'nft';
    tags?: string[];
  };
  onClose: () => void;
  onUpdate: (contentId: string, data: { title: string; tags: string[] }) => Promise<void>;
  onDelete: (contentId: string) => Promise<void>;
}

export function EditContentModal({ content, onClose, onUpdate, onDelete }: EditContentModalProps) {
  const [title, setTitle] = useState(content.title);
  const [selectedTags, setSelectedTags] = useState<string[]>(content.tags || []);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onUpdate(content._id, {
        title,
        tags: selectedTags
      });
      onClose();
    } catch (error) {
      console.error('Failed to update content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот контент?')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await onDelete(content._id);
      onClose();
    } catch (error) {
      console.error('Failed to delete content:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const contentType = content.type as keyof typeof CONTENT_TAGS;
  const availableTags = CONTENT_TAGS[contentType] || [];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-lg w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Редактировать контент</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Название</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Теги</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag)
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      );
                    }}
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
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </button>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 