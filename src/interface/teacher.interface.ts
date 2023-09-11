import {Document} from 'mongoose'
export interface ITeacher extends Document{
    readonly name: string;
    readonly roleNumber: number;
    readonly subject: string;
    readonly gender: string;
    readonly marks: number;

     //Interface ini digunakan untuk menyebutkan field-field table yang akan dibuat

}