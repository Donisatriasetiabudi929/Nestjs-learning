import { IsString, MaxLength, IsNotEmpty, IsNumber, IsEmpty } from "class-validator";
import { User } from "../schema/user.schema";

export class CreateBookingDto{

    
    @IsString()//Untuk memberitahu bahwa data yang diinput bertype string
    @MaxLength(50)//Untuk mengatur maximal length value
    @IsNotEmpty()//Untuk mengecek bahwa jangan sampai field nya tidak terisi
    readonly name: string;

    @IsString()//Untuk memberitahu bahwa data yang diinput bertype string
    @MaxLength(50)//Untuk mengatur maximal length value
    @IsNotEmpty()//Untuk mengecek bahwa jangan sampai field nya tidak terisi
    readonly item: string;

    @IsNumber()//Untuk memberitahu bahwa data yang diinput bertype number
    @IsNotEmpty()//Untuk mengecek bahwa jangan sampai field nya tidak terisi
    readonly qty: number;

    @IsString()//Untuk memberitahu bahwa data yang diinput bertype string
    @MaxLength(50)//Untuk mengatur maximal length value
    @IsNotEmpty()//Untuk mengecek bahwa jangan sampai field nya tidak terisi
    readonly pay: string;

    readonly notransaksi: string;

    @IsEmpty({ message: "You cannot pass user id" })
    readonly user: User;

}