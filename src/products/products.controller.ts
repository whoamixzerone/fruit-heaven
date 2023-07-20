import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Authorization } from '../common/decorators/roles.decorator';
import { UsersRole } from '../users/user-role.enum';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('upload')
  @Authorization([UsersRole.ADMIN])
  @UseInterceptors(FilesInterceptor('files'))
  uploadFile(@UploadedFiles() files: Array<Express.Multer.File>): {
    url: string[];
  } {
    let urlPath = [];
    for (const file of files) {
      urlPath = [...urlPath, file.path];
    }

    return { url: urlPath };
  }
}
