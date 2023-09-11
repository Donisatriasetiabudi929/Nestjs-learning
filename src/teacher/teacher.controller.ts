import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { CreateTeacherDto } from 'src/dto/create-teacher.dto';
import { UpdateTeacherDto } from 'src/dto/update-teacher.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('teacher')
export class TeacherController {
    constructor(private readonly teacherService: TeacherService){

    }

    //post untuk menambah data guru
    @Post()
    //Untuk memanggil keamanan authorisasi auth
    @UseGuards(AuthGuard())
    async createTeacher(@Res() Response, @Body() createTeacherDto: CreateTeacherDto, @Req() Req){
        //req Req untuk mengakses dan manipulasi informasi yang dikirimkan
        try{
            const newTeacher = await this.teacherService.createTeacher(createTeacherDto)
            return Response.status(HttpStatus.CREATED).json({
                message: "Berhasil menambahkan data guru",
                newTeacher,
                user: Req.user
            });
        }catch(err){
            return Response.status(HttpStatus.BAD_REQUEST).json({
                statusCode: 400,
                message: "Error teacher not created",
                error: 'Bad request'
            });
        }
    }

    //untuk menampilkan seluruh data guru
    @Get()
    async getTeachers(@Res() Response){
        try{
            const teacherData = await this.teacherService.getAllTeacher();
            return Response.status(HttpStatus.OK).json({
                message: 'Semua data guru berhasil di temukan', teacherData
            });
        }catch(err){
            return Response.status(err.status).json(err.Response);
        }
    }

    //menampilkan data guru berdasarkan id
    @Get('/:id')
    async getTeacherById(@Param('id') id:string, @Res() Response){
        try{
            const teacher = await this.teacherService.getTeacher(id);
            if(!teacher){
                return Response.status(HttpStatus.NOT_FOUND).json({
                    message: 'Data guru tidak ditemukan'
                });
            }
            return Response.status(HttpStatus.OK).json({
                message: 'Data guru berhasil ditemukan',
                teacher
            });
        }catch(err){
            return Response.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Tidak ada id guru yang terdaftar'
            });
        }
    }

    //Update data guru berdasarkan id
    @Put('/:id')
    //Untuk memanggil keamanan authorisasi auth
    @UseGuards(AuthGuard())
    async updateTeacher(@Res() Response, @Param('id') teacherId: string, @Body() updateTeacherDto: UpdateTeacherDto, @Req() Req){
        //req Req untuk mengakses dan manipulasi informasi yang dikirimkan
        try{
            const existingTeacher = await this.teacherService.updateTeacher(teacherId, updateTeacherDto);
            return Response.status(HttpStatus.OK).json({
                message: 'Guru berhasil di update',
                existingTeacher,
                user: Req.user
            });
        }catch(err){
            return Response.status(err.status).json(err.Response);
        }
    }

    //Menghapus data guru
    @Delete('/:id')
    //Untuk memanggil keamanan authorisasi auth
    @UseGuards(AuthGuard())
    async deleteTeacher(@Res() Response, @Param('id') teacherId: string, @Req() Req){
        //req Req untuk mengakses dan manipulasi informasi yang dikirimkan
        try{
            const deletedTeacher = await this.teacherService.deleteTeacher(teacherId)
            return Response.status(HttpStatus.OK).json({
                message: 'Berhasil hapus data siswa',
                deletedTeacher,
                user: Req.user
            });
        }catch(err){
            return Response.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Id yang di input tidak tersedia'
            });
        }
    }
}
