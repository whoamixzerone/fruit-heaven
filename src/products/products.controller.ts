import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { Authorization } from '../common/decorators/roles.decorator';
import { UsersRole } from '../users/user-role.enum';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CreateProductRequestDto } from './dto/create-product.request.dto';
import { Products } from './entities/product.entity';
import { SearchConditionRequestDto } from './dto/search-condition.request.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('upload')
  @Authorization([UsersRole.ADMIN])
  @UseInterceptors(FilesInterceptor('files'))
  uploadFile(@UploadedFiles() files: Array<Express.Multer.File>): {
    imageUrl: string[];
  } {
    const imageUrl = files.map((file) => {
      return file.path;
    });

    return { imageUrl };
  }

  @Post()
  @Authorization([UsersRole.ADMIN])
  createProduct(
    @Body() createProductRequestDto: CreateProductRequestDto,
  ): string {
    const result = this.productsService.createProduct(createProductRequestDto);
    if (result) {
      return 'ok';
    } else {
      throw new ForbiddenException();
    }
  }

  @Get()
  async findAllProduct(
    @Query() query: SearchConditionRequestDto,
  ): Promise<Products[]> {
    return await this.productsService.findAll(query);
  }

  @Get(':id')
  findProduct(@Param('id', ParseIntPipe) id: number): Promise<Products> {
    return this.productsService.findById(id);
  }
}
