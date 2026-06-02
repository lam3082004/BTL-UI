import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredChild, getChildVisual } from '../utils/childVisuals';
import { sounds } from '../utils/soundEffects';
import { checkAndAwardChallengeBadge } from '../utils/badges';
import { BadgeUnlockedModal } from '../components/BadgeUnlockedModal';

const MAX_HP = 3;
const THEME_ITEM = '🍎';

type Question = {
  a: number;
  b: number;
  options: number[];
  answer: number;
};

const generateQuestion = (minNum: number, maxNum: number): Question => {
  const safeMin = Math.max(2, minNum);
  const safeMax = Math.min(10, maxNum); // Giới hạn tối đa 10 quả để không tràn khung lựa chọn
  
  const finalMin = Math.min(safeMin, safeMax);
  const finalMax = Math.max(safeMin, safeMax);

  const answer = finalMin === finalMax ? finalMin : Math.floor(Math.random() * (finalMax - finalMin + 1)) + finalMin;
  const a = Math.floor(Math.random() * (answer - 1)) + 1; // 1 to answer-1
  const b = answer - a;
  
  const options = new Set<number>([answer]);
  while (options.size < 3) {
    let offset = Math.floor(Math.random() * 5) - 2; // -2 to +2
    if (offset === 0) offset = 3;
    const opt = answer + offset;
    if (opt > 0 && opt <= 12) options.add(opt);
  }
  
  return {
    a,
    b,
    answer,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  };
};

const HpBar: React.FC<{ hp: number; maxHp: number; label: string; isPlayer: boolean }> = ({
  hp,
  maxHp,
  label,
  isPlayer,
}) => {
  const percentage = (hp / maxHp) * 100;
  const barColor = hp === 3 
    ? (isPlayer ? 'bg-gradient-to-r from-[#4ECDC4] to-[#9DE8D0]' : 'bg-gradient-to-r from-[#FF7A7A] to-[#FF9A9E]') 
    : hp === 2 
      ? 'bg-gradient-to-r from-[#FFD39A] to-[#FFB74D]' 
      : 'bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E]';

  const glowColor = hp === 3 
    ? (isPlayer ? 'rgba(78, 205, 196, 0.4)' : 'rgba(255, 122, 122, 0.4)') 
    : hp === 2 
      ? 'rgba(255, 211, 154, 0.4)' 
      : 'rgba(255, 107, 107, 0.4)';

  return (
    <div className="flex flex-col w-36 sm:w-44 text-left">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-xs font-black uppercase tracking-wider text-gray-300">{label}</span>
        <span className="text-xs font-black text-white/80">{hp}/{maxHp} HP</span>
      </div>
      <div className="relative h-4 w-full rounded-full bg-white/10 p-0.5 overflow-hidden border border-white/10 shadow-[inset_0_1px_4px_rgba(0,0,0,0.3)]">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 85, damping: 14 }}
          className={`h-full rounded-full ${barColor}`}
          style={{ boxShadow: `0 0 10px ${glowColor}` }}
        />
      </div>
    </div>
  );
};

export const MonsterChallengePage: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  
  const child = getStoredChild();
  const minNum = child?.minNumber ?? 1;
  const maxNum = child?.maxNumber ?? 10;

  const [playerHp, setPlayerHp] = useState(MAX_HP);
  const [monsterHp, setMonsterHp] = useState(MAX_HP);
  const [question, setQuestion] = useState<Question>(generateQuestion(minNum, maxNum));
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const visual = child ? getChildVisual(child) : { avatar: '🧒', color: '#FFD39A' };
  
  const [monsterAnim, setMonsterAnim] = useState('');
  const [playerAnim, setPlayerAnim] = useState('');

  const handleAnswer = (selected: number) => {
    if (status !== 'playing') return;

    if (selected === question.answer) {
      // Correct: Attack monster
      sounds.playSuccess();
      setFeedback('correct');
      setMonsterAnim('animate-shake');
      setTimeout(() => {
        setMonsterAnim('');
        setFeedback(null);
      }, 500);
      
      const newMonsterHp = monsterHp - 1;
      setMonsterHp(newMonsterHp);
      
      if (newMonsterHp <= 0) {
        sounds.playComplete();
        setTimeout(() => {
          setStatus('won');
          const earned = checkAndAwardChallengeBadge(childId || '', 'monster-challenge');
          setNewBadges(earned);
        }, 600);
      } else {
        setTimeout(() => setQuestion(generateQuestion(minNum, maxNum)), 600);
      }
    } else {
      // Wrong: Monster attacks
      sounds.playWrong();
      setFeedback('wrong');
      setPlayerAnim('animate-shake bg-red-500/20');
      setTimeout(() => {
        setPlayerAnim('');
        setFeedback(null);
      }, 500);
      
      const newPlayerHp = playerHp - 1;
      setPlayerHp(newPlayerHp);
      
      if (newPlayerHp <= 0) {
        setTimeout(() => setStatus('lost'), 600);
      } else {
        setTimeout(() => setQuestion(generateQuestion(minNum, maxNum)), 600);
      }
    }
  };

  const renderVisuals = (count: number) => {
    return (
      <div className="flex flex-wrap justify-center gap-0.5">
        {Array.from({ length: count }).map((_, i) => (
          <span key={i} className="text-2xl drop-shadow">{THEME_ITEM}</span>
        ))}
      </div>
    );
  };

  return (
    <main className="app-screen overflow-hidden text-white relative" style={{ background: 'radial-gradient(circle at center, #231B42 0%, #0E0922 100%)' }}>
      {/* Background Star grid decorations */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="flex items-center justify-between p-6 relative z-10">
        <button className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xl backdrop-blur-sm active:scale-90 transition border border-white/10" onClick={() => { sounds.playClick(); navigate(`/child/${childId}/challenges`); }}>
          ←
        </button>
        <div className="text-xl font-black tracking-widest text-[#9DE8D0] uppercase">ĐÁNH QUÁI</div>
        <div className="w-10"></div>
      </div>

      {status === 'playing' ? (
        <div className="flex h-full flex-col p-6 pt-0 relative z-10">
          {/* Health Bars */}
          <div className="flex items-center justify-between px-2 mt-2">
            <div className={`transition-all rounded-2xl p-2.5 border border-white/5 backdrop-blur-sm bg-white/5 ${playerAnim}`}>
              <HpBar hp={playerHp} maxHp={MAX_HP} label={child?.name || 'Bé'} isPlayer={true} />
            </div>
            <div className="text-center mx-2">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-amber-500 italic drop-shadow-[0_2px_8px_rgba(234,179,8,0.5)]">VS</span>
            </div>
            <div className="rounded-2xl p-2.5 border border-white/5 backdrop-blur-sm bg-white/5 text-right">
              <HpBar hp={monsterHp} maxHp={MAX_HP} label="Quái Vật" isPlayer={false} />
            </div>
          </div>

          {/* Monster Arena with podiums */}
          <div className="relative mt-8 flex h-48 items-center justify-between px-8">
            {/* Player Avatar & Platform */}
            <div className="relative flex flex-col items-center">
              <motion.div
                animate={playerAnim ? { x: [-12, 12, -12, 12, 0] } : { y: [-3, 3, -3] }}
                transition={{ repeat: playerAnim ? 0 : Infinity, duration: playerAnim ? 0.35 : 2.5 }}
                className="grid h-24 w-24 place-items-center rounded-full text-6xl shadow-[0_0_20px_rgba(255,255,255,0.2)] border-4 border-white/90 relative z-10"
                style={{ backgroundColor: visual.color }}
              >
                {visual.avatar}
              </motion.div>
              {/* Podium */}
              <div className="absolute -bottom-3 h-5 w-28 rounded-full bg-cyan-500/20 blur-[2px] border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.4)]" />
            </div>

            {/* Battle Clash sparks when hits */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl z-20 pointer-events-none"
                >
                  💥
                </motion.div>
              )}
            </AnimatePresence>

            {/* Monster Avatar & Platform */}
            <div className="relative flex flex-col items-center">
              <motion.div
                animate={monsterAnim ? { x: [-12, 12, -12, 12, 0], filter: 'brightness(2)' } : { y: [-6, 6, -6] }}
                transition={{ repeat: monsterAnim ? 0 : Infinity, duration: monsterAnim ? 0.35 : 2.2 }}
                className="text-9xl drop-shadow-[0_0_25px_rgba(255,122,122,0.6)] relative z-10"
              >
                👾
              </motion.div>
              {/* Podium */}
              <div className="absolute -bottom-3 h-5 w-32 rounded-full bg-rose-500/20 blur-[2px] border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.4)]" />
            </div>
          </div>

          {/* Question Box (Concrete Math) */}
          <div className="mt-8 rounded-[28px] bg-white/10 p-5 backdrop-blur-md text-center shadow-lg border border-white/15 relative">
            <AnimatePresence>
              {feedback === 'correct' && (
                <motion.div initial={{ opacity: 0, y: 15, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-black text-[#9DE8D0] bg-white/15 border border-[#9DE8D0]/30 backdrop-blur px-5 py-1.5 rounded-full shadow-md whitespace-nowrap uppercase tracking-wider">
                  Chính xác! Đánh! 💥
                </motion.div>
              )}
              {feedback === 'wrong' && (
                <motion.div initial={{ opacity: 0, y: 15, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-black text-[#FF7A7A] bg-white/15 border border-[#FF7A7A]/30 backdrop-blur px-5 py-1.5 rounded-full shadow-md whitespace-nowrap uppercase tracking-wider">
                  Bé bị quái vật tấn công! 💔
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex items-center justify-center gap-5">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 w-28 flex flex-col items-center shadow-inner">
                <span className="text-4xl font-black text-white mb-2">{question.a}</span>
                {renderVisuals(question.a)}
              </div>
              <div className="text-4xl font-black text-[#9DE8D0] drop-shadow">+</div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-3.5 w-28 flex flex-col items-center shadow-inner">
                <span className="text-4xl font-black text-white mb-2">{question.b}</span>
                {renderVisuals(question.b)}
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="mt-8 grid grid-cols-1 gap-4 pb-8 flex-1 justify-end">
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => { sounds.playClick(); handleAnswer(opt); }}
                className="flex items-center justify-center gap-5 rounded-[22px] bg-gradient-to-r from-[#54C2F0] to-[#9DE8D0] py-4 text-3xl font-black shadow-md border-b-4 border-cyan-600 active:border-b-0 active:scale-95 transition-all"
              >
                <span>{opt}</span>
                <span className="opacity-30 text-xl font-normal">|</span>
                <div className="scale-75 flex justify-center">{renderVisuals(opt)}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid h-full place-items-center p-6 text-center relative z-10">
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm rounded-[32px] bg-white p-8 text-[#1E1B4B] shadow-2xl border-4"
              style={{ borderColor: status === 'won' ? '#9DE8D0' : '#FF7A7A' }}
            >
              <div className="text-8xl mb-5">{status === 'won' ? '🏆🎉' : '👽💀'}</div>
              <h2 className="text-4xl font-black mb-3 tracking-tight" style={{ color: status === 'won' ? '#4ECDC4' : '#FF6B6B' }}>
                {status === 'won' ? 'CHIẾN THẮNG!' : 'THUA RỒI!'}
              </h2>
              <p className="text-gray-500 font-bold text-sm leading-relaxed mb-8">
                {status === 'won' 
                  ? playerHp === MAX_HP 
                    ? 'Bé đã đánh bại quái vật xuất sắc mà không mất một giọt máu nào! Bé là siêu anh hùng toán học!' 
                    : 'Bé đã chiến thắng quái vật! Lần sau cố gắng không để mất máu nhé!'
                  : 'Không sao đâu, lần sau bé hãy đếm số lượng quả táo kĩ hơn một chút nhé!'}
              </p>
              <button
                onClick={() => {
                  sounds.playClick();
                  if (status === 'won') navigate(`/child/${childId}/challenges`);
                  else {
                    setPlayerHp(MAX_HP);
                    setMonsterHp(MAX_HP);
                    setQuestion(generateQuestion(minNum, maxNum));
                    setStatus('playing');
                  }
                }}
                className="w-full rounded-full bg-gradient-to-r from-[#FF9A9E] to-[#FECFEF] py-4 text-xl font-black text-white shadow-md active:scale-95 transition-transform"
              >
                {status === 'won' ? 'Quay lại' : 'Chơi lại'}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
      <BadgeUnlockedModal badgeIds={newBadges} onClose={() => setNewBadges([])} />
    </main>
  );
};
