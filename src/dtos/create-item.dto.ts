import { IsString, Min, IsBoolean, IsNotEmpty, Length, IsNumber } from 'class-validator';

export class CreateItemDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 50) // The name must be between 5 and 50 characters
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    @Length(10, 200) // The name must be between 5 and 50 characters
    readonly description: string;

    @IsNumber()
    @Min(0)  // The price should be a positive integer
    readonly price: number;

    @IsBoolean()
    readonly isActive: boolean;
}
