import { useState, useCallback, useEffect } from 'react';
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

const BALLOON_COLORS = [
  ['#FF6B6B', '#FF8E8E'], // đỏ
  ['#4ECDC4', '#7EDDD6'], // xanh lá
  ['#45B7D1', '#6DC8DB'], // xanh dương
  ['#F7DC6F', '#FAE99F'], // vàng
  ['#BB8FCE', '#D2B4DE'], // tím
  ['#F0B27A', '#F5CBA7'], // cam
  ['#85C1E9', '#AED6F1'], // xanh nhạt
  ['#F1948A', '#F5B7B1'], // hồng
];

type Question = {
  total: number;
  subtract: number;
  answer: number;
};

const generateQuestion = (_level: number, minNum: number, maxNum: number): Question => {
  const safeMin = Math.max(3, minNum);
  const safeMax = Math.min(10, maxNum); // Giới hạn tối đa 10 bóng bay cho giao diện
  
  const finalMin = Math.min(safeMin, safeMax);
  const finalMax = Math.max(safeMin, safeMax);
  
  const total = finalMin === finalMax ? finalMin : Math.floor(Math.random() * (finalMax - finalMin + 1)) + finalMin;
  const subtract = Math.floor(Math.random() * (total - 2)) + 1; // Đảm bảo nổ ít nhất 1 quả, còn lại ít nhất 1 quả
  return { total, subtract, answer: total - subtract };
};

const randomBalloonPos = (index: number, total: number) => {
  // Spread balloons in a grid-ish pattern
  const cols = Math.min(total, 5);
  const row = Math.floor(index / cols);
  const col = index % cols;
  const offsetX = (Math.random() - 0.5) * 20;
  const offsetY = (Math.random() - 0.5) * 15;
  const baseX = ((col + 0.5) / cols) * 80 + 10 + offsetX;
  const baseY = 10 + row * 40 + offsetY;
  return { x: Math.max(5, Math.min(95, baseX)), y: Math.max(5, Math.min(85, baseY)) };
};

export const SubtractionPage: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const tracker = useLessonTracker(childId || '');

  const child = getStoredChild();
  const minNum = child?.minNumber ?? 1;
  const maxNum = child?.maxNumber ?? 10;

  const totalQuestions = getQuestionsPerLesson();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState<Question>(generateQuestion(0, minNum, maxNum));
  const [poppedIds, setPoppedIds] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<'popping' | 'answer' | 'done'>('popping');
  const [correctCount, setCorrectCount] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [positions] = useState(() =>
    Array.from({ length: 10 }, (_, i) => randomBalloonPos(i, 10))
  );

  useEffect(() => {
    tracker.startSession();
  }, [childId]);

  const popBalloon = useCallback(
    (id: number) => {
      if (phase !== 'popping') return;
      if (poppedIds.has(id)) return;
      sounds.playClick(); // Play pop sound
      const next = new Set(poppedIds);
      next.add(id);
      setPoppedIds(next);

      if (next.size >= question.subtract) {
        // All balloons to pop have been popped
        setTimeout(() => setPhase('answer'), 600);
      }
    },
    [phase, poppedIds, question.subtract]
  );

  const handleAnswer = async (selected: number) => {
    if (feedback) return;
    const isCorrect = selected === question.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setCorrectCount((p) => p + 1);
      sounds.playSuccess();
    } else {
      sounds.playWrong();
    }
    setResults((prev) => [...prev, isCorrect]);

    await tracker.submitQuestionResult(`${question.total} - ${question.subtract} = ?`, isCorrect);

    setTimeout(async () => {
      setFeedback(null);
      if (questionIndex + 1 >= totalQuestions) {
        sounds.playComplete();
        await tracker.completeSession();
        
        const finalCorrectCount = results.filter(Boolean).length + (isCorrect ? 1 : 0);
        const earned = checkAndAwardLessonBadge(childId || '', 'Phép Trừ', finalCorrectCount, totalQuestions);
        setNewBadges(earned);
        
        setPhase('done');
      } else {
        const nextQ = generateQuestion(questionIndex + 1, minNum, maxNum);
        setQuestion(nextQ);
        setQuestionIndex((p) => p + 1);
        setPoppedIds(new Set());
        setSelectedAnswer(null);
        setPhase('popping');
      }
    }, 1400);
  };

  // Generate answer options
  const options = (() => {
    const opts = new Set<number>([question.answer]);
    while (opts.size < 3) {
      const offset = [-1, 1, 2, -2, 3][Math.floor(Math.random() * 5)];
      const c = question.answer + offset;
      if (c >= 0 && c <= 10 && c !== question.answer) opts.add(c);
    }
    return Array.from(opts).sort(() => Math.random() - 0.5);
  })();

  const getEvaluation = () => {
    if (correctCount === totalQuestions) return 'Xuất sắc! Bé hiểu phép trừ rất giỏi!';
    if (correctCount >= 3) return 'Tốt lắm! Bé đếm bóng còn lại thật cẩn thận nhé!';
    return 'Không sao! Bé hãy đếm lại từ từ nhé!';
  };

  const instructionText = phase === 'popping'
    ? `Chạm vào ${question.subtract} quả bóng để làm nổ`
    : 'Còn lại bao nhiêu quả bóng?';

  return (
    <main className="app-screen" style={{ background: 'linear-gradient(180deg, #E8F8FF 0%, #FFF0F4 100%)' }}>
      <div className="flex items-center justify-between p-6">
        <button
          className="grid h-10 w-10 place-items-center rounded-full bg-white text-xl shadow-sm"
          onClick={() => { sounds.playClick(); navigate(`/child/${childId}/lessons`); }}
        >
          ←
        </button>
        <div className="text-xl font-extrabold text-[#FF6B6B]">BẮN BÓNG BAY</div>
        <SpeakButton text={`${question.total} trừ ${question.subtract} bằng mấy? ${instructionText}`} size="sm" />
      </div>

      {phase !== 'done' ? (
        <div className="flex flex-col items-center px-6 pb-6 text-center">
          {/* Instruction */}
          <motion.h2

            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-extrabold text-gray-700"
          >
            {question.total} − {question.subtract} = ?
          </motion.h2>
          <p className="mt-1 font-bold text-gray-500">
            {phase === 'popping'
              ? `Chạm vào ${question.subtract} quả bóng để làm nổ! 💥`
              : 'Còn lại bao nhiêu quả bóng?'}
          </p>

          {/* Feedback */}
          <div className="relative mt-2 h-10 w-full">
            <AnimatePresence>
              {feedback === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-[#4ECDC4]"
                >
                  Chính xác! 🎉
                </motion.div>
              )}
              {feedback === 'wrong' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-[#FF6B6B]"
                >
                  Đáp án là {question.answer}! 💡
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Balloon Area */}
          <div className="relative mt-2 h-72 w-full max-w-sm rounded-[28px] bg-white/60 shadow-inner backdrop-blur-sm overflow-hidden border-2 border-white/80">
            {/* Sky decoration */}
            <div className="absolute top-3 left-4 text-2xl opacity-40">☁️</div>
            <div className="absolute top-6 right-6 text-xl opacity-30">☁️</div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-3xl opacity-30">🌳🌳🌳</div>

            <AnimatePresence>
              {Array.from({ length: question.total }, (_, i) => {
                const popped = poppedIds.has(i);
                const pos = positions[i % positions.length];
                const color = BALLOON_COLORS[i % BALLOON_COLORS.length];

                return !popped ? (
                  <motion.button
                    key={`balloon-${questionIndex}-${i}`}
                    initial={{ opacity: 0, scale: 0, y: 30 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: [0, -6, 0],
                      transition: {
                        opacity: { duration: 0.3, delay: i * 0.08 },
                        scale: { duration: 0.3, delay: i * 0.08 },
                        y: { duration: 2 + Math.random(), repeat: Infinity, repeatType: 'reverse' },
                      },
                    }}
                    exit={{
                      scale: [1.4, 0],
                      opacity: [1, 0],
                      transition: { duration: 0.35 },
                    }}
                    onClick={() => popBalloon(i)}
                    className="absolute flex flex-col items-center cursor-pointer z-10"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                    whileTap={{ scale: 1.3 }}
                  >
                    {/* Balloon body */}
                    <div
                      className="h-14 w-11 rounded-[50%] shadow-lg relative"
                      style={{
                        background: `linear-gradient(135deg, ${color[1]} 0%, ${color[0]} 100%)`,
                      }}
                    >
                      {/* Shine */}
                      <div className="absolute top-2 left-2 h-4 w-3 rounded-full bg-white/40" />
                    </div>
                    {/* String */}
                    <div className="h-5 w-[2px] bg-gray-400 rounded-full" />
                  </motion.button>
                ) : (
                  <motion.div
                    key={`pop-${questionIndex}-${i}`}
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: 0, scale: 2 }}
                    transition={{ duration: 0.4 }}
                    className="absolute text-3xl z-20"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    💥
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Progress indicator */}
          {phase === 'popping' && (
            <div className="mt-3 text-sm font-extrabold text-gray-400">
              Đã nổ: {poppedIds.size}/{question.subtract}
            </div>
          )}

          {/* Answer options */}
          <AnimatePresence>
            {phase === 'answer' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 grid w-full grid-cols-3 gap-3"
              >
                {options.map((opt, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => { sounds.playClick(); setSelectedAnswer(opt); }}
                    disabled={!!feedback}
                    className={`rounded-[20px] py-5 text-3xl font-extrabold text-white shadow-md active:scale-95 transition disabled:opacity-60 ${
                      selectedAnswer === opt
                        ? 'bg-gradient-to-br from-[#71C9EE] to-[#9DE8D0] ring-4 ring-[#71C9EE]/40'
                        : 'bg-gradient-to-br from-[#FF6B6B] to-[#FF8E8E]'
                    }`}
                  >
                    {opt}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3 w-full">
            <button
              className="outline-pill"
              onClick={() => {
                sounds.playClick();
                setPoppedIds(new Set());
                setSelectedAnswer(null);
                setPhase('popping');
              }}
              disabled={!!feedback}
            >
              Đặt lại
            </button>
            <button
              className="primary-pill"
              onClick={() => selectedAnswer !== null && handleAnswer(selectedAnswer)}
              disabled={selectedAnswer === null || !!feedback}
            >
              Kiểm tra
            </button>
          </div>

          {/* Progress bar at bottom */}
          <div className="w-full mt-4">
            <LessonProgressBar current={questionIndex} total={totalQuestions} results={results} />
          </div>
        </div>
      ) : (
        <div className="grid h-full place-items-center p-6 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full rounded-[32px] bg-white p-8 shadow-2xl"
          >
            <div className="mb-6 text-8xl">🎈✨</div>
            <h2 className="mb-2 text-3xl font-extrabold text-[#FF6B6B]">Hoàn thành!</h2>
            <div className="mb-4 text-2xl font-bold text-gray-700">
              Điểm: {correctCount}/{totalQuestions}
            </div>
            <p className="mb-8 font-bold text-gray-500">{getEvaluation()}</p>
            <button
              onClick={() => navigate(`/child/${childId}/lessons`)}
              className="w-full rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] py-4 text-xl font-extrabold text-white shadow-md active:scale-95"
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
