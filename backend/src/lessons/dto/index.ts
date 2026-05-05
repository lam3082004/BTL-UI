import { IsString, IsNumber, IsBoolean, IsArray, IsOptional } from 'class-validator';
import { MathOperation } from '../../entities/child.entity';

export class CreateSessionDto {
  @IsString()
  childId: string;
}

export class GenerateQuestionDto {
  @IsNumber()
  minNumber: number;

  @IsNumber()
  maxNumber: number;

  @IsArray()
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
