
import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from './orders/orders.module';
import { ItemsModule } from './items/items.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                uri: configService.get<string>('MONGO_DB_URI'),
            }),
            inject: [ConfigService],
        }),

        // Redis configuration using ConfigService
        CacheModule.registerAsync({
            isGlobal: true,
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                isGlobal: true,
                store: redisStore,
                host: configService.get<string>('REDIS_HOST'),
                port: configService.get<number>('REDIS_PORT'),
                // redisOptions: {
                //     onClientReady: (client) => {
                //         client.on('ready', () => console.log('Redis is connected!'));
                //         client.on('error', (err) => console.error('Redis error:', err));
                //     },
                // },
            }),
            inject: [ConfigService],
        }),

        OrdersModule,
        ItemsModule
    ],
    // controllers: [AppController],
    // providers: [AppService],
})
export class AppModule { }

