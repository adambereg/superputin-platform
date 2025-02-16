import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Создаем более безопасную конфигурацию хранилища
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    // Генерируем безопасное имя файла
    const hash = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${hash}${ext}`);
  }
});

// Улучшенный фильтр файлов
const fileFilter = (_req: any, file: Express.Multer.File, cb: Function) => {
  // Проверяем MIME-тип
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    // Проверяем расширение файла
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.gif'];
    if (allowedExts.includes(ext)) {
      return cb(null, true);
    }
  }
  cb(new Error('Неверный формат файла. Разрешены только JPEG, PNG и GIF'));
};

// Экспортируем конфигурацию multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1 // Только один файл за раз
  }
});

// Middleware для обработки ошибок multer
export const handleMulterError = (error: any, _req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'Файл слишком большой. Максимальный размер 5MB' 
      });
    }
    return res.status(400).json({ error: error.message });
  }
  next(error);
}; 