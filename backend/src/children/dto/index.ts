import { IsString, IsOptional, IsNumber, IsArray, Min, Max, IsEnum } from 'class-validator';
import { MathOperation } from '../../entities/child.entity';

export class CreateChildDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minNumber?: number;

  @IsOptional()
  @IsNumber()
  @Max(12)
  maxNumber?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(MathOperation, { each: true })
  allowedOperations?: MathOperation[];
}

export class UpdateChildConfigDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  minNumber?: number;

  @IsOptional()
  @IsNumber()
  @Max(12)
  maxNumber?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(MathOperation, { each: true })
  allowedOperations?: MathOperation[];
}
