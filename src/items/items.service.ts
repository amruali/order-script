import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from './schemas/item.schema';
import { CreateItemDto } from '../dtos/create-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<Item>, // Inject the Mongoose model
  ) {}

  // Create a new item
  async create(createItemDto: CreateItemDto): Promise<Item> {
    const createdItem = new this.itemModel(createItemDto);
    return createdItem.save();
  }

  // Get all items
  async findAll(): Promise<Item[]> {
    return this.itemModel.find().exec();
  }

  // Get an item by ID
  async findOne(id: string): Promise<Item> {
    return this.itemModel.findById(id).exec();
  }

  // Update an item by ID
  async update(id: string, updateItemDto: CreateItemDto): Promise<Item> {
    return this.itemModel.findByIdAndUpdate(id, updateItemDto, { new: true }).exec();
  }

  // Delete an item by ID
  async remove(id: string): Promise<Item> {
    return this.itemModel.findByIdAndDelete(id).exec();
  }
}
