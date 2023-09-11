import { Controller, Post, Res, Body, HttpStatus, Get, Put, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from 'src/dto/create-student.dto';
import { UpdateStudentDto } from 'src/dto/update-student.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('student')
export class StudentController {
    constructor(private readonly studentService: StudentService){

    }

    @Post()
    //Untuk memanggil keamanan authorisasi auth
    @UseGuards(AuthGuard())
    async createStudent(@Res() Response, @Body() createStudentDto: CreateStudentDto, @Req() Req){
        //req Req untuk mengakses dan manipulasi informasi yang dikirimkan
        try{
            //Untuk menampilkan data user di console
            console.log(Req.user);
            const newStudent = await this.studentService.createStudent(createStudentDto)
            return Response.status(HttpStatus.CREATED).json({
                message: "Berhasil menambahkan data siswa", 
                newStudent,
                user: Req.user
            });
        }catch(err){
            return Response.status(HttpStatus.BAD_REQUEST).json({
                statusCode: 400,
                message: "Error student not created",
                error: 'Bad request'
            });
        }
    }

    @Get()
    async getStudents(@Res() Response){
        try{
            const studentData = await this.studentService.getAllStudents();
            return Response.status(HttpStatus.OK).json({
                message: 'Semua data siswa berhasil ditemukan', studentData
            });
        }catch(err){
            return Response.status(err.status).json(err.Response);
        }
    }

    @Get('/:id')
    async getStudentById(@Param('id') id: string, @Res() Response) {
        try {
            const student = await this.studentService.getStudent(id);

            if (!student) {
                return Response.status(HttpStatus.NOT_FOUND).json({
                    message: 'Data siswa tidak ditemukan'
                });
            }

            return Response.status(HttpStatus.OK).json({
                message: 'Data siswa berhasil ditemukan',
                student
            });
        } catch (err) {
            return Response.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Terjadi kesalahan saat mengambil data siswa'
            });
        }
    }

    @Put('/:id')
    //Untuk memanggil keamanan authorisasi auth
    @UseGuards(AuthGuard())
    async updateStudent(@Res() Response, @Param('id') studentId: string,
    @Body() updateStudentDto: UpdateStudentDto, @Req() Req){
        //req Req untuk mengakses dan manipulasi informasi yang dikirimkan
        try{
            //Untuk menampilkan data user di console
            console.log(Req.user);
            const existingStudent = await this.studentService.updateStudent(studentId, updateStudentDto);
            return Response.status(HttpStatus.OK).json({
                message: 'Siswa berhasil di update',
                existingStudent,
                user: Req.user,
            });
        }catch(err){
            return Response.status(err.status).json(err.Response);
        }
    }

    @Delete('/:id')
    //Untuk memanggil keamanan authorisasi auth
    @UseGuards(AuthGuard())
    async deleteStudent(@Res() Response, @Param('id') studentId: string,  @Req() Req){
        //req Req untuk mengakses dan manipulasi informasi yang dikirimkan
        try{
            const deletedStudent = await this.studentService.deleteStudent(studentId)
            return Response.status(HttpStatus.OK).json({
                message: 'Berhasil hapus data siswa',
                deletedStudent,
                user: Req.user,
            });
        }catch(err){
            return Response.status(err.status).json(err.Response)
        }
    }
    
}
