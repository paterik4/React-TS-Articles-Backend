import {Get, Post, Body, Put, Delete, Query, Param, Controller} from '@nestjs/common';
import { Request } from 'express';
import { ArticleService } from './article.service';
import { CreateArticleDto, CreateCommentDto } from './dto';
import { ArticlesRO, ArticleRO } from './article.interface';
import { CommentsRO } from './article.interface';
import { User } from '../user/user.decorator';
import { ApiBody, ApiParam, ApiTags, ApiBearerAuth, ApiResponse, ApiOperation } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('articles')
@Controller('articles')
export class ArticleController {

	constructor(private readonly articleService: ArticleService) {}

	@ApiOperation({ summary: 'Get all articles' })
	@ApiResponse({ status: 200, description: 'Return all articles.'})
	@Get()
	async findAll(@Query() query): Promise<ArticlesRO> {
		return await this.articleService.findAll(query);
	}

	@ApiOperation({ summary: 'Get an article by slug' })
	@ApiResponse({ status: 200, description: 'Return the article' })
	@ApiResponse({ status: 404, description: 'Article not found' })
	@ApiParam({ name: "slug", required: true })
	@Get(':slug')
	async findOne(@User('id') userId: number, @Param('slug') slug): Promise<ArticleRO> {
		return await this.articleService.findOne(slug, userId);
	}

	@ApiOperation({ summary: 'Get article comments' })
	@ApiParam({ name: "slug", required: true })
	@Get(':slug/comments')
	async findComments(@Param('slug') slug): Promise<CommentsRO> {
		return await this.articleService.findComments(slug);
	}

	@ApiBody({ type: CreateArticleDto })
	@ApiOperation({ summary: 'Create article' })
	@ApiResponse({ status: 201, description: 'The article has been successfully created.'})
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	@Post()
	async create(@User('id') userId: number, @Body() articleData: CreateArticleDto) {
		return this.articleService.create(userId, articleData);
	}

	@ApiBody({ type: CreateArticleDto })
	@ApiOperation({ summary: 'Update article' })
	@ApiResponse({ status: 200, description: 'The article has been successfully updated.'})
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	@ApiParam({ name: "slug", required: true })
	@Put(':slug')
	async update(@Param() params, @Body() articleData: CreateArticleDto) {
		// Todo: update slug also when title gets changed
		return this.articleService.update(params.slug, articleData);
	}

	@ApiOperation({ summary: 'Delete article' })
	@ApiResponse({ status: 200, description: 'The article has been successfully deleted.'})
	@ApiResponse({ status: 404, description: 'Article not found' })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	@ApiParam({ name: "slug", required: true })
	@Delete(':slug')
	async delete(@Param() params) {
		return this.articleService.delete(params.slug);
	}

	@ApiBody({ type: CreateCommentDto })
	@ApiOperation({ summary: 'Create comment' })
	@ApiResponse({ status: 201, description: 'The comment has been successfully created.'})
	@ApiResponse({ status: 404, description: 'Article not found' })
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	@ApiParam({ name: "slug", required: true })
	@Post(':slug/comments')
	async createComment(@User('id') userId: number, @Param('slug') slug, @Body() commentData: CreateCommentDto) {
		return await this.articleService.addComment(userId, slug, commentData);
	}

	@ApiOperation({ summary: 'Delete comment' })
	@ApiResponse({ status: 201, description: 'The comment has been successfully deleted.'})
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	@ApiParam({ name: "slug", required: true })
	@ApiParam({ name: "id", required: true })
	@Delete(':slug/comments/:id')
	async deleteComment(@Param() params) {
		const {slug, id} = params;
		return await this.articleService.deleteComment(slug, id);
	}

	@ApiOperation({ summary: 'Favorite article' })
	@ApiResponse({ status: 201, description: 'The article has been successfully favorited.'})
	@ApiResponse({ status: 400, description: 'Invalid slug.'})
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	@ApiParam({ name: "slug", required: true })
	@Post(':slug/favorite')
	async favorite(@User('id') userId: number, @Param('slug') slug) {
		return await this.articleService.favorite(userId, slug);
	}

	@ApiOperation({ summary: 'Unfavorite article' })
	@ApiResponse({ status: 201, description: 'The article has been successfully unfavorited.'})
	@ApiResponse({ status: 400, description: 'Invalid slug.'})
	@ApiResponse({ status: 401, description: 'Unauthorized.' })
	@ApiParam({ name: "slug", required: true })
	@Delete(':slug/favorite')
	async unFavorite(@User('id') userId: number, @Param('slug') slug) {
		return await this.articleService.unFavorite(userId, slug);
	}
}
