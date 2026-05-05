import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get(':childId')
  @UseGuards(JwtAuthGuard)
  async getChildReport(
    @Param('childId') childId: string,
    @Query('days') days: string = '7',
    @Req() req: any,
  ) {
    return this.reportsService.getChildReport(childId, req.user.id, parseInt(days, 10));
  }

  @Get('session/:sessionId/stats')
  async getSessionStats(@Param('sessionId') sessionId: string) {
    return this.reportsService.getSessionStats(sessionId);
  }
}
