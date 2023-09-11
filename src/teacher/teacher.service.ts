import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeacherDto } from 'src/dto/create-teacher.dto';
import { ITeacher } from 'src/interface/teacher.interface';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UpdateTeacherDto } from 'src/dto/update-teacher.dto';

@Injectable()
export class TeacherService {
    constructor(@InjectModel('Teacher') private teacherModel: Model<ITeacher>){

    }


    // untuk membuat teacer baru
    async createTeacher(createTeacherDto: CreateTeacherDto): Promise<ITeacher>{
        const newTeacher = await new this.teacherModel(createTeacherDto);
        return newTeacher.save();
    }

    //reading all student dari mangodb
    async getAllTeacher(): Promise<ITeacher[]>{
        const teacherData = await this.teacherModel.find()
        if (!teacherData || teacherData.length == 0){
            throw new NotFoundException('Data guru tidak ada!');
        }
        return teacherData;
    }

    //reading teacher by id dari mongo db
    async getTeacher(teacherId:string): Promise<ITeacher>{
        const existingTeacher = await this.teacherModel.findById(teacherId)
        if(!existingTeacher){
            throw new NotFoundException(`Guru dengan #${teacherId} tidak tersedia!`);
        }
        return existingTeacher;
    }

    //hapus guru berdasarkan id
    async deleteTeacher(teacherId: string): Promise<ITeacher> {
        const deletedTeacher = await this.teacherModel.findByIdAndDelete(teacherId);
        
        if (!deletedTeacher) {
            throw new NotFoundException(`Guru dengan ID ${teacherId} tidak tersedia!`);
        }
        
        return deletedTeacher;
    }
    

    //update data guru berdasarkan id
    async updateTeacher(teacherId: string, updateTeacherDto:UpdateTeacherDto):Promise<ITeacher>{
        const existingTeacher = await this.teacherModel.findByIdAndUpdate(teacherId, updateTeacherDto, {new: true});
        if(!existingTeacher){
            throw new NotFoundException(`Guru dengan #${teacherId} tidak tersedia!`);
        }
        return existingTeacher;
    }
}
