import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DndContext, DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { DraggableFruit } from '../components/DraggableFruit.tsx';
import { FruitBasket } from '../components/FruitBasket.tsx';
import { useLesson } from '../hooks/useLesson.ts';
import { Child } from '../types/index.ts';

export const LessonPage: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [droppedCount, setDroppedCount] = useState(0);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [speakStartTime, setSpeakStartTime] = useState<number>(0);
  const basketShakeRef = useRef<() => void>(() => {});
  const soundSuccessRef = useRef<HTMLAudioElement>(new Audio('/sounds/success.wav'));
  const soundWrongRef = useRef<HTMLAudioElement>(new Audio('/sounds/wrong.wav'));

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
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

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveDragId(null);
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
    },
    [droppedCount, lesson, navigate],
  );

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
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl text-teal font-bold">
          Đang tải bài học...
        </motion.div>
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

  const backRoute = childId ? `/child/${childId}/home` : '/child-select';

  return (
    <DndContext 
      sensors={sensors} 
      onDragEnd={handleDragEnd}
      onDragStart={(event) => setActiveDragId(event.active.id as string)}
    >
      <div className="min-h-screen w-full px-4 py-6 bg-gradient-to-b from-teal/10 to-blue/10 flex flex-col">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex justify-between items-center mb-8"
        >
          <button
            onClick={() => navigate(backRoute)}
            className="text-3xl text-teal hover:scale-110 transition"
          >
            ←
          </button>
          <div className="text-center flex-1">
            <p className="text-gray-600 text-sm mb-1">HỌC BÀI NÀO</p>
            <h2 className="text-4xl font-bold text-text">{selectedChild.name}</h2>
          </div>
          <div className="text-3xl">{selectedChild.name === 'Bé Bo' ? '📖' : '🐰'}</div>
        </motion.div>

        {/* Question Count */}
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="text-center text-gray-600 mb-2 font-semibold"
        >
          Câu hỏi {lesson.questionCount + 1}/5
        </motion.p>

        {/* Expression Header Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-full px-6 py-3 text-center shadow-soft mb-8 max-w-md mx-auto"
        >
          <p className="text-lg text-gray-600 mb-1">
            🍎 {lesson.currentQuestion.operand1} vào giỏ 🍊 {lesson.currentQuestion.operand2} 🧺
          </p>
          <p className="text-3xl font-bold text-teal">{lesson.currentQuestion.expression}</p>
        </motion.div>

        {/* Speak Button - Animated pulse for first 3 seconds */}
        <motion.button
          onClick={readQuestionAloud}
          className="self-center mb-8 w-20 h-20 rounded-full bg-teal text-white text-3xl shadow-soft hover:shadow-lg transition"
          animate={{
            scale: Date.now() - speakStartTime < 3000 ? [1, 1.2, 1] : 1,
          }}
          transition={{ repeat: Date.now() - speakStartTime < 3000 ? Infinity : 0, duration: 1 }}
        >
          🔊
        </motion.button>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center justify-center mb-8">
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

        {/* Progress Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-2 items-center"
        >
          {[0, 1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx < lesson.questionCount ? 'bg-teal w-3' : 'bg-gray-300 w-2'
              }`}
            />
          ))}
        </motion.div>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => navigate(backRoute)}
          className="mt-8 text-gray-600 hover:text-teal transition self-center"
        >
          ← Quay lại
        </motion.button>
      </div>
    </DndContext>
  );
};
