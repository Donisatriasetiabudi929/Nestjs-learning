import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateStudentDto } from 'src/dto/create-student.dto';
import { UpdateStudentDto } from 'src/dto/update-student.dto';
import { IStudent } from 'src/interface/student.interface';

@Injectable()
export class StudentService {
    constructor(@InjectModel('Student') private studentModel: Model<IStudent>){

    }

    // Membuat siswa baru di dalam mongodb

    async createStudent(createStudentDto: CreateStudentDto): Promise<IStudent>{
        const newStudent = await new this.studentModel(createStudentDto);
        return newStudent.save(); // untuk save student baru
    }

    // reading all student dari mongodb
    async getAllStudents():Promise<IStudent[]>{
        const studentData = await this.studentModel.find()
        if (!studentData || studentData.length == 0){
            throw new NotFoundException('Data siswa tidak ada!');
        }
        return studentData;
    }

    // reading student by id dari mongodb
    async getStudent(studentId:string):Promise<IStudent>{
        const existingStudent = await this.studentModel.findById(studentId)
        if (!existingStudent){
            throw new NotFoundException(`Siswa dengan #${studentId} tidak tersedia`);
        }
        return existingStudent;
    }

    // Hapus siswa berdasarkan id
    async deleteStudent(studentId: string):Promise<IStudent>{
        const deletedStudent = await this.studentModel.findByIdAndDelete(studentId)
        if (!deletedStudent) {
            throw new NotFoundException(`Siswa dengan #${studentId} tidak tersedia!`);
        }
        return deletedStudent;
    }

    // update siswa berdasarkan id
    async updateStudent(studentId: string, updateStudentDto: UpdateStudentDto):Promise<IStudent>{
        const existingStudent = await this.studentModel.findByIdAndUpdate(studentId, updateStudentDto, {new: true});
        if (!existingStudent) {
            throw new NotFoundException(`Siswa #${studentId} tidak tersedia!`);
        }
        return existingStudent;
    }

}
