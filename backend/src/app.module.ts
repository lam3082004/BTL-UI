import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Parent } from './entities/parent.entity';
import { Child } from './entities/child.entity';
import { LessonSession } from './entities/lesson-session.entity';
import { QuestionResult } from './entities/question-result.entity';
import { AuthModule } from './auth/auth.module';
import { ChildrenModule } from './children/children.module';
import { LessonsModule } from './lessons/lessons.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Use SQLite for quick local development when USE_SQLITE=true
    TypeOrmModule.forRoot(
      process.env.USE_SQLITE === 'true'
        ? {
            type: 'sqlite',
            database: process.env.SQLITE_DB_PATH || 'dev.sqlite',
            entities: [Parent, Child, LessonSession, QuestionResult],
            synchronize: true,
            logging: false,
          }
        : {
            type: 'postgres',
            // Prefer a full DATABASE_URL if provided (useful for remote DBs)
            url: process.env.DATABASE_URL || undefined,
            host: process.env.DATABASE_HOST || 'db',
            port: parseInt(process.env.DATABASE_PORT || '5432'),
            username: process.env.DATABASE_USER || 'postgres',
            password: process.env.DATABASE_PASSWORD || 'password',
            database: process.env.DATABASE_NAME || 'numsense',
            entities: [Parent, Child, LessonSession, QuestionResult],
            synchronize: process.env.NODE_ENV !== 'production',
            logging: process.env.NODE_ENV === 'development',
          },
    ),
    TypeOrmModule.forFeature([Parent, Child, LessonSession, QuestionResult]),
    AuthModule,
    ChildrenModule,
    LessonsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
