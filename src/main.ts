import { NestFactory } from '@nestjs/core';
import { ApplicationModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
	const appOptions = {cors: true};
	const app = await NestFactory.create(ApplicationModule, appOptions);
	app.setGlobalPrefix('api');

	const options = new DocumentBuilder()
		.setTitle('UI challenge')
		.setDescription(`This site and README.md has all the necessary documentation`)
		.setVersion('1.0')
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, options, { ignoreGlobalPrefix: false	});
	SwaggerModule.setup('/docs', app, document);

	await app.listen(3000);
}
bootstrap();