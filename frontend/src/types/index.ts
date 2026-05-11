export enum MathOperation {
  ADDITION = 'ADDITION',
  SUBTRACTION = 'SUBTRACTION',
  MULTIPLICATION = 'MULTIPLICATION',
  DIVISION = 'DIVISION',
}

export interface Child {
  id: string;
  name: string;
  avatar?: string;
  minNumber: number;
  maxNumber: number;
  allowedOperations: MathOperation[];
}

export interface Parent {
  id: string;
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface LessonSession {
  id: string;
  childId: string;
  startedAt: Date;
  completedAt?: Date;
}

export interface QuestionResult {
  id: string;
  sessionId: string;
  expression: string;
  correct: boolean;
  responseTimeMs?: number;
  createdAt: Date;
}
