import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('redis')
export class RedisController {
    constructor(private readonly redisService: RedisService){}

    //Endpoint untuk mengirim data ke cache
    @Post()
    saveDataRedis(@Body("name") name:string){
        return this.redisService.saveData(name);
    }

    //Endpoint untuk menampilkan data dari cache
    @Get()
    async getCache(): Promise<string | null> {
    return await this.redisService.getCache();
    }

    




}
