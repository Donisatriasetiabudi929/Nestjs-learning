import {Prop,Schema,SchemaFactory} from '@nestjs/mongoose'
import mongoose from 'mongoose';
import { User } from './user.schema';

@Schema()
export class Teacher{
    @Prop()//Properti atau untuk menyebutkan fieldnya
    name: string;

    @Prop()//Properti atau untuk menyebutkan fieldnya
    roleNumber: number;

    @Prop()//Properti atau untuk menyebutkan fieldnya
    subject: string;

    @Prop()//Properti atau untuk menyebutkan fieldnya
    gender: string;

    @Prop()//Properti atau untuk menyebutkan fieldnya
    marks: number;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User'})
    user: User;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher)