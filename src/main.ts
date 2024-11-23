import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core/nest-factory';
import { AppModule } from './app.module';
import { ValidationExceptionFilter } from './orders/filters/validation-exception.filter';

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

    await app.listen(3000);
}
bootstrap();
