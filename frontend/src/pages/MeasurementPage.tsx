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

const OBJECTS = [
  { emoji: '✏️', name: 'Cây bút chì', color: '#FFD54F' },
  { emoji: '🍌', name: 'Quả chuối', color: '#FFF176' },
  { emoji: '🥕', name: 'Củ cà rốt', color: '#FF8A65' },
  { emoji: '🌽', name: 'Bắp ngô', color: '#FDD835' },
  { emoji: '🥒', name: 'Quả dưa', color: '#AED581' },
  { emoji: '🍎', name: 'Quả táo', color: '#EF5350' },
  { emoji: '🐛', name: 'Con sâu', color: '#81C784' },
];

type Question = {
  objectLength: number; // in cm
  objectIndex: number;
};

const generateQuestion = (_level: number, minNum: number, maxNum: number): Question => {
  const minLen = Math.max(1, minNum);
  const maxLen = Math.min(12, maxNum); // Chiều dài tối đa của thước là 12cm

  // Đảm bảo safeMin <= safeMax
  const safeMin = Math.min(minLen, maxLen);
  const safeMax = Math.max(minLen, maxLen);

  const objectLength = Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
  const objectIndex = Math.floor(Math.random() * OBJECTS.length);

  return {
    objectLength,
    objectIndex,
  };
};

const RULER_MARKS = 13; // 0 to 12 cm

const Ruler: React.FC<{ maxCm: number; highlightCm: number | null; onSelect?: (cm: number) => void }> = ({ maxCm, highlightCm, onSelect }) => {
  const width = 320;
  const height = 70;
  const leftPad = 20;
  const cmWidth = (width - leftPad * 2) / maxCm;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="drop-shadow-md">
      {/* Ruler body */}
      <rect x="0" y="10" width={width} height="50" rx="8" fill="#FFF9C4" stroke="#F9A825" strokeWidth="2" />

      {/* Wood grain decoration */}
      <rect x="4" y="14" width={width - 8} height="42" rx="6" fill="none" stroke="#FDD835" strokeWidth="0.5" opacity="0.5" />

      {/* Tape measure overlay */}
      {highlightCm !== null && (
        <rect
          x={leftPad}
          y="10"
          width={highlightCm * cmWidth}
          height="50"
          fill="#43A047"
          opacity="0.3"
          className="transition-all duration-300 pointer-events-none"
        />
      )}

      {/* Centimeter marks */}
      {Array.from({ length: maxCm + 1 }, (_, i) => {
        const x = leftPad + i * cmWidth;
        const isHighlight = highlightCm !== null && i <= highlightCm;
        return (
          <g key={i} className="cursor-pointer select-none" onClick={() => onSelect?.(i)}>
            {/* Large hit area for easy tapping */}
            <rect
              x={x - cmWidth / 2}
              y="10"
              width={cmWidth}
              height="50"
              fill="transparent"
            />
            {/* Main mark */}
            <line
              x1={x}
              y1={12}
              x2={x}
              y2={i % 5 === 0 ? 36 : 30}
              stroke={isHighlight ? '#E53935' : '#5D4037'}
              strokeWidth={i % 5 === 0 ? 2.5 : 1.5}
            />
            {/* Number label */}
            <text
              x={x}
              y={52}
              textAnchor="middle"
              fontSize={i % 5 === 0 ? '14' : '11'}
              fontWeight="900"
              fill={isHighlight ? '#E53935' : '#5D4037'}
              fontFamily="system-ui, sans-serif"
            >
              {i}
            </text>

            {/* Half-cm mark */}
            {i < maxCm && (
              <line
                x1={x + cmWidth / 2}
                y1={12}
                x2={x + cmWidth / 2}
                y2={24}
                stroke={isHighlight ? '#E5393580' : '#8D6E6380'}
                strokeWidth="1"
              />
            )}
          </g>
        );
      })}

      {/* Unit label */}
      <text x={width - 8} y={50} textAnchor="end" fontSize="10" fontWeight="800" fill="#F9A825" fontFamily="system-ui">
        cm
      </text>
    </svg>
  );
};

export const MeasurementPage: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const tracker = useLessonTracker(childId || '');

  const child = getStoredChild();
  const minNum = child?.minNumber ?? 1;
  const maxNum = child?.maxNumber ?? 10;

  const totalQuestions = getQuestionsPerLesson();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState<Question>(generateQuestion(0, minNum, maxNum));
  const [phase, setPhase] = useState<'playing' | 'done'>('playing');
  const [correctCount, setCorrectCount] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  // New interactive state
  const [measuredLength, setMeasuredLength] = useState<number>(0);

  const obj = OBJECTS[question.objectIndex];

  useEffect(() => {
    tracker.startSession();
  }, [childId]);

  const handleConfirm = async () => {
    if (feedback) return;
    const isCorrect = measuredLength === question.objectLength;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setCorrectCount((p) => p + 1);
      sounds.playSuccess();
    } else {
      sounds.playWrong();
    }

    await tracker.submitQuestionResult(`Đo ${obj.name}`, isCorrect);
    setResults(prev => [...prev, isCorrect]);

    if (isCorrect) {
      setTimeout(async () => {
        setFeedback(null);
        if (questionIndex + 1 >= totalQuestions) {
          sounds.playComplete();
          await tracker.completeSession();
          
          const finalCorrectCount = results.filter(Boolean).length + 1; // since isCorrect is true and results is updated
          const earned = checkAndAwardLessonBadge(childId || '', 'Đo Lường', finalCorrectCount, totalQuestions);
          setNewBadges(earned);
          
          setPhase('done');
        } else {
          setQuestion(generateQuestion(questionIndex + 1, minNum, maxNum));
          setQuestionIndex((p) => p + 1);
          setMeasuredLength(0); // Reset for next question
        }
      }, 1500);
    }
  };

  const handleRetry = () => {
    sounds.playClick();
    setFeedback(null);
  };

  const getEvaluation = () => {
    if (correctCount === totalQuestions) return 'Siêu giỏi! Bé đo lường chính xác tuyệt đối!';
    if (correctCount >= 3) return 'Tốt lắm! Hãy cẩn thận kéo đúng đến vạch cuối cùng của đồ vật nhé!';
    return 'Không sao! Bé đếm từ vạch 0 đến hết đồ vật nhé!';
  };

  const instructionText = `Đo chiều dài của ${obj.name}. Kéo thanh đo để đo đúng chiều dài nhé!`;

  const rulerTotalWidth = 280;
  const cmWidth = rulerTotalWidth / (RULER_MARKS - 1);
  const objectVisualWidth = question.objectLength * cmWidth;

  return (
    <main className="app-screen" style={{ background: 'linear-gradient(180deg, #E8F5E9 0%, #C8E6C9 100%)' }}>
      <div className="flex items-center justify-between p-6">
        <button
          className="grid h-10 w-10 place-items-center rounded-full bg-white text-xl shadow-sm"
          onClick={() => { sounds.playClick(); navigate(`/child/${childId}/lessons`); }}
        >
          ←
        </button>
        <div className="text-xl font-extrabold text-[#2E7D32]">ĐO CHIỀU DÀI</div>
        <SpeakButton text={instructionText} size="sm" />
      </div>

      {phase !== 'done' ? (
        <div className="flex flex-col items-center px-6 pb-6 text-center">
          <motion.h2
            key={questionIndex}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-extrabold text-gray-700"
          >
            {obj.name} dài bao nhiêu cm?
          </motion.h2>
          <p className="mt-1 font-bold text-gray-500">Chạm số trên thước hoặc kéo thanh trượt để đo nhé! 📏</p>

          <div className="relative mt-2 h-10 w-full">
            <AnimatePresence>
              {feedback === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-[#43A047]"
                >
                  Chính xác! 📐🎉
                </motion.div>
              )}
              {feedback === 'wrong' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center text-xl font-extrabold text-[#E53935]"
                >
                  Chưa đúng! Hãy kéo hoặc chạm cẩn thận nhé! 💡
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            key={`measure-${questionIndex}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 w-full rounded-[24px] bg-white/70 p-5 shadow-inner backdrop-blur-sm"
          >
            {/* Object to measure */}
            <div className="relative h-20 flex items-end mb-4" style={{ paddingLeft: '20px' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: objectVisualWidth }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="relative h-12 shadow-md flex items-center overflow-hidden rounded-xl border border-gray-300/40 bg-gray-100"
              >
                {/* 1cm Block subdivisions (Cuisenaire style) */}
                <div className="flex h-full w-full">
                  {Array.from({ length: question.objectLength }).map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center justify-between py-1 h-full border-r last:border-r-0 border-white/40 text-white font-black select-none"
                      style={{
                        backgroundColor: obj.color,
                        width: `${cmWidth}px`,
                        minWidth: `${cmWidth}px`,
                      }}
                    >
                      {/* Emoji in first block */}
                      {i === 0 ? (
                        <span className="text-xl leading-none">{obj.emoji}</span>
                      ) : (
                        <span className="h-4" />
                      )}
                      
                      {/* Counting Number inside the segment */}
                      <span className="text-[10px] leading-none bg-black/20 text-white h-4 w-4 rounded-full flex items-center justify-center border border-white/15">
                        {i + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <div className="absolute left-[20px] bottom-0 h-16 w-[2px] bg-[#E53935] opacity-50" />
              <motion.div
                initial={{ left: 20 }}
                animate={{ left: 20 + objectVisualWidth }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="absolute bottom-0 h-16 w-[2px] bg-[#E53935] opacity-50"
              />
            </div>

            <div className="mt-2">
              <Ruler
                maxCm={RULER_MARKS - 1}
                highlightCm={measuredLength}
                onSelect={(cm) => {
                  if (feedback !== 'correct') {
                    sounds.playClick();
                    setMeasuredLength(cm);
                  }
                }}
              />
            </div>

            {/* Slider to interact */}
            <div className="mt-6 flex flex-col items-center">
              <div className="mb-2 text-3xl font-extrabold text-[#43A047]">{measuredLength} cm</div>
              <input
                type="range"
                min="0"
                max={RULER_MARKS - 1}
                value={measuredLength}
                onChange={(e) => setMeasuredLength(Number(e.target.value))}
                disabled={feedback === 'correct'}
                className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#43A047]"
              />
              <div className="w-full flex justify-between mt-2 text-xs font-bold text-gray-400">
                <span>0</span>
                <span>{RULER_MARKS - 1}</span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3 w-full px-4">
            <button
              className="outline-pill"
              onClick={() => {
                sounds.playClick();
                setMeasuredLength(0);
                setFeedback(null);
              }}
              disabled={feedback === 'correct'}
            >
              Đặt lại
            </button>
            {feedback === 'wrong' ? (
              <button
                className="primary-pill"
                onClick={handleRetry}
              >
                Thử lại
              </button>
            ) : (
              <button
                className="primary-pill"
                onClick={handleConfirm}
                disabled={feedback === 'correct'}
              >
                Kiểm tra
              </button>
            )}
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
            <div className="mb-6 text-8xl">📏✨</div>
            <h2 className="mb-2 text-3xl font-extrabold text-[#2E7D32]">Hoàn thành!</h2>
            <div className="mb-4 text-2xl font-bold text-gray-700">
              Điểm: {correctCount}/{totalQuestions}
            </div>
            <p className="mb-8 font-bold text-gray-500">{getEvaluation()}</p>
            <button
              onClick={() => navigate(`/child/${childId}/lessons`)}
              className="w-full rounded-full bg-gradient-to-r from-[#2E7D32] to-[#66BB6A] py-4 text-xl font-extrabold text-white shadow-md active:scale-95"
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
