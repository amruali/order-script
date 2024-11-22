import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from '../dtos/create-item.dto';
import { Item } from './schemas/item.schema';

@Controller('items')
export class ItemsController {
    constructor(private readonly itemsService: ItemsService) { }

    // Create an item
    @Post()
    async create(@Body() createItemDto: CreateItemDto): Promise<Item> {
        return this.itemsService.create(createItemDto);
    }

    // Get all items
    @Get()
    async findAll(): Promise<Item[]> {
        return this.itemsService.findAll();
    }

    // Get a specific item by ID
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Item> {
        return this.itemsService.findOne(id);
    }

    // Update an item by ID
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateItemDto: CreateItemDto,
    ): Promise<Item> {
        return this.itemsService.update(id, updateItemDto);
    }

    // Delete an item by ID
    @Delete(':id')
    async remove(@Param('id') id: string): Promise<Item> {
        return this.itemsService.remove(id);
    }
}
