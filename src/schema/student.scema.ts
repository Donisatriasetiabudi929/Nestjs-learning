import {Prop,Schema,SchemaFactory} from '@nestjs/mongoose'
import { User } from './user.schema';
import mongoose from 'mongoose';

@Schema()
export class Student{
    @Prop()//Properti atau untuk menyebutkan fieldnya
    name: string;

    @Prop()//Properti atau untuk menyebutkan fieldnya
    roleNumber: number;

    @Prop()//Properti atau untuk menyebutkan fieldnya
    class: number;

    @Prop()//Properti atau untuk menyebutkan fieldnya
    gender: string;

    @Prop()//Properti atau untuk menyebutkan fieldnya
    marks: number;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User'})
    user: User;
}

export const StudentSchema = SchemaFactory.createForClass(Student)