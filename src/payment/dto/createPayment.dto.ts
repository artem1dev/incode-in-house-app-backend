import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreatePaymentDTO {
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsNotEmpty()
    @IsString()
    country: string;
}
