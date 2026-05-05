import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 bg-gradient-to-b from-primary/10 to-secondary/10">
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo / Title */}
        <motion.h1 variants={itemVariants} className="text-6xl font-bold text-primary mb-4">
          🧮 NumSense
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-xl text-gray-600 mb-12 max-w-md mx-auto"
        >
          Giúp con bạn yêu thích toán học
        </motion.p>

        {/* Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6 max-w-sm mx-auto">
          {/* Child Button */}
          <button
            onClick={() => navigate('/child-select')}
            className="btn-primary bg-primary text-white text-xl py-6 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            👶 DÀNH CHO BÉ
          </button>

          {/* Parent Button */}
          <button
            onClick={() => navigate('/parent-login')}
            className="btn-secondary bg-secondary text-gray-800 text-xl py-6 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            👨‍👩‍👧 DÀNH CHO PHỤ HUYNH
          </button>
        </motion.div>

        <motion.p variants={itemVariants} className="mt-8 text-sm text-gray-500">
          Dành cho trẻ em bị dyscalculia
        </motion.p>
      </motion.div>
    </div>
  );
};
