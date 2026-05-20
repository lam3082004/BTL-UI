import { useState, useCallback } from 'react';
import client from '../api/client';
import { EnabledLesson, LessonActivity, MathOperation } from '../types';
import { maxVisualNumber } from '../utils/childVisuals';

export interface Question {
  expression: string;
  operand1: number;
  operand2: number;
  operator: string;
  answer: number;
}

const randomNumber = (minNumber: number, maxNumber: number) =>
  Math.max(1, Math.floor(Math.random() * (Math.max(maxNumber, minNumber) - minNumber + 1)) + minNumber);

const normalizeQuestion = (
  question: Question,
  minNumber: number,
  maxNumber: number,
  allowedOperations: MathOperation[],
): Question => {
  if (Number.isFinite(question.answer) && question.answer >= 0 && question.answer <= maxVisualNumber) {
    return question;
  }

  return createFallbackQuestion(minNumber, maxNumber, allowedOperations);
};

const createFallbackQuestion = (
  minNumber: number,
  maxNumber: number,
  allowedOperations: MathOperation[],
): Question => {
  const operation = allowedOperations[0] || MathOperation.ADDITION;
  const a = Math.min(maxVisualNumber / 2, randomNumber(minNumber, maxNumber));
  const b = Math.min(maxVisualNumber / 2, randomNumber(minNumber, maxNumber));

  if (operation === MathOperation.SUBTRACTION) {
    const operand1 = Math.max(a, b);
    const operand2 = Math.min(a, b);
    return {
      expression: `${operand1} - ${operand2} = ?`,
      operand1,
      operand2,
      operator: '-',
      answer: operand1 - operand2,
    };
  }

  if (operation === MathOperation.MULTIPLICATION) {
    const operand1 = Math.min(3, a);
    const operand2 = Math.min(3, b);
    return {
      expression: `${operand1} × ${operand2} = ?`,
      operand1,
      operand2,
      operator: '×',
      answer: operand1 * operand2,
    };
  }

  if (operation === MathOperation.DIVISION) {
    const operand2 = Math.max(1, Math.min(5, b));
    const answer = Math.max(1, Math.min(5, a));
    const operand1 = operand2 * answer;
    return {
      expression: `${operand1} ÷ ${operand2} = ?`,
      operand1,
      operand2,
      operator: '÷',
      answer,
    };
  }

  return {
    expression: `${a} + ${b} = ?`,
    operand1: a,
    operand2: b,
    operator: '+',
    answer: a + b,
  };
};

const createCountingQuestion = (minNumber: number, maxNumber: number): Question => {
  const operand1 = Math.min(maxVisualNumber, randomNumber(minNumber, maxNumber));
  return {
    expression: `${operand1}`,
    operand1,
    operand2: 0,
    operator: '',
    answer: operand1,
  };
};

export const useLesson = (
  childId: string,
  minNumber: number,
  maxNumber: number,
  allowedOperations: MathOperation[],
  activity?: EnabledLesson,
) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateNewQuestion = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activity === LessonActivity.COUNTING) {
        setCurrentQuestion(createCountingQuestion(minNumber, maxNumber));
        return;
      }

      const response = await client.post('/lessons/generate-question', {
        minNumber,
        maxNumber,
        allowedOperations,
      });
      setCurrentQuestion(normalizeQuestion(response.data, minNumber, maxNumber, allowedOperations));
    } catch (err) {
      setCurrentQuestion(createFallbackQuestion(minNumber, maxNumber, allowedOperations));
      setError(null);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [minNumber, maxNumber, allowedOperations, activity]);

  const startSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await client.post('/lessons/session', { childId });
      setSessionId(response.data.id);
      setQuestionCount(0);
      await generateNewQuestion();
    } catch (err) {
      setSessionId(`local-${Date.now()}`);
      setQuestionCount(0);
      setCurrentQuestion(activity === LessonActivity.COUNTING ? createCountingQuestion(minNumber, maxNumber) : createFallbackQuestion(minNumber, maxNumber, allowedOperations));
      setError(null);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [childId, minNumber, maxNumber, allowedOperations, activity, generateNewQuestion]);

  const submitAnswer = useCallback(
    async (userAnswer: number, responseTimeMs: number): Promise<boolean> => {
      if (!sessionId || !currentQuestion) return false;

      const isCorrect = userAnswer === currentQuestion.answer;

      if (sessionId.startsWith('local-')) {
        setQuestionCount((prev) => prev + 1);
        setCurrentQuestion(activity === LessonActivity.COUNTING ? createCountingQuestion(minNumber, maxNumber) : createFallbackQuestion(minNumber, maxNumber, allowedOperations));
        return isCorrect;
      }

      try {
        await client.post('/lessons/result', {
          sessionId,
          expression: currentQuestion.expression,
          correct: isCorrect,
          responseTimeMs,
        });

        setQuestionCount((prev) => prev + 1);
        await generateNewQuestion();
        return isCorrect;
      } catch (err) {
        setError('Failed to save result');
        console.error(err);
        return false;
      }
    },
    [sessionId, currentQuestion, minNumber, maxNumber, allowedOperations, activity, generateNewQuestion],
  );

  const completeSession = useCallback(async () => {
    if (!sessionId) return;
    if (sessionId.startsWith('local-')) return { sessionId, questionCount };

    try {
      await client.post(`/lessons/session/${sessionId}/complete`);
      return { sessionId, questionCount };
    } catch (err) {
      setError('Failed to complete session');
      console.error(err);
    }
  }, [sessionId, questionCount]);

  return {
    sessionId,
    currentQuestion,
    questionCount,
    isLoading,
    error,
    startSession,
    generateNewQuestion,
    submitAnswer,
    completeSession,
  };
};
