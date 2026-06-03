import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { Child, Parent } from '../types';
import { getChildVisual, getLocalChildren, normalizeChildConfig, removeLocalChild, setLocalChildren, upsertLocalChild } from '../utils/childVisuals';
import { AddChildModal } from '../components/AddChildModal';
import { decodeJwtPayload, repairMojibake } from '../utils/jwt';

export const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [parent, setParent] = useState<Parent | null>(null);
  const [expandedChild, setExpandedChild] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  useEffect(() => {
    if (!token) {
      setParent(null);
      fetchDemoChildren();
      return;
    }

    fetchDashboardData();
  }, [token]);

  const buildProfileFromToken = (rawToken: string | null): Parent | null => {
    const payload = decodeJwtPayload<{ sub?: string; email?: string; name?: string; avatarUrl?: string }>(rawToken);
    if (!payload?.sub || !payload.email) return null;
    return { id: payload.sub, googleId: '', email: payload.email, name: repairMojibake(payload.name) || payload.email, avatarUrl: payload.avatarUrl };
  };

  const fetchDemoChildren = async () => {
    setChildren(getLocalChildren());
    setIsLoading(false);
  };

  const fetchDashboardData = async () => {
    try {
      const profileRequest = client.get('/auth/profile').catch(() => null);
      const childrenRequest = client.get('/children');
      const [profileResponse, childrenResponse] = await Promise.all([profileRequest, childrenRequest]);

      setParent(
        profileResponse?.data
          ? { ...profileResponse.data, name: repairMojibake(profileResponse.data.name) || profileResponse.data.name }
          : buildProfileFromToken(localStorage.getItem('jwtToken')),
      );
      if (childrenResponse.data) {
        const sourceChildren = childrenResponse.data;
        const normalizedChildren = sourceChildren.map(normalizeChildConfig);
        setLocalChildren(normalizedChildren);
        setChildren(getLocalChildren());
      }
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

  const removeChildLocally = (childId: string) => {
    const currentChildren = removeLocalChild(childId);
    setChildren(currentChildren);
    if (expandedChild === childId) {
      setExpandedChild(null);
    }
  };

  const handleDeleteChild = async (childId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) return;
    const isLocalOnlyChild = childId.startsWith('local-') || childId.startsWith('demo-');

    try {
      if (token && !isLocalOnlyChild) {
        await client.delete(`/children/${childId}`);
        fetchDashboardData();
      } else {
        removeChildLocally(childId);
      }
    } catch (err: any) {
      console.error('Failed to delete child:', err);
      if (err?.response?.status === 404) {
        removeChildLocally(childId);
        return;
      }
      if (err?.response?.status === 401) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại rồi xóa hồ sơ trên máy chủ.');
        return;
      }
      alert('Không thể xóa. Vui lòng thử lại.');
    }
  };

  const refreshActiveChild = (child: Child) => {
    const currentActiveStr = sessionStorage.getItem('selectedChild');
    if (!currentActiveStr) return;

    try {
      const currentActive = JSON.parse(currentActiveStr) as Child;
      if (currentActive.id === child.id) {
        sessionStorage.setItem('selectedChild', JSON.stringify(normalizeChildConfig(child)));
      }
    } catch {
      // Ignore stale session storage.
    }
  };

  const handleChildSaved = (child: Child) => {
    const normalizedChild = normalizeChildConfig(child);
    upsertLocalChild(normalizedChild);
    refreshActiveChild(normalizedChild);

    if (token) {
      fetchDashboardData();
    } else {
      setChildren(getLocalChildren());
    }

    setShowAddModal(false);
    setEditingChild(null);
  };

  if (isLoading) {
    return (
      <main className="app-screen grid place-items-center">
        <div className="text-2xl text-[#71C9E8] font-extrabold">Đang tải...</div>
      </main>
    );
  }

  return (
    <main className="app-screen flex flex-col h-[100dvh] overflow-hidden px-6 py-8">
      <div className="screen-top shrink-0 items-center">
        <button className="circle-button" onClick={() => navigate('/')} aria-label="Quay lại">
          ←
        </button>
        <div className="text-center">
          <p className="text-gray-400 font-extrabold">NumSense</p>
          <h1 className="app-title text-[28px]">BẢNG ĐIỀU KHIỂN</h1>
        </div>
        <button
          className="grid h-14 w-14 place-items-center rounded-full bg-[#9DE8D0] text-3xl text-white shadow-soft"
          onClick={() => navigate('/parent-settings')}
          title={parent?.email || 'Bảng điều khiển demo'}
        >
          ⚙
        </button>
      </div>

      <div className="flex-grow flex flex-col min-h-0 mt-6 justify-between gap-6">
        <div className="shrink-0 flex flex-col gap-6">
          {!token && (
            <section className="soft-card p-5">
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

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold">DANH SÁCH TRẺ</h2>
            <button
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#9DE8D0] text-3xl text-white shadow-sm"
              onClick={() => {
                setEditingChild(null);
                setShowAddModal(true);
              }}
              aria-label="Thêm trẻ"
            >
              +
            </button>
          </div>
        </div>
        {/* This white card container is fixed, but its inner list scrolls */}
        <div className="flex-grow flex flex-col min-h-0 soft-card p-4">
          <div className="flex-grow overflow-y-auto min-h-0 pr-1">
            {!children.length && (
              <div className="py-8 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#E4F8FF] text-4xl">👶</div>
                <h3 className="mt-4 text-xl font-extrabold">Chưa có hồ sơ trẻ</h3>
                <p className="mt-2 text-sm font-bold text-gray-400">Phần thêm/bớt hồ sơ có thể bổ sung sau.</p>
              </div>
            )}

            {children.map((child, index) => {
              const visual = getChildVisual(child, index);
              const expanded = expandedChild === child.id;
              return (
                <div key={child.id} className={index > 0 ? 'border-t border-gray-100 pt-4 mt-4' : ''}>
                  <div className="flex items-center gap-3">
                    <div className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full text-3xl shadow-sm" style={{ backgroundColor: visual.color }}>
                      {visual.avatar}
                    </div>
                    <button
                      onClick={() => setExpandedChild(expanded ? null : child.id)}
                      className={`flex min-h-[56px] min-w-0 flex-1 items-center justify-between rounded-[18px] border-2 px-4 text-left font-extrabold transition ${
                        expanded ? 'border-[#FFD39A]' : 'border-gray-200'
                      }`}
                    >
                      <span className="truncate">{child.name}</span>
                      <span className="ml-3 shrink-0">{expanded ? '⌃' : '⌄'}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteChild(child.id)}
                      className="grid h-[56px] w-[40px] shrink-0 place-items-center rounded-[18px] text-[#FF7A7A] transition hover:bg-[#FFF0F0]"
                      aria-label="Xóa trẻ"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>

                  {expanded && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 grid grid-cols-2 gap-3 pl-[64px]">
                      <button
                        className="rounded-[16px] bg-[#9DE8D0] px-4 py-4 text-white font-extrabold"
                        onClick={() => {
                          setEditingChild(child);
                          setShowAddModal(true);
                        }}
                      >
                        ✏️ Sửa
                      </button>
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
        </div>
        {/* Bottom widgets fixed */}
        <div className="shrink-0 grid grid-cols-3 gap-4">
          {[
            { icon: '👶', value: children.length, label: 'Tổng trẻ', color: 'bg-[#E4F8FF]' },
            { icon: '📚', value: Math.max(0, children.length - 1), label: 'Đang học', color: 'bg-[#ECF8ED]' },
            { icon: '🏆', value: Math.max(0, Math.floor(children.length / 2)), label: 'Hoàn thành', color: 'bg-[#FFF3DF]' },
          ].map((item) => (
            <div key={item.label} className={`${item.color} rounded-[16px] p-3 text-center shadow-sm`}>
              <div className="text-3xl">{item.icon}</div>
              <strong className="mt-2 block text-2xl">{item.value}</strong>
              <span className="text-xs font-bold leading-tight text-gray-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <AddChildModal
        open={showAddModal}
        initialChild={editingChild}
        onClose={() => {
          setShowAddModal(false);
          setEditingChild(null);
        }}
        onChildAdded={handleChildSaved}
      />
    </main>
  );
};
