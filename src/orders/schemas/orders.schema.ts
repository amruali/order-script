import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
    @Prop({
        type: String,
        required: true
    })
    customerName: string;

    @Prop({
        type: [{
            item: { type: Types.ObjectId, ref: 'Item', required: true },
            quantity: { type: Number, required: true, min: 1 },
        }],
        required: true,
        _id: false, // Disable automatic _id creation for the items array
    })
    items: { item: Types.ObjectId; quantity: number }[];

    @Prop({ required: true })
    totalAmount: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
