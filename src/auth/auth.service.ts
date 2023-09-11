import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/schema/user.schema';
import { SignUpDto } from 'src/dto/signup.dto';
import { LoginDto } from 'src/dto/login.dto';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import { IUser } from 'src/interface/user.interface';

@Injectable()
export class AuthService {
    //Untuk menyuntikkan model pengguna serta layanan JWT
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
        private jwtService: JwtService,
    ){}

    //Untuk melakukan proses signup
    async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
        //yang di input sesuai dengan yang ada di file DTO
        const { name, email, password } = signUpDto;
        // Untuk periksa apakah email sudah terdaftar sebelumnya
        const existingUser = await this.userModel.findOne({ email });
        //Kondisi untuk data user sudah ada atau belum
        if (existingUser) {
            throw new NotFoundException('Data dengan email yang anda input, sudah terdaftar!!!'); 
        }
        //Untuk melakukan hash kepada pasword
        const hashedPassword = await bcrypt.hash(password, 10);
        //Proses pembuatan data user baru
        const user = await this.userModel.create({
            name,
            email,
            password: hashedPassword,
            role: 'public', 
        });
        //Untuk menghasilkan token perID
        const token = this.jwtService.sign({ id: user._id });
        //Untuk menampilkan token
        return { token };
    }         

    async updateUser(userId: string, updateUserDto: UpdateUserDto):Promise<IUser>{
        const existingUser = await this.userModel.findByIdAndUpdate(userId, updateUserDto, {new: true});
        if (!existingUser) {
            throw new NotFoundException(`User #${userId} tidak tersedia!`);
        }
        return existingUser;
    }

    //Untuk proses login
    async login (loginDto: LoginDto): Promise<{ token: string }> {
        //Yang di input
        const {email, password} = loginDto;

        //untuk mencari user berdasarkan email
        const user = await this.userModel.findOne({email});
        //Jika tidak ada data user yang sesuai
        if(!user){
            throw new UnauthorizedException('Invalid email or password');
        }

        //Untuk melakukan compare / mencocokkan antara password dengan hasil hash yang ada di database
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        //Jika password tidak match
        if(!isPasswordMatched){
            throw new UnauthorizedException('Invalid email or password');
        }

        //Untuk menghasilkan token perID
        const token = this.jwtService.sign({ id: user._id });
        //Untuk menampilkan token
        return { token } ;
    }
}
