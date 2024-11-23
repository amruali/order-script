import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core/nest-factory';
import { AppModule } from './app.module';
import { ValidationExceptionFilter } from './orders/filters/validation-exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {

    const app = await NestFactory.create(AppModule);

    // Apply the ValidationPipe globally
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Remove unknown properties
            forbidNonWhitelisted: true, // Reject requests with extra properties
            transform: true, // Automatically transform payloads to match DTOs
        }),
    );

    app.useGlobalFilters(new ValidationExceptionFilter());

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 8080); // Default to 3000 if PORT is not set

    await app.listen(port);
}
bootstrap();
