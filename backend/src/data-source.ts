import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Parent } from './entities/parent.entity';
import { Child } from './entities/child.entity';
import { LessonSession } from './entities/lesson-session.entity';
import { QuestionResult } from './entities/question-result.entity';
import { resolvePostgresSynchronize } from './typeorm-sync.util';
import { resolvePostgresSsl } from './postgres-ssl.util';

const databaseUrl = process.env.DATABASE_URL;
const ssl = resolvePostgresSsl(databaseUrl);

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(databaseUrl
    ? { url: databaseUrl }
    : {
        host: process.env.DATABASE_HOST || 'db',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        username: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'password',
        database: process.env.DATABASE_NAME || 'numsense',
      }),
  synchronize: resolvePostgresSynchronize(),
  logging: process.env.NODE_ENV === 'development',
  entities: [Parent, Child, LessonSession, QuestionResult],
  subscribers: [],
  migrations: [],
  ...(ssl !== undefined ? { ssl } : {}),
});
