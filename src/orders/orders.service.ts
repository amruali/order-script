import { /* BadRequestException, */ Injectable, NotFoundException } from '@nestjs/common';
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
        const orderItems = await Promise.all(
            createOrderDto.items.map(async ({ itemId, quantity }) => {

                const item = await this.itemModel.findById(itemId).exec();

                return {
                    item: new Types.ObjectId(itemId),
                    quantity,
                    price: item.price
                };
            }),
        );

        const totalAmount = orderItems.reduce((total, orderItem) => {
            const item = orderItems.find((oi) => oi.item.toString() === orderItem.item.toString());
            return total + (item?.quantity || 0) * (item?.price || 0);
        }, 0);

        const createdOrder = new this.orderModel({
            customerName: createOrderDto.customerName,
            items: orderItems,
            totalAmount,
        });


        return createdOrder.save();
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
         const orderItems = await Promise.all(

            updateOrderDto.items.map(async ({ itemId, quantity }) => {

                const item = await this.itemModel.findById(itemId).exec();

                return {
                    item: new Types.ObjectId(itemId),
                    quantity,
                    price: item.price
                };

            }),
        );

        const totalAmount = orderItems.reduce((total, orderItem) => {
            const item = orderItems.find((oi) => oi.item.toString() === orderItem.item.toString());
            return total + (item?.quantity || 0) * (item?.price || 0);
        }, 0);


        // Update the order document
        const updatedOrder = await this.orderModel
            .findByIdAndUpdate(
                id,
                {
                    customerName: updateOrderDto.customerName,
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

    async getDailySalesReport(): Promise<any> {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const [report] = await this.orderModel.aggregate([
            //     {
            //         $match: {
            //             createdAt: { $gte: startOfDay, $lte: endOfDay },
            //         },
            //     },
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
