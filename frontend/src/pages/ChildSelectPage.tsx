import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';
import { Child } from '../types';
import { getChildVisual, getLocalChildren, normalizeChildConfig, setLocalChildren } from '../utils/childVisuals';

export const ChildSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await client.get('/children/demo');
        const normalizedChildren = response.data.map(normalizeChildConfig);
        setChildren(normalizedChildren);
        setLocalChildren(normalizedChildren);
      } catch (err) {
        setChildren(getLocalChildren());
        setError(null);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildren();
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
    <main className="app-screen px-8 py-10">
      <div className="screen-top">
        <button className="circle-button" onClick={() => navigate('/')} aria-label="Quay lại">
          ←
        </button>
        <div className="text-5xl">🏠</div>
      </div>

      <section className="mt-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="app-title">CHÀO CÁC BÉ!</h1>
          <p className="app-subtitle">AI ĐÂY NHỈ? 🤔</p>
        </motion.div>

        {error && <div className="soft-card p-4 mb-6 text-center font-bold text-red-500">{error}</div>}

        <div className="grid grid-cols-2 gap-x-10 gap-y-9">
          {children.map((child, index) => {
            const visual = getChildVisual(child, index);
            return (
              <motion.button
                key={child.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.06 }}
                onClick={() => selectChild(child)}
                className="soft-card min-h-[260px] px-4 py-5 flex flex-col items-center justify-between active:scale-95 transition"
              >
                <div className={`door ${visual.doorClass}`}>
                  <span className="door-knob" />
                </div>
                <span className="rounded-full px-5 py-2 text-white font-extrabold" style={{ backgroundColor: visual.color }}>
                  {child.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>
    </main>
  );
};
