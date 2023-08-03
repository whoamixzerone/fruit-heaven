import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
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
import { UpdateProductRequestDto } from './dto/update-product.request.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('upload')
  @Authorization([UsersRole.ADMIN])
  @UseInterceptors(FilesInterceptor('files'))
  uploadFile(@UploadedFiles() files: Array<Express.Multer.File>): {
    imageUrl: string[];
  } {
    if (!files) {
      throw new BadRequestException('하나 이상의 파일을 업로드 하셔야 합니다.');
    }

    const imageUrl = files.map((file) => {
      return file.path;
    });

    return { imageUrl };
  }

  @Post()
  @Authorization([UsersRole.ADMIN])
  async createProduct(
    @Body() createProductRequestDto: CreateProductRequestDto,
  ): Promise<string> {
    const result = await this.productsService.createProduct(
      createProductRequestDto,
    );
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
  async findProduct(@Param('id', ParseIntPipe) id: number): Promise<Products> {
    return await this.productsService.findById(id);
  }

  @Patch(':id')
  @Authorization([UsersRole.ADMIN])
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductRequestDto: UpdateProductRequestDto,
  ) {
    const product = await this.productsService.hasProductById(id);
    if (!product) {
      throw new NotFoundException('해당 상품이 존재하지 않습니다.');
    }

    const result = await this.productsService.updateProduct(
      id,
      updateProductRequestDto,
    );
    if (result) {
      return 'ok';
    } else {
      throw new BadRequestException();
    }
  }

  @Delete(':id')
  @Authorization([UsersRole.ADMIN])
  async deleteProduct(@Param('id', ParseIntPipe) id: number): Promise<string> {
    const product = await this.productsService.findById(id);
    if (!product) {
      throw new NotFoundException('해당 상품이 존재하지 않습니다.');
    }

    const result = await this.productsService.deleteProduct(product);
    if (result) {
      return 'ok';
    } else {
      throw new BadRequestException();
    }
  }
}
