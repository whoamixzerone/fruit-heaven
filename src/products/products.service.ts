import { Injectable } from '@nestjs/common';
import { SearchConditionRequestDto } from './dto/search-condition.request.dto';
import { SorterCondition } from './sorter-condition.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Products } from './entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateProductRequestDto } from './dto/create-product.request.dto';
import { ProductImages } from './entities/product-images.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Products)
    private readonly productsRepository: Repository<Products>,
    @InjectRepository(ProductImages)
    private readonly productImagesRepository: Repository<ProductImages>,
    private readonly dataSource: DataSource,
  ) {}

  async createProduct(
    createProductRequestDto: CreateProductRequestDto,
  ): Promise<boolean> {
    const { title, content, price, stock, imageUrl } = createProductRequestDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.getRepository(Products).save({
        title,
        content,
        price,
        stock,
      });

      const productImages = imageUrl.map((url) => {
        const productImage = this.productImagesRepository.create();
        productImage.product = product;
        productImage.imageUrl = url;
        return productImage;
      });
      await queryRunner.manager
        .getRepository(ProductImages)
        .save(productImages);

      await queryRunner.commitTransaction();

      return true;
    } catch (err: unknown) {
      console.error(err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(queryString: SearchConditionRequestDto): Promise<Products[]> {
    let title, limit, sorter, orderCol, orderOpt;
    if (queryString) {
      title = queryString?.tit;
      limit = queryString?.limit ?? 50;
      sorter = queryString?.sorter ?? SorterCondition.BESTASC;
    }

    const query = this.productsRepository
      .createQueryBuilder('products')
      .where(title != null ? 'products.title LIKE :title' : 'false', { title })
      .take(limit);

    // todo : 판매량 order by desc
    //  order_items(주문 상품 테이블) join
    //  count(product_id) as product_count group by product_id order by product_count
    if (sorter === SorterCondition.BESTASC) {
    } else if (sorter === SorterCondition.SALEPRICEASC) {
      orderCol = 'products.price';
      orderOpt = 'ASC';
      query.orderBy(`${orderCol}, ${orderOpt}`);
    } else if (sorter === SorterCondition.SALEPRICEDESC) {
      orderCol = 'products.price';
      orderOpt = 'DESC';
      query.orderBy(`${orderCol}, ${orderOpt}`);
    } else if (sorter === SorterCondition.LATESTDESC) {
      orderCol = 'products.createdAt';
      orderOpt = 'DESC';
      query.orderBy(`${orderCol}, ${orderOpt}`);
    }

    return await query.getMany();
  }

  async findById(id: number): Promise<Products> {
    return this.productsRepository.findOne({
      where: { id },
    });
  }
}
