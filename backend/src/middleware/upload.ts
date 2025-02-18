import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { Request, Response } from 'express';

// Расширяем интерфейс Request
interface CustomRequest extends Request {
  contentType?: string;
}

// Обновляем middleware для определения типа контента
export const determineContentType = (req: CustomRequest, _res: Response, next: Function) => {
  const contentType = req.body.type || 'meme';
  req.contentType = contentType;
  next();
};

// Обновляем конфигурацию multer для контента
const storage = multer.diskStorage({
  destination: (req: Request, _file, cb) => {
    // Получаем тип контента из формы
    const formData = req.body;
    console.log('Form data:', formData);
    
    // Определяем папку в зависимости от типа
    let uploadPath = 'uploads/memes';
    
    if (formData && formData.type === 'comic') {
      uploadPath = 'uploads/comics';
    }
    
    console.log('Upload path:', uploadPath);
    
    // Создаем папку если её нет
    if (!fs.existsSync(uploadPath)) {
      console.log('Creating directory:', uploadPath);
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const hash = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${hash}${ext}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// Обновляем фильтр файлов
const fileFilter = (_req: any, file: Express.Multer.File, cb: Function) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif'];
  
  if (allowedMimes.includes(file.mimetype)) {
    const ext = path.extname(file.originalname).toLowerCase();
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
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  }
});

// Middleware для обработки ошибок multer
export const handleMulterError = (error: any, _req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'Файл слишком большой. Максимальный размер 10MB' 
      });
    }
    return res.status(400).json({ error: error.message });
  }
  next(error);
}; 