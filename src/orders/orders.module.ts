import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './schemas/orders.schema';
import { ItemsModule } from 'src/items/items.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]), // Register schema
    ItemsModule, // Import ItemsModule to make ItemModel available
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule { }
