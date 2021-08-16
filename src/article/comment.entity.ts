import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinTable } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { UserEntity } from '../user/user.entity';

@Entity()
export class Comment {

	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'int', default: () => Date.now()})
	created: number;

	@Column()
	body: string;

	@ManyToOne(type => ArticleEntity, article => article.comments, { onDelete: 'CASCADE' })
	article: ArticleEntity;

	@ManyToOne(type => UserEntity, user => user.comments, { onDelete: 'CASCADE', eager: true })
	@JoinTable()
	author: UserEntity;
}