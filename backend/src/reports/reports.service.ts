import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { QuestionResult } from '../entities/question-result.entity';
import { LessonSession } from '../entities/lesson-session.entity';
import { Child } from '../entities/child.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(QuestionResult)
    private resultRepository: Repository<QuestionResult>,
    @InjectRepository(LessonSession)
    private sessionRepository: Repository<LessonSession>,
    @InjectRepository(Child)
    private childRepository: Repository<Child>,
  ) {}

  async getChildReport(childId: string, parentId: string, days: number = 7) {
    // Verify ownership
    const child = await this.childRepository.findOne({ where: { id: childId } });
    if (!child) {
      throw new NotFoundException('Child not found');
    }
    if (child.parentId !== parentId) {
      throw new BadRequestException('Unauthorized to view this report');
    }

    // Get sessions from past N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await this.sessionRepository.find({
      where: { childId, startedAt: MoreThan(startDate) },
      relations: ['results'],
    });

    // Aggregate data
    const allResults = sessions.flatMap((s) => s.results);
    const totalQuestions = allResults.length;
    const correctAnswers = allResults.filter((r) => r.correct).length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const correctRate =
      totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Response time analysis (exclude nulls)
    const responseTimes = allResults.filter((r) => r.responseTimeMs !== null).map((r) => r.responseTimeMs);
    const avgResponseTime =
      responseTimes.length > 0
        ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
        : 0;

    // Response time per question (for bar chart)
    const responseTimeData = allResults.map((result, idx) => ({
      question: `Q${idx + 1}`,
      timeMs: result.responseTimeMs || 0,
      correct: result.correct,
    }));

    return {
      childId,
      period: `${days} days`,
      totalSessions: sessions.length,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      correctRate,
      avgResponseTime,
      responseTimeChart: responseTimeData,
      donutChart: {
        correct: correctAnswers,
        wrong: wrongAnswers,
      },
    };
  }

  async getSessionStats(sessionId: string) {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
      relations: ['results'],
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const results = session.results;
    const totalQuestions = results.length;
    const correctAnswers = results.filter((r) => r.correct).length;
    const wrongAnswers = totalQuestions - correctAnswers;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    return {
      sessionId,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      accuracy,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      results,
    };
  }
}
