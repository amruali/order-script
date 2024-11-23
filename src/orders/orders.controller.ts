import { Controller, Get, Post, Put, Body, Param, BadRequestException, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { Order } from './schemas/orders.schema';
import { UpdateOrderDto } from 'src/dtos/update-order.dto';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    // Utility function to parse the date in DD-MM-YYYY format
    private parseDate(date: string): Date {
        const [day, month, year] = date.split('-').map((part) => parseInt(part, 10));
        // Return a new Date object
        return new Date(new Date(year, month - 1, day) + 'UTC')
        // return new Date(year, month - 1, day);  // Month is zero-based
    }

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
    async getDailySalesReport(@Query('date') date?: string) {

        // If no date is provided, use the current date
        const targetDate = date ? this.parseDate(date) : new Date(new Date() + 'UTC');

        const startOfDay = new Date(new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0) + 'UTC'); // Local midnight

        const endDateLocalTime = new Date(new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999) + 'UTC'); // Local midnight

        return this.ordersService.getDailySalesReport(startOfDay, endDateLocalTime);
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
