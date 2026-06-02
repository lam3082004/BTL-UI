import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLessonTracker } from '../hooks/useLessonTracker';
import { sounds } from '../utils/soundEffects';
import { SpeakButton } from '../components/SpeakButton';
import { LessonProgressBar } from '../components/LessonProgressBar';
import { checkAndAwardLessonBadge } from '../utils/badges';
import { BadgeUnlockedModal } from '../components/BadgeUnlockedModal';
import { getQuestionsPerLesson } from '../hooks/useParentSettings';

type Question = {
  hour: number;
  minute: number;
};

const formatTime = (h: number, m: number): string => {
  return `${h}:${m.toString().padStart(2, '0')}`;
};

const generateQuestion = (level: number): Question => {
  const hour = Math.floor(Math.random() * 12) + 1;
  const minuteOptions = level < 2 ? [0] : level < 4 ? [0, 30] : [0, 15, 30, 45];
  const minute = minuteOptions[Math.floor(Math.random() * minuteOptions.length)];

  return { hour, minute };
};

const ClockFace: React.FC<{
  hour: number;
  minute: number;
  size: number;
  onSelectHour?: (h: number) => void;
  onSelectMinute?: (m: number) => void;
  disabled?: boolean;
}> = ({ hour, minute, size, onSelectHour, onSelectMinute, disabled }) => {
  const center = size / 2;
  const radius = size / 2 - 8;
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeDrag, setActiveDrag] = useState<'hour' | 'minute' | null>(null);

  // Angles
  const minuteAngle = (minute / 60) * 360;
  const hourAngle = ((hour % 12) / 12) * 360 + (minute / 60) * 30;

  // Hand endpoints
  const minuteLen = radius * 0.75;
  const hourLen = radius * 0.5;

  const minuteRad = ((minuteAngle - 90) * Math.PI) / 180;
  const hourRad = ((hourAngle - 90) * Math.PI) / 180;

  const mX = center + minuteLen * Math.cos(minuteRad);
  const mY = center + minuteLen * Math.sin(minuteRad);
  const hX = center + hourLen * Math.cos(hourRad);
  const hY = center + hourLen * Math.sin(hourRad);

  const markers = Array.from({ length: 12 }, (_, i) => {
    const angle = ((i * 30 - 90) * Math.PI) / 180;
    const outerR = radius - 4;
    const innerR = radius - 16;
    const textR = radius - 28;
    return {
      x1: center + outerR * Math.cos(angle),
      y1: center + outerR * Math.sin(angle),
      x2: center + innerR * Math.cos(angle),
      y2: center + innerR * Math.sin(angle),
      tx: center + textR * Math.cos(angle),
      ty: center + textR * Math.sin(angle),
      num: i === 0 ? 12 : i,
    };
  });

  const ticks = Array.from({ length: 60 }, (_, i) => {
    if (i % 5 === 0) return null; // Skip hour markers
    const angle = ((i * 6 - 90) * Math.PI) / 180;
    const outerR = radius - 4;
    const innerR = radius - 10;
    return {
      x1: center + outerR * Math.cos(angle),
      y1: center + outerR * Math.sin(angle),
      x2: center + innerR * Math.cos(angle),
      y2: center + innerR * Math.sin(angle),
    };
  });

  // Calculate red sector shading path (Time Timer style)
  const shadeRadius = radius * 0.88;
  const isLargeArc = minuteAngle > 180 ? 1 : 0;
  const endRad = ((minuteAngle - 90) * Math.PI) / 180;
  const endX = center + shadeRadius * Math.cos(endRad);
  const endY = center + shadeRadius * Math.sin(endRad);
  const sectorPath = minuteAngle > 0
    ? `M ${center} ${center} L ${center} ${center - shadeRadius} A ${shadeRadius} ${shadeRadius} 0 ${isLargeArc} 1 ${endX} ${endY} Z`
    : '';

  const updateTimeFromCoords = (x: number, y: number, type: 'hour' | 'minute') => {
    let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;

    if (type === 'hour') {
      let h = Math.round(angle / 30);
      if (h === 0) h = 12;
      onSelectHour?.(h);
    } else {
      let m = Math.round(angle / 90) * 15;
      if (m === 60) m = 0;
      onSelectMinute?.(m);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (disabled) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - center;
    const y = e.clientY - rect.top - center;
    const dist = Math.sqrt(x * x + y * y);

    if (dist < 15 || dist > radius + 20) return;

    // Drag hour hand if closer to center, else minute hand
    const dragType = dist < radius * 0.55 ? 'hour' : 'minute';
    setActiveDrag(dragType);
    updateTimeFromCoords(x, y, dragType);
    svg.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!activeDrag || disabled) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - center;
    const y = e.clientY - rect.top - center;
    updateTimeFromCoords(x, y, activeDrag);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (activeDrag) {
      setActiveDrag(null);
      const svg = svgRef.current;
      if (svg) {
        svg.releasePointerCapture(e.pointerId);
      }
    }
  };

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`touch-none ${disabled ? '' : 'cursor-grab active:cursor-grabbing'}`}
    >
      {/* Clock body shadow */}
      <circle cx={center} cy={center + 3} r={radius + 6} fill="rgba(0,0,0,0.08)" />

      {/* Clock body */}
      <defs>
        <radialGradient id="clockBg" cx="40%" cy="35%">
          <stop offset="0%" stopColor="#FFFEF7" />
          <stop offset="100%" stopColor="#FFF8E1" />
        </radialGradient>
      </defs>
      <circle cx={center} cy={center} r={radius + 6} fill="#5D4037" />
      <circle cx={center} cy={center} r={radius + 2} fill="#8D6E63" />
      <circle cx={center} cy={center} r={radius} fill="url(#clockBg)" />

      {/* Red sector shading representation for minutes */}
      {minuteAngle > 0 && (
        <path
          d={sectorPath}
          fill="rgba(229, 57, 53, 0.18)"
          stroke="rgba(229, 57, 53, 0.3)"
          strokeWidth="1.5"
          className="pointer-events-none"
        />
      )}

      {/* Minute ticks */}
      {ticks.map(
        (tick, i) =>
          tick && (
            <line key={i} x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2} stroke="#D7CCC8" strokeWidth="1.5" className="pointer-events-none" />
          )
      )}

      {/* Hour markers & Numbers */}
      {markers.map((m) => (
        <g
          key={m.num}
          className={disabled ? '' : 'cursor-pointer select-none'}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onSelectHour?.(m.num);
          }}
        >
          {/* Larger invisible hit area */}
          <circle cx={m.tx} cy={m.ty} r="14" fill="transparent" />
          <line x1={m.x1} y1={m.y1} x2={m.x2} y2={m.y2} stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" />
          <text
            x={m.tx}
            y={m.ty}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="16"
            fontWeight="800"
            fill="#5D4037"
            fontFamily="system-ui, sans-serif"
          >
            {m.num}
          </text>
        </g>
      ))}

      {/* Minute Helper Numbers (in Red, outer ring) */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = ((i * 30 - 90) * Math.PI) / 180;
        const minuteTextR = radius - 15;
        const mx = center + minuteTextR * Math.cos(angle);
        const my = center + minuteTextR * Math.sin(angle);
        const minuteVal = i * 5;
        const minuteStr = minuteVal.toString().padStart(2, '0');
        return (
          <g
            key={`min-helper-${i}`}
            className={disabled ? '' : 'cursor-pointer select-none'}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) onSelectMinute?.(minuteVal);
            }}
          >
            {/* Larger invisible hit area */}
            <circle cx={mx} cy={my} r="10" fill="transparent" />
            <text
              x={mx}
              y={my}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="10"
              fontWeight="800"
              fill="#E53935"
              opacity="0.85"
              fontFamily="system-ui, sans-serif"
            >
              {minuteStr}
            </text>
          </g>
        );
      })}

      {/* Hour hand */}
      <motion.line
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, x1: center, y1: center, x2: hX, y2: hY }}
        transition={{ type: 'spring', stiffness: 50 }}
        stroke="#5D4037"
        strokeWidth="6"
        strokeLinecap="round"
        className="pointer-events-none"
      />

      {/* Minute hand */}
      <motion.line
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, x1: center, y1: center, x2: mX, y2: mY }}
        transition={{ type: 'spring', stiffness: 50, delay: 0.1 }}
        stroke="#E53935"
        strokeWidth="4"
        strokeLinecap="round"
        className="pointer-events-none"
      />

      {/* Center dot */}
      <circle cx={center} cy={center} r="6" fill="#E53935" className="pointer-events-none" />
      <circle cx={center} cy={center} r="3" fill="#FFCDD2" className="pointer-events-none" />
    </svg>
  );
};


export const ClockPage: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const tracker = useLessonTracker(childId || '');

  const totalQuestions = getQuestionsPerLesson();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState<Question>(generateQuestion(0));
  const [phase, setPhase] = useState<'playing' | 'done'>('playing');
  const [correctCount, setCorrectCount] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  // User input state
  const [userHour, setUserHour] = useState(12);
  const [userMinute, setUserMinute] = useState(0);

  const correctAnswer = formatTime(question.hour, question.minute);

  useEffect(() => {
    tracker.startSession();
  }, [childId]);

  const handleConfirm = async () => {
    if (feedback) return;
    const isCorrect = userHour === question.hour && userMinute === question.minute;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setCorrectCount((p) => p + 1);
      sounds.playSuccess();
    } else {
      sounds.playWrong();
    }

    await tracker.submitQuestionResult(`Chỉnh đồng hồ thành ${correctAnswer}`, isCorrect);
    setResults(prev => [...prev, isCorrect]);

    if (isCorrect) {
      setTimeout(async () => {
        setFeedback(null);
        if (questionIndex + 1 >= totalQuestions) {
          sounds.playComplete();
          await tracker.completeSession();
          
          const finalCorrectCount = results.filter(Boolean).length + 1; // since isCorrect is true and results is updated
          const earned = checkAndAwardLessonBadge(childId || '', 'Xem Giờ', finalCorrectCount, totalQuestions);
          setNewBadges(earned);
          
          setPhase('done');
        } else {
          setQuestion(generateQuestion(questionIndex + 1));
          setQuestionIndex((p) => p + 1);
          // Don't reset user clock, let them adjust from current time
        }
      }, 1500);
    }
  };

  const handleRetry = () => {
    setFeedback(null);
  };

  const getEvaluation = () => {
    if (correctCount === totalQuestions) return 'Tuyệt vời! Bé chỉnh giờ siêu giỏi!';
    if (correctCount >= 3) return 'Tốt lắm! Nhớ chú ý kim phút nhé!';
    return 'Không sao! Bé nhớ: kim ngắn = giờ, kim dài = phút nhé!';
  };

  const instructionText = `Hãy chỉnh đồng hồ thành ${correctAnswer}. Chỉnh giờ và phút bằng các nút cộng trừ nhé!`;

  const getTimeGreeting = () => {
    if (question.hour <= 6) return '🌅 Buổi sáng sớm';
    if (question.hour <= 11) return '☀️ Buổi sáng';
    if (question.hour === 12) return '🌞 Buổi trưa';
    return '🌇 Buổi chiều';
  };

  return (
    <main className="app-screen" style={{ background: 'linear-gradient(180deg, #E3F2FD 0%, #BBDEFB 100%)' }}>
      <div className="flex items-center justify-between p-6">
        <button
          className="grid h-10 w-10 place-items-center rounded-full bg-white text-xl shadow-sm"
          onClick={() => { sounds.playClick(); navigate(`/child/${childId}/lessons`); }}
        >
          ←
        </button>
        <div className="text-xl font-extrabold text-[#1565C0]">XEM ĐỒNG HỒ</div>
        <SpeakButton text={instructionText} size="sm" />
      </div>

      {phase !== 'done' ? (
        <div className="flex flex-col items-center px-6 pb-6 text-center">
          <motion.h2
            key={`title-${questionIndex}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-extrabold text-gray-700"
          >
            Hãy chỉnh đồng hồ thành
            <span className="block mt-1 text-4xl text-[#1565C0]">{correctAnswer}</span>
          </motion.h2>
          <p className="mt-1 font-bold text-gray-500">{getTimeGreeting()}</p>

          <div className="relative mt-2 h-10 w-full">
            <AnimatePresence>
              {feedback === 'correct' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center text-2xl font-extrabold text-[#43A047]"
                >
                  Đúng rồi! ⏰🎉
                </motion.div>
              )}
              {feedback === 'wrong' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center text-xl font-extrabold text-[#E53935]"
                >
                  Chưa đúng! Đồng hồ đang chỉ {formatTime(userHour, userMinute)} 💡
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="mt-2 relative"
          >
            <ClockFace
              hour={userHour}
              minute={userMinute}
              size={220}
              onSelectHour={setUserHour}
              onSelectMinute={setUserMinute}
              disabled={feedback === 'correct'}
            />
          </motion.div>

          {/* Interactive Controls */}
          <div className="mt-6 w-full rounded-[24px] bg-white/70 p-5 shadow-inner backdrop-blur-sm grid grid-cols-2 gap-4">
            {/* Hour control */}
            <div className="flex flex-col items-center bg-[#EFEBE9] border-2 border-[#D7CCC8] p-3 rounded-[18px]">
              <span className="text-[#5D4037] font-extrabold text-sm mb-2">GIỜ</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUserHour(h => (h === 1 ? 12 : h - 1))}
                  className="h-10 w-10 rounded-full bg-white shadow-sm border border-[#D7CCC8] text-xl font-bold active:scale-95 text-[#5D4037]"
                >
                  -
                </button>
                <div className="w-8 text-center text-2xl font-extrabold text-[#5D4037]">
                  {userHour}
                </div>
                <button
                  onClick={() => setUserHour(h => (h === 12 ? 1 : h + 1))}
                  className="h-10 w-10 rounded-full bg-white shadow-sm border border-[#D7CCC8] text-xl font-bold active:scale-95 text-[#5D4037]"
                >
                  +
                </button>
              </div>
            </div>

            {/* Minute control */}
            <div className="flex flex-col items-center bg-[#FFEBEE] border-2 border-[#FFCDD2] p-3 rounded-[18px]">
              <span className="text-[#E53935] font-extrabold text-sm mb-2">PHÚT</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUserMinute(m => (m === 0 ? 45 : m - 15))}
                  className="h-10 w-10 rounded-full bg-white shadow-sm border border-[#FFCDD2] text-xl font-bold active:scale-95 text-[#E53935]"
                >
                  -
                </button>
                <div className="w-8 text-center text-2xl font-extrabold text-[#E53935]">
                  {userMinute.toString().padStart(2, '0')}
                </div>
                <button
                  onClick={() => setUserMinute(m => (m === 45 ? 0 : m + 15))}
                  className="h-10 w-10 rounded-full bg-white shadow-sm border border-[#FFCDD2] text-xl font-bold active:scale-95 text-[#E53935]"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3 w-full px-2">
            <button
              className="outline-pill"
              onClick={() => {
                sounds.playClick();
                setUserHour(12);
                setUserMinute(0);
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
            <div className="mb-6 text-8xl">⏰✨</div>
            <h2 className="mb-2 text-3xl font-extrabold text-[#1565C0]">Hoàn thành!</h2>
            <div className="mb-4 text-2xl font-bold text-gray-700">
              Điểm: {correctCount}/{totalQuestions}
            </div>
            <p className="mb-8 font-bold text-gray-500">{getEvaluation()}</p>
            <button
              onClick={() => navigate(`/child/${childId}/lessons`)}
              className="w-full rounded-full bg-gradient-to-r from-[#1565C0] to-[#42A5F5] py-4 text-xl font-extrabold text-white shadow-md active:scale-95"
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
