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
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 bg-gradient-to-b from-accent to-secondary/20 overflow-hidden">
      {/* Confetti */}
      {confettiPieces}

      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        {/* Celebration Text */}
        <motion.h1
          className="text-6xl font-bold text-primary mb-4"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          🎉 TUYỆT VỜI! 🎉
        </motion.h1>

        {/* Stars */}
        <motion.div
          className="flex justify-center gap-2 mb-8 text-5xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: i < stars ? 1 : 0.5 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              {i < stars ? '⭐' : '☆'}
            </motion.span>
          ))}
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div
            className="bg-white rounded-2xl p-6 mb-8 shadow-lg max-w-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="text-lg mb-3">
              <p className="text-gray-600">Trả lời đúng</p>
              <p className="text-3xl font-bold text-success">
                {stats.correctAnswers}/{stats.totalQuestions}
              </p>
            </div>
            <div className="text-lg">
              <p className="text-gray-600">Độ chính xác</p>
              <p className="text-3xl font-bold text-primary">{stats.accuracy}%</p>
            </div>
          </motion.div>
        )}

        {/* Continue Button */}
        <motion.button
          onClick={() => navigate('/child-select')}
          className="btn-primary bg-primary text-white text-xl py-4 px-8 rounded-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ⏭️ Bài tiếp theo
        </motion.button>

        <motion.button
          onClick={() => navigate('/')}
          className="mt-4 text-primary hover:underline"
          whileHover={{ scale: 1.05 }}
        >
          ← Về trang chủ
        </motion.button>
      </motion.div>
    </div>
  );
};
