import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core/nest-factory';
import { AppModule } from './app.module';

async function bootstrap() {
    
    const app = await NestFactory.create(AppModule);

    // Apply global validation pipe
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.listen(3000);
}
bootstrap();
