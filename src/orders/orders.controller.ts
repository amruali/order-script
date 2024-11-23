import { Controller, Get, Post, Put, Body, Param, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { Order } from './schemas/orders.schema';
import { UpdateOrderDto } from 'src/dtos/update-order.dto';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    async createOrder(@Body() createOrderDto: CreateOrderDto) {
        try {
            return this.ordersService.createOrder(createOrderDto);
        } catch (exception) {
            const message =
                exception instanceof Error
                    ? exception.message : 'Order creation failed.';

            throw new BadRequestException(message);
        }
    }

    @Get()
    async findAll(): Promise<Order[]> {
        return this.ordersService.findAll();
    }

    @Get('daily-report')
    async getDailySalesReport() {
        return this.ordersService.getDailySalesReport();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Order> {
        return this.ordersService.findOne(id);
    }

    // Update an order by ID
    @Put(':id')
    async updateOrder(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto): Promise<Order> {
        return this.ordersService.updateOrder(id, updateOrderDto);
    }
}
