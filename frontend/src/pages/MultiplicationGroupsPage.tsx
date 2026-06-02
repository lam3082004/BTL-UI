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
  groups: number;
  perGroup: number;
  item: string;
  basket: string;
};

const ITEMS = [
  { item: '🍎', basket: '🧺' },
  { item: '⭐', basket: '🎒' },
  { item: '🐟', basket: '🪣' },
  { item: '🍬', basket: '🎁' },
  { item: '🌸', basket: '🪴' },
];

const generateQuestion = (_level: number, minNum: number, maxNum: number): Question => {
  const pairs: [number, number][] = [];
  for (let g = 2; g <= 5; g++) {
    for (let p = 2; p <= 5; p++) {
      const product = g * p;
      if (product >= minNum && product <= maxNum) {
        pairs.push([g, p]);
      }
    }
  }

  if (pairs.length === 0) {
    for (let g = 1; g <= 3; g++) {
      for (let p = 1; p <= 3; p++) {
        const product = g * p;
        if (product >= minNum && product <= maxNum) {
          pairs.push([g, p]);
        }
      }
    }
  }

  if (pairs.length === 0) {
    pairs.push([2, 2]);
  }

  const [groups, perGroup] = pairs[Math.floor(Math.random() * pairs.length)];
  const theme = ITEMS[Math.floor(Math.random() * ITEMS.length)];

  return { groups, perGroup, item: theme.item, basket: theme.basket };
};

export const MultiplicationGroupsPage: React.FC = () => {
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
  const [modal, setModal] = useState<'correct' | 'wrong' | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  // Array to keep track of the order items were clicked. Elements are "gIndex-iIndex"
  const [countedItems, setCountedItems] = useState<string[]>([]);

  const totalItems = question.groups * question.perGroup;

  useEffect(() => {
    tracker.startSession();
  }, [childId]);

  const handleItemClick = (gIndex: number, iIndex: number) => {
    if (modal) return;
    const id = `${gIndex}-${iIndex}`;
    if (!countedItems.includes(id)) {
      sounds.playClick();
      const newCounted = [...countedItems, id];
      setCountedItems(newCounted);
    }
  };

  const checkAnswer = async () => {
    if (modal) return;
    const isCorrect = countedItems.length === totalItems;
    setCorrectCount((prev) => prev + (isCorrect ? 1 : 0));
    setResults((prev) => [...prev, isCorrect]);
    if (isCorrect) {
      sounds.playSuccess();
      await tracker.submitQuestionResult(`${question.groups} × ${question.perGroup} = ?`, true);
      setModal('correct');
    } else {
      sounds.playWrong();
      await tracker.submitQuestionResult(`${question.groups} × ${question.perGroup} = ?`, false);
      setModal('wrong');
    }
  };

  const continueLesson = async () => {
    sounds.playClick();
    if (modal === 'wrong') {
      setModal(null);
      setCountedItems([]);
      return;
    }
    setModal(null);
    if (questionIndex + 1 >= totalQuestions) {
      sounds.playComplete();
      await tracker.completeSession();
      
      const finalCorrectCount = results.filter(Boolean).length;
      const earned = checkAndAwardLessonBadge(childId || '', 'Phép Nhân', finalCorrectCount, totalQuestions);
      setNewBadges(earned);
      
      setPhase('done');
    } else {
      setCountedItems([]);
      setQuestion(generateQuestion(questionIndex + 1, minNum, maxNum));
      setQuestionIndex((prev) => prev + 1);
    }
  };

  const getEvaluation = () => {
    if (correctCount === totalQuestions) return 'Tuyệt vời! Bé đã biết đếm rất nhanh và chính xác!';
    if (correctCount >= 3) return 'Tốt lắm! Tiếp tục phát huy nhé!';
    return 'Cố lên! Hãy đếm kỹ từng phần tử trong các nhóm nha!';
  };

  const instructionText = `Có ${question.groups} nhóm, mỗi nhóm có ${question.perGroup} cái. Chạm vào tất cả để đếm nhé!`;

  const answer = totalItems;

  return (
    <main className="app-screen bg-[#F5F0FB] overflow-hidden">
      <div className="flex items-center justify-between p-6">
        <button
          className="grid h-10 w-10 place-items-center rounded-full bg-white text-xl shadow-sm"
          onClick={() => { sounds.playClick(); navigate(`/child/${childId}/lessons`); }}
        >
          ←
        </button>
        <div className="text-xl font-extrabold text-[#C78BE8]">NHÓM NHÂN</div>
        <SpeakButton text={instructionText} size="sm" />
      </div>

      {phase === 'playing' ? (
        <div className="flex flex-col items-center px-6 pb-6 text-center">
          <h2 className="text-2xl font-extrabold text-gray-700">
            Có tất cả bao nhiêu {question.item}?
          </h2>
          <div className="mt-2 text-4xl font-extrabold text-[#C78BE8]">
            {question.groups} × {question.perGroup} = ?
          </div>
          <p className="mt-2 text-gray-500 font-bold">
            Bé hãy bấm vào từng đồ vật để đếm nhé!
          </p>

          <div className="mt-4 flex flex-col items-center gap-1 w-full max-w-[360px] rounded-2xl bg-white p-4 shadow-sm border border-[#E3B6F5]/40">
            <div className="font-extrabold text-xs text-gray-400">PHÉP CỘNG BÉ ĐANG ĐẾM:</div>
            <div className="text-2xl font-black text-[#C78BE8] tracking-wider">
              {Array.from({ length: question.groups }).map((_, gi) => {
                const countVal = Array.from({ length: question.perGroup }).filter((_, ii) => countedItems.includes(`${gi}-${ii}`)).length;
                return countVal;
              }).join(' + ')} = {countedItems.length}
            </div>
            <div className="text-xs text-gray-400 font-bold mt-1">
              Đã đếm: {countedItems.length} / {totalItems} {question.item}
            </div>
          </div>

          <div className="mt-6 w-full max-w-[360px] rounded-[24px] bg-white p-5 shadow-inner">
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: question.groups }).map((_, gi) => {
                const groupCountedCount = Array.from({ length: question.perGroup }).filter((_, ii) => countedItems.includes(`${gi}-${ii}`)).length;
                return (
                  <div
                    key={gi}
                    className="relative rounded-[20px] border-2 border-dashed border-[#E3B6F5] bg-[#FBF5FF] p-3 shadow-sm"
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 rounded-full text-xs font-extrabold text-[#C78BE8] whitespace-nowrap shadow-sm border border-[#E3B6F5]">
                      Nhóm {gi + 1} ({groupCountedCount}/{question.perGroup})
                    </div>
                    <div className="text-center text-4xl mb-2">{question.basket}</div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {Array.from({ length: question.perGroup }).map((_, ii) => {
                        const id = `${gi}-${ii}`;
                        const countIndex = countedItems.indexOf(id);
                        const isCounted = countIndex !== -1;

                        return (
                          <button
                            key={ii}
                            onClick={() => handleItemClick(gi, ii)}
                            className={`relative text-3xl transition-transform active:scale-90 ${
                              isCounted ? 'scale-110 opacity-60' : 'animate-pulse-slow'
                            }`}
                          >
                            {question.item}
                            <AnimatePresence>
                              {isCounted && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF7A7A] text-[10px] font-extrabold text-white shadow"
                                >
                                  {countIndex + 1}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-[360px]">
            <button
              className="outline-pill"
              onClick={() => { sounds.playClick(); setCountedItems([]); }}
              disabled={modal !== null}
            >
              Đặt lại
            </button>
            <button
              className="primary-pill"
              onClick={checkAnswer}
              disabled={modal !== null}
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
            <div className="mb-6 text-8xl">🎯✨</div>
            <h2 className="mb-2 text-3xl font-extrabold text-[#C78BE8]">Hoàn thành!</h2>
            <div className="mb-4 text-2xl font-bold text-gray-700">
              Điểm: {correctCount}/{totalQuestions}
            </div>
            <p className="mb-8 font-bold text-gray-500">{getEvaluation()}</p>
            <button
              onClick={() => navigate(`/child/${childId}/lessons`)}
              className="w-full rounded-full bg-gradient-to-r from-[#C78BE8] to-[#E3B6F5] py-4 text-xl font-extrabold text-white shadow-md active:scale-95"
            >
              Quay lại
            </button>
          </motion.div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 px-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-xs rounded-[24px] bg-white p-8 text-center shadow-xl border-4 ${
              modal === 'correct' ? 'border-[#C78BE8]' : 'border-[#FF7A7A]'
            }`}
          >
            <div className="text-7xl mb-4">{modal === 'correct' ? '🎉' : '🤔'}</div>
            <h2 className="text-2xl font-extrabold mb-4 text-gray-800">
              {modal === 'correct' ? 'BÉ ĐÃ ĐẾM XONG!' : 'CHƯA CHÍNH XÁC!'}
            </h2>
            
            {modal === 'correct' ? (
              <div className="mb-6 rounded-[16px] bg-[#FBF5FF] p-4 text-[#C78BE8] border border-[#E3B6F5] text-left">
                <p className="font-extrabold text-center text-sm text-gray-500 mb-2">Ý nghĩa phép nhân:</p>
                <div className="space-y-3 font-bold text-gray-600">
                  <div className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg border border-dashed border-[#C78BE8]/30">
                    <span className="text-xs text-gray-400">Phép cộng:</span>
                    <span className="text-base font-extrabold text-[#C78BE8]">
                      {Array.from({ length: question.groups }).map(() => question.perGroup).join(' + ')} = {answer}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 text-center my-1 bg-[#F5E6FF] px-2 py-1 rounded">
                    Có <strong>{question.groups} nhóm</strong>, mỗi nhóm có <strong>{question.perGroup} {question.item}</strong>
                  </div>
                  <div className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg border border-dashed border-[#C78BE8]/30">
                    <span className="text-xs text-gray-400">Viết gọn là:</span>
                    <span className="text-lg font-black text-white bg-[#C78BE8] px-2.5 py-0.5 rounded-md">
                      {question.groups} × {question.perGroup} = {answer}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 rounded-[16px] bg-[#FFF0F0] p-4 text-[#FF7A7A] border border-[#FFA5A5] text-center font-bold">
                Bé mới đếm được {countedItems.length} {question.item}, đáp án đúng là {totalItems} {question.item}. Bé đếm lại nhé!
              </div>
            )}

            <button
              className={`w-full rounded-full py-4 text-white font-extrabold shadow-md active:scale-95 transition-all ${
                modal === 'correct' ? 'bg-[#9DE8D0]' : 'bg-[#FF7A7A]'
              }`}
              onClick={continueLesson}
            >
              {modal === 'correct' 
                ? (questionIndex + 1 >= totalQuestions ? 'Xem kết quả' : 'Tiếp theo') 
                : 'Thử lại'}
            </button>
          </motion.div>
        </div>
      )}
      <BadgeUnlockedModal badgeIds={newBadges} onClose={() => setNewBadges([])} />
    </main>
  );
};
