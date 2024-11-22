import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { Item, ItemSchema } from './schemas/item.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Item.name, schema: ItemSchema }]), // Register the schema
    ],
    exports: [MongooseModule], // Export MongooseModule so other modules can use ItemModel
    providers: [ItemsService],
    controllers: [ItemsController],
})
export class ItemsModule { }
