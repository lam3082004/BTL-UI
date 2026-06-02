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

const MONSTERS = [
  { emoji: '👾', color: '#BB8FCE', name: 'Tím' },
  { emoji: '🐸', color: '#82E0AA', name: 'Xanh' },
  { emoji: '🐻', color: '#F0B27A', name: 'Nâu' },
  { emoji: '🐱', color: '#85C1E9', name: 'Mèo' },
  { emoji: '🐰', color: '#F1948A', name: 'Thỏ' },
];

const CANDIES = ['🍬', '🍭', '🍫', '🧁', '🍪'];

type Question = {
  total: number;
  groups: number;
  answer: number; // total / groups
  candyEmoji: string;
};

const generateQuestion = (_level: number, minNum: number, maxNum: number): Question => {
  const allPairs = [
    [4, 2], [6, 2], [6, 3], [8, 2], [8, 4],
    [9, 3], [10, 2], [10, 5], [12, 3], [12, 4],
  ];
  
  // Lọc các cặp chia hết có số bị chia nằm trong khoảng giới hạn
  let pairs = allPairs.filter(([total]) => total >= minNum && total <= maxNum);
  
  // Nếu không tìm thấy cặp nào trong list sẵn có (ví dụ: giới hạn số quá nhỏ), tự động tạo các cặp hợp lệ
  if (pairs.length === 0) {
    for (let total = Math.max(2, minNum); total <= Math.min(12, maxNum); total++) {
      for (let groups = 2; groups <= 3; groups++) {
        if (total % groups === 0 && total / groups >= 1) {
          pairs.push([total, groups]);
        }
      }
    }
  }

  // Fallback tuyệt đối
  if (pairs.length === 0) {
    pairs.push([4, 2]);
  }

  const [total, groups] = pairs[Math.floor(Math.random() * pairs.length)];
  const candyEmoji = CANDIES[Math.floor(Math.random() * CANDIES.length)];
  return { total, groups, answer: total / groups, candyEmoji };
};

type CandyAlloc = Record<number, number>; // monsterIndex -> count

export const DivisionPage: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const tracker = useLessonTracker(childId || '');

  const child = getStoredChild();
  const minNum = child?.minNumber ?? 1;
  const maxNum = child?.maxNumber ?? 10;

  const totalQuestions = getQuestionsPerLesson();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState<Question>(generateQuestion(0, minNum, maxNum));
  const [allocation, setAllocation] = useState<CandyAlloc>({});
  const [phase, setPhase] = useState<'dividing' | 'done'>('dividing');
  const [correctCount, setCorrectCount] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  const totalAllocated = Object.values(allocation).reduce((s, v) => s + v, 0);
  const remaining = question.total - totalAllocated;

  useEffect(() => {
    tracker.startSession();
  }, [childId]);

  const addCandy = useCallback(
    (monsterIdx: number) => {
      if (feedback) return;
      if (remaining <= 0) return;
      sounds.playClick();
      setAllocation((prev) => ({
        ...prev,
        [monsterIdx]: (prev[monsterIdx] || 0) + 1,
      }));
    },
    [feedback, remaining]
  );

  const removeCandy = useCallback(
    (monsterIdx: number) => {
      if (feedback) return;
      sounds.playClick();
      setAllocation((prev) => {
        const current = prev[monsterIdx] || 0;
        if (current <= 0) return prev;
        return { ...prev, [monsterIdx]: current - 1 };
      });
    },
    [feedback]
  );

  const checkAnswer = async () => {
    if (feedback) return;
    // Check if all monsters have equal amounts AND no candies remaining
    const counts = Array.from({ length: question.groups }, (_, i) => allocation[i] || 0);
    const allEqual = counts.every((c) => c === counts[0]);
    const isCorrect = allEqual && remaining === 0 && counts[0] === question.answer;

    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setCorrectCount((p) => p + 1);
      sounds.playSuccess();
    } else {
      sounds.playWrong();
    }
    setResults(prev => [...prev, isCorrect]);

    await tracker.submitQuestionResult(`${question.total} ÷ ${question.groups} = ?`, isCorrect);

    setTimeout(async () => {
      setFeedback(null);
      if (questionIndex + 1 >= totalQuestions) {
        sounds.playComplete();
        await tracker.completeSession();
        
        const finalCorrectCount = results.filter(Boolean).length + (isCorrect ? 1 : 0);
        const earned = checkAndAwardLessonBadge(childId || '', 'Phép Chia', finalCorrectCount, totalQuestions);
        setNewBadges(earned);
        
        setPhase('done');
      } else {
        setQuestion(generateQuestion(questionIndex + 1, minNum, maxNum));
        setQuestionIndex((p) => p + 1);
        setAllocation({});
      }
    }, 1500);
  };

  const resetAllocation = () => {
    if (feedback) return;
    sounds.playClick();
    setAllocation({});
  };

  const getEvaluation = () => {
    if (correctCount === totalQuestions) return 'Tuyệt vời! Bé chia đều rất giỏi!';
    if (correctCount >= 3) return 'Khá lắm! Bé hãy thử chia từ từ cho đều nhé!';
    return 'Không sao! Hãy nhớ chia cho mỗi bạn bằng nhau nhé!';
  };

  const instructionText = `Chia ${question.total} ${question.candyEmoji} cho ${question.groups} bạn. Chạm vào từng bạn để chia kẹo nhé!`;

  const monsters = MONSTERS.slice(0, question.groups);

  return (
    <main className="app-screen" style={{ background: 'linear-gradient(180deg, #FBF5FF 0%, #F0E6FF 100%)' }}>
      <div className="flex items-center justify-between p-6">
        <button
          className="grid h-10 w-10 place-items-center rounded-full bg-white text-xl shadow-sm"
          onClick={() => { sounds.playClick(); navigate(`/child/${childId}/lessons`); }}
        >
          ←
        </button>
        <div className="text-xl font-extrabold text-[#BB8FCE]">CHIA KẸO</div>
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
            {question.total} ÷ {question.groups} = ?
          </motion.h2>
          <p className="mt-1 font-bold text-gray-500">
            Chia đều {question.total} {question.candyEmoji} cho {question.groups} bạn!
          </p>

          {/* Feedback */}
          <div className="relative mt-2 h-10 w-full">
            <AnimatePresence>
              {feedback === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-[#82E0AA]"
                >
                  Chia đều rồi! 🎉
                </motion.div>
              )}
              {feedback === 'wrong' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-[#F1948A]"
                >
                  Chưa đều! Mỗi bạn cần {question.answer} {question.candyEmoji}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Remaining Candies */}
          <div className="mt-1 w-full rounded-[20px] bg-white/70 p-4 shadow-sm backdrop-blur-sm">
            <div className="text-sm font-extrabold text-gray-400 mb-2">
              Kẹo còn lại: {remaining}
            </div>
            <div className="flex flex-wrap justify-center gap-1 min-h-[36px]">
              {Array.from({ length: remaining }, (_, i) => (
                <motion.span
                  key={`remaining-${i}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-2xl"
                >
                  {question.candyEmoji}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Monsters receiving candies */}
          <div className="mt-4 grid w-full gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(question.groups, 3)}, 1fr)` }}>
            {monsters.map((monster, idx) => {
              const count = allocation[idx] || 0;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-[20px] bg-white p-3 shadow-md border-2 border-dashed"
                  style={{ borderColor: monster.color + '80' }}
                >
                  {/* Monster face */}
                  <div className="text-center">
                    <motion.div
                      className="text-4xl"
                      animate={count > 0 ? { rotate: [0, -5, 5, 0] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      {monster.emoji}
                    </motion.div>
                    <div className="text-xs font-extrabold mt-1" style={{ color: monster.color }}>
                      Bạn {monster.name}
                    </div>
                  </div>

                  {/* Candy count */}
                  <div className="flex flex-wrap justify-center gap-0.5 mt-2 min-h-[28px]">
                    <AnimatePresence>
                      {Array.from({ length: count }, (_, i) => (
                        <motion.span
                          key={i}
                          initial={{ scale: 0, y: -20 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0 }}
                          className="text-xl"
                        >
                          {question.candyEmoji}
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="text-center text-sm font-extrabold text-gray-500 mt-1">
                    {count} cái
                  </div>

                  {/* +/- buttons */}
                  <div className="mt-2 flex justify-center gap-2">
                    <button
                      onClick={() => removeCandy(idx)}
                      disabled={count <= 0 || !!feedback}
                      className="grid h-8 w-8 place-items-center rounded-full bg-gray-100 text-lg font-bold text-gray-500 active:scale-90 disabled:opacity-30"
                    >
                      −
                    </button>
                    <button
                      onClick={() => addCandy(idx)}
                      disabled={remaining <= 0 || !!feedback}
                      className="grid h-8 w-8 place-items-center rounded-full text-lg font-bold text-white active:scale-90 disabled:opacity-30"
                      style={{ backgroundColor: monster.color }}
                    >
                      +
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="mt-5 grid w-full grid-cols-2 gap-3">
            <button
              onClick={resetAllocation}
              disabled={!!feedback}
              className="outline-pill"
            >
              Đặt lại
            </button>
            <button
              onClick={checkAnswer}
              disabled={feedback !== null || remaining > 0}
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
            <div className="mb-6 text-8xl">🍬✨</div>
            <h2 className="mb-2 text-3xl font-extrabold text-[#BB8FCE]">Hoàn thành!</h2>
            <div className="mb-4 text-2xl font-bold text-gray-700">
              Điểm: {correctCount}/{totalQuestions}
            </div>
            <p className="mb-8 font-bold text-gray-500">{getEvaluation()}</p>
            <button
              onClick={() => navigate(`/child/${childId}/lessons`)}
              className="w-full rounded-full bg-gradient-to-r from-[#BB8FCE] to-[#D2B4DE] py-4 text-xl font-extrabold text-white shadow-md active:scale-95"
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
