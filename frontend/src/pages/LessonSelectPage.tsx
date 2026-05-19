import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Child, MathOperation } from '../types';
import { getChildVisual, getStoredChild } from '../utils/childVisuals';

const lessons = [
  { title: 'Học Đếm', icon: '🍎', color: 'bg-[#FFD39A]', operation: MathOperation.ADDITION },
  { title: 'Phép Cộng', icon: '+', color: 'bg-[#9DE8D0]', operation: MathOperation.ADDITION },
  { title: 'Phép Trừ', icon: '−', color: 'bg-[#F7A6B8]', operation: MathOperation.SUBTRACTION },
  { title: 'Phép Nhân', icon: '×', color: 'bg-[#9DD9E8]', operation: MathOperation.MULTIPLICATION },
  { title: 'Phép Chia', icon: '÷', color: 'bg-[#C78BE8]', operation: MathOperation.DIVISION },
];

export const LessonSelectPage: React.FC = () => {
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

  const startLesson = (operation: MathOperation, title: string) => {
    sessionStorage.setItem('selectedLesson', JSON.stringify({ operation, title }));
    navigate(`/child/${childId || child.id}/lesson`);
  };

  return (
    <main className="app-screen px-8 py-10">
      <div className="screen-top">
        <button className="circle-button" onClick={() => navigate(`/child/${child.id}/home`)} aria-label="Quay lại">
          ←
        </button>
        <div className="kid-chip">
          <span style={{ backgroundColor: visual.color }}>{visual.avatar}</span>
          <strong>{child.name}</strong>
        </div>
      </div>

      <section className="mt-12">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="app-title text-center">
          CHỌN BÀI HỌC
        </motion.h1>
        <p className="app-subtitle text-center">Hôm nay mình học gì nào? 💡</p>

        <div className="mt-9 grid grid-cols-2 gap-4">
          {lessons.map((lesson, index) => (
            <motion.button
              key={lesson.title}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => startLesson(lesson.operation, lesson.title)}
              className={`${lesson.color} lesson-tile`}
            >
              <span className="lesson-icon">{lesson.icon}</span>
              <strong>{lesson.title}</strong>
            </motion.button>
          ))}
        </div>
      </section>
    </main>
  );
};
