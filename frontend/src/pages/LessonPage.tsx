import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  Modifier,
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
import { getChildVisual, getStoredChild, getLocalChildById, maxVisualNumber } from '../utils/childVisuals';
import { sounds } from '../utils/soundEffects';
import { SpeakButton } from '../components/SpeakButton';
import { checkAndAwardLessonBadge } from '../utils/badges';
import { LessonProgressBar } from '../components/LessonProgressBar';



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
  { left: '35%', top: '12%' },
  { left: '55%', top: '8%' },
  { left: '70%', top: '15%' },
  { left: '25%', top: '25%' },
  { left: '50%', top: '20%' },
  { left: '75%', top: '28%' },
  { left: '30%', top: '38%' },
  { left: '60%', top: '35%' },
  { left: '45%', top: '45%' },
  { left: '70%', top: '42%' },
  { left: '25%', top: '48%' },
  { left: '55%', top: '50%' },
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
}> = ({
  id,
  position,
  dropped,
  item,
  label,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: dropped,
  });
  const dragTransform = CSS.Translate.toString(transform);

  return (
    <button
      id={id}
      ref={setNodeRef}
      type="button"
      style={{
        left: position.left,
        top: position.top,
        transform: `translate(-50%, -50%) ${dragTransform || ''}`,
        touchAction: 'none',
      }}
      className={`absolute z-20 grid h-12 w-12 select-none place-items-center rounded-full bg-white/95 text-3xl sm:h-14 sm:w-14 sm:text-4xl ${
        isDragging ? '' : 'transition'
      } ${
        dropped ? 'pointer-events-none opacity-0 scale-75' : 'cursor-grab active:cursor-grabbing active:scale-95'
      } ${isDragging ? 'opacity-90 scale-110' : ''}`}
      aria-label={label}
      {...listeners}
      {...attributes}
    >
      {item}
    </button>
  );
};

const BasketDropZone: React.FC<{ count: number; item: string; basket: string }> = ({
  count,
  item,
  basket,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'basket' });

  return (
    <div
      ref={setNodeRef}
      className={`mx-auto h-32 w-40 rounded-[24px] border-2 border-dashed bg-white/80 shadow-sm transition relative ${
        isOver ? 'scale-105 border-[#71C9EE] bg-[#E4F8FF] shadow-lg' : 'border-gray-300'
      }`}
    >
      <div className="absolute inset-x-0 top-2 flex max-h-16 flex-wrap justify-center overflow-hidden px-3 text-2xl leading-none">
        {Array.from({ length: count }, (_, index) => (
          <span key={index}>{item}</span>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-1 text-center text-6xl leading-none">{basket}</div>
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
  const dragInitialRectRef = useRef<DOMRect | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const node = document.getElementById(String(event.active.id));
    if (node) {
      dragInitialRectRef.current = node.getBoundingClientRect();
    }
  };

  const clampToBounds: Modifier = useCallback(({ transform }) => {
    const container = document.getElementById('drag-bounds');
    const nodeRect = dragInitialRectRef.current;
    if (!nodeRect || !container) return transform;

    const bounds = container.getBoundingClientRect();
    const value = { ...transform };

    if (nodeRect.top + transform.y < bounds.top) {
      value.y = bounds.top - nodeRect.top;
    } else if (nodeRect.bottom + transform.y > bounds.bottom) {
      value.y = bounds.bottom - nodeRect.bottom;
    }

    if (nodeRect.left + transform.x < bounds.left) {
      value.x = bounds.left - nodeRect.left;
    } else if (nodeRect.right + transform.x > bounds.right) {
      value.x = bounds.right - nodeRect.right;
    }

    return value;
  }, []);

  useEffect(() => {
    let child = getStoredChild();
    if (!child && childId) {
      child = getLocalChildById(childId);
      if (child) {
        sessionStorage.setItem('selectedChild', JSON.stringify(child));
        sessionStorage.setItem('selectedChildId', child.id);
      }
    }
    if (!child) {
      navigate('/child-select');
      return;
    }
    setSelectedChild(child);
  }, [childId, navigate]);

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
    if (isCorrect) {
      sounds.playSuccess();
    } else {
      sounds.playWrong();
    }
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
    sounds.playClick();
    if (results.length >= totalQuestions) {
      sounds.playComplete();
      await lesson.completeSession();

      const correctCount = results.filter(Boolean).length;
      const newBadgeIds = checkAndAwardLessonBadge(
        selectedChild.id,
        lessonChoice.title,
        correctCount,
        totalQuestions
      );

      navigate('/reward', {
        state: {
          sessionId: lesson.sessionId,
          childName: selectedChild.name,
          lessonTitle: lessonChoice.title,
          results,
          newBadgeIds,
        },
      });
      return;
    }

    setModal(null);
    setDroppedAppleIds([]); // Reset các quả táo đã kéo vào giỏ trước khi tạo câu hỏi mới
    await lesson.generateNewQuestion();
  };

  const resetCurrent = () => {
    sounds.playClick();
    setDroppedAppleIds([]);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[clampToBounds]}>
      <main className="app-screen overflow-hidden px-5 py-6">
        <div className="screen-top items-center">
          <button className="circle-button" onClick={() => { sounds.playClick(); navigate(backRoute); }} aria-label="Quay lại">
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
            <SpeakButton text={questionCopy.text} size="sm" />
          </div>

          <div id="drag-bounds" className="relative mx-auto mt-3 w-full max-w-[360px] overflow-hidden rounded-[22px]">
            {/* Tree area with fruits */}
            <div className="relative h-[min(42dvh,310px)] min-h-[280px] w-full">
              <div className="absolute left-1/2 top-8 z-0 -translate-x-1/2 text-[clamp(130px,42vw,188px)] leading-none opacity-90">{theme.scene}</div>
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
                  />
                );
              })}
            </div>
            {/* Basket below the tree */}
            <div className="relative mx-auto -mt-4">
              <BasketDropZone count={selectedApples} item={theme.item} basket={theme.basket} />
            </div>
          </div>

          <div className="mt-3 text-center text-lg font-extrabold text-gray-500">
            {selectedApples}/{targetCount}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button className="outline-pill" onClick={resetCurrent} disabled={isSubmitting}>
              Đặt lại
            </button>
            <button className="primary-pill" onClick={confirmAnswer} disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Kiểm tra'}
            </button>
          </div>
          <LessonProgressBar current={results.length} total={totalQuestions} results={results} onDotClick={setReviewIndex} />
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
