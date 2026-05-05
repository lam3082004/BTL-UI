import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateSessionDto, SaveResultDto, GenerateQuestionDto } from './dto';
import { LessonSession } from '../entities/lesson-session.entity';
import { QuestionResult } from '../entities/question-result.entity';

@Controller('lessons')
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Post('session')
  async createSession(@Body() createSessionDto: CreateSessionDto): Promise<LessonSession> {
    return this.lessonsService.createSession(createSessionDto);
  }

  @Post('generate-question')
  async generateQuestion(@Body() generateQuestionDto: GenerateQuestionDto) {
    return this.lessonsService.generateQuestion(generateQuestionDto);
  }

  @Post('result')
  async saveResult(@Body() saveResultDto: SaveResultDto): Promise<QuestionResult> {
    return this.lessonsService.saveResult(saveResultDto);
  }

  @Get('session/:id/results')
  async getSessionResults(@Param('id') sessionId: string): Promise<QuestionResult[]> {
    return this.lessonsService.getSessionResults(sessionId);
  }

  @Post('session/:id/complete')
  async completeSession(@Param('id') sessionId: string): Promise<LessonSession> {
    return this.lessonsService.completeSession(sessionId);
  }
}
