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
import { resolvePostgresSynchronize } from './typeorm-sync.util';
import { resolvePostgresSsl } from './postgres-ssl.util';

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
        : (() => {
            const databaseUrl = process.env.DATABASE_URL;
            const ssl = resolvePostgresSsl(databaseUrl);
            return {
              type: 'postgres' as const,
              ...(databaseUrl
                ? { url: databaseUrl }
                : {
                    host: process.env.DATABASE_HOST || 'db',
                    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
                    username: process.env.DATABASE_USER || 'postgres',
                    password: process.env.DATABASE_PASSWORD || 'password',
                    database: process.env.DATABASE_NAME || 'numsense',
                  }),
              entities: [Parent, Child, LessonSession, QuestionResult],
              synchronize: resolvePostgresSynchronize(),
              logging: process.env.NODE_ENV === 'development',
              ...(ssl !== undefined ? { ssl } : {}),
            };
          })(),
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
