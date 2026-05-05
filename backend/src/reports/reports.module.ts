import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { QuestionResult } from '../entities/question-result.entity';
import { LessonSession } from '../entities/lesson-session.entity';
import { Child } from '../entities/child.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionResult, LessonSession, Child])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
