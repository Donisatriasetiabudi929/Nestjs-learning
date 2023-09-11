import { IsNotEmpty, IsString } from "class-validator";

export class CreateUploudDto{
    @IsString()
    @IsNotEmpty()//Untuk mengecek bahwa jangan sampai field nya tidak terisi
    readonly name: string;

    readonly file: Express.Multer.File;


}