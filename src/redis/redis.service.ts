import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Redis } from 'ioredis';
import { Model } from 'mongoose';
import { IUploud } from 'src/interface/uploud.interface';
import * as Minio from 'minio';
import * as amqp from 'amqplib';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class RedisService {
    private readonly Redisclient: Redis;
    private minioClient: Minio.Client;
    private client: amqp.Connection;
    //Untuk meyimpan "Channel" untuk melakukan koneksi langsung ke AMQP server
    private channel: amqp.Channel;

    constructor(private configService: ConfigService, @InjectModel('Uploud') private uploudModel: Model<IUploud>){
        this.Redisclient = new Redis({
            port: 6379,
            host: '127.0.0.1',
            password: '',
            username: '',
            //Optional
            db: 0
        });

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

    //Proses untuk menampilkan data cache yang tersimpan
    async getCache(): Promise<string | null> {
        return await this.Redisclient.get('001');
    }

    //Proses untuk mengirim data ke cache 
    async saveData(body: string){
        return await this.Redisclient.setex('001', 100, body);
    }

}
