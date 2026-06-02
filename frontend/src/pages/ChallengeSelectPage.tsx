import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getStoredChild } from '../utils/childVisuals';
import { sounds } from '../utils/soundEffects';

const challenges = [
  {
    id: 'monster-challenge',
    title: 'Đánh Quái Vật',
    icon: '👾',
    description: 'Trả lời đúng phép cộng để trừ máu quái vật!',
    gradient: 'from-[#FF8E8E] to-[#FF9A9E]',
  },
  {
    id: 'balance-scale',
    title: 'Cân Thăng Bằng',
    icon: '⚖️',
    description: 'So sánh số lượng táo trên hai đĩa cân nhé!',
    gradient: 'from-[#54C2F0] to-[#71C9EE]',
  },
  {
    id: 'subitizing',
    title: 'Nhanh Mắt Nhanh Trí',
    icon: '👀',
    description: 'Nhìn nhanh chớp nhoáng và đố bé có mấy chấm?',
    gradient: 'from-[#4ECDC4] to-[#9DE8D0]',
  },
];

export const ChallengeSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const child = getStoredChild();

  if (!child) {
    navigate('/child-select');
    return null;
  }

  return (
    <main className="app-screen px-6 py-8" style={{ background: 'radial-gradient(circle at top right, #FFF3F3 0%, #E8F8FF 100%)' }}>
      <div className="screen-top items-center">
        <button className="circle-button" onClick={() => { sounds.playClick(); navigate(`/child/${child.id}/home`); }} aria-label="Quay lại">
          ←
        </button>
        <div className="text-center flex-1">
          <p className="text-xs font-black tracking-widest text-[#71C9EE] uppercase">ĐẤU TRƯỜNG</p>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">THỬ THÁCH</h1>
        </div>
        <div className="w-12"></div> {/* Spacer for centering */}
      </div>

      <section className="mt-10 flex flex-col gap-5">
        {challenges.map((chal, index) => (
          <motion.button
            key={chal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, type: 'spring', stiffness: 120 }}
            onClick={() => { sounds.playClick(); navigate(`/child/${child.id}/${chal.id}`); }}
            className="w-full rounded-[28px] bg-white p-5 shadow-soft border-2 border-transparent active:border-white/50 active:scale-95 transition flex items-center gap-5 text-left relative overflow-hidden group"
            style={{
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.03)',
            }}
          >
            {/* Glowing gradient background overlay on active */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 group-active:opacity-10 bg-gradient-to-r ${chal.gradient} transition-all duration-300`} />
            
            <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-[20px] text-4xl shadow-md text-white bg-gradient-to-br ${chal.gradient} relative z-10`}>
              {chal.icon}
            </div>
            
            <div className="relative z-10 flex-1">
              <h2 className="text-xl font-extrabold text-gray-800 leading-tight">{chal.title}</h2>
              <p className="mt-1 text-xs font-bold text-gray-400 leading-snug">{chal.description}</p>
            </div>
            
            <span className="text-2xl font-black text-gray-300 group-active:text-gray-600 transition pr-2">→</span>
          </motion.button>
        ))}
      </section>
    </main>
  );
};
