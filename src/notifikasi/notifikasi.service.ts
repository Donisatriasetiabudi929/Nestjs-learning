import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class NotifikasiService {
    private client: amqp.Connection;
    private channel: amqp.Channel;

    //Untuk menginsialisasi modul terkait
    async onModuleInit() {
        //Untuk mengoneksikan KE SERVER AMQP
        this.client = await amqp.connect('amqp://localhost:5672'); 
        //Untuk membuat saluran yang berkomunikasi langsung dengan antrian di dalam koneksi nya
        this.channel = await this.client.createChannel();
        //Untuk mendefinisikan antrian 
        await this.channel.assertQueue('email_queue', { durable: false });
        //Untuk mendefinisikan antrian
        await this.channel.assertQueue('wadah', { durable: true });
    }

    //Untuk proses mengirim email notifikasi ke queued message rabbitmq
    async sendEmailNotification(email: string, message: string) {
        const payload = { email, message };
        //Buffer untuk mengonversi json string menjadi bentuk biner menggunakan objek
        this.channel.sendToQueue('email_queue', Buffer.from(JSON.stringify(payload)));
        console.log(`Notifikasi email untuk ${email} dikirim.`);
    }

    // async sendWadahNotification(nama: string, message: string) {
    //     const payload = { nama, message };
    //     this.channel.sendToQueue('wadah', Buffer.from(JSON.stringify(payload)));
    //     console.log(`Notifikasi wadah ${nama} dikirim.`);
    // }
    

    //Untuk proses menampilkan notifikasi rabbitmq
    async receiveEmailNotification() {
        const messages = [];
        await this.channel.assertQueue('email_queue', { durable: false });
        //Untuk mengambil data antrian notifikasi
        await this.channel.consume('email_queue', (message) => {
        if (message) {
            const content = message.content.toString();
            const parsedContent = JSON.parse(content); // Menguraikan string JSON menjadi objek
            console.log(`Pesan pengguna:`, parsedContent);
            messages.push(parsedContent);
            this.channel.ack(message); // Mengirim konfirmasi bahwa pesan telah diambil
        }
        });
        // Mengecek kondisi apakah ada antrian atau tidak
        if (messages.length > 0) {
            return messages;
        } else {
            return 'Tidak ada pesan dalam antrian.';
        }
    }  
    
    //Untuk pr0oses menampilkan notifikasi rabbitmq queue message wadah
    // async receiveWadahNotification() {
    //     const messagess = [];
    //     await this.channel.assertQueue('wadah', { durable: true });
    //     await this.channel.consume('wadah', (message) => {
    //         if (message) {
    //             const content = message.content.toString();
    //             const parsedContent = JSON.parse(content);
    //             console.log(`Pesan wadah:`, parsedContent);
    //             messagess.push(parsedContent);
    //             this.channel.ack(message);
    //         }
    //     });
    //     if (messagess.length > 0) {
    //         return messagess;
    //     } else {
    //         return 'Tidak ada pesan dalam antrian wadah.';
    //     }
    // }
    
}
