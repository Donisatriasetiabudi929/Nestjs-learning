import {Prop,Schema,SchemaFactory} from '@nestjs/mongoose'
import { User } from './user.schema';
import mongoose from 'mongoose';

@Schema()
export class Booking{
    @Prop()//Properti atau untuk menyebutkan fieldnya
    name: string;

    @Prop()//Properti atau untuk menyebutkan fieldnya
    item: string;

    @Prop()//Properti atau untuk menyebutkan fieldnya
    qty: number;

    @Prop()//Properti atau untuk menyebutkan fieldnya
    pay: string;

    @Prop()//Properti atau untuk menyebutkan fieldnya
    notransaksi: string;


    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User'})
    user: User;
}

export const BookingSchema = SchemaFactory.createForClass(Booking)