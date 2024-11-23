import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './schemas/orders.schema';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { Item } from '../items/schemas/item.schema';
import { UpdateOrderDto } from '../dtos/update-order.dto';

@Injectable()
export class OrdersService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
        @InjectModel(Item.name) private readonly itemModel: Model<Item>,
    ) { }


    async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
        // Populate the order with item details
        const { customerName, items: payloadItems } = createOrderDto;

        // Validate item IDs
        const payloadItemsIDs = payloadItems.map((item) => item.itemId);

        const existingItems = await this.itemModel.find({ _id: { $in: payloadItemsIDs } }).exec();

        if (existingItems.length !== payloadItems.length) {
            const missing_items = payloadItemsIDs.filter(itemID => !existingItems.map(item => item._id.toString()).includes(itemID));
            throw new BadRequestException(`Some items in the order do not exist. [${missing_items.join(",")}]`);
        }

        const orderItems = await Promise.all(
            payloadItems.map(async ({ itemId, quantity }) => {
                const existingItem = existingItems.find(item => item._id.toString() === itemId);
                return {
                    item: new Types.ObjectId(itemId),
                    quantity,
                    price: existingItem.price,
                };
            })
        );

        const totalAmount = orderItems.reduce((total, { price, quantity }) => {
            return total + price * quantity;
        }, 0);

        try {

            const createdOrder = new this.orderModel({
                customerName,
                items: orderItems,
                totalAmount,
            });

            return createdOrder.save();

        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException('Failed to create the order.');
        }
    }


    async findAll(): Promise<Order[]> {
        return this.orderModel
            .find()
            .populate({
                path: 'items.item', // Populate the itemId field with Item details
                select: 'name price _id', // Select only the name and price fields from the Item model
            })
            .exec();
    }

    async findOne(id: string): Promise<Order> {
        return this.orderModel
            .findById(id)
            .populate({
                path: 'items.item',
                select: 'name price _id', // Fetch name, price, and _id (itemId)
            })
            .exec();
    }


    // Update an order by ID
    async updateOrder(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {

        // Populate the order with item details
        const { customerName, items: payloadItems } = updateOrderDto;

        // Validate item IDs
        const payloadItemsIDs = payloadItems.map((item) => item.itemId);

        const existingItems = await this.itemModel.find({ _id: { $in: payloadItemsIDs } }).exec();

        if (existingItems.length !== payloadItems.length) {
            const missing_items = payloadItemsIDs.filter(itemID => !existingItems.map(item => item._id.toString()).includes(itemID));
            throw new BadRequestException(`Some items in the order do not exist. [${missing_items.join(",")}]`);
        }

        const orderItems = await Promise.all(
            payloadItems.map(async ({ itemId, quantity }) => {
                const existingItem = existingItems.find(item => item._id.toString() === itemId);
                return {
                    item: new Types.ObjectId(itemId),
                    quantity,
                    price: existingItem.price,
                };
            })
        );

        const totalAmount = orderItems.reduce((total, { price, quantity }) => {
            return total + price * quantity;
        }, 0);


        // Update the order document
        const updatedOrder = await this.orderModel
            .findByIdAndUpdate(
                id,
                {
                    customerName: customerName,
                    items: orderItems.length ? orderItems : [],
                    totalAmount: orderItems.length ? totalAmount : 0,
                },
                { new: true, omitUndefined: true }, // `omitUndefined` skips undefined fields
            )
            .populate({
                path: 'items.item',
                select: 'name price _id',
            });

        if (!updatedOrder) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        return updatedOrder;
    }

    async getDailySalesReport(startOfDay: Date, endOfDay: Date): Promise<any> {

        const [report] = await this.orderModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDay, $lte: endOfDay },
                },
            },
            {
                '$group': {
                    '_id': null,
                    'totalOrders': {
                        '$sum': 1
                    },
                    'orders': {
                        '$push': '$$ROOT'
                    }
                }
            },
            {
                '$unwind': {
                    'path': '$orders'
                }
            },
            {
                '$unwind': {
                    'path': '$orders.items'
                }
            },
            {
                '$lookup': {
                    'from': 'items',
                    'localField': 'orders.items.item',
                    'foreignField': '_id',
                    'as': 'itemDetails'
                }
            },
            {
                '$unwind': {
                    'path': '$itemDetails'
                }
            },
            {
                '$group': {
                    '_id': '$orders.items.item',
                    'name': {
                        '$first': '$itemDetails.name'
                    },
                    'quantitySold': {
                        '$sum': '$orders.items.quantity'
                    },
                    'totalSales': {
                        '$sum': {
                            '$multiply': [
                                '$orders.items.quantity', '$itemDetails.price'
                            ]
                        }
                    },
                    'totalOrders': {
                        '$first': '$totalOrders'
                    }
                }
            },
            {
                '$sort': {
                    'totalSales': -1   // sort is on totalSales of item which is price * quantity of sold ones not quantity of sold items alone
                }
            },
            {
                '$limit': 10   // can be configurable next; now set to limit to 
            },
            {
                '$group': {
                    '_id': null,
                    'totalRevenue': {
                        '$sum': '$totalSales'
                    },
                    'totalOrders': {
                        '$first': '$totalOrders'
                    },
                    'topSellingItems': {
                        '$push': {
                            'itemId': '$_id',
                            'name': '$name',
                            'quantitySold': '$quantitySold',
                            'totalSales': '$totalSales'
                        }
                    }
                }
            },
            {
                '$project': {
                    '_id': 0,
                    'totalRevenue': 1,
                    'totalOrders': 1,
                    'topSellingItems': 1
                }
            }
        ]);

        return report
    }

}
