import { S3 } from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export class StorageService {
  private s3: S3;
  private isDevelopment: boolean;
  private uploadsDir: string;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.uploadsDir = path.join(process.cwd(), 'uploads');

    // Создаем директорию для загрузок, если она не существует
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }

    // Настройка S3 клиента
    this.s3 = new S3({
      endpoint: process.env.R2_ENDPOINT || 'http://localhost:9000',
      region: 'auto',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || 'dummy-key',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'dummy-secret'
      },
      signatureVersion: 'v4',
      // Добавляем эту опцию для локальной разработки
      s3ForcePathStyle: true
    });
  }

  async uploadFile(buffer: Buffer, fileName: string): Promise<string> {
    try {
      // Генерируем уникальное имя файла
      const uniqueFileName = this.generateUniqueFileName(fileName);
      
      // Для локальной разработки сохраняем файл на диск
      if (this.isDevelopment) {
        const filePath = path.join(this.uploadsDir, uniqueFileName);
        fs.writeFileSync(filePath, buffer);
        
        // Возвращаем полный URL к файлу с базовым URL API
        const baseUrl = process.env.API_URL || 'http://localhost:3000';
        return `${baseUrl}/uploads/${uniqueFileName}`;
      }
      
      // Для продакшена загружаем в S3/R2
      const contentType = this.getContentType(fileName);
      
      // Проверяем, что R2_BUCKET определен
      if (!process.env.R2_BUCKET) {
        console.error('R2_BUCKET не определен в переменных окружения');
        // Если бакет не определен, сохраняем локально как запасной вариант
        const filePath = path.join(this.uploadsDir, uniqueFileName);
        fs.writeFileSync(filePath, buffer);
        
        // Добавляем базовый URL
        const baseUrl = process.env.API_URL || 'http://localhost:3000';
        return `${baseUrl}/uploads/${uniqueFileName}`;
      }
      
      const params: S3.PutObjectRequest = {
        Bucket: process.env.R2_BUCKET,
        Key: uniqueFileName,
        Body: buffer,
        ContentType: contentType
      };
      
      await this.s3.putObject(params).promise();
      
      // Формируем полный URL к файлу
      const publicUrl = process.env.R2_PUBLIC_URL 
        ? `${process.env.R2_PUBLIC_URL}/${uniqueFileName}`
        : `/uploads/${uniqueFileName}`;
        
      return publicUrl;
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      
      // В случае ошибки с S3/R2, пробуем сохранить локально
      try {
        const uniqueFileName = this.generateUniqueFileName(fileName);
        const filePath = path.join(this.uploadsDir, uniqueFileName);
        fs.writeFileSync(filePath, buffer);
        
        // Также возвращаем полный URL
        const baseUrl = process.env.API_URL || 'http://localhost:3000';
        return `${baseUrl}/uploads/${uniqueFileName}`;
      } catch (localError) {
        console.error('Ошибка локального сохранения:', localError);
        throw error; // Выбрасываем оригинальную ошибку
      }
    }
  }

  private generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalName);
    return `${timestamp}-${randomString}${ext}`;
  }

  private getContentType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const contentTypes: { [key: string]: string } = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp'
    };
    return contentTypes[ext || ''] || 'application/octet-stream';
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      // Если это локальный файл
      if (fileName.includes('/uploads/')) {
        // Извлекаем имя файла из полного URL
        const fileNameOnly = fileName.split('/uploads/').pop();
        if (!fileNameOnly) return;
        
        const localPath = path.join(this.uploadsDir, fileNameOnly);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
        return;
      }
      
      // Если это файл в S3/R2
      const key = fileName.split('/').pop();
      if (!key) return;
      
      const params: S3.DeleteObjectRequest = {
        Bucket: process.env.R2_BUCKET!,
        Key: key
      };

      await this.s3.deleteObject(params).promise();
    } catch (error) {
      console.error('Ошибка удаления файла:', error);
      // Не выбрасываем ошибку, чтобы не блокировать основной процесс
    }
  }
} 