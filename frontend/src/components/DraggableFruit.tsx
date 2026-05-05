import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableFruitProps {
  id: string;
  value: number;
  emoji: string;
}

export const DraggableFruit: React.FC<DraggableFruitProps> = ({ id, value, emoji }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { value },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 1.15, rotate: 5 }}
      className="touch-target card-base bg-white border-2 border-secondary p-3 cursor-grab active:cursor-grabbing shadow-md hover:shadow-lg"
    >
      <div className="text-3xl">{emoji}</div>
      <div className="text-xs font-bold text-primary mt-1">{value}</div>
    </motion.div>
  );
};
