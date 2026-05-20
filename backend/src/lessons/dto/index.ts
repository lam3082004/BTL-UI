import { IsString, IsNumber, IsBoolean, IsArray, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { MathOperation } from '../../entities/child.entity';

export class CreateSessionDto {
  @IsString()
  childId: string;
}

export class GenerateQuestionDto {
  @IsNumber()
  @Min(1)
  minNumber: number;

  @IsNumber()
  @Max(12)
  maxNumber: number;

  @IsArray()
  @IsEnum(MathOperation, { each: true })
  allowedOperations: MathOperation[];
}

export class SaveResultDto {
  @IsString()
  sessionId: string;

  @IsString()
  expression: string;

  @IsBoolean()
  correct: boolean;

  @IsOptional()
  @IsNumber()
  responseTimeMs?: number;
}
