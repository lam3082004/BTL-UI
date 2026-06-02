import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Parent } from './parent.entity';
import { LessonSession } from './lesson-session.entity';

// Kept for backward compatibility if needed elsewhere, but allowedOperations will be strings
export enum MathOperation {
  COUNTING = 'COUNTING',
  ADDITION = 'ADDITION',
  SUBTRACTION = 'SUBTRACTION',
  MULTIPLICATION = 'MULTIPLICATION',
  DIVISION = 'DIVISION',
}

@Entity('children')
export class Child {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column()
  parentId: string;

  @ManyToOne(() => Parent, (parent) => parent.children, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: Parent;

  @Column({ type: 'int', default: 1 })
  minNumber: number;

  @Column({ type: 'int', default: 10 })
  maxNumber: number;

  @Column('text', { array: true, default: ['ADDITION'] })
  allowedOperations: string[];

  @Column({ type: 'int', default: 1 })
  configVersion: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => LessonSession, (session) => session.child, { cascade: true })
  lessonSessions: LessonSession[];
}
