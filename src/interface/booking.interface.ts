import {Document} from 'mongoose'
export interface IBooking extends Document{
    readonly name: string;
    readonly item: string;
    readonly qty: number;
    readonly pay: string;
    readonly notransaksi: string;

    //Interface ini digunakan untuk menyebutkan field-field table yang akan dibuat
}