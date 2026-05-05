import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';

interface SessionStats {
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
}

export const RewardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    const sessionId = (location.state as any)?.sessionId;
    if (sessionId) {
      fetchStats(sessionId);
    }
  }, [location.state]);

  const fetchStats = async (sessionId: string) => {
    try {
      const response = await client.get(`/reports/session/${sessionId}/stats`);
      setStats(response.data);

      // Calculate stars based on accuracy
      const accuracy = response.data.accuracy;
      if (accuracy === 100) setStars(5);
      else if (accuracy >= 80) setStars(4);
      else if (accuracy >= 60) setStars(3);
      else if (accuracy >= 40) setStars(2);
      else setStars(1);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Confetti animation
  const confettiPieces = Array.from({ length: 50 }, (_, i) => (
    <motion.div
      key={i}
      className="fixed pointer-events-none"
      initial={{
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        opacity: 1,
      }}
      animate={{
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 20,
        opacity: 0,
      }}
      transition={{
        duration: 2 + Math.random() * 1,
        ease: 'easeIn',
      }}
    >
      <div className="text-2xl">{['🎉', '⭐', '🎊', '🏆', '🌟'][Math.floor(Math.random() * 5)]}</div>
    </motion.div>
  ));

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 bg-gradient-to-b from-teal/10 to-yellow/10 overflow-hidden">
      {/* Confetti */}
      {confettiPieces}

      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        {/* Party Popper */}
        <motion.div
          className="text-8xl mb-4"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          🎉
        </motion.div>

        {/* Celebration Text */}
        <motion.h1
          className="text-5xl font-bold text-teal mb-6"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          TUYỆT VỜI!
        </motion.h1>

        {/* Stars - Stagger animation */}
        <motion.div
          className="flex justify-center gap-3 mb-8 text-5xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {Array.from({ length: 3 }, (_, i) => (
            <motion.span
              key={i}
              className="text-yellow"
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
            >
              ⭐
            </motion.span>
          ))}
        </motion.div>

        {/* Stats Card */}
        {stats && (
          <motion.div
            className="bg-white rounded-3xl p-8 mb-8 shadow-soft max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-lg mb-4">
              <p className="text-gray-600 text-sm font-semibold">Trả lời đúng</p>
              <p className="text-4xl font-bold text-teal">
                {stats.correctAnswers}/{stats.totalQuestions}
              </p>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-teal to-green"
                initial={{ width: 0 }}
                animate={{ width: `${stats.accuracy}%` }}
                transition={{ delay: 1, duration: 1 }}
              />
            </div>
            <div className="text-lg">
              <p className="text-gray-600 text-sm font-semibold">Độ chính xác</p>
              <p className="text-3xl font-bold text-teal">{stats.accuracy}%</p>
            </div>
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.button
          onClick={() => navigate('/child-select')}
          className="btn-primary text-lg py-4 px-8 rounded-full mb-4"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ⏭️ Bài tiếp theo
        </motion.button>

        <motion.button
          onClick={() => navigate('/')}
          className="text-teal hover:text-teal/80 transition text-lg font-semibold"
          whileHover={{ scale: 1.05 }}
        >
          ← Về trang chủ
        </motion.button>
      </motion.div>
    </div>
  );
};
