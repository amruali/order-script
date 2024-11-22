import { Type } from 'class-transformer';
import { IsString, Min, IsMongoId, IsNotEmpty, IsNumber, IsArray, ValidateNested } from 'class-validator';


class OrderItemDto {
    @IsMongoId() // Ensures valid MongoDB ObjectId
    @IsNotEmpty()
    itemId: string;

    @IsNumber()
    @Min(1) // Ensure quantity is at least 1
    quantity: number;
}

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty() // Ensures the customerName is not empty
    customerName: string;

    @IsArray() // Ensures the items field is an array
    @ValidateNested({ each: true }) // Validate each item in the array
    @Type(() => OrderItemDto) // Transform each array element into an OrderItemDto instance
    items: OrderItemDto[];
}