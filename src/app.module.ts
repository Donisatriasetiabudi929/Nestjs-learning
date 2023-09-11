import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { StudentSchema } from './schema/student.scema';
import { StudentService } from './student/student.service';
import { StudentController } from './student/student.controller';
import { TeacherSchema } from './schema/teacher.scema';
import { TeacherController } from './teacher/teacher.controller';
import { TeacherService } from './teacher/teacher.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserSchema } from './schema/user.schema';
import { JwtStrategy } from './auth/jwt.strategy';
import { NotifikasiController } from './notifikasi/notifikasi.controller';
import { RabbitMQModule } from '@nestjs-plus/rabbitmq';
import { NotifikasiService } from './notifikasi/notifikasi.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BookingSchema } from './schema/booking.schema';
import { BookingController } from './booking/booking.controller';
import { BookingService } from './booking/booking.service';
import { MinioService } from './minio/minio.service';
import { MinioController } from './minio/minio.controller';
import { UploudSchema } from './schema/uploud.schema';
import { RedisController } from './redis/redis.controller';
import { RedisService } from './redis/redis.service';



@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'EMAIL_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'], // link URL kita sendiri
          queue: 'email_queue',
          queueOptions: { durable: false },
        },
      },
      {
        name: 'ht',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'], // Ganti dengan URL RabbitMQ Anda
          queue: 'wadah',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'EMAIL_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'], // Ganti dengan URL RabbitMQ Anda
          queue: 'user',
          queueOptions: { durable: true },
        },
      },
      {
        name: 'file',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'], // Ganti dengan URL RabbitMQ Anda
          queue: 'file',
          queueOptions: { durable: true },
        },
      },
    ]),
    ConfigModule.forRoot(),
    PassportModule.register({defaultStrategy: 'jwt'}),
        JwtModule.registerAsync({
          imports: [ConfigModule],
            useFactory: (config: ConfigService) =>{
                return{
                    secret: config.get<string>('JWT_SECRET'),
                    signOptions: {
                        expiresIn :config.get<string | number>('JWT_EXPIRES'),
                    },
                };
            },            
            inject: [ConfigService],
        }),
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/crudnest'),
    MongooseModule.forFeature([{name: 'Student', schema: StudentSchema}]),
    MongooseModule.forFeature([{name: 'Teacher', schema: TeacherSchema}]),
    MongooseModule.forFeature([{name: 'User', schema: UserSchema}]),
    MongooseModule.forFeature([{name: 'Booking', schema: BookingSchema}]),
    MongooseModule.forFeature([{name: 'Uploud', schema: UploudSchema}]),
  ],
  controllers: [AppController, StudentController, TeacherController, AuthController, NotifikasiController, BookingController, MinioController, RedisController],
  providers: [AppService, StudentService, TeacherService, AuthService, JwtStrategy, NotifikasiService, BookingService, MinioService, RedisService],
  exports: [JwtStrategy, PassportModule],
})
export class AppModule {}

