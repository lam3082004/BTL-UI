import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { getStoredChild } from '../utils/childVisuals';

interface SessionStats {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
}

export const RewardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const child = getStoredChild();
  const state = location.state as {
    sessionId?: string;
    childName?: string;
    lessonTitle?: string;
    results?: boolean[];
  } | null;
  const [stats, setStats] = useState<SessionStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!state?.sessionId) return;
      try {
        const response = await client.get(`/reports/session/${state.sessionId}/stats`);
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };

    fetchStats();
  }, [state?.sessionId]);

  const fallbackStats = useMemo(() => {
    const results = state?.results || [];
    const correctAnswers = results.filter(Boolean).length;
    const totalQuestions = results.length || 4;
    return {
      totalQuestions,
      correctAnswers,
      wrongAnswers: totalQuestions - correctAnswers,
      accuracy: Math.round((correctAnswers / totalQuestions) * 100),
    };
  }, [state?.results]);

  const visibleStats = stats || fallbackStats;
  const childName = state?.childName || child?.name || 'bé';
  const lessonTitle = state?.lessonTitle || 'Học Đếm';

  return (
    <main className="app-screen px-8 py-16 flex flex-col items-center text-center">
      <div className="text-9xl mb-6">🥇</div>
      <h1 className="app-title">RẤT GIỎI!</h1>
      <p className="app-subtitle mt-2">
        Bé {childName.toUpperCase()} đã hoàn thành
        <br />
        bài học {lessonTitle}
      </p>

      <section className="soft-card mt-10 w-full p-8">
        <h2 className="text-lg font-extrabold text-gray-400 mb-6">KẾT QUẢ CỦA BÉ</h2>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#9DE8D0] text-white text-2xl">✓</span>
              <strong className="text-xl">Trả lời ĐÚNG</strong>
            </div>
            <strong className="text-2xl text-[#9DE8D0]">{visibleStats.correctAnswers}</strong>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-300 text-2xl">×</span>
              <strong className="text-xl">Chưa chính xác</strong>
            </div>
            <strong className="text-2xl text-red-300">{visibleStats.wrongAnswers}</strong>
          </div>
        </div>
      </section>

      <button className="primary-pill mt-10 w-full" onClick={() => navigate(`/child/${child?.id || ''}/lesson`)}>
        ↩ Chơi lại từ đầu
      </button>
      <button className="outline-pill mt-5 w-full" onClick={() => navigate(child ? `/child/${child.id}/lessons` : '/child-select')}>
        🏠 Về chọn bài học
      </button>
    </main>
  );
};
