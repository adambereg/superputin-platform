import { S3 } from 'aws-sdk';

export class StorageService {
  private s3: S3;
  private publicUrl: string;

  constructor() {
    // Временно отключаем проверку R2 credentials
    // if (!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_ENDPOINT || !process.env.R2_BUCKET) {
    //   throw new Error('R2 credentials are not configured');
    // }

    this.s3 = new S3({
      endpoint: process.env.R2_ENDPOINT || 'http://localhost:9000',
      region: 'auto',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || 'dummy-key',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'dummy-secret'
      },
      signatureVersion: 'v4'
    });

    this.publicUrl = process.env.R2_PUBLIC_URL || 'http://localhost:9000';
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

  async deleteFile(fileName: string): Promise<void> {
    try {
      const params: S3.DeleteObjectRequest = {
        Bucket: process.env.R2_BUCKET!,
        Key: fileName
      };

      await this.s3.deleteObject(params).promise();
    } catch (error) {
      console.error('Ошибка удаления файла:', error);
      throw error;
    }
  }
} 