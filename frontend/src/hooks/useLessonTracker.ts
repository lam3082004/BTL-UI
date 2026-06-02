import { useState, useCallback, useRef } from 'react';
import client from '../api/client';

export const useLessonTracker = (childId: string) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const startSession = useCallback(async () => {
    try {
      const response = await client.post('/lessons/session', { childId });
      setSessionId(response.data.id);
      startTimeRef.current = Date.now();
    } catch (err) {
      setSessionId(`local-${Date.now()}`);
      startTimeRef.current = Date.now();
      console.error('Failed to start session on backend:', err);
    }
  }, [childId]);

  const submitQuestionResult = useCallback(async (expression: string, correct: boolean) => {
    const responseTimeMs = Date.now() - startTimeRef.current;
    
    // Reset timer for the next question
    startTimeRef.current = Date.now();

    if (!sessionId || sessionId.startsWith('local-')) {
      return { correct, responseTimeMs };
    }

    try {
      await client.post('/lessons/result', {
        sessionId,
        expression,
        correct,
        responseTimeMs,
      });
    } catch (err) {
      console.error('Failed to save question result:', err);
    }
    return { correct, responseTimeMs };
  }, [sessionId]);

  const completeSession = useCallback(async () => {
    if (!sessionId || sessionId.startsWith('local-')) return;
    try {
      await client.post(`/lessons/session/${sessionId}/complete`);
    } catch (err) {
      console.error('Failed to complete session:', err);
    }
  }, [sessionId]);

  return {
    sessionId,
    startSession,
    submitQuestionResult,
    completeSession,
  };
};
