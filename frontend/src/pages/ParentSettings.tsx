import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { Parent } from '../types';

const settingsKey = 'numsenseParentSettings';

interface ParentSettingsState {
  soundEnabled: boolean;
  animationsEnabled: boolean;
  questionsPerLesson: number;
}

const defaultSettings: ParentSettingsState = {
  soundEnabled: true,
  animationsEnabled: true,
  questionsPerLesson: 4,
};

const readSettings = (): ParentSettingsState => {
  const saved = localStorage.getItem(settingsKey);
  if (!saved) return defaultSettings;

  try {
    return { ...defaultSettings, ...JSON.parse(saved) };
  } catch {
    return defaultSettings;
  }
};

const decodeParentFromToken = (rawToken: string | null): Parent | null => {
  if (!rawToken) return null;
  try {
    const payload = JSON.parse(window.atob(rawToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.sub || !payload.email) return null;
    return {
      id: payload.sub,
      googleId: '',
      email: payload.email,
      name: payload.name || payload.email,
      avatarUrl: payload.avatarUrl,
    };
  } catch {
    return null;
  }
};

export const ParentSettings: React.FC = () => {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [settings, setSettings] = useState(readSettings);
  const [parent, setParent] = useState<Parent | null>(() => decodeParentFromToken(localStorage.getItem('jwtToken')));

  useEffect(() => {
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!token) {
      setParent(null);
      return;
    }

    client
      .get('/auth/profile')
      .then((response) => setParent(response.data))
      .catch(() => setParent(decodeParentFromToken(localStorage.getItem('jwtToken'))));
  }, [token]);

  const apiBaseUrl = useMemo(() => client.defaults.baseURL || 'http://localhost:3001', []);

  const handleGoogleLogin = () => {
    window.location.href = `${apiBaseUrl}/auth/google`;
  };

  const updateSetting = <T extends keyof ParentSettingsState>(key: T, value: ParentSettingsState[T]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  return (
    <main className="app-screen px-8 py-9">
      <div className="screen-top items-center">
        <button className="circle-button" onClick={() => navigate('/parent-dashboard')} aria-label="Quay lại">
          ←
        </button>
        <div className="text-center">
          <p className="text-gray-400 font-extrabold">PHỤ HUYNH</p>
          <h1 className="app-title">CÀI ĐẶT</h1>
        </div>
        <div className="w-14" />
      </div>

      <section className="soft-card mt-9 p-6">
        <h2 className="mb-5 text-2xl font-extrabold">Tài khoản</h2>
        {token ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              {parent?.avatarUrl ? (
                <img src={parent.avatarUrl} alt="" className="h-14 w-14 rounded-full" />
              ) : (
                <span className="grid h-14 w-14 place-items-center rounded-full bg-[#9DE8D0] text-3xl">👤</span>
              )}
              <div className="min-w-0">
                <strong className="block truncate text-lg">{parent?.name || 'Phụ huynh'}</strong>
                <span className="block truncate text-sm font-bold text-gray-400">{parent?.email || 'Đã đăng nhập Google'}</span>
              </div>
            </div>
            <button className="outline-pill w-full" onClick={logout}>
              Đăng xuất
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="font-bold text-gray-500">Đang dùng bảng điều khiển trên thiết bị này. Đăng nhập Google để đồng bộ hồ sơ.</p>
            <button className="primary-pill w-full" onClick={handleGoogleLogin}>
              Đăng nhập với Google
            </button>
          </div>
        )}
      </section>

      <section className="soft-card mt-7 p-6">
        <h2 className="mb-5 text-2xl font-extrabold">Trải nghiệm học</h2>
        {[
          { key: 'soundEnabled' as const, label: 'Âm thanh phản hồi', enabled: settings.soundEnabled },
          { key: 'animationsEnabled' as const, label: 'Hiệu ứng minh họa', enabled: settings.animationsEnabled },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => updateSetting(item.key, !item.enabled)}
            className="mb-4 flex w-full items-center justify-between rounded-[16px] border-2 border-gray-100 p-4"
          >
            <strong className="text-lg">{item.label}</strong>
            <span className={`relative h-9 w-16 rounded-full ${item.enabled ? 'bg-[#9DE8D0]' : 'bg-gray-300'}`}>
              <motion.span layout className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow ${item.enabled ? 'left-8' : 'left-1'}`} />
            </span>
          </button>
        ))}

        <div className="rounded-[16px] border-2 border-gray-100 p-4">
          <div className="mb-4 flex items-center justify-between">
            <strong className="text-lg">Số câu mỗi bài</strong>
            <span className="rounded-[14px] bg-[#FFD39A] px-4 py-2 text-xl font-extrabold text-white">{settings.questionsPerLesson}</span>
          </div>
          <input
            type="range"
            min="3"
            max="8"
            value={settings.questionsPerLesson}
            onChange={(event) => updateSetting('questionsPerLesson', Number(event.target.value))}
            className="w-full"
          />
          <div className="mt-3 flex justify-between font-bold text-gray-400">
            <span>3</span>
            <span>8</span>
          </div>
        </div>
      </section>
    </main>
  );
};
