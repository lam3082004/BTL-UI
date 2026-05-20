import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  pointerWithin,
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

type AnswerRecord = {
  questionTitle: string;
  questionText: string;
  target: number;
  selected: number;
  correct: boolean;
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

const itemPositions = [
  { left: '26%', top: '9%' },
  { left: '48%', top: '2%' },
  { left: '67%', top: '14%' },
  { left: '16%', top: '24%' },
  { left: '50%', top: '29%' },
  { left: '73%', top: '35%' },
  { left: '28%', top: '44%' },
  { left: '61%', top: '53%' },
  { left: '38%', top: '61%' },
  { left: '76%', top: '61%' },
  { left: '19%', top: '59%' },
  { left: '69%', top: '4%' },
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

const DraggableItem: React.FC<{
  id: string;
  position: { left: string; top: string };
  dropped: boolean;
  item: string;
  label: string;
  onQuickAdd: (id: string) => void;
}> = ({
  id,
  position,
  dropped,
  item,
  label,
  onQuickAdd,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: dropped,
  });
  const dragTransform = CSS.Translate.toString(transform);

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={{
        left: position.left,
        top: position.top,
        transform: `translate(-50%, -50%) ${dragTransform || ''}`,
        touchAction: 'none',
      }}
      onClick={(event) => {
        if (isDragging) return;
        event.stopPropagation();
        onQuickAdd(id);
      }}
      className={`absolute z-20 grid h-12 w-12 select-none place-items-center rounded-full bg-white/95 text-3xl shadow-md ring-2 ring-white/80 sm:h-14 sm:w-14 sm:text-4xl ${
        isDragging ? '' : 'transition'
      } ${
        dropped ? 'pointer-events-none opacity-0 scale-75' : 'cursor-grab active:cursor-grabbing active:scale-95'
      } ${isDragging ? 'opacity-90 scale-110 shadow-xl ring-[#71C9EE]' : ''}`}
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
      className={`absolute bottom-0 left-1/2 z-10 h-32 w-40 -translate-x-1/2 rounded-[24px] border-2 border-dashed bg-white/80 shadow-sm transition ${
        isOver ? 'scale-105 border-[#71C9EE] bg-[#E4F8FF] shadow-lg' : 'border-gray-300'
      }`}
    >
      <div className="absolute inset-x-0 top-2 flex max-h-16 flex-wrap justify-center overflow-hidden px-3 text-2xl leading-none">
        {Array.from({ length: count }, (_, index) => (
          <span key={index}>{item}</span>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-1 text-center text-6xl leading-none">{basket}</div>
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 rounded-full bg-white px-4 py-1 text-sm font-extrabold text-gray-500 shadow-sm">
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
  const [answerHistory, setAnswerHistory] = useState<AnswerRecord[]>([]);
  const [reviewIndex, setReviewIndex] = useState<number | null>(null);
  const [totalQuestions] = useState(readTotalQuestions);
  const [modal, setModal] = useState<'correct' | 'wrong' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTimeRef = useRef(Date.now());
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
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

  const addItemToBasket = (itemId: string) => {
    setDroppedAppleIds((current) => (current.includes(itemId) ? current : [...current, itemId]));
  };

  const confirmAnswer = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const isCorrect = selectedApples === targetCount;
    const nextResults = [...results, isCorrect];
    const nextHistory = [
      ...answerHistory,
      {
        questionTitle: questionCopy.title,
        questionText: questionCopy.text,
        target: targetCount,
        selected: selectedApples,
        correct: isCorrect,
      },
    ];
    const responseTime = Date.now() - startTimeRef.current;

    await lesson.submitAnswer(selectedApples, responseTime);
    setResults(nextResults);
    setAnswerHistory(nextHistory);
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
    await lesson.generateNewQuestion();
  };

  const resetCurrent = () => setDroppedAppleIds([]);

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
      <main className="app-screen overflow-hidden px-5 py-6">
        <div className="screen-top items-center">
          <button className="circle-button" onClick={() => navigate(backRoute)} aria-label="Quay lại">
            ←
          </button>
          <div className="kid-chip">
            <span style={{ backgroundColor: visual.color }}>{visual.avatar}</span>
            <strong className="max-w-[96px] truncate">{selectedChild.name.toUpperCase()}</strong>
          </div>
        </div>

        <section className="mt-5">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-gray-400">BÀI HỌC</p>
              <h1 className="app-title truncate text-[26px]">{lessonChoice.title.toUpperCase()}</h1>
            </div>
            <div className="shrink-0 text-4xl">🧺</div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-[16px] px-4 py-3 shadow-sm" style={{ backgroundColor: theme.bg }}>
            <div className="min-w-0">
              <div className="text-[22px] font-extrabold leading-tight">{questionCopy.title}</div>
              <p className="mt-1 text-sm font-extrabold text-gray-500 leading-snug">{questionCopy.text}</p>
            </div>
            <span className="shrink-0 text-3xl">{theme.basket}</span>
          </div>

          <div className="relative mx-auto mt-3 h-[min(42dvh,310px)] min-h-[280px] w-full max-w-[360px] rounded-[22px] bg-white/45">
            <div className="absolute left-1/2 top-8 z-0 -translate-x-1/2 text-[clamp(130px,42vw,188px)] leading-none opacity-90">{theme.scene}</div>
            <div className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-extrabold text-gray-500 shadow-sm">
              Chạm hoặc kéo
            </div>
            {Array.from({ length: availableItems }, (_, index) => {
              const appleId = `item-${index}`;
              return (
                <DraggableItem
                  key={appleId}
                  id={appleId}
                  position={itemPositions[index % itemPositions.length]}
                  dropped={droppedAppleIds.includes(appleId)}
                  item={theme.item}
                  label={`Kéo ${theme.itemName} vào ${theme.basketName}`}
                  onQuickAdd={addItemToBasket}
                />
              );
            })}
            <BasketDropZone count={selectedApples} target={targetCount} item={theme.item} basket={theme.basket} />
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button className="outline-pill" onClick={resetCurrent} disabled={isSubmitting}>
              Đặt lại
            </button>
            <button className="primary-pill" onClick={confirmAnswer} disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Xác nhận'}
            </button>
          </div>

          <div className="soft-card mt-4 flex justify-around p-3">
            {Array.from({ length: totalQuestions }, (_, index) => {
              const result = results[index];
              return (
                <button
                  type="button"
                  key={index}
                  onClick={() => (answerHistory[index] ? setReviewIndex(index) : undefined)}
                  disabled={!answerHistory[index]}
                  className={`grid h-11 w-11 place-items-center rounded-full font-extrabold ${
                    result === true
                      ? 'bg-[#9DE8D0] text-white'
                      : result === false
                        ? 'bg-[#FF7A7A] text-white'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {result === true ? '✓' : result === false ? '×' : index + 1}
                </button>
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

        {reviewIndex !== null && answerHistory[reviewIndex] && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xs rounded-[24px] bg-white p-7 text-center shadow-xl"
            >
              <div className="text-6xl mb-3">{answerHistory[reviewIndex].correct ? '✅' : '❌'}</div>
              <h2 className="text-xl font-extrabold">Câu {reviewIndex + 1}</h2>
              <p className="mt-2 text-lg font-extrabold">{answerHistory[reviewIndex].questionTitle}</p>
              <p className="mt-1 text-sm font-bold text-gray-500">{answerHistory[reviewIndex].questionText}</p>
              <div className="mt-5 rounded-[16px] bg-[#F6FCFD] p-4 font-extrabold">
                Bé chọn {answerHistory[reviewIndex].selected}, đáp án đúng là {answerHistory[reviewIndex].target}
              </div>
              <button className="primary-pill mt-6 w-full" onClick={() => setReviewIndex(null)}>
                Đóng
              </button>
            </motion.div>
          </div>
        )}
      </main>
    </DndContext>
  );
};
