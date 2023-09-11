import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto{

    @IsNotEmpty()//Untuk mengecek bahwa jangan sampai field nya tidak terisi
    @IsEmail({}, {message: "Please enter correct email"})//Untuk memastikan bahwa penulisan email benar
    readonly email: string;

    @IsNotEmpty()//Untuk mengecek bahwa jangan sampai field nya tidak terisi
    @IsString()//Untuk memberitahu bahwa data yang diinput bertype string
    @MinLength(6)//Untuk mengatur minimal length value
    readonly password:string;
}