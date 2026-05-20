import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useLesson } from '../hooks/useLesson';
import { Child, EnabledLesson, LessonActivity, MathOperation } from '../types';
import { getChildVisual, getStoredChild, maxVisualNumber } from '../utils/childVisuals';

type LessonChoice = {
  activity: EnabledLesson;
  operation: MathOperation;
  title: string;
};

const readTotalQuestions = () => {
  const saved = localStorage.getItem('numsenseParentSettings');
  if (!saved) return 4;

  try {
    const value = Number(JSON.parse(saved).questionsPerLesson);
    return Number.isFinite(value) ? Math.max(3, Math.min(8, value)) : 4;
  } catch {
    return 4;
  }
};

const applePositions = [
  'left-[118px] top-[34px]',
  'left-[194px] top-[6px]',
  'left-[260px] top-[54px]',
  'left-[82px] top-[92px]',
  'left-[207px] top-[104px]',
  'left-[286px] top-[132px]',
  'left-[132px] top-[160px]',
  'left-[240px] top-[196px]',
  'left-[168px] top-[222px]',
  'left-[300px] top-[220px]',
  'left-[96px] top-[218px]',
  'left-[272px] top-[14px]',
];

const itemThemes = [
  { item: '🍎', itemName: 'quả táo', basket: '🧺', basketName: 'giỏ', scene: '🌳', bg: '#E4F8FF' },
  { item: '⭐', itemName: 'ngôi sao', basket: '🎒', basketName: 'túi', scene: '☁️', bg: '#FFF3DF' },
  { item: '🐟', itemName: 'con cá', basket: '🪣', basketName: 'xô', scene: '🌊', bg: '#EAF8FB' },
  { item: '🍬', itemName: 'viên kẹo', basket: '🎁', basketName: 'hộp quà', scene: '🍭', bg: '#FFF0F4' },
  { item: '⚽', itemName: 'quả bóng', basket: '📦', basketName: 'hộp', scene: '🌈', bg: '#F1F8EA' },
];

const readStoredLesson = (): LessonChoice => {
  const value = sessionStorage.getItem('selectedLesson');
  if (!value) return { activity: LessonActivity.COUNTING, operation: MathOperation.ADDITION, title: 'Học Đếm' };

  try {
    const parsed = JSON.parse(value) as Partial<LessonChoice>;
    return {
      activity: parsed.activity || (parsed.title === 'Học Đếm' ? LessonActivity.COUNTING : parsed.operation || MathOperation.ADDITION),
      operation: parsed.operation || MathOperation.ADDITION,
      title: parsed.title || 'Học Đếm',
    };
  } catch {
    return { activity: LessonActivity.COUNTING, operation: MathOperation.ADDITION, title: 'Học Đếm' };
  }
};

const DraggableItem: React.FC<{ id: string; className: string; dropped: boolean; item: string; label: string }> = ({
  id,
  className,
  dropped,
  item,
  label,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: dropped,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={{ transform: CSS.Translate.toString(transform) }}
      className={`absolute z-20 text-5xl touch-none select-none transition ${className} ${
        dropped ? 'opacity-20 scale-75' : 'cursor-grab active:cursor-grabbing'
      } ${isDragging ? 'opacity-80 scale-110' : ''}`}
      aria-label={label}
      {...listeners}
      {...attributes}
    >
      {item}
    </button>
  );
};

const BasketDropZone: React.FC<{ count: number; target: number; item: string; basket: string }> = ({
  count,
  target,
  item,
  basket,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'basket' });

  return (
    <div
      ref={setNodeRef}
      className={`absolute bottom-0 left-1/2 z-10 h-32 w-40 -translate-x-1/2 rounded-[24px] border-2 border-dashed bg-white/55 transition ${
        isOver ? 'scale-105 border-[#71C9EE] bg-[#E4F8FF]' : 'border-gray-300'
      }`}
    >
      <div className="absolute inset-x-0 top-2 flex flex-wrap justify-center gap-0 px-3 text-3xl leading-none">
        {Array.from({ length: count }, (_, index) => (
          <span key={index}>{item}</span>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 text-center text-7xl leading-none">{basket}</div>
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-sm font-extrabold text-gray-500 shadow-sm">
        {count}/{target}
      </div>
    </div>
  );
};

const buildQuestionCopy = (
  lessonTitle: string,
  operation: MathOperation,
  question: { operand1: number; operand2: number; answer: number },
  theme: (typeof itemThemes)[number],
) => {
  if (lessonTitle === 'Học Đếm') {
    return {
      target: Math.min(maxVisualNumber, Math.max(0, question.operand1)),
      title: `${question.operand1} ${theme.item}`,
      text: `Kéo ${question.operand1} ${theme.itemName} vào ${theme.basketName}`,
    };
  }

  if (operation === MathOperation.SUBTRACTION) {
    return {
      target: Math.min(maxVisualNumber, Math.max(0, question.answer)),
      title: `${question.operand1} - ${question.operand2} = ?`,
      text: `Có ${question.operand1} ${theme.itemName}, bớt ${question.operand2}. Còn lại mấy?`,
    };
  }

  if (operation === MathOperation.MULTIPLICATION) {
    return {
      target: Math.min(maxVisualNumber, Math.max(0, question.answer)),
      title: `${question.operand1} × ${question.operand2} = ?`,
      text: `${question.operand1} nhóm, mỗi nhóm ${question.operand2} ${theme.itemName}. Có tất cả mấy?`,
    };
  }

  if (operation === MathOperation.DIVISION) {
    return {
      target: Math.min(maxVisualNumber, Math.max(0, question.answer)),
      title: `${question.operand1} ÷ ${question.operand2} = ?`,
      text: `Chia đều ${question.operand1} ${theme.itemName} vào ${question.operand2} nhóm. Mỗi nhóm mấy?`,
    };
  }

  return {
    target: Math.min(maxVisualNumber, Math.max(0, question.answer)),
    title: `${question.operand1} + ${question.operand2} = ?`,
    text: `${question.operand1} ${theme.itemName} thêm ${question.operand2} nữa. Tất cả mấy?`,
  };
};

export const LessonPage: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [lessonChoice] = useState(readStoredLesson);
  const [droppedAppleIds, setDroppedAppleIds] = useState<string[]>([]);
  const [results, setResults] = useState<boolean[]>([]);
  const [totalQuestions] = useState(readTotalQuestions);
  const [modal, setModal] = useState<'correct' | 'wrong' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTimeRef = useRef(Date.now());
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
  );

  useEffect(() => {
    const child = getStoredChild();
    if (!child) {
      navigate('/child-select');
      return;
    }
    setSelectedChild(child);
  }, [navigate]);

  const allowedOperations = useMemo(() => [lessonChoice.operation], [lessonChoice.operation]);

  const lesson = useLesson(
    selectedChild?.id || '',
    selectedChild?.minNumber || 1,
    selectedChild?.maxNumber || 10,
    allowedOperations,
    lessonChoice.activity,
  );

  useEffect(() => {
    if (!selectedChild || lesson.sessionId || lesson.isLoading) return;
    lesson.startSession();
    startTimeRef.current = Date.now();
  }, [selectedChild, lesson.sessionId, lesson.isLoading, lesson.startSession]);

  useEffect(() => {
    setDroppedAppleIds([]);
    startTimeRef.current = Date.now();
  }, [lesson.currentQuestion?.expression]);

  if (!selectedChild || !lesson.currentQuestion) {
    return (
      <main className="app-screen grid place-items-center">
        <div className="text-2xl text-[#71C9E8] font-extrabold">Đang tải bài học...</div>
      </main>
    );
  }

  const visual = getChildVisual(selectedChild);
  const theme = itemThemes[(lesson.questionCount + results.length) % itemThemes.length];
  const questionCopy = buildQuestionCopy(lessonChoice.title, lessonChoice.operation, lesson.currentQuestion, theme);
  const targetCount = questionCopy.target;
  const availableItems = Math.min(maxVisualNumber, Math.max(targetCount + 2, 4));
  const backRoute = childId ? `/child/${childId}/lessons` : '/child-select';
  const selectedApples = droppedAppleIds.length;

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over?.id !== 'basket') return;

    const appleId = String(event.active.id);
    setDroppedAppleIds((current) => (current.includes(appleId) ? current : [...current, appleId]));
  };

  const confirmAnswer = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const isCorrect = selectedApples === targetCount;
    const nextResults = [...results, isCorrect];
    const responseTime = Date.now() - startTimeRef.current;

    await lesson.submitAnswer(selectedApples, responseTime);
    setResults(nextResults);
    setModal(isCorrect ? 'correct' : 'wrong');
    setIsSubmitting(false);
  };

  const continueLesson = async () => {
    if (results.length >= totalQuestions) {
      await lesson.completeSession();
      navigate('/reward', {
        state: {
          sessionId: lesson.sessionId,
          childName: selectedChild.name,
          lessonTitle: lessonChoice.title,
          results,
        },
      });
      return;
    }

    setModal(null);
  };

  const resetCurrent = () => setDroppedAppleIds([]);

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <main className="app-screen px-8 py-10 overflow-hidden">
        <div className="screen-top">
          <button className="circle-button" onClick={() => navigate(backRoute)} aria-label="Quay lại">
            ←
          </button>
          <div className="kid-chip">
            <span style={{ backgroundColor: visual.color }}>{visual.avatar}</span>
            <strong>{selectedChild.name.toUpperCase()}</strong>
          </div>
        </div>

        <section className="mt-10">
          <p className="text-gray-500 font-extrabold">BÀI HỌC</p>
          <div className="flex items-center justify-between">
            <h1 className="app-title">{lessonChoice.title.toUpperCase()}</h1>
            <div className="text-5xl">🧺</div>
          </div>

          <div className="mt-7 rounded-[16px] px-5 py-4 flex items-center justify-between gap-3" style={{ backgroundColor: theme.bg }}>
            <div className="min-w-0">
              <div className="text-2xl font-extrabold">{questionCopy.title}</div>
              <p className="mt-1 text-sm font-extrabold text-gray-500 leading-snug">{questionCopy.text}</p>
            </div>
            <span className="shrink-0 text-4xl">{theme.basket}</span>
          </div>

          <div className="relative mt-2 h-[365px]">
            <div className="absolute left-1/2 top-10 z-0 -translate-x-1/2 text-[210px] leading-none opacity-95">{theme.scene}</div>
            {Array.from({ length: availableItems }, (_, index) => {
              const appleId = `item-${index}`;
              return (
                <DraggableItem
                  key={appleId}
                  id={appleId}
                  className={applePositions[index % applePositions.length]}
                  dropped={droppedAppleIds.includes(appleId)}
                  item={theme.item}
                  label={`Kéo ${theme.itemName} vào ${theme.basketName}`}
                />
              );
            })}
            <BasketDropZone count={selectedApples} target={targetCount} item={theme.item} basket={theme.basket} />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-7">
            <button className="outline-pill" onClick={resetCurrent}>
              ↩ Đặt lại
            </button>
            <button className="primary-pill" onClick={confirmAnswer} disabled={isSubmitting}>
              ✅ Xác nhận
            </button>
          </div>

          <div className="soft-card mt-6 p-4 flex justify-around">
            {Array.from({ length: totalQuestions }, (_, index) => {
              const result = results[index];
              return (
                <div
                  key={index}
                  className={`grid h-11 w-11 place-items-center rounded-full font-extrabold ${
                    result === true
                      ? 'bg-[#9DE8D0] text-white'
                      : result === false
                        ? 'bg-[#FF7A7A] text-white'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {result === true ? '✓' : result === false ? '×' : index + 1}
                </div>
              );
            })}
          </div>
        </section>

        {modal && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 px-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xs rounded-[24px] bg-white p-9 text-center shadow-xl"
            >
              <div className="text-7xl mb-4">{modal === 'correct' ? '🎉' : '🤔'}</div>
              <h2 className="text-2xl font-extrabold mb-6">{modal === 'correct' ? 'ĐÚNG RỒI!' : 'CHƯA CHÍNH XÁC!'}</h2>
              <button
                className={`rounded-full px-8 py-4 text-white font-extrabold ${modal === 'correct' ? 'bg-[#9DE8D0]' : 'bg-[#FF7A7A]'}`}
                onClick={continueLesson}
              >
                {results.length >= totalQuestions ? 'Xem kết quả' : modal === 'correct' ? 'Tiếp theo' : 'Tiếp tục'}
              </button>
            </motion.div>
          </div>
        )}
      </main>
    </DndContext>
  );
};
