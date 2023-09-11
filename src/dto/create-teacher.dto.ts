import { IsString, MaxLength, IsNotEmpty, IsNumber, IsEmpty } from "class-validator";
import { User } from "src/schema/user.schema";

export class CreateTeacherDto{
    @IsString()//Untuk memberitahu bahwa data yang diinput bertype string
    @MaxLength(50)//Untuk mengatur maximal length value
    @IsNotEmpty()//Untuk mengecek bahwa jangan sampai field nya tidak terisi
    readonly name: string;

    @IsNumber()//Untuk memberitahu bahwa data yang diinput bertype number
    @IsNotEmpty()//Untuk mengecek bahwa jangan sampai field nya tidak terisi
    readonly roleNumber: number;

    @IsString()//Untuk memberitahu bahwa data yang diinput bertype string
    @MaxLength(50)//Untuk mengatur maximal length value
    @IsNotEmpty()//Untuk mengecek bahwa jangan sampai field nya tidak terisi
    readonly subject: number;

    @IsString()//Untuk memberitahu bahwa data yang diinput bertype string
    @MaxLength(50)//Untuk mengatur maximal length value
    @IsNotEmpty()//Untuk mengecek bahwa jangan sampai field nya tidak terisi
    readonly gender: string;

    @IsNumber()//Untuk memberitahu bahwa data yang diinput bertype number
    @IsNotEmpty()//Untuk mengecek bahwa jangan sampai field nya tidak terisi
    readonly marks: number;

    @IsEmpty({ message: "You cannot pass user id" })
    readonly user: User;


}