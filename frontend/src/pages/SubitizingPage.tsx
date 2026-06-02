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

type Question = {
  count: number;
  options: number[];
};

const generateQuestion = (_level: number, minNum: number, maxNum: number): Question => {
  const safeMin = Math.max(1, minNum);
  const safeMax = Math.min(9, maxNum); // Giới hạn tối đa 9 chấm để không bị tràn hộp
  
  const finalMin = Math.min(safeMin, safeMax);
  const finalMax = Math.max(safeMin, safeMax);
  
  const count = finalMin === finalMax ? finalMin : Math.floor(Math.random() * (finalMax - finalMin + 1)) + finalMin;
  
  const options = new Set<number>([count]);
  while (options.size < 3) {
    let offset = Math.floor(Math.random() * 5) - 2; // -2 to +2
    if (offset === 0) offset = 3;
    const opt = count + offset;
    if (opt > 0 && opt <= 12) options.add(opt);
  }
  
  return {
    count,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  };
};

export const SubitizingPage: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const tracker = useLessonTracker(childId || '');

  const child = getStoredChild();
  const minNum = child?.minNumber ?? 1;
  const maxNum = child?.maxNumber ?? 10;
  
  const totalQuestions = getQuestionsPerLesson();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState<Question>(generateQuestion(0, minNum, maxNum));
  const [phase, setPhase] = useState<'showing' | 'guessing' | 'done'>('showing');
  const [correctCount, setCorrectCount] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    tracker.startSession();
  }, [childId]);
  
  useEffect(() => {
    if (phase === 'showing') {
      const timer = setTimeout(() => {
        setPhase('guessing');
      }, 2000); // Show for 2 seconds
      return () => clearTimeout(timer);
    }
  }, [phase, questionIndex]);

  const handleAnswer = async (selected: number) => {
    const isCorrect = selected === question.count;
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setFeedback('correct');
      sounds.playSuccess();
    } else {
      setFeedback('wrong');
      sounds.playWrong();
    }
    setResults(prev => [...prev, isCorrect]);

    await tracker.submitQuestionResult(`Đếm nhanh ${question.count} chấm`, isCorrect);

    setTimeout(async () => {
      setFeedback(null);
      if (questionIndex + 1 >= totalQuestions) {
        sounds.playComplete();
        await tracker.completeSession();
        
        const earned = checkAndAwardChallengeBadge(childId || '', 'subitizing');
        setNewBadges(earned);
        
        setPhase('done');
      } else {
        setQuestion(generateQuestion(questionIndex + 1, minNum, maxNum));
        setQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setPhase('showing');
      }
    }, 1000);
  };

  const getEvaluation = () => {
    if (correctCount === totalQuestions) return "Tuyệt vời! Bé có đôi mắt siêu tinh tường!";
    if (correctCount >= 3) return "Khá lắm! Bé cố gắng nhìn kĩ hơn chút nữa nhé!";
    return "Không sao đâu! Bé hãy tập trung đếm nhẩm trong đầu thật nhanh nhé!";
  };

  const instructionText = phase === 'showing'
    ? 'Nhìn kĩ các chấm trên màn hình nhé!'
    : 'Có bao nhiêu chấm? Chọn đáp án đúng nhé!';

  const renderDots = (count: number) => {
    // Generate random positions for the dots so it's not always a standard dice pattern, forcing subitizing
    return Array.from({ length: count }).map((_, i) => {
      const top = 10 + Math.random() * 70 + '%';
      const left = 10 + Math.random() * 70 + '%';
      return (
        <div
          key={i}
          className="absolute h-8 w-8 rounded-full bg-[#FF7A7A] shadow-sm"
          style={{ top, left }}
        />
      );
    });
  };

  return (
    <main className="app-screen bg-[#FFF0F4]">
      <div className="flex items-center justify-between p-6">
        <button className="grid h-10 w-10 place-items-center rounded-full bg-white text-xl shadow-sm" onClick={() => { sounds.playClick(); navigate(`/child/${childId}/challenges`); }}>
          ←
        </button>
        <div className="text-xl font-extrabold text-[#FF9A9E]">NHANH MẮT NHANH TRÍ</div>
        <SpeakButton text={instructionText} size="sm" />
      </div>

      {phase !== 'done' ? (
        <div className="flex flex-col items-center p-6 text-center mt-4 h-full">
          <h2 className="text-3xl font-extrabold text-gray-700 h-10">
            {phase === 'showing' ? 'Nhìn kĩ nhé!' : 'Có bao nhiêu chấm?'}
          </h2>

          <div className="relative h-10 w-full mt-4">
            <AnimatePresence>
              {feedback === 'correct' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-0 flex justify-center items-center text-2xl font-extrabold text-[#FF7A7A]">
                  Đúng rồi! 🎉
                </motion.div>
              )}
              {feedback === 'wrong' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-0 flex justify-center items-center text-2xl font-extrabold text-gray-400">
                  Chưa chính xác! 💦
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 relative h-64 w-64 rounded-[32px] bg-white shadow-inner border-4 border-[#FECFEF] overflow-hidden">
            <AnimatePresence>
              {phase === 'showing' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="absolute inset-0"
                >
                  {renderDots(question.count)}
                </motion.div>
              )}
            </AnimatePresence>
            
            {phase === 'guessing' && (
              <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-20">
                ❓
              </div>
            )}
          </div>

          <AnimatePresence>
            {phase === 'guessing' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 grid w-full grid-cols-3 gap-4"
              >
                {question.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => { sounds.playClick(); setSelectedOption(opt); }}
                    disabled={feedback !== null}
                    className={`rounded-[24px] py-6 text-4xl font-extrabold text-white shadow-md active:scale-95 transition ${
                      selectedOption === opt
                        ? 'bg-gradient-to-br from-[#71C9EE] to-[#9DE8D0] ring-4 ring-[#71C9EE]/40'
                        : 'bg-gradient-to-br from-[#FF9A9E] to-[#FECFEF]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          {phase === 'guessing' && (
            <div className="mt-8 grid grid-cols-2 gap-4 w-full">
              <button
                onClick={() => { sounds.playClick(); setSelectedOption(null); }}
                disabled={feedback !== null}
                className="outline-pill"
              >
                Đặt lại
              </button>
              <button
                onClick={() => selectedOption !== null && handleAnswer(selectedOption)}
                disabled={selectedOption === null || feedback !== null}
                className="primary-pill"
              >
                Kiểm tra
              </button>
            </div>
          )}

          {/* Progress bar at bottom */}
          <div className="w-full mt-4">
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
              <div className="text-8xl mb-6">👀✨</div>
              <h2 className="text-3xl font-extrabold mb-2 text-[#FF9A9E]">Hoàn thành!</h2>
              <div className="text-2xl font-bold text-gray-700 mb-4">Điểm: {correctCount}/{totalQuestions}</div>
              <p className="text-gray-500 font-bold mb-8">
                {getEvaluation()}
              </p>
              <button
                onClick={() => navigate(`/child/${childId}/challenges`)}
                className="w-full rounded-full bg-gradient-to-r from-[#FF9A9E] to-[#FECFEF] py-4 text-xl font-extrabold text-white shadow-md active:scale-95"
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
