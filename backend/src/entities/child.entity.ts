import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Parent } from './parent.entity';
import { LessonSession } from './lesson-session.entity';

export enum MathOperation {
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

  @Column('enum', { enum: MathOperation, array: true, default: [MathOperation.ADDITION] })
  allowedOperations: MathOperation[];

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => LessonSession, (session) => session.child, { cascade: true })
  lessonSessions: LessonSession[];
}
