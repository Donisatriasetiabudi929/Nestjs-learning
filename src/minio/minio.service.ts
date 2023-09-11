import { Injectable, NotFoundException } from '@nestjs/common';
import * as Minio from 'minio';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';
import { CreateUploudDto } from 'src/dto/create-uploud.dto';
import { IUploud } from 'src/interface/uploud.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as amqp from 'amqplib';
import { Redis } from 'ioredis';



@Injectable()
export class MinioService {
    
    private readonly Redisclient: Redis;
    private minioClient: Minio.Client;
    private client: amqp.Connection;
    //Untuk meyimpan "Channel" untuk melakukan koneksi langsung ke AMQP server
    private channel: amqp.Channel;

    constructor(private configService: ConfigService, @InjectModel('Uploud') private uploudModel: Model<IUploud>){
        //Untuk menghubungkan redis server
        this.Redisclient = new Redis({
            port: 6379,
            host: '127.0.0.1',
            password: '',
            username: '',
            //Optional
            db: 0
        });

        //Untuk menghubungkan ke MinIO Server
        this.minioClient = new Minio.Client({
            endPoint: '127.0.0.1',
            port: 9000,
            useSSL: false,
            accessKey: this.configService.get<string>('MINIO_ACCESS_KEY'),
            secretKey: this.configService.get<string>('MINIO_SECRET_KEY')
        });
    }


    async onModuleInit() {
      //Untuk mengoneksikan KE SERVER AMQP
        this.client = await amqp.connect('amqp://localhost:5672');
      //Untuk membuat saluran yang berkomunikasi langsung dengan antrian di dalam koneksi nya
        this.channel = await this.client.createChannel();
      //Untuk mendefinisikan antrian "wadah"
        await this.channel.assertQueue('file', { durable: true });
      //Untuk mendefinisikan antrian "user"
    }
    
    //Proses uploud file ke minio console
    
        async uploadFile(bucketName: string, objectName: string, stream: Readable, contentType: string): Promise<void> {
            const objectExists = await this.checkObjectExists(bucketName, objectName);

            if (objectExists) {
                throw new Error(`File dengan nama ${objectName} sudah ada di storage`);
            }

            await this.minioClient.putObject(bucketName, objectName, stream, null, {
                'Content-Type': contentType,
            });
        }
        async checkObjectExists(bucketName: string, objectName: string): Promise<boolean> {
            try {
                await this.minioClient.statObject(bucketName, objectName);
                return true;
            } catch (error) {
                if (error.code === 'NotFound') {
                return false;
                }
                throw error;
            }
        }


    //proses memasukkan data ke mongodb
        async createUploud(name: string, namaFile: string): Promise<IUploud>{
            const newUploud = await new this.uploudModel({ name, file: namaFile }); // Menyimpan 'name' dan 'namaFile'
            return newUploud.save();
        }


    //proses memasukkan antrian ke queuenya
        async sendWadahNotification(payload: any) {
            try {
                await this.channel.assertQueue('file', { durable: true });
                this.channel.sendToQueue('file', Buffer.from(JSON.stringify(payload)));
                console.log(`${payload.name} telah memasukkan pesanan`);
            } catch (error) {
                console.error(`Error saat mengirim notifikasi uploud file: ${error}`);
            }
        }
        async UserNotificationByNameAndDelete(name: string) {
            const messages = [];
            // Untuk mendapatkan data antrian notifikasi
            const { messageCount } = await this.channel.checkQueue('file');
            //variable untuk menandakan apakah ada setidaknya 1 pesan yang sesuai dengan nama yang diinput
            let foundMessages = false; 
        
            //Untuk mengulang seberapa bnayak pesan antrian yang tersedia 
            for (let i = 0; i < messageCount; i++) {
                //untuk mengambil pesan dalam queue message user
                const message = await this.channel.get('file', { noAck: false });
                //Noack digunakan untuk tidak adakn menghapus pesan dari antrian sampai ack diberikan 
                //Proses keluaran atau outpunya dan untuk proses pengakuan dari ack
                if (message) {
                    const content = message.content.toString();
                    const parsedContent = JSON.parse(content);
                    if (parsedContent.name === name) {
                        console.log(`${name}: telah menguploud file`, parsedContent);
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

    //Proses pengambilan data dari mongodb dan redis cache
        async getAllUploud(): Promise<IUploud[]> {
            //Untuk membuat dan memasukkan data ke cache dengan key 003
            const cachedData = await this.Redisclient.get('003');
            
            if (cachedData) {
                // Jika data tersedia di cache, parse data JSON dan kembalikan
                return JSON.parse(cachedData);
            } else {
                // Jika data tidak ada di cache, ambil dari database
                const uploudData = await this.uploudModel.find();
                if (!uploudData || uploudData.length === 0) {
                    throw new NotFoundException('Data uploud tidak ada!');
                }
    
                // Untuk menyimpan data dari database ke cache dan mengatur waktu kedaluwarsa
                await this.Redisclient.setex('003', 3600, JSON.stringify(uploudData)); 
            
                return uploudData;
            }
        }

    //Proses pengambilan data berdasarkan nama dari mongodb dan redis cache
        async getUploudsByName(name: string): Promise<IUploud[]> {
            //Untuk membuat dan memasukkan data ke cache dengan key 004
            const cacheKey = `004:${name}`;
            const cachedData = await this.Redisclient.get(cacheKey);
            
            if (cachedData) {
                // Jika data tersedia di cache, parse data JSON dan kembalikan
                return JSON.parse(cachedData);
            } else {
                // Jika data tidak ada di cache, ambil dari database
                const uplouds = await this.uploudModel.find({ name });
                if (uplouds.length === 0) {
                    throw new NotFoundException('Data Uploud tidak ditemukan!');
                }
                
                // Untuk menyimpan data dari database ke cache dan mengatur waktu kedaluwarsa
                await this.Redisclient.setex(cacheKey, 3600, JSON.stringify(uplouds)); 
    
                return uplouds;
            }
        }

    //Untuk proses update cache 003
    //Pengambilan ulang semua data dari mongodb jika ada data yang dihapus
        async updateCache(): Promise<void> {
            try {
                const uploudData = await this.uploudModel.find();
                if (!uploudData || uploudData.length === 0) {
                    throw new NotFoundException('Data uploud tidak ada!');
                }
                // Simpan data dari database ke cache dan atur waktu kedaluwarsa
                await this.Redisclient.setex('003', 3600, JSON.stringify(uploudData)); // 3600 detik = 1 jam
                console.log('Cache Redis (key 003) telah diperbarui dengan data terbaru dari MongoDB');
                } catch (error) {
                    console.error(`Error saat memperbarui cache Redis (key 003): ${error}`);
                    throw new Error('Terjadi kesalahan saat memperbarui cache Redis');
                }
            }
    
        //Proses untuk menghapus data uploud di database
        async deleteUploud(uploudId: string): Promise<IUploud> {
            const deletedUploud = await this.uploudModel.findByIdAndDelete(uploudId);
                
            if (!deletedUploud) {
                throw new NotFoundException(`Data uploud dengan ID ${uploudId} tidak tersedia!`);
            }
            
            return deletedUploud;
        }
    
        //Untuk menghapus data file di miniostorage berdasarkan id di mongodb
        async deleteFile(bucketName: string, objectName: string): Promise<void> {
            try {
                await this.minioClient.removeObject(bucketName, objectName);
                console.log(`File ${objectName} telah dihapus dari Minio`);
            } catch (error) {
                console.error(`Error saat menghapus file dari Minio: ${error}`);
                throw new Error('Terjadi kesalahan saat menghapus file dari Minio');
            }
        }
    
        //Untuk menghapus data cache dengan key 004 berdasarkan name
        async deleteCache(key: string): Promise<void> {
            try {
                await this.Redisclient.del(key);
                console.log(`Cache dengan key ${key} telah dihapus dari Redis`);
            } catch (error) {
                console.error(`Error saat menghapus cache dari Redis: ${error}`);
                throw new Error('Terjadi kesalahan saat menghapus cache dari Redis');
            }
        }


        // Proses Edit data
        
        async getUploud(uploudId: string): Promise<IUploud> {
            const uploudData = await this.uploudModel.findById(uploudId);
            if (!uploudData) {
                throw new NotFoundException(`Data uploud dengan ID ${uploudId} tidak ditemukan!`);
            }
            return uploudData;
        }
        async updateUploud(uploudId: string, name: string, namefile: string): Promise<IUploud> {
            const updatedUploud = await this.uploudModel.findByIdAndUpdate(
                uploudId,
                { name, file: namefile },
                { new: true }
            );

            if (!updatedUploud) {
                throw new NotFoundException(`Data uploud dengan ID ${uploudId} tidak tersedia!`);
            }

            // Perbarui cache untuk data uploud
            await this.updateCache();

            // Hapus cache untuk data uploud berdasarkan nama
            await this.deleteCache(`004:${updatedUploud.name}`);

            return updatedUploud;
        }

}