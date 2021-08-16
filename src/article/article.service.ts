import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, DeleteResult } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { Comment } from './comment.entity';
import { UserEntity } from '../user/user.entity';
import { FollowsEntity } from '../profile/follows.entity';
import { CreateArticleDto } from './dto';

import {ArticleRO, ArticlesRO, CommentsRO} from './article.interface';
const slug = require('slug');

@Injectable()
export class ArticleService {
	constructor(
		@InjectRepository(ArticleEntity)
		private readonly articleRepository: Repository<ArticleEntity>,
		@InjectRepository(Comment)
		private readonly commentRepository: Repository<Comment>,
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		@InjectRepository(FollowsEntity)
		private readonly followsRepository: Repository<FollowsEntity>
	) {}

	async findAll(query): Promise<ArticlesRO> {

		const qb = await getRepository(ArticleEntity)
		.createQueryBuilder('article')
		.leftJoinAndSelect('article.author', 'author');

		qb.where("1 = 1");

		if ('tag' in query) {
			qb.andWhere("article.tagList LIKE :tag", { tag: `%${query.tag}%` });
		}

		if ('author' in query) {
			const author = await this.userRepository.findOne({username: query.author});
			qb.andWhere("article.authorId = :id", { id: author.id });
		}

		if ('favorited' in query) {
			const author = await this.userRepository.findOne({username: query.favorited});
			const ids = (await author.favorites).map(el => el.id);
			qb.andWhere("article.authorId IN (:ids)", { ids });
		}

		qb.orderBy('article.created', 'DESC');

		const articlesCount = await qb.getCount();

		if ('limit' in query) {
			qb.limit(query.limit);
		}

		if ('offset' in query) {
			qb.offset(query.offset);
		}

		const articles = await qb.getMany();

		return {articles, articlesCount};
	}

	async findFeed(userId: number, query): Promise<ArticlesRO> {
		const _follows = await this.followsRepository.find( {followerId: userId});
		const ids = _follows.map(el => el.followingId);

		const qb = await getRepository(ArticleEntity)
		.createQueryBuilder('article')
		.where('article.authorId IN (:ids)', { ids });

		qb.orderBy('article.created', 'DESC');

		const articlesCount = await qb.getCount();

		if ('limit' in query) {
			qb.limit(query.limit);
		}

		if ('offset' in query) {
			qb.offset(query.offset);
		}

		const articles = await qb.getMany();

		return {articles, articlesCount};
	}

	async findOne(slug, userId: number): Promise<ArticleRO> {
		const article = await this.articleRepository.findOne({slug});

		if (!article) {
			throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
		}

		if (!userId) {
			return {article};
		}
		(article as any).isFavourite = !!(await (await this.userRepository.findOne(userId)).favorites).find(a => a.id === article.id);

		return {article};
	}

	async addComment(userId: number, slug: string, commentData): Promise<ArticleRO> {
		let article = await this.articleRepository.findOne({slug});

		if (!article) {
			throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
		}

		const comment = new Comment();
		comment.body = commentData.body;
		comment.author = await this.userRepository.findOne({ where: { id: userId }, relations: ["comments"] });

		article.comments.push(comment);

		await this.commentRepository.save(comment);
		article = await this.articleRepository.save(article);
		return {article}
	}

	async deleteComment(slug: string, id: string): Promise<ArticleRO> {
		let article = await this.articleRepository.findOne({slug});
		const comment = await this.commentRepository.findOne(id);

		if (!article || !comment) {
			throw new HttpException('Invalid article or comment', HttpStatus.BAD_REQUEST);
		}

		const deleteIndex = article.comments.findIndex(_comment => _comment.id === comment.id);

		if (deleteIndex >= 0) {
			const deleteComments = article.comments.splice(deleteIndex, 1);
			await this.commentRepository.delete(deleteComments[0].id);
			article =  await this.articleRepository.save(article);
			return {article};
		} else {
			return {article};
		}

	}

	async favorite(userId: number, slug: string): Promise<ArticleRO> {
		let article = await this.articleRepository.findOne({slug});
		const user = await this.userRepository.findOne(userId);

		if (!article || !user) {
			throw new HttpException('Invalid article or user', HttpStatus.BAD_REQUEST);
		}

		const favArticleList = await user.favorites;
		if (favArticleList.findIndex(_article => _article.id === article.id) < 0) {
			favArticleList.push(article);
			article.favoriteCount++;

			user.favorites = Promise.resolve(favArticleList);
			await this.userRepository.save(user);
			article = await this.articleRepository.save(article);
		}

		return {article};
	}

	async unFavorite(userId: number, slug: string): Promise<ArticleRO> {
		let article = await this.articleRepository.findOne({slug});
		const user = await this.userRepository.findOne(userId);

		if (!article || !user) {
			throw new HttpException('Invalid article or user', HttpStatus.BAD_REQUEST);
		}

		const favArticleList = await user.favorites;
		const deleteIndex = favArticleList.findIndex(_article => _article.id === article.id);

		if (deleteIndex >= 0) {
			favArticleList.splice(deleteIndex, 1);
			article.favoriteCount--;

			user.favorites = Promise.resolve(favArticleList);
			await this.userRepository.save(user);
			article = await this.articleRepository.save(article);
		}

		return {article};
	}

	async findComments(slug: string): Promise<CommentsRO> {
		const article = await this.articleRepository.findOne({slug});
		if (!article) {
			throw new HttpException('Article not found.', HttpStatus.NOT_FOUND);
		}
		return {comments: article.comments};
	}

	async create(userId: number, articleData: CreateArticleDto): Promise<ArticleEntity> {

		let article = new ArticleEntity();
		article.title = articleData.title;
		article.body = articleData.body;
		article.description = articleData.description;
		article.slug = this.slugify(articleData.title);
		article.tagList = articleData.tagList || [];
		article.comments = [];

		const newArticle = await this.articleRepository.save(article);

		const author = await this.userRepository.findOne({ where: { id: userId }, relations: ["articles"] });

		if (Array.isArray(author.articles)) {
			author.articles.push(article);
		} else {
			author.articles = [article];
		}

		await this.userRepository.save(author);

		return newArticle;

	}

	async update(slug: string, articleData: any): Promise<ArticleRO> {
		let toUpdate = await this.articleRepository.findOne({ slug: slug});
		if (!toUpdate) {
			throw new HttpException('Article not found.', HttpStatus.NOT_FOUND);
		}
		let updated = Object.assign(toUpdate, articleData);
		const article = await this.articleRepository.save(updated);
		return {article};
	}

	async delete(slug: string): Promise<DeleteResult> {
		return await this.articleRepository.delete({ slug: slug});
	}

	slugify(title: string) {
		return `${slug(title, {lower: true})} - ${(Math.random() * Math.pow(36, 6) | 0).toString(36)}`;
	}
}
