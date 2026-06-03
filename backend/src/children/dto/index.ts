import { IsString, IsOptional, IsNumber, IsArray, Min, Max } from 'class-validator';

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
  @IsString({ each: true })
  allowedOperations?: string[];
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
  @IsString({ each: true })
  allowedOperations?: string[];
}

export class UpdateChildDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
