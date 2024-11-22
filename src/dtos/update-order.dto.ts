import { Type } from 'class-transformer';

import {
    IsOptional,
    IsString,
    IsNotEmpty,
    IsArray,
    ValidateNested,
    IsNumber,
    Min,
    IsMongoId,
} from 'class-validator';

class UpdateOrderItemDto {
    @IsMongoId()
    @IsOptional() // Optional because we might not always update itemId
    itemId?: string;

    @IsNumber()
    @Min(1)
    @IsOptional()
    quantity?: number;
}

export class UpdateOrderDto {
    @IsString()
    @IsOptional() // Optional because customerName may not always need updating
    @IsNotEmpty()
    customerName?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateOrderItemDto)
    @IsOptional() // Optional because the items array may not always need updating
    items?: UpdateOrderItemDto[];
}
