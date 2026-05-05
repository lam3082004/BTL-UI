import { useState, useCallback } from 'react';
import client from '../api/client';
import { MathOperation } from '../types';

export interface Question {
  expression: string;
  operand1: number;
  operand2: number;
  operator: string;
  answer: number;
}

export const useLesson = (childId: string, minNumber: number, maxNumber: number, allowedOperations: MathOperation[]) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await client.post('/lessons/session', { childId });
      setSessionId(response.data.id);
      setQuestionCount(0);
      generateNewQuestion();
    } catch (err) {
      setError('Failed to start lesson');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [childId]);

  const generateNewQuestion = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await client.post('/lessons/generate-question', {
        minNumber,
        maxNumber,
        allowedOperations,
      });
      setCurrentQuestion(response.data);
    } catch (err) {
      setError('Failed to generate question');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [minNumber, maxNumber, allowedOperations]);

  const submitAnswer = useCallback(
    async (userAnswer: number, responseTimeMs: number): Promise<boolean> => {
      if (!sessionId || !currentQuestion) return false;

      const isCorrect = userAnswer === currentQuestion.answer;

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
    [sessionId, currentQuestion, generateNewQuestion],
  );

  const completeSession = useCallback(async () => {
    if (!sessionId) return;

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
