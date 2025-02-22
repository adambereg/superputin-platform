import { api } from '../api/client';

interface UploadMetadata {
  title: string;
  description?: string;
  category?: string;
}

export function UploadModal({ type, onClose }: { type: 'comic' | 'meme' | 'nft', onClose: () => void }) {
  const handleUpload = async (file: File, metadata: UploadMetadata) => {
    try {
      const response = await api.content.upload(file, type, metadata);
      // Обработка успешной загрузки
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
    }
  };
  
  // ... код формы загрузки ...
} 