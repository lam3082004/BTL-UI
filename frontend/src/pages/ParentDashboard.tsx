import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { Child, Parent } from '../types';
import { getChildVisual, getLocalChildren, normalizeChildConfig, setLocalChildren } from '../utils/childVisuals';

export const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [parent, setParent] = useState<Parent | null>(null);
  const [expandedChild, setExpandedChild] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setChildren(getLocalChildren());
      setParent(null);
      setIsLoading(false);
      return;
    }

    fetchDashboardData();
  }, [token]);

  const buildProfileFromToken = (rawToken: string | null): Parent | null => {
    if (!rawToken) return null;
    try {
      const payload = JSON.parse(window.atob(rawToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (!payload.sub || !payload.email) return null;
      return { id: payload.sub, googleId: '', email: payload.email, name: payload.name || payload.email, avatarUrl: payload.avatarUrl };
    } catch {
      return null;
    }
  };

  const fetchDashboardData = async () => {
    try {
      const profileRequest = client.get('/auth/profile').catch(() => null);
      const childrenRequest = client.get('/children');
      const [profileResponse, childrenResponse] = await Promise.all([profileRequest, childrenRequest]);

      setParent(profileResponse?.data || buildProfileFromToken(localStorage.getItem('jwtToken')));
      const normalizedChildren = childrenResponse.data.map(normalizeChildConfig);
      setChildren(normalizedChildren);
      setLocalChildren(normalizedChildren);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setChildren(getLocalChildren());
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiBaseUrl = client.defaults.baseURL || 'http://localhost:3001';
    window.location.href = `${apiBaseUrl}/auth/google`;
  };

  const handleDeleteChild = async (childId: string) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa hồ sơ trẻ này?');
    if (!confirmed) return;

    try {
      if (token) {
        await client.delete(`/children/${childId}`);
      }
      setChildren((current) => {
        const next = current.filter((child) => child.id !== childId);
        setLocalChildren(next);
        return next;
      });
      setExpandedChild(null);
    } catch (err) {
      console.error('Failed to delete child:', err);
    }
  };

  if (isLoading) {
    return (
      <main className="app-screen grid place-items-center">
        <div className="text-2xl text-[#71C9E8] font-extrabold">Đang tải...</div>
      </main>
    );
  }

  return (
    <main className="app-screen px-8 py-9">
      <div className="screen-top items-center">
        <button className="circle-button" onClick={() => navigate('/')} aria-label="Quay lại">
          ←
        </button>
        <div className="text-center">
          <p className="text-gray-400 font-extrabold">NumSense</p>
          <h1 className="app-title">BẢNG ĐIỀU KHIỂN</h1>
        </div>
        <button
          className="grid h-14 w-14 place-items-center rounded-full bg-[#9DE8D0] text-3xl text-white shadow-soft"
          onClick={() => navigate('/parent-settings')}
          title={parent?.email || 'Bảng điều khiển demo'}
        >
          ⚙
        </button>
      </div>

      {!token && (
        <section className="soft-card mt-7 p-5">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#FFF3DF] text-3xl">G</span>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-extrabold">Đăng nhập Google</h2>
              <p className="mt-1 text-sm font-bold leading-snug text-gray-500">
                Dùng lần đầu để đăng ký tài khoản, lần sau chỉ cần truy cập bảng điều khiển.
              </p>
            </div>
          </div>
          <button className="primary-pill mt-5 w-full" onClick={handleGoogleLogin}>
            Đăng nhập Google / đăng ký
          </button>
        </section>
      )}

      <section className="mt-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-extrabold">DANH SÁCH TRẺ</h2>
          <button className="grid h-14 w-14 place-items-center rounded-full bg-[#9DE8D0] text-4xl text-white shadow-soft" onClick={() => navigate('/add-child')} aria-label="Thêm trẻ">
            +
          </button>
        </div>

        <div className="soft-card p-4">
          {children.map((child, index) => {
            const visual = getChildVisual(child, index);
            const expanded = expandedChild === child.id;
            return (
              <div key={child.id} className={index > 0 ? 'border-t border-gray-100 pt-4 mt-4' : ''}>
                <div className="grid grid-cols-[56px_1fr_36px] items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-full text-3xl" style={{ backgroundColor: visual.color }}>
                    {visual.avatar}
                  </div>
                  <button
                    onClick={() => setExpandedChild(expanded ? null : child.id)}
                    className={`flex h-14 items-center justify-between rounded-full border-2 px-5 text-left font-extrabold transition ${
                      expanded ? 'border-[#FFD39A]' : 'border-gray-200'
                    }`}
                  >
                    {child.name}
                    <span>{expanded ? '⌃' : '⌄'}</span>
                  </button>
                  <button className="text-3xl text-red-300" onClick={() => handleDeleteChild(child.id)} aria-label="Xóa trẻ">
                    🗑
                  </button>
                </div>

                {expanded && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="ml-[68px] mt-4 grid grid-cols-2 gap-3">
                    <button className="rounded-[16px] bg-[#9DD9E8] px-4 py-4 text-white font-extrabold" onClick={() => navigate(`/progress-report/${child.id}`)}>
                      📊 Báo cáo
                    </button>
                    <button className="rounded-[16px] bg-[#FFD39A] px-4 py-4 text-white font-extrabold" onClick={() => navigate(`/child-config/${child.id}`)}>
                      ⚙ Cấu hình
                    </button>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { icon: '👶', value: children.length, label: 'Tổng trẻ', color: 'bg-[#E4F8FF]' },
            { icon: '📚', value: Math.max(0, children.length - 1), label: 'Đang học', color: 'bg-[#ECF8ED]' },
            { icon: '🏆', value: Math.max(0, Math.floor(children.length / 2)), label: 'Hoàn thành', color: 'bg-[#FFF3DF]' },
          ].map((item) => (
            <div key={item.label} className={`${item.color} rounded-[16px] p-4 text-center shadow-sm`}>
              <div className="text-4xl">{item.icon}</div>
              <strong className="mt-2 block text-3xl">{item.value}</strong>
              <span className="text-sm font-bold text-gray-500">{item.label}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};
