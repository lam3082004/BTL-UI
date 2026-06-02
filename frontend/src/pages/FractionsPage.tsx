import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredChild } from '../utils/childVisuals';
import { useLessonTracker } from '../hooks/useLessonTracker';
import { sounds } from '../utils/soundEffects';
import { SpeakButton } from '../components/SpeakButton';
import { LessonProgressBar } from '../components/LessonProgressBar';
import { checkAndAwardLessonBadge } from '../utils/badges';
import { BadgeUnlockedModal } from '../components/BadgeUnlockedModal';
import { getQuestionsPerLesson } from '../hooks/useParentSettings';

type Question = {
  numerator: number;
  denominator: number;
};

const generateQuestion = (_level: number, _minNum: number, maxNum: number): Question => {
  const denoms = [2, 3, 4, 6, 8].filter((d) => d <= maxNum);
  
  // Fallback nếu giới hạn số quá nhỏ
  if (denoms.length === 0) {
    denoms.push(2);
  }
  
  const denominator = denoms[Math.floor(Math.random() * denoms.length)];
  const numerator = Math.floor(Math.random() * (denominator - 1)) + 1;
  return { numerator, denominator };
};

// Build SVG pizza slices using path arcs
const getPizzaSlicePath = (index: number, total: number, radius: number): string => {
  const anglePerSlice = (2 * Math.PI) / total;
  const startAngle = index * anglePerSlice - Math.PI / 2;
  const endAngle = startAngle + anglePerSlice;

  const x1 = radius + radius * Math.cos(startAngle);
  const y1 = radius + radius * Math.sin(startAngle);
  const x2 = radius + radius * Math.cos(endAngle);
  const y2 = radius + radius * Math.sin(endAngle);

  const largeArc = anglePerSlice > Math.PI ? 1 : 0;

  return `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
};

const PIZZA_TOPPINGS = ['🫒', '🍄', '🌶️', '🧀'];

export const FractionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const tracker = useLessonTracker(childId || '');

  const child = getStoredChild();
  const minNum = child?.minNumber ?? 1;
  const maxNum = child?.maxNumber ?? 10;

  const totalQuestions = getQuestionsPerLesson();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState<Question>(generateQuestion(0, minNum, maxNum));
  const [selectedSlices, setSelectedSlices] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<'selecting' | 'done'>('selecting');
  const [correctCount, setCorrectCount] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  const RADIUS = 120;

  useEffect(() => {
    tracker.startSession();
  }, [childId]);

  const toggleSlice = (index: number) => {
    if (feedback) return;
    sounds.playClick();
    const next = new Set(selectedSlices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedSlices(next);
  };

  const checkAnswer = async () => {
    if (feedback) return;
    const isCorrect = selectedSlices.size === question.numerator;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setCorrectCount((p) => p + 1);
      sounds.playSuccess();
    } else {
      sounds.playWrong();
    }

    await tracker.submitQuestionResult(`Tô màu ${question.numerator}/${question.denominator}`, isCorrect);
    setResults(prev => [...prev, isCorrect]);

    setTimeout(async () => {
      setFeedback(null);
      if (questionIndex + 1 >= totalQuestions) {
        sounds.playComplete();
        await tracker.completeSession();
        
        const finalCorrectCount = results.filter(Boolean).length + (isCorrect ? 1 : 0);
        const earned = checkAndAwardLessonBadge(childId || '', 'Phân Số', finalCorrectCount, totalQuestions);
        setNewBadges(earned);
        
        setPhase('done');
      } else {
        const nextQ = generateQuestion(questionIndex + 1, minNum, maxNum);
        setQuestion(nextQ);
        setQuestionIndex((p) => p + 1);
        setSelectedSlices(new Set());
      }
    }, 1500);
  };

  const getEvaluation = () => {
    if (correctCount === totalQuestions) return 'Tuyệt vời! Bé hiểu phân số rất giỏi!';
    if (correctCount >= 3) return 'Khá lắm! Bé nhớ đếm kĩ các miếng nhé!';
    return 'Không sao! Phân số là chia thành phần đều nhau nhé!';
  };

  const instructionText = `Tô màu ${question.numerator} phần trên ${question.denominator} của bánh pizza. Chạm vào các miếng bánh nhé!`;

  return (
    <main className="app-screen" style={{ background: 'linear-gradient(180deg, #FFF8E1 0%, #FFECB3 100%)' }}>
      <div className="flex items-center justify-between p-6">
        <button
          className="grid h-10 w-10 place-items-center rounded-full bg-white text-xl shadow-sm"
          onClick={() => { sounds.playClick(); navigate(`/child/${childId}/lessons`); }}
        >
          ←
        </button>
        <div className="text-xl font-extrabold text-[#FF8F00]">CHIA BÁNH PIZZA</div>
        <SpeakButton text={instructionText} size="sm" />
      </div>

      {phase !== 'done' ? (
        <div className="flex flex-col items-center px-6 pb-6 text-center">
          {/* Question */}
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-extrabold text-gray-700"
          >
            Tô màu{' '}
            <span className="text-[#FF8F00]">
              {question.numerator}/{question.denominator}
            </span>{' '}
            cái bánh!
          </motion.h2>
          <p className="mt-1 font-bold text-gray-500">
            Chạm vào {question.numerator} miếng bánh để tô màu 🍕
          </p>

          {/* Feedback */}
          <div className="relative mt-2 h-10 w-full">
            <AnimatePresence>
              {feedback === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-[#66BB6A]"
                >
                  Chính xác! 🎉
                </motion.div>
              )}
              {feedback === 'wrong' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-[#EF5350]"
                >
                  Cần chọn đúng {question.numerator} miếng! 💡
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pizza SVG */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="relative mt-3"
          >
            <svg width={RADIUS * 2 + 8} height={RADIUS * 2 + 8} viewBox={`-4 -4 ${RADIUS * 2 + 8} ${RADIUS * 2 + 8}`}>
              {/* Pizza base */}
              <circle cx={RADIUS} cy={RADIUS} r={RADIUS} fill="#FFF3E0" stroke="#E0A240" strokeWidth="3" />

              {/* Slices */}
              {Array.from({ length: question.denominator }, (_, i) => {
                const isSelected = selectedSlices.has(i);
                const path = getPizzaSlicePath(i, question.denominator, RADIUS);
                return (
                  <g key={i} onClick={() => toggleSlice(i)} style={{ cursor: 'pointer' }}>
                    <path
                      d={path}
                      fill={isSelected ? '#FF8F00' : '#FFCC80'}
                      stroke="#E0A240"
                      strokeWidth="2"
                      className="transition-colors duration-200"
                    />
                    {/* Topping decoration on each slice */}
                    {(() => {
                      const anglePerSlice = (2 * Math.PI) / question.denominator;
                      const midAngle = i * anglePerSlice + anglePerSlice / 2 - Math.PI / 2;
                      const tx = RADIUS + (RADIUS * 0.55) * Math.cos(midAngle);
                      const ty = RADIUS + (RADIUS * 0.55) * Math.sin(midAngle);
                      return (
                        <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fontSize="18" className="pointer-events-none select-none">
                          {isSelected ? '😋' : PIZZA_TOPPINGS[i % PIZZA_TOPPINGS.length]}
                        </text>
                      );
                    })()}
                  </g>
                );
              })}

              {/* Center circle */}
              <circle cx={RADIUS} cy={RADIUS} r="18" fill="#FFF8E1" stroke="#E0A240" strokeWidth="2" />
              <text x={RADIUS} y={RADIUS} textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="bold" fill="#E0A240">
                🍕
              </text>
            </svg>
          </motion.div>

          {/* Selection count */}
          <div className="mt-3 rounded-full bg-white/70 px-5 py-2 shadow-sm backdrop-blur-sm">
            <span className="text-lg font-extrabold text-gray-600">
              Đã chọn:{' '}
              <span className="text-[#FF8F00]">{selectedSlices.size}</span>
              /{question.numerator}
            </span>
          </div>

          {/* Fraction visualization */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex flex-col items-center rounded-[16px] bg-white/80 px-5 py-3 shadow-sm">
              <span className="text-3xl font-extrabold text-[#FF8F00]">{selectedSlices.size}</span>
              <div className="h-[3px] w-10 rounded-full bg-gray-400 my-1" />
              <span className="text-3xl font-extrabold text-gray-600">{question.denominator}</span>
            </div>
            <span className="text-2xl font-extrabold text-gray-400">→ phần được chọn</span>
          </div>

          {/* Action buttons */}
          <div className="mt-5 grid grid-cols-2 gap-3 w-full">
            <button
              onClick={() => { sounds.playClick(); setSelectedSlices(new Set()); }}
              disabled={!!feedback}
              className="outline-pill"
            >
              Đặt lại
            </button>
            <button
              onClick={checkAnswer}
              disabled={selectedSlices.size === 0 || !!feedback}
              className="primary-pill"
            >
              Kiểm tra
            </button>
          </div>

          {/* Progress bar at bottom */}
          <LessonProgressBar current={questionIndex} total={totalQuestions} results={results} />
        </div>
      ) : (
        <div className="grid h-full place-items-center p-6 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full rounded-[32px] bg-white p-8 shadow-2xl"
          >
            <div className="mb-6 text-8xl">🍕✨</div>
            <h2 className="mb-2 text-3xl font-extrabold text-[#FF8F00]">Hoàn thành!</h2>
            <div className="mb-4 text-2xl font-bold text-gray-700">
              Điểm: {correctCount}/{totalQuestions}
            </div>
            <p className="mb-8 font-bold text-gray-500">{getEvaluation()}</p>
            <button
              onClick={() => navigate(`/child/${childId}/lessons`)}
              className="w-full rounded-full bg-gradient-to-r from-[#FF8F00] to-[#FFB74D] py-4 text-xl font-extrabold text-white shadow-md active:scale-95"
            >
              Quay lại
            </button>
          </motion.div>
        </div>
      )}
      <BadgeUnlockedModal badgeIds={newBadges} onClose={() => setNewBadges([])} />
    </main>
  );
};
