import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Child } from './child.entity';

@Entity('parents')
export class Parent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  googleId: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'boolean', default: true })
  soundEnabled: boolean;

  @Column({ type: 'boolean', default: true })
  animationsEnabled: boolean;

  @Column({ type: 'int', default: 4 })
  questionsPerLesson: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Child, (child) => child.parent, { cascade: true })
  children: Child[];
}
