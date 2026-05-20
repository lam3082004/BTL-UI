import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Child, EnabledLesson, LessonActivity, MathOperation } from '../types';
import { getChildVisual, getStoredChild, normalizeChildConfig } from '../utils/childVisuals';

const lessons = [
  { title: 'Học Đếm', hint: 'Kéo đủ số lượng', icon: '🍎', color: 'bg-[#FFD39A]', activity: LessonActivity.COUNTING, operation: MathOperation.ADDITION },
  { title: 'Phép Cộng', hint: 'Gộp thêm vào giỏ', icon: '+', color: 'bg-[#9DE8D0]', activity: MathOperation.ADDITION, operation: MathOperation.ADDITION },
  { title: 'Phép Trừ', hint: 'Bớt đi rồi đếm', icon: '−', color: 'bg-[#F7A6B8]', activity: MathOperation.SUBTRACTION, operation: MathOperation.SUBTRACTION },
  { title: 'Phép Nhân', hint: 'Nhiều nhóm bằng nhau', icon: '×', color: 'bg-[#9DD9E8]', activity: MathOperation.MULTIPLICATION, operation: MathOperation.MULTIPLICATION },
  { title: 'Phép Chia', hint: 'Chia đều từng nhóm', icon: '÷', color: 'bg-[#C78BE8]', activity: MathOperation.DIVISION, operation: MathOperation.DIVISION },
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
    setChild(normalizeChildConfig(selected));
  }, [navigate]);

  if (!child) return null;

  const visual = getChildVisual(child);

  const enabledLessons = child.allowedOperations?.length ? child.allowedOperations : [LessonActivity.COUNTING, MathOperation.ADDITION];
  const visibleLessons = lessons.filter((lesson) => enabledLessons.includes(lesson.activity));

  const startLesson = (activity: EnabledLesson, operation: MathOperation, title: string) => {
    sessionStorage.setItem('selectedLesson', JSON.stringify({ activity, operation, title }));
    navigate(`/child/${childId || child.id}/lesson`);
  };

  return (
    <main className="app-screen px-5 py-6">
      <div className="screen-top">
        <button className="circle-button" onClick={() => navigate(`/child/${child.id}/home`)} aria-label="Quay lại">
          ←
        </button>
        <div className="kid-chip">
          <span style={{ backgroundColor: visual.color }}>{visual.avatar}</span>
          <strong>{child.name}</strong>
        </div>
      </div>

      <section className="mt-7">
        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="app-title text-center">
          CHỌN BÀI HỌC
        </motion.h1>
        <p className="app-subtitle text-center">Hôm nay mình học gì nào? 💡</p>

        <div className="mt-7 grid grid-cols-2 gap-3">
          {visibleLessons.map((lesson, index) => (
            <motion.button
              key={lesson.title}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => startLesson(lesson.activity, lesson.operation, lesson.title)}
              className={`${lesson.color} lesson-tile min-h-[142px] gap-2 p-3 text-center`}
            >
              <span className="lesson-icon h-14 w-14 text-3xl">{lesson.icon}</span>
              <strong className="text-lg leading-tight">{lesson.title}</strong>
              <span className="text-xs font-extrabold leading-tight text-gray-600/80">{lesson.hint}</span>
            </motion.button>
          ))}
        </div>
        {!visibleLessons.length && (
          <div className="soft-card mt-8 p-5 text-center font-extrabold text-gray-500">
            Chưa có dạng bài nào được bật cho bé.
          </div>
        )}
      </section>
    </main>
  );
};
