import { S3 } from 'aws-sdk';

export class StorageService {
  private s3: S3;
  private publicUrl: string;

  constructor() {
    if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_ENDPOINT || !process.env.R2_BUCKET) {
      throw new Error('R2 credentials are not configured');
    }

    this.s3 = new S3({
      endpoint: process.env.R2_ENDPOINT,
      region: 'auto',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
      },
      signatureVersion: 'v4'
    });

    // В продакшене используем тот же URL что и в dev
    this.publicUrl = process.env.R2_PUBLIC_URL || '';
  }

  async uploadFile(file: Buffer, fileName: string): Promise<string> {
    try {
      if (!this.publicUrl || !process.env.R2_BUCKET) {
        throw new Error('Public URL or bucket is not configured');
      }

      const params: S3.PutObjectRequest = {
        Bucket: process.env.R2_BUCKET,
        Key: fileName,
        Body: file,
        ContentType: this.getContentType(fileName)
      };

      await this.s3.upload(params).promise();
      return `${this.publicUrl}/${fileName}`;
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