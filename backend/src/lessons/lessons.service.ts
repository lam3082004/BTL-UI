import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonSession } from '../entities/lesson-session.entity';
import { QuestionResult } from '../entities/question-result.entity';
import { Child, MathOperation } from '../entities/child.entity';
import { CreateSessionDto, SaveResultDto, GenerateQuestionDto } from './dto';

export interface MathQuestion {
  expression: string;
  operand1: number;
  operand2: number;
  operator: string;
  answer: number;
}

const visualMaxNumber = 12;

const normalizeRange = (minNumber: number, maxNumber: number) => {
  const min = Math.max(1, Math.min(visualMaxNumber, Math.floor(Math.min(minNumber, maxNumber))));
  const max = Math.max(min, Math.min(visualMaxNumber, Math.floor(Math.max(minNumber, maxNumber))));
  return { min, max };
};

const randomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(LessonSession)
    private sessionRepository: Repository<LessonSession>,
    @InjectRepository(QuestionResult)
    private resultRepository: Repository<QuestionResult>,
    @InjectRepository(Child)
    private childRepository: Repository<Child>,
  ) {}

  async createSession(createSessionDto: CreateSessionDto): Promise<LessonSession> {
    const child = await this.childRepository.findOne({
      where: { id: createSessionDto.childId },
    });

    if (!child) {
      throw new NotFoundException('Child not found');
    }

    const session = this.sessionRepository.create({
      childId: createSessionDto.childId,
    });

    return this.sessionRepository.save(session);
  }

  generateQuestion(generateQuestionDto: GenerateQuestionDto): MathQuestion {
    const { minNumber, maxNumber } = generateQuestionDto;
    const { min, max } = normalizeRange(minNumber, maxNumber);
    const allowedOperations = generateQuestionDto.allowedOperations?.length
      ? generateQuestionDto.allowedOperations
      : [MathOperation.COUNTING, MathOperation.ADDITION];

    // Pick random operation
    const operation = allowedOperations[Math.floor(Math.random() * allowedOperations.length)];

    switch (operation) {
      case MathOperation.COUNTING: {
        const operand1 = randomNumber(min, max);
        return {
          expression: `${operand1}`,
          operand1,
          operand2: 0,
          operator: '',
          answer: operand1,
        };
      }
      case MathOperation.ADDITION:
        return this.generateAdditionQuestion(min, max);
      case MathOperation.SUBTRACTION:
        return this.generateSubtractionQuestion(min, max);
      case MathOperation.MULTIPLICATION:
        return this.generateMultiplicationQuestion(min, max);
      case MathOperation.DIVISION:
        return this.generateDivisionQuestion(min, max);
      default:
        return this.generateAdditionQuestion(min, max);
    }
  }

  private generateAdditionQuestion(min: number, max: number): MathQuestion {
    const operand1 = randomNumber(min, Math.min(max, visualMaxNumber - 1));
    const operand2 = randomNumber(1, Math.max(1, visualMaxNumber - operand1));
    const answer = operand1 + operand2;
    return {
      expression: `${operand1} + ${operand2} = ?`,
      operand1,
      operand2,
      operator: '+',
      answer,
    };
  }

  private generateSubtractionQuestion(min: number, max: number): MathQuestion {
    const operand1 = randomNumber(Math.max(min, 2), max);
    const operand2 = randomNumber(1, operand1);
    const answer = operand1 - operand2;
    return {
      expression: `${operand1} - ${operand2} = ?`,
      operand1,
      operand2,
      operator: '-',
      answer,
    };
  }

  private generateMultiplicationQuestion(min: number, max: number): MathQuestion {
    const operand1Min = Math.min(Math.max(1, min), 4);
    const operand1Max = Math.max(operand1Min, Math.min(max, 4));
    const operand1 = randomNumber(operand1Min, operand1Max);
    const operand2 = randomNumber(1, Math.max(1, Math.floor(visualMaxNumber / operand1)));
    const answer = operand1 * operand2;
    return {
      expression: `${operand1} × ${operand2} = ?`,
      operand1,
      operand2,
      operator: '×',
      answer,
    };
  }

  private generateDivisionQuestion(min: number, max: number): MathQuestion {
    const answerMin = Math.min(Math.max(1, min), 6);
    const answerMax = Math.max(answerMin, Math.min(max, 6));
    const answer = randomNumber(answerMin, answerMax);
    const operand2 = randomNumber(1, Math.max(1, Math.floor(visualMaxNumber / answer)));
    const operand1 = answer * operand2;
    return {
      expression: `${operand1} ÷ ${operand2} = ?`,
      operand1,
      operand2,
      operator: '÷',
      answer,
    };
  }

  async saveResult(saveResultDto: SaveResultDto): Promise<QuestionResult> {
    const session = await this.sessionRepository.findOne({
      where: { id: saveResultDto.sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const result = this.resultRepository.create({
      sessionId: saveResultDto.sessionId,
      expression: saveResultDto.expression,
      correct: saveResultDto.correct,
      responseTimeMs: saveResultDto.responseTimeMs,
    });

    return this.resultRepository.save(result);
  }

  async getSessionResults(sessionId: string): Promise<QuestionResult[]> {
    return this.resultRepository.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });
  }

  async completeSession(sessionId: string): Promise<LessonSession> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['results'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    session.completedAt = new Date();
    return this.sessionRepository.save(session);
  }
}
