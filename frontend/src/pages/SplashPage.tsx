import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();

  // Floating animation for decorative icons
  const floatVariants = {
    float: {
      y: [0, -20, 0],
      transition: { duration: 3, repeat: Infinity },
    },
  };

  const floatingIcons = [
    { emoji: '☀️', delay: 0, top: '15%', left: '10%' },
    { emoji: '🎈', delay: 0.5, top: '20%', right: '15%' },
    { emoji: '📚', delay: 1, top: '60%', right: '20%' },
  ];

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-b from-teal/20 to-blue/20">
      {/* TOP ZONE - DÀNH CHO BÉ */}
      <motion.div
        onClick={() => navigate('/child-select')}
        className="flex-1 flex flex-col items-center justify-center px-4 py-8 cursor-pointer relative overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Floating decorative icons */}
        {floatingIcons.map((icon, idx) => (
          <motion.div
            key={idx}
            className={`absolute text-4xl md:text-5xl ${icon.top ? `top-[${icon.top}]` : ''} ${icon.left ? `left-[${icon.left}]` : ''} ${icon.right ? `right-[${icon.right}]` : ''}`}
            variants={floatVariants}
            animate="float"
            transition={{ delay: icon.delay }}
          >
            {icon.emoji}
          </motion.div>
        ))}

        {/* Robot/child mascot area */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-6xl md:text-8xl mb-6 z-10"
        >
          🤖
        </motion.div>

        {/* Main text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl px-8 py-6 text-center shadow-soft z-10"
        >
          <p className="text-4xl font-bold text-teal">DÀNH CHO BÉ</p>
          <p className="text-lg text-gray-600 mt-2">Tap để bắt đầu</p>
        </motion.div>
      </motion.div>

      {/* BOTTOM ZONE - DÀNH CHO PHỤ HUYNH */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 bg-white/95">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center max-w-md"
        >
          {/* Parent icon */}
          <div className="text-6xl mb-4">👨‍👩‍👧</div>

          <h2 className="text-3xl font-bold text-text mb-2">DÀNH CHO PHỤ HUYNH</h2>
          <p className="text-gray-600 mb-8">Quản lý tiến độ học tập của con</p>

          {/* Buttons */}
          <div className="flex flex-col gap-4 w-full">
            {/* Login Button */}
            <button
              onClick={() => navigate('/parent-login')}
              className="w-full btn-secondary text-lg py-4 px-6"
            >
              Truy cập bảng điều khiển
            </button>

            {/* Google Button */}
            <button
              onClick={() => (window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`)}
              className="w-full flex items-center justify-center gap-3 btn-primary text-lg py-4 px-6"
            >
              <span>🔐</span>
              Đăng nhập / đăng ký Google
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
