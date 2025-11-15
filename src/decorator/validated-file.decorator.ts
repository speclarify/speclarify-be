import {
  MaxFileSizeValidator,
  ParseFilePipe,
  UploadedFile,
} from '@nestjs/common';
import { MimeTypeValidator } from '../validator/mime-type.validator';

export const ValidatedFile = (
  required: boolean,
  size: number,
  ...mimeTypes: string[]
) =>
  UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: size * 1000 * 1000 }),
        new MimeTypeValidator({
          mimeTypes,
        }),
      ],
      fileIsRequired: required,
    }),
  );
