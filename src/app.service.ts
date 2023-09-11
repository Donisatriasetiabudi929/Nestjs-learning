import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  sendNotification(email: string, message: string) {
      throw new Error('Method not implemented.');
  }
  getHello(): string {
    return 'Doni satria setiabudi';
  }
}
