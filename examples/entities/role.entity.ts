
import { IsString, Length, MinLength, ArrayNotEmpty, IsTimeZone,  IsDateString,  ArrayMaxSize, ArrayMinSize, MaxLength, Min, Max, IsInt, IsPositive, IsDate, IsEmail, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsArray } from 'class-validator'
import { Type } from 'class-transformer'
import { UserEntity } from './user.entity.js';
export class Role {

    @IsInt()
    @IsPositive()
    @IsNotEmpty()
    id: number

    @IsString()
    @MinLength(1)
    @MaxLength(65)
    name: string
}