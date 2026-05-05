import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

export const TreasurePage: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();

  // Treasure items (would come from backend in real app)
  const treasures = [
    { id: 1, emoji: '⭐', name: 'Sao vàng', color: 'from-yellow to-orange' },
    { id: 2, emoji: '💎', name: 'Kim cương', color: 'from-blue to-cyan' },
    { id: 3, emoji: '🏆', name: 'Cúp vàng', color: 'from-yellow to-peach' },
    { id: 4, emoji: '🌟', name: 'Sao sáng', color: 'from-pink to-purple' },
    { id: 5, emoji: '👑', name: 'Vương miện', color: 'from-yellow to-orange' },
    { id: 6, emoji: '🎖️', name: 'Huy chương', color: 'from-blue to-cyan' },
    { id: 7, emoji: '💰', name: 'Đồng xu', color: 'from-yellow to-peach' },
    { id: 8, emoji: '🎁', name: 'Quà tặng', color: 'from-pink to-red' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen w-full px-4 py-8 bg-gradient-to-b from-yellow/10 to-pink/10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-between items-center mb-8"
      >
        <button
          onClick={() => navigate(`/child/${childId}/home`)}
          className="text-3xl text-teal hover:scale-110 transition"
        >
          ←
        </button>
        <h1 className="text-3xl font-bold text-teal">Rương kho báu</h1>
        <div className="text-3xl">💰</div>
      </motion.div>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center text-gray-600 mb-12 text-lg"
      >
        Những phần thưởng bé đã thu thập 🌟
      </motion.p>

      {/* Treasure Grid */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {treasures.map((treasure) => (
          <motion.div
            key={treasure.id}
            className={`bg-gradient-to-br ${treasure.color} rounded-3xl p-8 text-center shadow-soft touch-target cursor-pointer group`}
            variants={itemVariants}
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Treasure emoji */}
            <motion.div
              className="text-6xl mb-4 group-hover:scale-125 transition-transform"
            >
              {treasure.emoji}
            </motion.div>

            {/* Treasure name */}
            <p className="text-sm font-bold text-text">{treasure.name}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Back button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-12"
      >
        <button
          onClick={() => navigate(`/child/${childId}/home`)}
          className="text-teal hover:text-teal/80 transition text-lg font-semibold"
        >
          ← Quay lại nhà
        </button>
      </motion.div>
    </div>
  );
};
