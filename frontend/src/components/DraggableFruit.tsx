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
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white border-2 border-secondary p-3 shadow-md hover:shadow-lg transition-all select-none rounded-lg"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 1.1 }}
        className="cursor-inherit"
      >
        <div className="text-3xl">{emoji}</div>
        <div className="text-xs font-bold text-primary mt-1">{value}</div>
      </motion.div>
    </div>
  );
};
