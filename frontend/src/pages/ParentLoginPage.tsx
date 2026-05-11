import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import client from '../api/client';

export const ParentLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      navigate('/parent-dashboard');
    }
  }, [token, navigate]);

  const handleGoogleLogin = () => {
    const apiBaseUrl = client.defaults.baseURL || 'http://localhost:3001';
    window.location.href = `${apiBaseUrl}/auth/google`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 bg-gradient-to-b from-teal/10 to-blue/10">
      <motion.div
        className="text-center max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo/Branding */}
        <motion.div variants={itemVariants} className="mb-8">
          <p className="text-teal text-sm font-bold">NumSense</p>
          <h1 className="text-6xl font-bold text-text">👨‍👩‍👧‍👦</h1>
        </motion.div>

        {/* Title */}
        <motion.h2 variants={itemVariants} className="text-4xl font-bold text-text mb-2">
          PHẦN PHỤ HUYNH
        </motion.h2>

        {/* Subtitle */}
        <motion.p variants={itemVariants} className="text-lg text-gray-600 mb-12">
          Đăng nhập để xem tiến độ học tập của con
        </motion.p>

        {/* Google Login Button */}
        <motion.button
          variants={itemVariants}
          onClick={handleGoogleLogin}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full max-w-sm text-lg font-bold py-4 px-6 mb-6 flex items-center justify-center gap-3 shadow-soft hover:shadow-lg transition-shadow"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Đăng nhập với Google
        </motion.button>

        {/* Back Button */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate('/')}
          className="text-teal hover:text-teal/80 transition text-lg font-semibold"
        >
          ← Quay lại trang chủ
        </motion.button>
      </motion.div>
    </div>
  );
};
