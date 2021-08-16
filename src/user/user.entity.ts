import {Entity, PrimaryGeneratedColumn, Column, BeforeInsert, JoinTable, ManyToMany, OneToMany} from "typeorm";
import { IsEmail, Validate } from 'class-validator';
import * as crypto from 'crypto';
import { ArticleEntity } from '../article/article.entity';
import { Comment } from '../article/comment.entity';

@Entity('user')
export class UserEntity {

	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	username: string;

	@Column()
	@IsEmail()
	email: string;

	@Column({default: ''})
	bio: string;

	@Column({default: ''})
	image: string;

	@Column({select: false})
	password: string;

	@BeforeInsert()
	hashPassword() {
		this.password = crypto.createHmac('sha256', this.password).digest('hex');
	}

	@ManyToMany(type => ArticleEntity, { onDelete: 'CASCADE' })
	@JoinTable()
	favorites: Promise<ArticleEntity[]>;

	@OneToMany(type => ArticleEntity, article => article.author)
	articles: ArticleEntity[];

	@OneToMany(type => Comment, comment => comment.author)
	comments: Comment[];

}
