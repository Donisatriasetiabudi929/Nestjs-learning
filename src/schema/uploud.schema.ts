import {Prop,Schema,SchemaFactory} from '@nestjs/mongoose'
import mongoose from 'mongoose';
import { User } from './user.schema';

@Schema()
export class Uploud{
    @Prop()//Properti atau untuk menyebutkan fieldnya
    name: string;

    @Prop()//Properti atau untuk menyebutkan fieldnya
    file: string;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User'})
    user: User;
}

export const UploudSchema = SchemaFactory.createForClass(Uploud)