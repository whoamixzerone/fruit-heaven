import { BadRequestException, Injectable } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import path from 'path';
import fs from 'fs';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import multer from 'multer';
import crypto from 'crypto';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  private readonly dirPath: string;

  constructor() {
    this.dirPath = path.join(__dirname, '..', 'uploads');
    this.mkdir();
  }

  mkdir(): void {
    try {
      fs.readdirSync(this.dirPath);
    } catch (err) {
      fs.mkdirSync(this.dirPath);
    }
  }

  diskStorage(dirPath: string): multer.StorageEngine {
    return multer.diskStorage({
      destination(
        req: Express.Request,
        file: Express.Multer.File,
        callback: (error: Error | null, destination: string) => void,
      ) {
        callback(null, dirPath);
      },
      filename(
        req: Express.Request,
        file: Express.Multer.File,
        callback: (error: Error | null, filename: string) => void,
      ) {
        const ext = path.extname(file.originalname);
        const fileName = `${crypto.randomUUID()}-${path.basename(
          file.originalname,
          ext,
        )}${ext}`;
        callback(null, fileName);
      },
    });
  }

  fileFilter(
    req: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ): void {
    const fileType: string | RegExp = /(jpg|jpeg|png)$/;
    const isMimeType = file.mimetype.match(fileType);
    if (!isMimeType) {
      return callback(
        new BadRequestException(
          'jpg, jpeg, png 이미지 파일만 업로드 할 수 있습니다.',
        ),
        false,
      );
    }

    return callback(null, true);
  }

  createMulterOptions(): Promise<MulterModuleOptions> | MulterModuleOptions {
    const dirPath = this.dirPath;
    const options: MulterOptions = {
      storage: this.diskStorage(dirPath),
      fileFilter: this.fileFilter.bind(this),
      limits: { fileSize: 10 * 1024 * 1024 },
    };

    return options;
  }
}
