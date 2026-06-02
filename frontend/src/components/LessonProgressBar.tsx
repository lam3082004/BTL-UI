import { motion } from 'framer-motion';

interface LessonProgressBarProps {
  current: number;        // current question index (0-based)
  total: number;          // total questions
  results: boolean[];     // array of correct/wrong for completed questions
  onDotClick?: (index: number) => void;
}

export const LessonProgressBar: React.FC<LessonProgressBarProps> = ({ total, results, onDotClick }) => {
  const progress = Math.min(100, (results.length / total) * 100);

  return (
    <div className="mt-auto pt-4 pb-2 w-full">
      {/* Progress bar */}
      <div className="relative h-3 w-full rounded-full bg-gray-100 overflow-hidden shadow-inner">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #71C9EE 0%, #9DE8D0 50%, #FFD39A 100%)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        />
      </div>

      {/* Dots */}
      <div className="mt-3 flex justify-center gap-2 flex-wrap">
        {Array.from({ length: total }, (_, index) => {
          const isDone = index < results.length;
          const isCurrent = index === results.length && index < total;
          const isCorrect = isDone ? results[index] : undefined;

          const className = `grid h-8 w-8 place-items-center rounded-full text-xs font-extrabold transition-all duration-300 ${
            isCorrect === true
              ? 'bg-[#9DE8D0] text-white shadow-sm'
              : isCorrect === false
                ? 'bg-[#FF7A7A] text-white shadow-sm'
                : isCurrent
                  ? 'bg-[#71C9EE] text-white shadow-md scale-110 ring-2 ring-[#71C9EE]/30'
                  : 'bg-gray-100 text-gray-400'
          }`;

          if (onDotClick && isDone) {
            return (
              <button
                key={index}
                type="button"
                onClick={() => onDotClick(index)}
                className={`${className} cursor-pointer hover:opacity-85 active:scale-95`}
              >
                {isCorrect === true ? '✓' : isCorrect === false ? '×' : index + 1}
              </button>
            );
          }

          return (
            <div
              key={index}
              className={className}
            >
              {isCorrect === true ? '✓' : isCorrect === false ? '×' : index + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
};
