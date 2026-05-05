import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Child } from './child.entity';
import { QuestionResult } from './question-result.entity';

@Entity('lesson_sessions')
export class LessonSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  childId: string;

  @ManyToOne(() => Child, (child) => child.lessonSessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'childId' })
  child: Child;

  @CreateDateColumn()
  startedAt: Date;

  @UpdateDateColumn()
  completedAt: Date;

  @OneToMany(() => QuestionResult, (result) => result.session, { cascade: true })
  results: QuestionResult[];
}
