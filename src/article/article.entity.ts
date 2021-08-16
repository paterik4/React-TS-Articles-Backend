import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, OneToMany, JoinColumn, AfterUpdate, BeforeUpdate } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { Comment } from './comment.entity';

@Entity('article')
export class ArticleEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	slug: string;

	@Column()
	title: string;

	@Column({default: ''})
	description: string;

	@Column({default: ''})
	body: string;

	@Column({ type: 'int', default: () => Date.now()})
	created: number;

	@Column({ type: 'int', default: () => Date.now()})
	updated: number;

	@BeforeUpdate()
	updateTimestamp() {
		this.updated = Date.now();
	}

	@Column('simple-array')
	tagList: string[];

	@ManyToOne(type => UserEntity, user => user.articles, { onDelete: 'CASCADE' })
	author: UserEntity;

	@OneToMany(type => Comment, comment => comment.article, {eager: true })
	@JoinColumn()
	comments: Comment[];

	@Column({default: 0})
	favoriteCount: number;
}
