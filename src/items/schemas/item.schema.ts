import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Item extends Document {
    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ required: true, unique: true })
    description: string;

    @Prop({ required: true })
    price: number;

    @Prop({ default: true })
    isActive: boolean;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
