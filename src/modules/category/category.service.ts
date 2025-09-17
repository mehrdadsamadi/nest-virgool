import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { Repository } from 'typeorm';
import {
  ConflictMessage,
  NotFoundMessage,
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

  async insertByTitle(title: string) {
    const category = this.categoryRepository.create({
      title,
    });

    return this.categoryRepository.save(category);
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

  async findOne(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) throw new NotFoundException(NotFoundMessage.Category);

    return category;
  }

  async findOneByTitle(title: string) {
    return this.categoryRepository.findOneBy({ title });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    const { title, priority } = updateCategoryDto;

    if (title) category.title = title;
    if (priority) category.priority = priority;

    await this.categoryRepository.save(category);

    return {
      message: PublicMessage.Updated,
    };
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.categoryRepository.delete(id);

    return {
      message: PublicMessage.Deleted,
    };
  }
}
