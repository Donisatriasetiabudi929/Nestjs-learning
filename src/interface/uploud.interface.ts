import {Document} from 'mongoose'
export interface IUploud extends Document{
    readonly name: string;
    readonly file: string;

     //Interface ini digunakan untuk menyebutkan field-field table yang akan dibuat

}