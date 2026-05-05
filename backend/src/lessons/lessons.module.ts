import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { LessonSession } from '../entities/lesson-session.entity';
import { QuestionResult } from '../entities/question-result.entity';
import { Child } from '../entities/child.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LessonSession, QuestionResult, Child])],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
