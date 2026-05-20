import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const SplashPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <main className="app-screen flex flex-col overflow-hidden">
      <motion.button
        type="button"
        onClick={() => navigate('/child-select')}
        className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-8 py-10 text-center"
        whileTap={{ scale: 0.98 }}
      >
        <motion.span
          className="absolute left-8 top-12 text-5xl"
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          ☀️
        </motion.span>
        <motion.span
          className="absolute right-10 top-20 text-5xl"
          animate={{ y: [0, -18, 0] }}
          transition={{ duration: 3.4, repeat: Infinity }}
        >
          🎈
        </motion.span>
        <motion.span
          className="absolute bottom-12 right-14 text-5xl"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 2.8, repeat: Infinity }}
        >
          📚
        </motion.span>

        <div className="mb-7 grid h-28 w-28 place-items-center rounded-full bg-white text-7xl shadow-soft">🤖</div>
        <div className="rounded-[24px] bg-white/90 px-8 py-6 shadow-soft">
          <h1 className="text-4xl font-extrabold text-[#5BBFB5]">DÀNH CHO BÉ</h1>
          <p className="mt-2 text-lg font-bold text-gray-500">Tap để bắt đầu</p>
        </div>
      </motion.button>

      <section className="rounded-t-[32px] bg-white px-8 py-10 text-center shadow-[0_-8px_24px_rgba(0,0,0,0.05)]">
        <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-[#FFF3DF] text-5xl">👨‍👩‍👧</div>
        <h2 className="text-3xl font-extrabold text-text">DÀNH CHO PHỤ HUYNH</h2>
        <p className="mt-2 text-base font-bold text-gray-500">Quản lý tiến độ học tập của con</p>
        <button className="primary-pill mt-7 w-full" onClick={() => navigate('/parent-login')}>
          Đăng nhập Google / đăng ký
        </button>
        <button className="outline-pill mt-4 w-full" onClick={() => navigate('/parent-dashboard')}>
          Truy cập bảng điều khiển
        </button>
      </section>
    </main>
  );
};
