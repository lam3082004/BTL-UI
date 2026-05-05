import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DndContext, DragEndEvent, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { DraggableFruit } from '../components/DraggableFruit.tsx';
import { FruitBasket } from '../components/FruitBasket.tsx';
import { useLesson } from '../hooks/useLesson.ts';
import { Child } from '../types/index.ts';

export const LessonPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [droppedCount, setDroppedCount] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const [speakStartTime, setSpeakStartTime] = useState<number>(0);
  const basketShakeRef = useRef<() => void>(() => {});
  const soundSuccessRef = useRef<HTMLAudioElement>(new Audio('/sounds/success.mp3'));
  const soundWrongRef = useRef<HTMLAudioElement>(new Audio('/sounds/wrong.mp3'));

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 8 },
    }),
  );

  useEffect(() => {
    // Get selected child from sessionStorage
    const childData = sessionStorage.getItem('selectedChild');
    if (!childData) {
      navigate('/child-select');
      return;
    }

    const child = JSON.parse(childData);
    setSelectedChild(child);
  }, [navigate]);

  const lesson = useLesson(
    selectedChild?.id || '',
    selectedChild?.minNumber || 1,
    selectedChild?.maxNumber || 10,
    selectedChild?.allowedOperations || [],
  );

  useEffect(() => {
    if (selectedChild && !lesson.sessionId) {
      lesson.startSession();
      setSpeakStartTime(Date.now());
    }
  }, [selectedChild, lesson]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over?.id === 'basket' && active.data.current?.value) {
      const fruitValue = active.data.current.value;
      const newCount = droppedCount + fruitValue;

      // Play sound based on if correct
      if (newCount <= lesson.currentQuestion?.answer! || 0) {
        soundSuccessRef.current.play().catch(() => {});
      } else {
        soundWrongRef.current.play().catch(() => {});
      }

      setDroppedCount(newCount);

      // Check if correct
      if (newCount === lesson.currentQuestion?.answer) {
        const responseTime = Date.now() - startTimeRef.current;
        await lesson.submitAnswer(newCount, responseTime);

        // Check if 5 questions completed
        if (lesson.questionCount + 1 >= 5) {
          await lesson.completeSession();
          setSessionFinished(true);
          setTimeout(() => navigate('/reward', { state: { sessionId: lesson.sessionId } }), 1000);
        } else {
          // Reset for next question
          setDroppedCount(0);
          startTimeRef.current = Date.now();
        }
      }
    }
  };

  const readQuestionAloud = () => {
    if (!lesson.currentQuestion) return;

    const text = lesson.currentQuestion.expression.replace('?', 'bằng bao nhiêu');
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'vi-VN';
    speech.rate = 0.8;
    window.speechSynthesis.speak(speech);
  };

  if (!selectedChild || !lesson.currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-primary">Đang tải bài học...</div>
      </div>
    );
  }

  // Generate fruit array for dragging
  const fruitsToShow = [];
  for (let i = 0; i < lesson.currentQuestion.operand1; i++) {
    fruitsToShow.push({ id: `fruit1-${i}`, value: 1, emoji: '🍎' });
  }
  for (let i = 0; i < lesson.currentQuestion.operand2; i++) {
    fruitsToShow.push({ id: `fruit2-${i}`, value: 1, emoji: '🍊' });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="min-h-screen w-full px-4 py-6 bg-gradient-to-b from-accent/30 to-primary/10 flex flex-col">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">Câu hỏi {lesson.questionCount + 1}/5</p>
            <h2 className="text-5xl font-bold text-primary">{lesson.currentQuestion.expression}</h2>
          </div>
        </motion.div>

        {/* Speak Button - Animated pulse for first 3 seconds */}
        <motion.button
          onClick={readQuestionAloud}
          className="self-center mb-8 w-20 h-20 rounded-full bg-primary text-white text-3xl shadow-lg hover:shadow-xl"
          animate={{
            scale: Date.now() - speakStartTime < 3000 ? [1, 1.2, 1] : 1,
          }}
          transition={{ repeat: Date.now() - speakStartTime < 3000 ? Infinity : 0, duration: 1 }}
        >
          🔊
        </motion.button>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center justify-center">
          {/* Draggable Fruits */}
          <motion.div
            className="flex flex-wrap gap-3 justify-center max-w-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {fruitsToShow.map((fruit) => (
              <DraggableFruit key={fruit.id} id={fruit.id} value={fruit.value} emoji={fruit.emoji} />
            ))}
          </motion.div>

          {/* Basket */}
          <motion.div
            className="w-48 h-48"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <FruitBasket
              isActive={true}
              droppedCount={droppedCount}
              targetCount={lesson.currentQuestion.answer}
              onShake={() => basketShakeRef.current?.()}
            />
          </motion.div>
        </div>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate('/child-select')}
          className="mt-8 text-gray-600 hover:text-primary transition self-center"
        >
          ← Quay lại
        </motion.button>
      </div>
    </DndContext>
  );
};
