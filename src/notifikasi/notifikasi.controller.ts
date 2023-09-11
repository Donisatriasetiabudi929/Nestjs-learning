import { Controller, Get, Post, Body } from '@nestjs/common';
import { NotifikasiService } from './notifikasi.service';

@Controller('email')
export class NotifikasiController {
    constructor(private readonly notifikasiService: NotifikasiService) {}

    //Untuk method link http send email ke queued message rabbitmq
    @Post('/sendEmail')
    async sendEmail(@Body() body: { email: string; message: string }) {
        const { email, message } = body;
        await this.notifikasiService.sendEmailNotification(email, message);
        return { message: 'Pesan email dalam antrian untuk pengiriman.' };
    }

    // @Post('/sendWadah')
    // async sendWadah(@Body() body: { nama: string; message: string }) {
    // const { nama, message } = body;
    // await this.notifikasiService.sendWadahNotification(nama, message);
    // return { message: 'Notifikasi wadah dalam antrian untuk pengiriman.' };
    // }


    //Untuk method link http menampilkan dan menghapus queued message rabbitmq
    @Get('/receiveEmail')
    async receiveEmail() {
        const receivedMessage = await this.notifikasiService.receiveEmailNotification();
        return { receivedMessage };
    }

    // @Get('/receiveWadah')
    // async receiveWadah() {
    //     const receivedMessages = await this.notifikasiService.receiveWadahNotification();
    //     return { receivedMessages };
    // }

}
