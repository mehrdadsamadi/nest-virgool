import { Request } from 'express';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { ValidationMessage } from '../enums/message.enum';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';

export type CallbackDestinationType = (
  error: Error | null,
  destination: string,
) => void;
export type CallbackFilenameType = (
  error: Error | null,
  filename: string,
) => void;
export type MulterFileType = Express.Multer.File;

export function multerDestination(fileName: string) {
  return function (
    req: Request,
    file: MulterFileType,
    callback: CallbackDestinationType,
  ): void {
    const path = join('public', 'uploads', fileName);
    mkdirSync(path, { recursive: true });
    callback(null, path);
  };
}

export function multerFilename(
  req: Request,
  file: MulterFileType,
  callback: CallbackFilenameType,
): void {
  const ext = extname(file.originalname).toLowerCase();

  if (!isValidImageFormat(ext)) {
    callback(new BadRequestException(ValidationMessage.InvalidImageFormat), '');
  } else {
    const filename = `${Date.now()}${ext}`;
    callback(null, filename);
  }
}

function isValidImageFormat(ext: string) {
  return ['.jpg', '.jpeg', '.png'].includes(ext);
}

export function multerStorage(folderName: string) {
  return diskStorage({
    destination: multerDestination(folderName),
    filename: multerFilename,
  });
}
