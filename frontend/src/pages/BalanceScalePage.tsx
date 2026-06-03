import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredChild } from '../utils/childVisuals';
import { useLessonTracker } from '../hooks/useLessonTracker';
import { sounds } from '../utils/soundEffects';
import { SpeakButton } from '../components/SpeakButton';
import { LessonProgressBar } from '../components/LessonProgressBar';
import { checkAndAwardChallengeBadge } from '../utils/badges';
import { BadgeUnlockedModal } from '../components/BadgeUnlockedModal';
import { getQuestionsPerLesson } from '../hooks/useParentSettings';
const THEME_ITEM = '🍎';

type Question = {
  left: number;
  right: number;
  mode: 'larger' | 'smaller';
};

const generateQuestion = (minNum: number, maxNum: number): Question => {
  const safeMin = Math.max(1, minNum);
  const safeMax = Math.min(9, maxNum); // Giới hạn tối đa 9 quả táo mỗi đĩa cân

  const finalMin = Math.min(safeMin, safeMax);
  const finalMax = Math.max(safeMin, safeMax);

  let left = finalMin === finalMax ? finalMin : Math.floor(Math.random() * (finalMax - finalMin + 1)) + finalMin;
  let right = finalMin === finalMax ? finalMin : Math.floor(Math.random() * (finalMax - finalMin + 1)) + finalMin;
  
  if (finalMin !== finalMax) {
    while (left === right) {
      right = Math.floor(Math.random() * (finalMax - finalMin + 1)) + finalMin;
    }
  } else {
    // Nếu chỉ cấu hình 1 số duy nhất, bẻ lái nhẹ để tạo khoảng cách so sánh
    if (left > 1) {
      right = left - 1;
    } else {
      right = left + 1;
    }
  }

  return {
    left,
    right,
    mode: Math.random() > 0.5 ? 'larger' : 'smaller',
  };
};

export const BalanceScalePage: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const tracker = useLessonTracker(childId || '');

  const child = getStoredChild();
  const minNum = child?.minNumber ?? 1;
  const maxNum = child?.maxNumber ?? 10;
  
  const totalQuestions = getQuestionsPerLesson();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState<Question>(generateQuestion(minNum, maxNum));
  const [tilt, setTilt] = useState<0 | -1 | 1>(0);
  const [status, setStatus] = useState<'playing' | 'done'>('playing');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    tracker.startSession();
  }, [childId]);

  const handleConfirm = async () => {
    if (!selectedSide || feedback) return;
    
    const side = selectedSide;
    const isLeftCorrect = question.mode === 'larger' ? question.left > question.right : question.left < question.right;
    const isCorrect = (side === 'left' && isLeftCorrect) || (side === 'right' && !isLeftCorrect);

    // Animate scale based on actual physical weight
    setTilt(question.left > question.right ? -1 : 1);
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setFeedback('correct');
      sounds.playSuccess();
    } else {
      setFeedback('wrong');
      sounds.playWrong();
    }
    setResults(prev => [...prev, isCorrect]);

    await tracker.submitQuestionResult(`So sánh ${question.left} và ${question.right} (${question.mode === 'larger' ? 'Nhiều hơn' : 'Ít hơn'})`, isCorrect);

    setTimeout(async () => {
      setFeedback(null);
      setSelectedSide(null);
      if (questionIndex + 1 >= totalQuestions) {
        sounds.playComplete();
        await tracker.completeSession();
        
        const earned = checkAndAwardChallengeBadge(childId || '', 'balance-scale');
        setNewBadges(earned);
        
        setStatus('done');
      } else {
        setTilt(0);
        setQuestion(generateQuestion(minNum, maxNum));
        setQuestionIndex(prev => prev + 1);
      }
    }, 1700);
  };

  const getEvaluation = () => {
    if (correctCount === totalQuestions) return "Giỏi quá! Bé nhận biết số lượng rất tuyệt vời!";
    if (correctCount >= 3) return "Tốt lắm! Lần sau bé thử đếm lại xem bên nào nhiều hơn nhé!";
    return "Đừng lo, bé có thể dựa vào số lượng quả táo để so sánh dễ hơn nhé!";
  };

  const instructionText = `Bên nào ${question.mode === 'larger' ? 'nhiều hơn' : 'ít hơn'}? Bên trái có ${question.left}, bên phải có ${question.right}. Chạm vào bên đó nhé!`;

  const renderVisuals = (count: number) => (
    <div className="flex w-full max-w-[108px] flex-wrap justify-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-2xl leading-none sm:text-3xl">{THEME_ITEM}</span>
      ))}
    </div>
  );

  return (
    <main className="app-screen overflow-hidden bg-[#F0F9FF]">
      <div className="flex items-center justify-between p-6">
        <button className="grid h-10 w-10 place-items-center rounded-full bg-white text-xl shadow-sm" onClick={() => { sounds.playClick(); navigate(`/child/${childId}/challenges`); }}>
          ←
        </button>
        <div className="text-xl font-extrabold text-[#71C9EE]">CÂN THĂNG BẰNG</div>
        <SpeakButton text={instructionText} size="sm" />
      </div>

      {status === 'playing' ? (
        <div className="mt-4 flex flex-col items-center px-5 pb-6 pt-4 text-center sm:px-6">
          <h2 className="text-2xl font-extrabold text-gray-700 sm:text-3xl">
            Bên nào {question.mode === 'larger' ? <span className="text-[#FF7A7A]">NHIỀU HƠN</span> : <span className="text-[#9DE8D0]">ÍT HƠN</span>}?
          </h2>
          <p className="mt-2 text-gray-500 font-bold">Chạm vào bên đó nhé!</p>

          <div className="relative mt-10 h-[260px] w-full max-w-[390px]">
            <AnimatePresence>
              {feedback === 'correct' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -top-8 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-1 text-lg font-extrabold text-[#9DE8D0] drop-shadow-md sm:text-2xl">
                  Chính xác! Đỉnh quá! ✨
                </motion.div>
              )}
              {feedback === 'wrong' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute -top-8 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-1 text-lg font-extrabold text-[#FF7A7A] drop-shadow-md sm:text-2xl">
                  Gần đúng rồi! Thử lại ở câu sau nhé!
                </motion.div>
              )}
            </AnimatePresence>
            {/* The Scale Balance */}
            <motion.div
              animate={{ rotate: tilt * 15 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="absolute left-6 right-6 top-[136px] z-10 h-2 origin-center rounded-full bg-gray-400"
            >
              {/* Left Pan */}
              <button
                type="button"
                onClick={() => { if (feedback === null) { sounds.playClick(); setSelectedSide('left'); } }}
                className={`absolute -top-[112px] left-0 z-20 flex w-28 origin-bottom flex-col items-center transition active:scale-95 ${
                  selectedSide === 'left' ? 'scale-105 rounded-2xl ring-4 ring-[#FFD39A]/50' : ''
                }`}
              >
                <div className="mb-1 text-2xl font-extrabold text-gray-700 bg-white/60 px-3 rounded-full shadow-sm">{question.left}</div>
                <div className="mb-2">{renderVisuals(question.left)}</div>
                <div className="h-4 w-24 bg-[#FFD39A] rounded-t-xl shadow-md border-b-4 border-[#E0A865]"></div>
              </button>

              {/* Right Pan */}
              <button
                type="button"
                onClick={() => { if (feedback === null) { sounds.playClick(); setSelectedSide('right'); } }}
                className={`absolute -top-[112px] right-0 z-20 flex w-28 origin-bottom flex-col items-center transition active:scale-95 ${
                  selectedSide === 'right' ? 'scale-105 rounded-2xl ring-4 ring-[#9DE8D0]/50' : ''
                }`}
              >
                <div className="mb-1 text-2xl font-extrabold text-gray-700 bg-white/60 px-3 rounded-full shadow-sm">{question.right}</div>
                <div className="mb-2">{renderVisuals(question.right)}</div>
                <div className="h-4 w-24 bg-[#9DE8D0] rounded-t-xl shadow-md border-b-4 border-[#6BBDA4]"></div>
              </button>
            </motion.div>

            {/* The Base */}
            <div className="absolute left-1/2 top-[136px] h-20 w-8 -translate-x-1/2 rounded-t-full bg-gray-500 clip-triangle"></div>
            <div className="absolute left-1/2 top-[202px] h-4 w-24 -translate-x-1/2 rounded-full bg-gray-600"></div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 grid w-full max-w-[280px] grid-cols-2 gap-4">
            <button
              onClick={() => { sounds.playClick(); setSelectedSide(null); setTilt(0); }}
              disabled={feedback !== null}
              className="outline-pill"
            >
              Đặt lại
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedSide || feedback !== null}
              className="primary-pill"
            >
              Kiểm tra
            </button>
          </div>

          {/* Progress bar at bottom */}
          <div className="mt-5 w-full">
            <LessonProgressBar current={questionIndex} total={totalQuestions} results={results} />
          </div>
        </div>
      ) : (
        <div className="grid h-full place-items-center p-6 text-center">
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full rounded-[32px] bg-white p-8 shadow-2xl"
            >
              <div className="text-8xl mb-6">⚖️✨</div>
              <h2 className="text-3xl font-extrabold mb-2 text-[#71C9EE]">Hoàn thành!</h2>
              <div className="text-2xl font-bold text-gray-700 mb-4">Điểm: {correctCount}/{totalQuestions}</div>
              <p className="text-gray-500 font-bold mb-8">
                {getEvaluation()}
              </p>
              <button
                onClick={() => navigate(`/child/${childId}/challenges`)}
                className="w-full rounded-full bg-gradient-to-r from-[#71C9EE] to-[#9DE8D0] py-4 text-xl font-extrabold text-white shadow-md active:scale-95"
              >
                Quay lại
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
      <BadgeUnlockedModal badgeIds={newBadges} onClose={() => setNewBadges([])} />
    </main>
  );
};
