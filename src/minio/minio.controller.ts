// MinioController
import { Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Post, Put, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { MinioService } from './minio.service';
import { CreateUploudDto } from 'src/dto/create-uploud.dto';
import { randomBytes } from 'crypto';



@Controller('upload')
export class MinioController {
    constructor(private readonly minioService: MinioService) {}

//Endpoint untuk menguploud file, mengirim data ke dataabse, redis dan minio storage
@Post('file')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(
    @UploadedFile() uploadedFile: Express.Multer.File,
    @Body() createUploudDto: CreateUploudDto, 
): Promise<any> {
    try {
        // ...

        if (!uploadedFile) {
            return { message: 'Tidak ada file yang diunggah' };
        }

        const stream = require('stream');
        const readableStream = new stream.PassThrough();
        readableStream.end(uploadedFile.buffer);

        const uniqueCode = randomBytes(5).toString('hex');

        const objectName = `${uniqueCode}-${uploadedFile.originalname}`;

        const { name } = createUploudDto;

	    const payload = { name, file: uploadedFile.originalname };
        await this.minioService.sendWadahNotification(payload);

        await this.minioService.uploadFile('coba1', objectName, readableStream, uploadedFile.mimetype);

        await this.minioService.createUploud(name, objectName); // Simpan objectName di MongoDB
        await this.minioService.updateCache();

        return { message: 'Data berhasil dikirim' };

    } catch (error) {
        console.error(`Error saat mengunggah file: ${error}`);
        throw new Error('Terjadi kesalahan saat mengunggah file');
    }
}

//Endpoint untuk menampilkan notif antrian dari rabbitmw
@Get('/notif/:name')
    async receiveUserByName(@Param('name') name: string, @Res() Response) {
    try {
        const receivedMessages = await this.minioService.UserNotificationByNameAndDelete(name);
        
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

//Enpoint untuk menampilkan semua data, dan menyimpannya di redis cache
@Get('/up')
    async getUplouds(@Res() Response){
        try{
            const uploudData = await this.minioService.getAllUploud();
            return Response.status(HttpStatus.OK).json({
                message: 'Semua data uploud berhasil di temukan', uploudData
            });
        }catch(err){
            return Response.status(err.status).json(err.Response);
        }
    }

//Endpoint untuk menampilkan data berdasarkan nama, dan menyimpannya di redis cache
@Get('/up/:name')
    async getUploudsByName(@Param('name') name: string, @Res() Response) {
    try {
        const uplouds = await this.minioService.getUploudsByName(name);

        //Kondisi jika nama yang diinput tidak ada
        if (uplouds.length === 0) {
            return Response.status(HttpStatus.NOT_FOUND).json({
                message: 'Data Uploud tidak ditemukan'
            });
        }

        //Untuk menampilkan jika data tersedia
        return Response.status(HttpStatus.OK).json({
            message: 'Data pesanan berhasil ditemukan',
            uplouds
        });
    } catch (err) {
        return Response.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Data Uploud tidak ditemukan'
        });
    }
}

//Endpoint untuk entpoint Delete data di database dan juga file yang tersimpan di storage minio
@Delete('/:id')
async deleteUploud(@Res() Response, @Param('id') uploudId: string){
    try {
        // Dapatkan data uploud berdasarkan ID
        const deletedUploud = await this.minioService.deleteUploud(uploudId);

        // Hapus objek dari Minio berdasarkan nama file
        await this.minioService.deleteFile('coba1', deletedUploud.file);

        // Update cache untuk data uploud
        await this.minioService.updateCache();

        // Hapus cache untuk data uploud berdasarkan nama
        const { name } = deletedUploud;
        await this.minioService.deleteCache(`004:${name}`);

        return Response.status(HttpStatus.OK).json({
            message: 'Berhasil hapus data uploud',
            deletedUploud
        });
    } catch (err) {
        return Response.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Id yang di input tidak tersedia'
        });
    }
}


//Endpoint untuk mengupdate data
@Put('/:id')
@UseInterceptors(FileInterceptor('file')) 
async updateUploud(
    @Res() Response,
    @Param('id') uploudId: string,
    @Body() createUploudDto: CreateUploudDto,
    @UploadedFile() uploadeddFile: Express.Multer.File,
) {
    try {
        const { name } = createUploudDto;
        const file = uploadeddFile.originalname;

        // Dapatkan data uploud berdasarkan ID
        const uploudData = await this.minioService.getUploud(uploudId);

        if (uploudData) {
            // Hapus objek dari Minio berdasarkan nama file lama
            await this.minioService.deleteFile('coba1', uploudData.file);
        } else {
            throw new NotFoundException(`Data uploud dengan ID ${uploudId} tidak tersedia!`);
        }

        // Perbarui data di MongoDB
        const updatedUploud = await this.minioService.updateUploud(uploudId, name, file);

        // Upload file baru ke Minio
        const stream = require('stream');
        const readableStream = new stream.PassThrough();
        readableStream.end(uploadeddFile.buffer);

        const objectName = uploadeddFile.originalname;

        await this.minioService.uploadFile('coba1', objectName, readableStream, uploadeddFile.mimetype);

        return Response.status(HttpStatus.OK).json({
            message: 'Data uploud berhasil diperbarui',
            updatedUploud
        });
    } catch (err) {
        return Response.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: 'Terjadi kesalahan saat memperbarui data uploud'
        });
    }
}



}
