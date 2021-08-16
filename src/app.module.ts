import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ArticleModule } from './article/article.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { ProfileModule } from './profile/profile.module';
import { TagModule } from './tag/tag.module';

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: "sqlite",
			database: 'db.sqlite',
			synchronize: true,
			logging: false,
			entities: [`${__dirname}/../**/*.entity{.ts,.js}`],
		}),
		ArticleModule,
		UserModule,
		ProfileModule,
		TagModule
	],
	controllers: [
		AppController
	],
	providers: []
})
export class ApplicationModule {
	constructor(private readonly connection: Connection) {
		this.fixedSync(connection);
	}

	async fixedSync(connection: Connection) {
		await connection.query('PRAGMA foreign_keys=OFF');
		await connection.synchronize();
		await connection.query('PRAGMA foreign_keys=ON');
	}
}
