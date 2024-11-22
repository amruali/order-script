import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { Order } from './schemas/orders.schema';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    async createOrder(@Body() createOrderDto: CreateOrderDto) {
      return this.ordersService.createOrder(createOrderDto);
    }

    @Get()
    async findAll(): Promise<Order[]> {
        return this.ordersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Order> {
        return this.ordersService.findOne(id);
    }
}
