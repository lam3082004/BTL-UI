import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Child } from '../types';
import { getChildVisual, getStoredChild } from '../utils/childVisuals';

export const ChildHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const [child, setChild] = useState<Child | null>(null);

  useEffect(() => {
    const selected = getStoredChild();
    if (!selected) {
      navigate('/child-select');
      return;
    }
    setChild(selected);
  }, [navigate]);

  if (!child) return null;

  const visual = getChildVisual(child);

  return (
    <main className="app-screen px-8 py-10">
      <div className="screen-top">
        <button className="circle-button" onClick={() => navigate('/child-select')} aria-label="Quay lại">
          ←
        </button>
        <div className="kid-chip">
          <span style={{ backgroundColor: visual.color }}>{visual.avatar}</span>
          <strong>{child.name}</strong>
        </div>
      </div>

      <section className="mt-11 text-center">
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="app-title">
          CHÀO {child.name}!
        </motion.h1>
        <p className="app-subtitle">CÙNG KHÁM PHÁ NHÉ! ☀️</p>

        <motion.button
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate(`/child/${childId || child.id}/lessons`)}
          className="mt-9 w-full rounded-[24px] bg-gradient-to-r from-[#71C9EE] to-[#9DE8D0] shadow-soft p-9 text-white active:scale-95 transition"
        >
          <div className="text-5xl mb-4">📖 ✏️</div>
          <div className="text-3xl font-extrabold">BÀI HỌC</div>
        </motion.button>

        <div className="mt-7">
          <div className="h-3 rounded-full bg-white overflow-hidden shadow-sm">
            <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-[#71C9EE] via-[#9DE8D0] to-[#FFD39A]" />
          </div>
          <div className="mt-5 flex justify-between text-3xl text-yellow">
            {[0, 1, 2, 3, 4].map((item) => (
              <span key={item} className={item < 3 ? '' : 'opacity-25'}>
                ⭐
              </span>
            ))}
          </div>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          onClick={() => navigate(`/child/${child.id}/treasure`)}
          className="soft-card mt-8 w-full p-6 active:scale-95 transition"
        >
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-[18px] bg-[#FFD39A] text-4xl">🏛️</div>
          <strong className="text-xl text-gray-600">Rương kho báu ✨</strong>
        </motion.button>
      </section>
    </main>
  );
};
