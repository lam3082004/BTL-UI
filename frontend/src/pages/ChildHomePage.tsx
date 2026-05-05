import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Child } from '../types';

// Child profile mapping
const childProfiles: Record<string, { color: string; icon: string }> = {
  'Bé Bo': { color: '#F9A870', icon: '📖' },
  'Bé Thỏ': { color: '#A8D8EA', icon: '🐰' },
  'Bé Bi': { color: '#B8E0B0', icon: '🎈' },
  'Bé Sao': { color: '#F4B8C8', icon: '✨' },
};

export const ChildHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const [child, setChild] = useState<Child | null>(null);

  useEffect(() => {
    // Get child from sessionStorage or state
    const childData = sessionStorage.getItem('selectedChild');
    if (childData) {
      setChild(JSON.parse(childData));
    }
  }, [childId]);

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-2xl text-teal font-bold">Đang tải...</div>
      </div>
    );
  }

  const profile = childProfiles[child.name] || childProfiles['Bé Bo'];

  return (
    <div className="min-h-screen w-full px-4 py-8 bg-gradient-to-b from-teal/10 to-blue/10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-between items-center mb-8"
      >
        <button
          onClick={() => navigate('/child-select')}
          className="text-3xl text-teal hover:scale-110 transition"
        >
          ←
        </button>
        <div className="text-center flex-1">
          <p className="text-lg text-gray-600 font-medium">Xin chào</p>
          <h1 className="text-2xl font-bold text-teal">{child.name}</h1>
        </div>
        <div className="text-4xl">{profile.icon}</div>
      </motion.div>

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-text mb-2">CHÀO {child.name.toUpperCase()}!</h2>
        <p className="text-xl text-gray-600">CÙNG KHÁM PHÁ NHÉ! ✨</p>
      </motion.div>

      <div className="max-w-md mx-auto space-y-6">
        {/* Main Lesson Card */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate(`/child/${child.id}/lesson`)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-br from-teal to-blue rounded-3xl p-8 text-white shadow-soft touch-target cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg mb-2 opacity-90">📚 Sách vở 📝</p>
              <h3 className="text-4xl font-bold">BÀI HỌC</h3>
            </div>
            <div className="text-6xl">→</div>
          </div>
        </motion.button>

        {/* Star Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-2"
        >
          {[0, 1, 2, 3, 4].map((idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              className={`text-4xl ${idx < 3 ? 'text-yellow' : 'text-gray-300'}`}
            >
              ⭐
            </motion.div>
          ))}
        </motion.div>

        {/* Treasure Chest Card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={() => navigate(`/child/${child.id}/treasure`)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-br from-yellow/30 to-peach/30 rounded-3xl p-6 text-center shadow-soft touch-target cursor-pointer border-2 border-yellow"
        >
          <div className="text-6xl mb-2">💰</div>
          <p className="text-2xl font-bold text-text">Rương kho báu</p>
          <p className="text-sm text-gray-600 mt-1">✨ Xem phần thưởng của bé</p>
        </motion.button>
      </div>
    </div>
  );
};
