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
    <main className="app-screen flex flex-col items-center justify-center px-8 py-10">
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

        <motion.p variants={itemVariants} className="text-lg text-gray-600 mb-8">
          Bấm Google lần đầu để tạo tài khoản. Những lần sau hệ thống tự nhận diện, không cần đăng ký lại.
        </motion.p>

        <motion.button
          variants={itemVariants}
          onClick={token ? () => navigate('/parent-dashboard') : handleGoogleLogin}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary w-full max-w-sm text-lg font-bold py-4 px-6 mb-4"
        >
          {token ? 'Vào bảng điều khiển' : 'Đăng nhập với Google'}
        </motion.button>

        <motion.button
          variants={itemVariants}
          onClick={() => navigate('/parent-dashboard')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-secondary w-full max-w-sm text-lg font-bold py-4 px-6 mb-6 flex items-center justify-center gap-3 shadow-soft hover:shadow-lg transition-shadow"
        >
          Truy cập bảng điều khiển trên máy này
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
    </main>
  );
};
