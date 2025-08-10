import 'reflect-metadata'
import { Type } from 'class-transformer'
import { IsString, Length, MinLength, ArrayNotEmpty, IsTimeZone,  IsDateString,  ArrayMaxSize, ArrayMinSize, MaxLength, Min, Max, IsInt, IsPositive, IsDate, IsEmail, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsArray } from 'class-validator'



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
    email: string;
    
    
    @IsString()
    @Length(8, 60)
    password: string;
    
    @IsArray()
    @ArrayNotEmpty()
    @IsString({each: true})
    pictures: Uint8Array[]

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