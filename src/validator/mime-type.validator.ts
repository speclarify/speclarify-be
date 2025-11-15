import { FileValidator } from '@nestjs/common';

export interface ValidationOptions {
  mimeTypes: string[];
}

export class MimeTypeValidator extends FileValidator {
  protected readonly validationOptions: ValidationOptions;

  constructor(validationOptions: ValidationOptions) {
    super(validationOptions);
  }

  public isValid(file: Express.Multer.File): boolean | Promise<boolean> {
    return this.validationOptions.mimeTypes.indexOf(file.mimetype) !== -1;
  }

  public buildErrorMessage(file: Express.Multer.File): string {
    return `Invalid file type: ${file.mimetype}!`;
  }
}
