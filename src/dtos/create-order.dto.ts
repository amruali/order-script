import { Type } from 'class-transformer';
import { IsString, Min, IsMongoId, IsNotEmpty, IsNumber, IsArray, ValidateNested } from 'class-validator';


class OrderItemDto {
    @IsMongoId({ message: 'Invalid item ID format.' }) // Validates MongoDB ObjectId
    @IsNotEmpty({ message: 'Item ID is required.' })
    itemId: string;

    @IsNumber({}, { message: 'Quantity must be a number.' })
    @Min(1, { message: 'Quantity must be at least 1.' })
    quantity: number;
}

export class CreateOrderDto {
    @IsString({ message: 'Customer name must be a string.' })
    @IsNotEmpty({ message: 'Customer name is required.' })
    customerName: string;

    @IsArray({ message: 'Items must be an array.' })
    @ValidateNested({ each: true, message: 'Invalid item structure.' }) // Validate each item in the array
    @Type(() => OrderItemDto) // Transform each array element into an OrderItemDto instance
    items: OrderItemDto[];
}