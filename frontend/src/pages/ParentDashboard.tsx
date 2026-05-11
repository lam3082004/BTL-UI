import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { Child, Parent } from '../types';

export const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token, logout, requireAuth } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [parent, setParent] = useState<Parent | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [expandedChild, setExpandedChild] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const parentInitial = parent?.name?.trim()?.charAt(0)?.toUpperCase() || 'P';
  const isAuthenticated = Boolean(token);

  const buildProfileFromToken = (rawToken: string | null): Parent | null => {
    if (!rawToken) return null;

    try {
      const payloadPart = rawToken.split('.')[1];
      if (!payloadPart) return null;
      const normalizedPayload = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(normalizedPayload));

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

  useEffect(() => {
    requireAuth('/parent-login');
    if (token) {
      fetchDashboardData();
    }
  }, [token, isLoading]);

  const fetchDashboardData = async () => {
    try {
      const profileRequest = client.get('/auth/profile').catch((err) => {
        const tokenProfile = buildProfileFromToken(localStorage.getItem('jwtToken'));
        if (tokenProfile) {
          setParent(tokenProfile);
          setProfileError(null);
        } else {
          setProfileError('Không tải được hồ sơ phụ huynh. Hãy đăng xuất rồi đăng nhập lại.');
        }
        console.error('Failed to fetch parent profile:', err);
        return null;
      });
      const childrenRequest = client.get('/children');

      const [profileResponse, childrenResponse] = await Promise.all([
        profileRequest,
        childrenRequest,
      ]);

      if (profileResponse) {
        setParent(profileResponse.data);
        setProfileError(null);
      }
      setChildren(childrenResponse.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRelogin = () => {
    localStorage.removeItem('jwtToken');
    navigate('/parent-login');
  };

  const handleGoToReport = (childId: string) => {
    navigate(`/progress-report/${childId}`);
  };

  const handleGoToConfig = (childId: string) => {
    navigate(`/child-config/${childId}`);
  };

  const handleDeleteChild = async (childId: string) => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa hồ sơ trẻ này?');
    if (!confirmed) return;

    try {
      await client.delete(`/children/${childId}`);
      setChildren((current) => current.filter((child) => child.id !== childId));
      setExpandedChild(null);
    } catch (err) {
      console.error('Failed to delete child:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-2xl text-teal font-bold">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:py-8 bg-gradient-to-b from-teal/10 to-blue/10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto mb-8"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-teal text-sm font-bold">NumSense</p>
            <h1 className="text-4xl font-bold text-text">BẢNG ĐIỀU KHIỂN</h1>
          </div>
          <button
            onClick={handleLogout}
            className="min-w-touch min-h-touch rounded-2xl bg-white text-teal text-2xl shadow-soft hover:scale-105 transition"
            title="Đăng xuất"
          >
            ⎋
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border-2 border-teal/10 flex flex-col sm:flex-row sm:items-center gap-4"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal to-blue flex items-center justify-center text-white text-3xl font-bold overflow-hidden shrink-0">
            {parent?.avatarUrl ? (
              <img src={parent.avatarUrl} alt={parent.name} className="w-full h-full object-cover" />
            ) : (
              parentInitial
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-teal mb-1">HỒ SƠ PHỤ HUYNH</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-text truncate">
              {parent?.name || 'Đang chờ hồ sơ Google'}
            </h2>
            <p className="text-gray-600 break-words">
              {parent?.email || profileError || 'Bạn đã đăng nhập, hồ sơ đang được đồng bộ.'}
            </p>
          </div>
          {parent ? (
            <div className="bg-green/20 text-text rounded-2xl px-4 py-3 font-semibold text-sm">
              Đã đăng nhập bằng Google
            </div>
          ) : (
            <button
              onClick={handleRelogin}
              className="bg-yellow/20 hover:bg-yellow/30 text-text rounded-2xl px-4 py-3 font-semibold text-sm transition"
            >
              Đăng nhập lại
            </button>
          )}
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-text">DANH SÁCH TRẺ</h2>
            <button
              onClick={() => navigate('/add-child')}
              className="text-4xl text-teal hover:scale-110 transition"
              title="Thêm trẻ mới"
            >
              ➕
            </button>
          </div>
        </motion.div>

        {/* Children List */}
        {children.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl p-8 text-center shadow-soft"
          >
            <p className="text-gray-600 mb-4 text-lg">Chưa có hồ sơ trẻ nào</p>
            <button
              onClick={() => navigate('/add-child')}
              className="btn-primary"
            >
              ➕ Thêm trẻ mới
            </button>
          </motion.div>
        ) : (
          <motion.div className="grid gap-4 mb-12">
            {children.map((child, idx) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card-rounded bg-white border-2 border-gray-200 p-6 shadow-soft hover:shadow-lg transition"
              >
                {/* Child Header */}
                <button
                  onClick={() =>
                    setExpandedChild(expandedChild === child.id ? null : child.id)
                  }
                  className="w-full text-left flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">
                      {child.name === 'Bé Bo' ? '📖' : child.name === 'Bé Thỏ' ? '🐰' : child.name === 'Bé Bi' ? '🎈' : '✨'}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-text">{child.name}</h3>
                      <p className="text-sm text-gray-600">
                        Phạm vi: {child.minNumber}-{child.maxNumber}
                      </p>
                    </div>
                  </div>
                  <motion.div 
                    className="text-2xl text-teal"
                    animate={{ rotate: expandedChild === child.id ? 180 : 0 }}
                  >
                    ▼
                  </motion.div>
                </button>

                {/* Expanded Options */}
                {expandedChild === child.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t-2 border-gray-200 flex gap-4 flex-wrap"
                  >
                    <button
                      onClick={() => handleGoToReport(child.id)}
                      className="btn-primary"
                    >
                      📈 Báo cáo tiến độ
                    </button>
                    <button
                      onClick={() => handleGoToConfig(child.id)}
                      className="btn-secondary"
                    >
                      ⚙️ Cấu hình
                    </button>
                    <button
                      onClick={() => handleDeleteChild(child.id)}
                      className="px-4 py-2 text-warning hover:text-red-600 transition font-semibold text-lg"
                    >
                      🗑️ Xóa
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-4 mt-12"
        >
          <div className="bg-white rounded-3xl p-6 text-center shadow-soft">
            <div className="text-4xl mb-2">🐥</div>
            <p className="text-4xl font-bold text-teal">{children.length}</p>
            <p className="text-sm text-gray-600 mt-1">Tổng trẻ</p>
          </div>
          <div className="bg-white rounded-3xl p-6 text-center shadow-soft">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-4xl font-bold text-teal">{Math.max(0, children.length - 1)}</p>
            <p className="text-sm text-gray-600 mt-1">Đang học</p>
          </div>
          <div className="bg-white rounded-3xl p-6 text-center shadow-soft">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-4xl font-bold text-teal">{Math.max(0, Math.floor(children.length / 2))}</p>
            <p className="text-sm text-gray-600 mt-1">Hoàn thành</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
