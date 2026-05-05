import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';
import { Child } from '../types';

export const ChildSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        // For now, fetch from localStorage (mock data)
        // In production, this would come from parent's authenticated session
        const storedChildren = localStorage.getItem('children');
        if (storedChildren) {
          setChildren(JSON.parse(storedChildren));
        } else {
          // Mock children for demo
          const mockChildren: Child[] = [
            {
              id: 'child1',
              name: 'Bé Minh',
              avatar: '👧',
              minNumber: 1,
              maxNumber: 10,
              allowedOperations: [],
            },
            {
              id: 'child2',
              name: 'Bé Hùng',
              avatar: '👦',
              minNumber: 1,
              maxNumber: 20,
              allowedOperations: [],
            },
          ];
          setChildren(mockChildren);
          localStorage.setItem('children', JSON.stringify(mockChildren));
        }
      } catch (err) {
        setError('Lỗi khi tải danh sách trẻ');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildren();
  }, []);

  const selectChild = (child: Child) => {
    sessionStorage.setItem('selectedChildId', child.id);
    sessionStorage.setItem('selectedChild', JSON.stringify(child));
    navigate('/lesson');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    hover: { scale: 1.05, y: -10 },
    tap: { scale: 0.95 },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-primary">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 py-8 bg-gradient-to-b from-accent/20 to-secondary/20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-primary mb-2">Chọn cánh cửa của bé</h1>
        <p className="text-gray-600">Tap vào cánh cửa có tên của bé để bắt đầu</p>
      </motion.div>

      {error && (
        <div className="bg-warning text-white p-4 rounded-lg text-center mb-8">{error}</div>
      )}

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {children.map((child) => (
          <motion.button
            key={child.id}
            onClick={() => selectChild(child)}
            className="touch-target card-base bg-white border-4 border-primary p-8 text-center hover:shadow-xl cursor-pointer"
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <div className="text-6xl mb-4">{child.avatar || '👧'}</div>
            <div className="text-2xl font-bold text-primary">{child.name}</div>
            <div className="text-sm text-gray-500 mt-2">Tap để vào</div>
          </motion.button>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate('/')}
        className="mt-12 mx-auto block text-gray-600 hover:text-primary transition"
      >
        ← Quay lại
      </motion.button>
    </div>
  );
};
