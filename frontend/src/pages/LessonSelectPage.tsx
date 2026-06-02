import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Child, EnabledLesson, LessonActivity, MathOperation } from '../types';
import { getChildVisual, getStoredChild, getLocalChildById, normalizeChildConfig } from '../utils/childVisuals';

type LessonDef = {
  title: string;
  hint: string;
  icon: string;
  color: string;
  activity: EnabledLesson;
  operation: MathOperation;
  dedicatedRoute?: string; // if set, navigate directly instead of generic /lesson
};

const lessons: LessonDef[] = [
  { title: 'Học Đếm', hint: 'Kéo đủ số lượng', icon: '🍎', color: 'bg-[#FFD39A]', activity: LessonActivity.COUNTING, operation: MathOperation.ADDITION },
  { title: 'Phép Cộng', hint: 'Gộp thêm vào giỏ', icon: '+', color: 'bg-[#9DE8D0]', activity: MathOperation.ADDITION, operation: MathOperation.ADDITION },
  { title: 'Phép Trừ', hint: 'Bắn bóng bay!', icon: '🎈', color: 'bg-[#F7A6B8]', activity: MathOperation.SUBTRACTION, operation: MathOperation.SUBTRACTION, dedicatedRoute: 'subtraction' },
  { title: 'Phép Nhân', hint: 'Nhiều nhóm bằng nhau', icon: '×', color: 'bg-[#9DD9E8]', activity: MathOperation.MULTIPLICATION, operation: MathOperation.MULTIPLICATION, dedicatedRoute: 'multiplication' },
  { title: 'Phép Chia', hint: 'Chia kẹo cho bạn', icon: '🍬', color: 'bg-[#C78BE8]', activity: MathOperation.DIVISION, operation: MathOperation.DIVISION, dedicatedRoute: 'division' },
  { title: 'Phân Số', hint: 'Chia bánh pizza!', icon: '🍕', color: 'bg-[#FFB74D]', activity: LessonActivity.FRACTIONS, operation: MathOperation.ADDITION, dedicatedRoute: 'fractions' },
  { title: 'Xem Giờ', hint: 'Đọc đồng hồ', icon: '⏰', color: 'bg-[#90CAF9]', activity: LessonActivity.TIME, operation: MathOperation.ADDITION, dedicatedRoute: 'clock' },
  { title: 'Đo Lường', hint: 'Đo chiều dài', icon: '📏', color: 'bg-[#A5D6A7]', activity: LessonActivity.MEASUREMENT, operation: MathOperation.ADDITION, dedicatedRoute: 'measurement' },
];

export const LessonSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const [child, setChild] = useState<Child | null>(null);

  useEffect(() => {
    let selected = getStoredChild();
    if (!selected && childId) {
      selected = getLocalChildById(childId);
      if (selected) {
        sessionStorage.setItem('selectedChild', JSON.stringify(selected));
        sessionStorage.setItem('selectedChildId', selected.id);
      }
    }
    if (!selected) {
      navigate('/child-select');
      return;
    }
    setChild(normalizeChildConfig(selected));
  }, [childId, navigate]);

  if (!child) return null;

  const visual = getChildVisual(child);

  const enabledLessons = child.allowedOperations?.length ? child.allowedOperations : [LessonActivity.COUNTING, MathOperation.ADDITION];
  const visibleLessons = lessons.filter((lesson) => enabledLessons.includes(lesson.activity));

  const startLesson = (lesson: LessonDef) => {
    if (lesson.dedicatedRoute) {
      navigate(`/child/${childId || child.id}/${lesson.dedicatedRoute}`);
    } else {
      sessionStorage.setItem('selectedLesson', JSON.stringify({ activity: lesson.activity, operation: lesson.operation, title: lesson.title }));
      navigate(`/child/${childId || child.id}/lesson`);
    }
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
              onClick={() => startLesson(lesson)}
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
