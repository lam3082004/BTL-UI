import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BADGES } from '../utils/badges';
import { sounds } from '../utils/soundEffects';

interface BadgeUnlockedModalProps {
  badgeIds: string[];
  onClose: () => void;
}

export const BadgeUnlockedModal: React.FC<BadgeUnlockedModalProps> = ({ badgeIds, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (badgeIds.length > 0) {
      // Play celebratory sound when the modal is shown
      sounds.playComplete();
    }
  }, [badgeIds, currentIndex]);

  if (badgeIds.length === 0 || currentIndex >= badgeIds.length) return null;

  const currentBadgeId = badgeIds[currentIndex];
  const badge = BADGES.find((b) => b.id === currentBadgeId);

  if (!badge) return null;

  const handleNext = () => {
    sounds.playClick();
    if (currentIndex + 1 < badgeIds.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-8 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          className="w-full max-w-sm rounded-[32px] bg-white p-8 text-center shadow-2xl border-4"
          style={{ borderColor: badge.color }}
        >
          <div className="text-7xl mb-4 animate-bounce">🎉</div>
          <h3 className="text-sm font-black tracking-widest text-gray-400 uppercase">HUY HIỆU MỚI!</h3>

          <div
            className="mx-auto my-6 grid h-28 w-28 place-items-center rounded-full text-6xl shadow-lg relative overflow-hidden"
            style={{ backgroundColor: badge.color }}
          >
            {/* Spinning background glow */}
            <div className="absolute inset-0 bg-white/20 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="relative z-10">{badge.icon}</span>
          </div>

          <h2 className="text-2xl font-black text-gray-800 mb-2">{badge.name}</h2>
          <p className="text-gray-500 font-bold text-sm mb-6 leading-relaxed">
            {badge.description}
          </p>

          <button
            onClick={handleNext}
            className="w-full rounded-full bg-gradient-to-r from-[#FFD39A] to-[#FFB74D] py-4 text-lg font-black text-white shadow-md active:scale-95 transition-transform"
          >
            {currentIndex + 1 < badgeIds.length ? 'Xem tiếp 🚀' : 'Nhận huy hiệu 🚀'}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
