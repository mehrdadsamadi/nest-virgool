import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { Repository } from 'typeorm';
import {
  ConflictMessage,
  PublicMessage,
} from '../../common/enums/message.enum';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import {
  paginationGenerator,
  paginationSolver,
} from '../../common/utils/pagination.util';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    let { title, priority } = createCategoryDto;

    title = await this.checkExistAndResolveCategoryTitle(title);

    const category = this.categoryRepository.create({
      title,
      priority,
    });

    await this.categoryRepository.save(category);

    return {
      message: PublicMessage.Created,
    };
  }

  async checkExistAndResolveCategoryTitle(title: string) {
    title = title?.trim()?.toLowerCase();
    const category = await this.categoryRepository.findOneBy({ title });
    if (category) {
      throw new ConflictException(ConflictMessage.Category);
    }
    return title;
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, skip, page } = paginationSolver(paginationDto);

    const [categories, count] = await this.categoryRepository.findAndCount({
      where: {},
      skip,
      take: limit,
    });

    return {
      categories,
      pagination: paginationGenerator(count, page, limit),
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
