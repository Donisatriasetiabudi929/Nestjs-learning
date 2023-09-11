import { PartialType } from "@nestjs/mapped-types";
import { CreateStudentDto } from "./create-student.dto";
import { IsEmpty } from "class-validator";
import { User } from "../schema/user.schema";

export class UpdateStudentDto extends PartialType(CreateStudentDto){

    @IsEmpty({ message: "You cannot pass user id" })
    readonly user: User;

}