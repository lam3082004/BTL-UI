import { useNavigate } from 'react-router-dom';
import { getChildVisual, getStoredChild } from '../utils/childVisuals';

const badges = [
  { icon: '⭐', name: 'Siêu Sao', unlocked: true },
  { icon: '🐟', name: 'Cá Vàng', unlocked: true },
  { icon: '💫', name: 'Hoa Mai', unlocked: true },
  { icon: '🔒', name: 'Bướm Bay', unlocked: false },
  { icon: '🔒', name: 'Cầu Vồng', unlocked: false },
  { icon: '🔒', name: 'Vô Địch', unlocked: false },
];

export const TreasurePage: React.FC = () => {
  const navigate = useNavigate();
  const child = getStoredChild();
  const visual = getChildVisual(child);

  return (
    <main className="app-screen px-8 py-10">
      <div className="screen-top">
        <button className="circle-button" onClick={() => navigate(child ? `/child/${child.id}/home` : '/child-select')} aria-label="Quay lại">
          ←
        </button>
        <div className="kid-chip">
          <span style={{ backgroundColor: visual.color }}>{visual.avatar}</span>
          <strong>{child?.name || 'Bé'}</strong>
        </div>
      </div>

      <section className="mt-10 text-center">
        <h1 className="app-title">THÀNH TÍCH CỦA {child?.name?.toUpperCase() || 'BÉ'}</h1>
        <div className="mt-3 text-3xl">⭐⭐⭐</div>

        <div className="mt-8 overflow-hidden rounded-[24px] bg-[#D9B3F3] shadow-soft">
          <div className="flex items-center justify-between bg-[#C58BEA] px-6 py-4 text-white">
            <strong className="text-xl">🏅 Huy Hiệu</strong>
            <strong className="text-lg">3/6</strong>
          </div>
          <div className="grid grid-cols-3 gap-y-7 px-6 py-7">
            {badges.map((badge, index) => (
              <div key={badge.name} className={badge.unlocked ? 'text-text' : 'text-gray-400 opacity-45'}>
                <div
                  className={`relative mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full text-4xl ${
                    index === 0 ? 'bg-[#FFE1A5]' : index === 1 ? 'bg-[#9DD9E8]' : 'bg-[#F7A6B8]'
                  }`}
                >
                  {badge.icon}
                  {badge.unlocked && (
                    <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-[#FFD85E] text-sm text-white">
                      ✓
                    </span>
                  )}
                </div>
                <strong className="text-sm">{badge.name}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-[24px] bg-[#FFF3DF] p-6 shadow-soft text-left">
          <h2 className="text-2xl font-extrabold mb-5">🎖️ CẤP ĐỘ</h2>
          <div className="flex justify-between text-4xl mb-5">
            {[0, 1, 2, 3, 4].map((item) => (
              <span key={item} className={item < 3 ? 'opacity-100' : 'opacity-25'}>
                ⭐
              </span>
            ))}
          </div>
          <div className="h-4 rounded-full bg-white overflow-hidden">
            <div className="h-full w-3/5 rounded-full bg-[#FFD39A]" />
          </div>
          <p className="mt-5 text-center font-bold text-gray-500">Tiếp tục học để mở khóa thêm nhé! 🚀</p>
        </div>
      </section>
    </main>
  );
};
