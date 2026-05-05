import { IsString, IsOptional, IsNumber, IsArray, Min, Max } from 'class-validator';
import { MathOperation } from '../../entities/child.entity';

export class CreateChildDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minNumber?: number;

  @IsOptional()
  @IsNumber()
  @Max(1000)
  maxNumber?: number;

  @IsOptional()
  @IsArray()
  allowedOperations?: MathOperation[];
}

export class UpdateChildConfigDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  minNumber?: number;

  @IsOptional()
  @IsNumber()
  @Max(1000)
  maxNumber?: number;

  @IsOptional()
  @IsArray()
  allowedOperations?: MathOperation[];
}
