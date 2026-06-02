import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Child } from '../types';
import { getChildVisual, getLocalChildren, normalizeChildConfig } from '../utils/childVisuals';

export const ChildSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setChildren(getLocalChildren());
    setIsLoading(false);
  }, []);

  const selectChild = (child: Child) => {
    const normalizedChild = normalizeChildConfig(child);
    sessionStorage.setItem('selectedChildId', child.id);
    sessionStorage.setItem('selectedChild', JSON.stringify(normalizedChild));
    navigate(`/child/${normalizedChild.id}/home`);
  };

  if (isLoading) {
    return (
      <main className="app-screen grid place-items-center">
        <div className="text-2xl text-[#71C9E8] font-extrabold">Đang tải...</div>
      </main>
    );
  }

  return (
    <main className="app-screen flex flex-col h-[100dvh] overflow-hidden px-6 py-8">
      <div className="screen-top shrink-0">
        <button className="circle-button" onClick={() => navigate('/')} aria-label="Quay lại">
          ←
        </button>
        <div className="text-5xl">🏠</div>
      </div>

      <div className="flex-grow flex flex-col min-h-0 mt-6 overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 shrink-0">
          <h1 className="app-title">CHÀO CÁC BÉ!</h1>
          <p className="app-subtitle">AI ĐÂY NHỈ? 🤔</p>
        </motion.div>

        <div className="flex-grow overflow-y-auto min-h-0 pr-1 pb-4">
          <div className="grid grid-cols-2 gap-4">
            {children.map((child, index) => {
              const visual = getChildVisual(child, index);
              return (
                <motion.button
                  key={child.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.06 }}
                  onClick={() => selectChild(child)}
                  className="soft-card min-h-[230px] px-3 py-5 flex flex-col items-center justify-center gap-4 active:scale-95 transition"
                >
                  {/* Door with avatar inside */}
                  <div className={`door relative shrink-0 ${visual.doorClass} transform hover:scale-[1.02] transition-transform`}>
                    <div className="absolute top-[14px] left-[12px] right-[12px] h-[54px] flex items-center justify-center text-3xl select-none">
                      {visual.avatar}
                    </div>
                    <span className="door-knob" />
                  </div>
                  {/* Name badge */}
                  <span className="max-w-full rounded-full px-4 py-2 text-center text-sm font-extrabold text-white truncate" style={{ backgroundColor: visual.color }}>
                    {child.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
};
