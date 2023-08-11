import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Products } from './entities/product.entity';
import { ProductImages } from './entities/product-images.entity';
import { ProductStatus } from './product-status.enum';
import { CreateProductRequestDto } from './dto/create-product.request.dto';
import { SearchConditionRequestDto } from './dto/search-condition.request.dto';
import { SorterCondition } from './sorter-condition.enum';
import { UpdateProductRequestDto } from './dto/update-product.request.dto';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
type MockType<T = any> = Partial<Record<keyof T, jest.Mock>>;

const mockProductsRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  softRemove: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
  }),
});

const mockProductImagesRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
});

describe('ProductsService', () => {
  let service: ProductsService;
  let productsRepository: MockRepository<Products>;
  let productImagesRepository: MockRepository<ProductImages>;
  let dataSource: MockType<DataSource>;

  const mockDataSource = () => ({
    createQueryRunner: jest.fn(() => ({
      manager: {
        getRepository: jest.fn((entity) => {
          if (entity.name === 'ProductImages') {
            return productImagesRepository;
          }

          return productsRepository;
        }),
      },
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    })),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Products),
          useValue: mockProductsRepository(),
        },
        {
          provide: getRepositoryToken(ProductImages),
          useValue: mockProductImagesRepository(),
        },
        {
          provide: DataSource,
          useValue: mockDataSource(),
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productsRepository = module.get<MockRepository<Products>>(
      getRepositoryToken(Products),
    );
    productImagesRepository = module.get<MockRepository<ProductImages>>(
      getRepositoryToken(ProductImages),
    );
    dataSource = module.get<MockType<DataSource>>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('단일 상품 조회', () => {
    it('hasProductById() 함수 존재', () => {
      expect(service.hasProductById).toBeDefined();
    });

    it('단일 상품 조회', async () => {
      const id = 4;
      const product = { id };
      const callWithArgs = {
        where: { id },
        select: ['id'],
      };
      productsRepository.findOne.mockReturnValue(product);

      const result = await service.hasProductById(product.id);
      expect(productsRepository.findOne).toBeCalledTimes(1);
      expect(productsRepository.findOne).toBeCalledWith(callWithArgs);
      expect(result).toStrictEqual(product);
    });
  });

  describe('상품 등록 Post /products', () => {
    it('createProduct() 함수 존재', () => {
      expect(service.createProduct).toBeDefined();
    });

    let imageUrl,
      createProductRequestDto: CreateProductRequestDto,
      product: Products,
      productImages: ProductImages[];
    beforeEach(() => {
      const date = new Date();
      imageUrl = [
        '/fruit-heaven/dist/uploads/d5f65289-c7e2-44f2-a243-59841ec33091-9791158391409.jpg',
        '/fruit-heaven/dist/uploads/d5f65289-c7e2-44f2-a243-59841ec33091-9791158394564.jpg',
      ];
      createProductRequestDto = {
        title: '효성팜 부드러운 복숭아',
        content: '향긋한 복숭아\n달달한 향을 뽐내는 복숭아예요.',
        price: 13000,
        stock: 130,
        imageUrl,
      };
      product = {
        id: 4,
        title: '효성팜 부드러운 복숭아',
        content: '향긋한 복숭아\n달달한 향을 뽐내는 복숭아예요.',
        price: 13000,
        stock: 130,
        status: ProductStatus.SALE,
        createdAt: date,
        updatedAt: date,
        deletedAt: null,
        productImages: [],
      };
      productImages = imageUrl.map((url) => {
        const productImage = {
          ProductId: product.id,
          imageUrl: url,
        };
        return productImage;
      });
    });

    it('상품 & 이미지 등록 성공 시 true 반환', async () => {
      const productArgs = {
        title: '효성팜 부드러운 복숭아',
        content: '향긋한 복숭아\n달달한 향을 뽐내는 복숭아예요.',
        price: 13000,
        stock: 130,
      };
      productsRepository.save.mockReturnValue(product);
      productImagesRepository.create.mockImplementation(
        () => new ProductImages(),
      );
      productImagesRepository.save.mockReturnValue(productImages);

      const queryRunner = dataSource.createQueryRunner();
      queryRunner.commitTransaction();
      queryRunner.release();

      const result = await service.createProduct(createProductRequestDto);

      expect(result).toBeTruthy();
      expect(productsRepository.save).toBeCalledTimes(1);
      expect(productsRepository.save).toBeCalledWith(productArgs);
      expect(productImagesRepository.create).toBeCalledTimes(imageUrl.length);
      expect(productImagesRepository.save).toBeCalledTimes(1);
      expect(productImagesRepository.save).toBeCalledWith(productImages);
      expect(queryRunner.commitTransaction).toBeCalled();
      expect(queryRunner.release).toBeCalled();
    });

    it('상품 등록 실패 시 롤백', async () => {
      const errorMsg = { message: 'Internal Server Error' };
      productsRepository.save.mockRejectedValue(errorMsg);

      const queryRunner = dataSource.createQueryRunner();
      queryRunner.rollbackTransaction();
      queryRunner.release();

      try {
        await service.createProduct(createProductRequestDto);
      } catch (err: unknown) {
        expect(err).toEqual(errorMsg);
        expect(productsRepository.save).toBeCalledTimes(1);
        expect(queryRunner.rollbackTransaction).toBeCalled();
        expect(queryRunner.release).toBeCalled();
      }
    });

    it('상품 이미지 등록 실패 시 롤백', async () => {
      const errorMsg = { message: 'Internal Server Error' };
      productsRepository.save.mockReturnValue(product);
      productImagesRepository.create.mockImplementation(
        () => new ProductImages(),
      );
      productImagesRepository.save.mockRejectedValue(errorMsg);

      const queryRunner = dataSource.createQueryRunner();
      queryRunner.rollbackTransaction();
      queryRunner.release();

      try {
        await service.createProduct(createProductRequestDto);
      } catch (err: unknown) {
        expect(err).toEqual(errorMsg);
        expect(productsRepository.save).toBeCalledTimes(1);
        expect(productImagesRepository.create).toBeCalledTimes(imageUrl.length);
        expect(productImagesRepository.save).toBeCalledTimes(1);
        expect(queryRunner.rollbackTransaction).toBeCalled();
        expect(queryRunner.release).toBeCalled();
      }
    });
  });

  describe('상품 전체 조회 Get /products', () => {
    it('findAll() 함수 존재', () => {
      expect(service.findAll).toBeDefined();
    });

    let queryString: SearchConditionRequestDto, product: Products;
    beforeEach(() => {
      const now = new Date();
      queryString = {
        tit: '',
        limit: 50,
        sorter: SorterCondition.LATESTDESC,
      };
      product = {
        id: 5,
        title: '상품',
        content: '상품1',
        price: 13000,
        stock: 130,
        status: ProductStatus.SALE,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        productImages: [],
      };
    });

    it('상품 조회 성공 시 배열 반환', async () => {
      jest
        .spyOn(productsRepository.createQueryBuilder(), 'getMany')
        .mockResolvedValue([product]);

      const result = await service.findAll(queryString);

      expect(
        productsRepository.createQueryBuilder().getMany,
      ).toHaveBeenCalled();
      expect(result).toStrictEqual([product]);
    });

    it('상품 없을 시 빈 배열 반환', async () => {
      jest
        .spyOn(productsRepository.createQueryBuilder(), 'getMany')
        .mockResolvedValue([]);

      const result = await service.findAll(queryString);

      expect(
        productsRepository.createQueryBuilder().getMany,
      ).toHaveBeenCalled();
      expect(result).toStrictEqual([]);
    });
  });

  describe('상품 하나 조회 Get /products/id', () => {
    it('findById() 함수 존재', () => {
      expect(service.findById).toBeDefined();
    });

    let product: Products;
    beforeEach(() => {
      const now = new Date();
      product = {
        id: 5,
        title: '상품',
        content: '상품1',
        price: 13000,
        stock: 130,
        status: ProductStatus.SALE,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        productImages: [],
      };
    });

    it('상품 조회 성공 시 Products 반환', async () => {
      jest
        .spyOn(productsRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(product);

      const result = await service.findById(product.id);

      expect(productsRepository.createQueryBuilder().getOne).toHaveBeenCalled();
      expect(result).toStrictEqual(product);
    });

    it('상품 없을 시 null 반환', async () => {
      jest
        .spyOn(productsRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(null);

      const result = await service.findById(product.id);

      expect(productsRepository.createQueryBuilder().getOne).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('상품 수정 Patch /products/id', () => {
    it('updateProduct() 함수 존재', () => {
      expect(service.updateProduct).toBeDefined();
    });

    let id, updateProductRequestDto: UpdateProductRequestDto, updateResult;
    beforeEach(() => {
      id = 5;
      updateProductRequestDto = {
        status: ProductStatus.SOLDOUT,
      };
      updateResult = {
        affected: 1,
      };
    });

    it('상품 수정 성공 시 true 반환', async () => {
      productsRepository.update.mockReturnValue(updateResult);

      const result = await service.updateProduct(id, updateProductRequestDto);

      expect(result).toBeTruthy();
      expect(productsRepository.update).toHaveBeenCalledTimes(1);
      expect(productsRepository.update).toHaveBeenCalledWith(
        id,
        updateProductRequestDto,
      );
    });

    it('상품 수정 실패 시 false 반환', async () => {
      id = 0;
      updateResult.affected = 0;
      productsRepository.update.mockReturnValue(updateResult);

      const result = await service.updateProduct(id, updateProductRequestDto);

      expect(result).toBeFalsy();
      expect(productsRepository.update).toHaveBeenCalledTimes(1);
      expect(productsRepository.update).toHaveBeenCalledWith(
        id,
        updateProductRequestDto,
      );
    });

    it('상품 수정 서버 에러 시 에러 반환', async () => {
      const errorMsg = { message: 'Internal Server Error' };
      productsRepository.update.mockRejectedValue(errorMsg);

      try {
        await service.updateProduct(id, updateProductRequestDto);
      } catch (err: unknown) {
        expect(err).toEqual(errorMsg);
      }
    });
  });

  describe('상품 삭제 Delete /products/id', () => {
    it('deleteProduct() 함수 존재', () => {
      expect(service.deleteProduct).toBeDefined();
    });

    let product: Products;
    beforeEach(() => {
      const now = new Date();
      product = {
        id: 5,
        title: '상품',
        content: '상품1',
        price: 13000,
        stock: 130,
        status: ProductStatus.SALE,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        productImages: [],
      };
    });

    it('상품 삭제 성공 시 true 반환', async () => {
      productsRepository.softRemove.mockReturnValue(product);

      const result = await service.deleteProduct(product);

      expect(result).toBeTruthy();
      expect(productsRepository.softRemove).toHaveBeenCalledTimes(1);
      expect(productsRepository.softRemove).toHaveBeenCalledWith(product);
    });

    it('상품 삭제 서버 에러 시 에러 반환', async () => {
      const errorMsg = { message: 'Internal Server Error' };
      productsRepository.softRemove.mockRejectedValue(errorMsg);

      try {
        await service.deleteProduct(product);
      } catch (err: unknown) {
        expect(err).toEqual(errorMsg);
      }
    });
  });
});
