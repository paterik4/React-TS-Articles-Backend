import { Injectable} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { TagEntity } from './tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagRO } from './tag.interface';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';
import { validate } from 'class-validator';

@Injectable()
export class TagService {
	constructor(
		@InjectRepository(TagEntity)
		private readonly tagRepository: Repository<TagEntity>
	) {}

	async findAll(): Promise<TagEntity[]> {
		return await this.tagRepository.find();
	}

	async create(dto: CreateTagDto): Promise<TagRO> {

		// check uniqueness of username/email
		const { tag } = dto;
		const qb = await getRepository(TagEntity)
		.createQueryBuilder('tag')
		.where('tag.tag = :tag', { tag });

		const Tag = await qb.getOne();

		if (Tag) {
			const errors = {tag: 'Tag must be unique.'};
			throw new HttpException({message: 'Input data validation failed', errors}, HttpStatus.BAD_REQUEST);
		}

		// create new user
		let newTag = new TagEntity();
		newTag.tag = tag;

		const errors = await validate(newTag);
		if (errors.length > 0) {
			const _errors = {username: 'Userinput is not valid.'};
			throw new HttpException({message: 'Input data validation failed', _errors}, HttpStatus.BAD_REQUEST);
		} else {
			const savedUser = await this.tagRepository.save(newTag);
			return this.buildUserRO(savedUser);
		}
	}

	private buildUserRO(tag: TagEntity) {
		const tagRO = {
			id: tag.id,
			tag: tag.tag
		};

		return {tag: tagRO};
	}

}
