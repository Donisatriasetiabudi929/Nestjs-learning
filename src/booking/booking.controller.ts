import { Body, Controller, Get, HttpStatus, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from 'src/dto/create-booking.dto';

@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService: BookingService){

    }

    //Untuk menampilkan data booking dari mongodb bberdasarkan nama
    @Get('/:name')
    async getBookingByName(@Param('name') name: string, @Res() Response) {
    try {
        const bookings = await this.bookingService.getBookingsByName(name);

        //Kondisi jika nama yang diinput tidak ada
        if (bookings.length === 0) {
            return Response.status(HttpStatus.NOT_FOUND).json({
                message: 'Data pesanan tidak ditemukan'
            });
        }

        //Untuk menampilkan jika data tersedia
        return Response.status(HttpStatus.OK).json({
            message: 'Data pesanan berhasil ditemukan',
            bookings
        });
    } catch (err) {
        return Response.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Terjadi kesalahan saat mengambil data pesanan'
        });
    }
}

    //Untuk menambah data booking sekaligus menambah data queue message
    @Post()
    async createBooking(@Res() Response, @Body() createBookingDto: CreateBookingDto) {
    try {
        const newBooking = await this.bookingService.createBooking(createBookingDto);

        // Mengirim data pemesanan ke antrian "wadah"
        const wadahPayload = {
            message: "Pesanan baru",
            notransaksi: newBooking.notransaksi,
            name: newBooking.name,
            item: newBooking.item,
            pay: newBooking.pay,
            qty: newBooking.qty
        };
        await this.bookingService.sendWadahNotification(wadahPayload);

        // Mengirim notifikasi ke pengguna "user"
        const userPayload = {
            message: "Berhasil melakukan pesanan",
            notransaksi: newBooking.notransaksi,
            name: newBooking.name,
            item: newBooking.item,
            qty: newBooking.qty
        };
        await this.bookingService.sendUserNotification(userPayload);

        return Response.status(HttpStatus.CREATED).json({
            message: "Berhasil menambahkan data pemesanan",
            newBooking
        });
    } catch (err) {
        return Response.status(HttpStatus.BAD_REQUEST).json({
            statusCode: 400,
            message: "Error pemesanan tidak terbuat",
            error: 'Bad request'
        });
    }
}


    //Untuk menampilkan seluruh data pesanan yang masuk (Admin)
    @Get('/admin/receiveWadah')
    async receiveWadah() {
        const receivedMessages = await this.bookingService.receiveWadahNotification();
        return { receivedMessages };
    }

    //Untuk menampilkan seluruh data pesanan yang masuk (Admin)
    @Get('/user/alldata')
    async receiveUser() {
        const receivedMessages = await this.bookingService.receiveUserNotification();
        return { receivedMessages };
    }

    //Untuk menampilkan data pesanan berdasarkan nama (User)
    @Get('/user/receiveUser/:name')
async receiveUserByName(@Param('name') name: string, @Res() Response) {
    try {
        const receivedMessages = await this.bookingService.UserNotificationByNameAndDelete(name);
        
        return Response.status(HttpStatus.OK).json({
            message: 'Pesan dari antrian user dengan nama yang sesuai berhasil ditemukan',
            receivedMessages
        });
    } catch (err) {
        return Response.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Terjadi kesalahan saat mengambil pesan dari antrian user'
        });
    }
}




}
