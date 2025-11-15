import { applyDecorators } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

export function ApiParams(...params: string[]) {
  return applyDecorators(...params.map((param) => ApiParam({ name: param })));
}
