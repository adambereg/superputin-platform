import { S3 } from 'aws-sdk';
import { config } from '../config/config';

export class StorageService {
  private s3: S3;

  constructor() {
    this.s3 = new S3({
      region: config.storage.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    });
  }

  async uploadFile(file: Buffer, fileName: string): Promise<string> {
    try {
      const params = {
        Bucket: config.storage.bucket,
        Key: fileName,
        Body: file,
        ContentType: this.getContentType(fileName)
      };

      const result = await this.s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      throw error;
    }
  }

  private getContentType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const contentTypes: { [key: string]: string } = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif'
    };
    return contentTypes[ext || ''] || 'application/octet-stream';
  }
} 