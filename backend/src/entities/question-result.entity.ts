import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LessonSession } from './lesson-session.entity';

@Entity('question_results')
export class QuestionResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sessionId: string;

  @ManyToOne(() => LessonSession, (session) => session.results, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session: LessonSession;

  @Column()
  expression: string;

  @Column()
  correct: boolean;

  @Column({ type: 'int', nullable: true })
  responseTimeMs: number;

  @CreateDateColumn()
  createdAt: Date;
}
