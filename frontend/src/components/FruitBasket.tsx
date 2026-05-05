import { motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface FruitBasketProps {
  isActive: boolean;
  droppedCount: number;
  targetCount: number;
  onShake?: () => void;
}

export const FruitBasket: React.FC<FruitBasketProps> = ({
  isActive,
  droppedCount,
  targetCount,
  onShake,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'basket',
  });

  const shakeVariants = {
    shake: {
      x: [0, -5, 5, -5, 0],
      transition: { duration: 0.4, repeat: 0 },
    },
  };

  const isWrong = droppedCount > 0 && droppedCount !== targetCount;

  const handleWrongDrop = () => {
    if (isWrong && onShake) {
      onShake();
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col items-center justify-center p-8 border-4 transition-all rounded-lg ${
        isOver ? 'border-success bg-success/10 scale-105' : 'border-primary bg-white'
      } ${isWrong ? 'border-warning' : ''}`}
    >
      <motion.div
        variants={isWrong ? shakeVariants : undefined}
        animate={isWrong ? 'shake' : 'initial'}
        onAnimationComplete={handleWrongDrop}
      >
        <div className="text-6xl mb-4">🧺</div>
        <div className="text-2xl font-bold text-primary">
          {droppedCount}/{targetCount}
        </div>
        <div className="text-sm text-gray-600 mt-2">
          {droppedCount === targetCount && droppedCount > 0 ? '✅ Đúng rồi!' : 'Kéo quả vào đây'}
        </div>
      </motion.div>
    </div>
  );
};
