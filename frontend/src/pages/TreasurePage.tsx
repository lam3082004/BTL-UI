import { useNavigate } from 'react-router-dom';
import { getChildVisual, getStoredChild } from '../utils/childVisuals';
import { BADGES, getChildProgress } from '../utils/badges';

export const TreasurePage: React.FC = () => {
  const navigate = useNavigate();
  const child = getStoredChild();
  const visual = getChildVisual(child);
  const progress = getChildProgress(child?.id || '');
  const unlockedCount = BADGES.filter((b) => progress.earnedBadges.includes(b.id)).length;

  return (
    <main className="app-screen flex flex-col h-[100dvh] overflow-hidden px-8 py-10">
      <div className="screen-top shrink-0">
        <button className="circle-button" onClick={() => navigate(child ? `/child/${child.id}/home` : '/child-select')} aria-label="Quay lại">
          ←
        </button>
        <div className="kid-chip">
          <span style={{ backgroundColor: visual.color }}>{visual.avatar}</span>
          <strong>{child?.name || 'Bé'}</strong>
        </div>
      </div>

      <section className="flex-grow overflow-y-auto min-h-0 pr-1 pb-6 mt-10 text-center">
        <h1 className="app-title">THÀNH TÍCH CỦA {child?.name?.toUpperCase() || 'BÉ'}</h1>
        <div className="mt-3 text-3xl">⭐⭐⭐</div>

        <div className="mt-8 overflow-hidden rounded-[24px] bg-[#D9B3F3] shadow-soft">
          <div className="flex items-center justify-between bg-[#C58BEA] px-6 py-4 text-white">
            <strong className="text-xl">🏅 Huy Hiệu</strong>
            <strong className="text-lg">
              {unlockedCount}/{BADGES.length}
            </strong>
          </div>
          <div className="grid grid-cols-3 gap-y-7 px-4 py-7">
            {BADGES.map((badge) => {
              const isUnlocked = progress.earnedBadges.includes(badge.id);
              return (
                <div key={badge.id} className={isUnlocked ? 'text-text' : 'text-gray-400 opacity-60'}>
                  <div
                    className="relative mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full text-4xl shadow-sm transition-transform hover:scale-105"
                    style={{ backgroundColor: isUnlocked ? badge.color : '#E2EFF1' }}
                    title={badge.description}
                  >
                    <span className={isUnlocked ? '' : 'filter grayscale opacity-30 select-none'}>
                      {badge.icon}
                    </span>
                    {isUnlocked ? (
                      <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-[#FFD85E] text-sm text-white border-2 border-white font-extrabold shadow-sm">
                        ✓
                      </span>
                    ) : (
                      <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-gray-300 text-xs text-white border-2 border-white font-extrabold shadow-sm">
                        🔒
                      </span>
                    )}
                  </div>
                  <strong className="text-sm block leading-tight truncate px-1">{badge.name}</strong>
                  <span className="text-[10px] text-gray-500 font-bold block mt-0.5 leading-none">{badge.description}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 rounded-[24px] bg-[#FFF3DF] p-6 shadow-soft text-left">
          <h2 className="text-2xl font-extrabold mb-5">🎖️ CẤP ĐỘ</h2>
          <div className="flex justify-between text-4xl mb-5">
            {[0, 1, 2, 3, 4].map((item) => (
              <span key={item} className={item < unlockedCount ? 'opacity-100' : 'opacity-20'}>
                ⭐
              </span>
            ))}
          </div>
          <div className="h-4 rounded-full bg-white overflow-hidden">
            <div
              className="h-full rounded-full bg-[#FFD39A] transition-all duration-500"
              style={{ width: `${(unlockedCount / BADGES.length) * 100}%` }}
            />
          </div>
          <p className="mt-5 text-center font-bold text-gray-500">Tiếp tục học để mở khóa thêm nhé! 🚀</p>
        </div>
      </section>
    </main>
  );
};
