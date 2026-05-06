import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';
import { Child } from '../types';

// Child profile mapping with custom colors and icons
const childProfiles: Record<string, { color: string; bgClass: string; icon: string }> = {
  'Bé Bo': { color: '#F9A870', bgClass: 'child-card-bo', icon: '📖' },
  'Bé Thỏ': { color: '#A8D8EA', bgClass: 'child-card-tho', icon: '🐰' },
  'Bé Bi': { color: '#B8E0B0', bgClass: 'child-card-bi', icon: '🎈' },
  'Bé Sao': { color: '#F4B8C8', bgClass: 'child-card-sao', icon: '✨' },
};

export const ChildSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await client.get('/children/demo');
        setChildren(response.data);
      } catch (err) {
        setError('Lỗi khi tải danh sách trẻ');
        const anyErr = err as any;
        const baseUrl = client.defaults.baseURL || '(no baseURL)';
        const reqUrl = anyErr?.config?.url || '';
        const status = anyErr?.response?.status;
        const message = anyErr?.message;
        setDebugInfo(`baseURL=${baseUrl} url=${reqUrl} status=${status ?? 'n/a'} msg=${message ?? 'n/a'}`);
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
    navigate(`/child/${child.id}/home`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    hover: { scale: 1.02 },
    tap: { scale: 0.95 },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl text-teal font-bold">
          Đang tải...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 py-8 bg-gradient-to-b from-teal/10 to-blue/10">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate('/')}
          className="text-3xl text-teal hover:scale-110 transition"
        >
          ←
        </motion.button>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-4xl">
          🏠
        </motion.div>
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-teal mb-2">CHÀO CÁC BÉ!</h1>
        <p className="text-2xl text-text font-semibold">AI ĐÂY NHỈ? 🐻</p>
      </motion.div>

      {error && (
        <div className="bg-warning/20 text-text p-4 rounded-xl text-center mb-8 font-semibold">
          <div>{error}</div>
          {debugInfo ? <div className="mt-2 text-xs font-medium text-gray-700 break-words">{debugInfo}</div> : null}
        </div>
      )}

      {/* 2x2 Grid */}
      <motion.div
        className="grid grid-cols-2 gap-6 max-w-lg mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {children.map((child) => {
          const profile = childProfiles[child.name] || childProfiles['Bé Bo'];
          return (
            <motion.button
              key={child.id}
              onClick={() => selectChild(child)}
              className={`touch-target ${profile.bgClass} p-6 text-center relative group cursor-pointer`}
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {/* Decorative dot */}
              <motion.div
                className="absolute bottom-2 left-2 w-4 h-4 rounded-full"
                style={{ backgroundColor: profile.color }}
              />

              {/* Icon */}
              <motion.div className="text-6xl mb-4">{profile.icon}</motion.div>

              {/* Name label (pill/badge) */}
              <div className="label-pill inline-block">{child.name}</div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-12"
      >
        <button
          onClick={() => navigate('/')}
          className="text-gray-600 hover:text-teal transition text-lg"
        >
          ← Quay lại trang chủ
        </button>
      </motion.div>
    </div>
  );
};
