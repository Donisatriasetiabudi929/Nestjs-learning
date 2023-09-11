import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateBookingDto } from 'src/dto/create-booking.dto';
import { IBooking } from 'src/interface/booking.interface';
import * as amqp from 'amqplib';

@Injectable()
export class BookingService {
    //Untuk melakukan koneksi ke AMQP server
    private client: amqp.Connection;
    //Untuk meyimpan "Channel" untuk melakukan koneksi langsung ke AMQP server
    private channel: amqp.Channel;

    constructor(@InjectModel('Booking') private bookingModel: Model<IBooking>){

    }

    //Untuk menginsialisasi modul terkait
    async onModuleInit() {
        //Untuk mengoneksikan KE SERVER AMQP
        this.client = await amqp.connect('amqp://localhost:5672');
        //Untuk membuat saluran yang berkomunikasi langsung dengan antrian di dalam koneksi nya
        this.channel = await this.client.createChannel();
        //Untuk mendefinisikan antrian "wadah"
        await this.channel.assertQueue('wadah', { durable: true });
        //Untuk mendefinisikan antrian "user"
        await this.channel.assertQueue('user', { durable: true });
    }

    //Untuk menampilkan data dari mongodb berdasarkan nama
    async getBookingsByName(name: string): Promise<IBooking[]> {
        const Bookings = await this.bookingModel.find({ name });
        return Bookings;
    }

    //Untuk melakukan pesanan dan menyimpan nya di database mongodb
    async createBooking(createBookingDto: CreateBookingDto): Promise<IBooking> {
        const notransaksi = this.generateRandomCode(); // Generate random code
        const newBooking = await new this.bookingModel({ ...createBookingDto, notransaksi });
        return newBooking.save();
    }
    
    //Untuk melakukan generate random
    generateRandomCode(length: number = 10): string {
        //Variable untuk value random
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        //Variable untuk melakukan looping
        let code = '';
        //Proses looping 
        for (let i = 0; i < length; i++) {
            //untuk menghasilkan index secara acak
            const randomIndex = Math.floor(Math.random() * characters.length);
            code += characters.charAt(randomIndex);
        }
        return code;
    }
    

    //untuk mengirim notifikasi ke queue message wadah
    async sendWadahNotification(payload: any) {
        try {
            await this.channel.assertQueue('wadah', { durable: true });
            this.channel.sendToQueue('wadah', Buffer.from(JSON.stringify(payload)));
            console.log(`${payload.name} telah memasukkan pesanan`);
        } catch (error) {
            console.error(`Error saat mengirim notifikasi wadah: ${error}`);
        }
    }

    //untuk mengirim notifikasi ke queue message user
    async sendUserNotification(payload: any) {
        try {
            await this.channel.assertQueue('user', { durable: true });
            this.channel.sendToQueue('user', Buffer.from(JSON.stringify(payload)));
            console.log(`Notifikasi untuk pengguna ${payload.name} dikirim.`);
        } catch (error) {
            console.error(`Error saat mengirim notifikasi ke pengguna: ${error}`);
        }
    }

    //Untuk menampilkan data queue message wadah
    async receiveWadahNotification() {
            const messagess = [];
            await this.channel.assertQueue('wadah', { durable: true });
            await this.channel.consume('wadah', (message) => {
                if (message) {
                    const content = message.content.toString();
                    const parsedContent = JSON.parse(content);
                    console.log(`Pesan wadah:`, parsedContent);
                    messagess.push(parsedContent);
                    this.channel.ack(message);
                }
            });
            if (messagess.length > 0) {
                return messagess;
            } else {
                return 'Tidak ada pesan dalam antrian wadah.';
            }
    }

    //Untuk menampilkan pesan queue message user
    async receiveUserNotification() {
        const messagess = [];
        await this.channel.assertQueue('user', { durable: true });
        await this.channel.consume('user', (message) => {
            if (message) {
                const content = message.content.toString();
                const parsedContent = JSON.parse(content);
                console.log(`Pesan user:`, parsedContent);
                messagess.push(parsedContent);
                this.channel.ack(message);
            }
        });
        if (messagess.length > 0) {
            return messagess;
        } else {
            return 'Tidak ada pesan dalam antrian user.';
        }
}

    //Untuk menampilkan queue message user berdasarkan nama
    async UserNotificationByNameAndDelete(name: string) {
        const messages = [];
        // Untuk mendapatkan data antrian notifikasi
        const { messageCount } = await this.channel.checkQueue('user');
        //variable untuk menandakan apakah ada setidaknya 1 pesan yang sesuai dengan nama yang diinput
        let foundMessages = false; 
        
        //Untuk mengulang seberapa bnayak pesan antrian yang tersedia 
        for (let i = 0; i < messageCount; i++) {
            //untuk mengambil pesan dalam queue message user
            const message = await this.channel.get('user', { noAck: false });
            //Noack digunakan untuk tidak adakn menghapus pesan dari antrian sampai ack diberikan 
            //Proses keluaran atau outpunya dan untuk proses pengakuan dari ack
            if (message) {
                const content = message.content.toString();
                const parsedContent = JSON.parse(content);
                if (parsedContent.name === name) {
                    console.log(`Pesan user untuk ${name}:`, parsedContent);
                    messages.push(parsedContent);
                    await this.channel.ack(message);
                    foundMessages = true;
                } else {
                    await this.channel.nack(message);
                }
            }
        }
        //Kondisi dimana tidak ada antrian notifikasi berdasarkan nama yang di input
        if (!foundMessages) {
            messages.push({ message: 'Belum ada notifikasi' }); 
        }
        return messages;
    }
}

