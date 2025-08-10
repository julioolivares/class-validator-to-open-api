import 'reflect-metadata'
import { Type } from 'class-transformer'
import { IsString, Length, MinLength, ArrayNotEmpty,  ArrayMaxSize, ArrayMinSize, MaxLength, Min, Max, IsInt, IsPositive, IsDate, IsEmail, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator'



class Role {

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    id: number

    @IsString()
    @MinLength(1)
    @MaxLength(65)
    name: string
}

export class UserEntity {
    
    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    @Min(1)
    id: number
    
    @IsString()
    @Length(2, 65)
    name: string;


    @IsString()
    @MinLength(2)
    @MaxLength(65)
    lastName: string;


    @IsInt()
    @IsPositive()
    @Min(1)
    @Max(130)
    age: number;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    password: string[];

    @Type(() => Date)
    @IsDate()
    
    createdAt: Date;
    
    @Type(() => Date)
    @IsDate()
    updatedAt: Date;

    @Type(() => Role)
    @IsNotEmpty()
    role: Role
}