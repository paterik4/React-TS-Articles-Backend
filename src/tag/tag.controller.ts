import {Get, Post, Body, Controller, UsePipes } from '@nestjs/common';

import { TagEntity } from './tag.entity';
import { TagService } from './tag.service';

import { ApiBody, ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { ValidationPipe } from '../shared/pipes/validation.pipe';
import { CreateTagDto } from './dto/create-tag.dto';

@ApiBearerAuth()
@ApiTags('tags')
@Controller('tags')
export class TagController {

	constructor(private readonly tagService: TagService) {}

	@ApiOperation({ summary: 'Get all tags' })
	@ApiResponse({ status: 200, description: 'Return all tags.'})
	@Get()
	async findAll(): Promise<TagEntity[]> {
		return await this.tagService.findAll();
	}

	@ApiOperation({ summary: 'Add a new Tag' })
	@ApiResponse({ status: 201, description: 'New tag successfully created.'})
	@ApiResponse({ status: 400, description: 'Input data validation failed.'})
	@ApiBody({ type: CreateTagDto })
	@UsePipes(new ValidationPipe())
	@Post('addNew')
	async create(@Body() tagData: CreateTagDto) {
		return this.tagService.create(tagData);
	}

}