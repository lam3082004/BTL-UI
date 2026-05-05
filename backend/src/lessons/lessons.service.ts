import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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
    const { minNumber, maxNumber, allowedOperations } = generateQuestionDto;

    // Random operands
    const operand1 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    const operand2 = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;

    // Pick random operation
    const operation = allowedOperations[Math.floor(Math.random() * allowedOperations.length)];

    let operator = '';
    let answer = 0;

    switch (operation) {
      case MathOperation.ADDITION:
        operator = '+';
        answer = operand1 + operand2;
        break;
      case MathOperation.SUBTRACTION:
        operator = '-';
        answer = operand1 - operand2;
        break;
      case MathOperation.MULTIPLICATION:
        operator = '×';
        answer = operand1 * operand2;
        break;
      case MathOperation.DIVISION:
        operator = '÷';
        // Ensure clean division
        answer = Math.floor(operand1 / (operand2 || 1));
        break;
      default:
        operator = '+';
        answer = operand1 + operand2;
    }

    return {
      expression: `${operand1} ${operator} ${operand2} = ?`,
      operand1,
      operand2,
      operator,
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
