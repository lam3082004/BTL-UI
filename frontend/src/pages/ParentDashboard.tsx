import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { Child } from '../types';

export const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token, logout, requireAuth } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [expandedChild, setExpandedChild] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    requireAuth('/parent-login');
    if (token) {
      fetchChildren();
    }
  }, [token]);

  const fetchChildren = async () => {
    try {
      const response = await client.get('/children');
      setChildren(response.data);
    } catch (err) {
      console.error('Failed to fetch children:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGoToReport = (childId: string) => {
    navigate(`/progress-report/${childId}`);
  };

  const handleGoToConfig = (childId: string) => {
    navigate(`/child-config/${childId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-primary">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-b from-primary/10 to-secondary/10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-8"
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-primary">📊 Bảng Điều Khiển Phụ Huynh</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-warning text-white rounded-lg hover:bg-opacity-90 transition"
          >
            Đăng xuất
          </button>
        </div>
      </motion.div>

      {/* Children List */}
      <div className="max-w-4xl mx-auto">
        {children.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg p-8 text-center shadow-md"
          >
            <p className="text-gray-600 mb-4">Chưa có hồ sơ trẻ nào</p>
            <button
              onClick={() => navigate('/add-child')}
              className="btn-primary bg-primary text-white"
            >
              ➕ Thêm trẻ mới
            </button>
          </motion.div>
        ) : (
          <motion.div className="grid gap-4">
            {children.map((child, idx) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="card-base bg-white border-2 border-primary p-6 shadow-md"
              >
                {/* Child Header */}
                <button
                  onClick={() =>
                    setExpandedChild(expandedChild === child.id ? null : child.id)
                  }
                  className="w-full text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{child.avatar || '👧'}</div>
                    <div>
                      <h3 className="text-2xl font-bold text-primary">{child.name}</h3>
                      <p className="text-sm text-gray-600">
                        Phạm vi: {child.minNumber}-{child.maxNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl">
                    {expandedChild === child.id ? '▼' : '▶'}
                  </div>
                </button>

                {/* Expanded Options */}
                {expandedChild === child.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t-2 border-primary flex gap-4 flex-wrap"
                  >
                    <button
                      onClick={() => handleGoToReport(child.id)}
                      className="btn-primary bg-success text-white"
                    >
                      📈 Báo cáo tiến độ
                    </button>
                    <button
                      onClick={() => handleGoToConfig(child.id)}
                      className="btn-secondary bg-secondary text-gray-800"
                    >
                      ⚙️ Cấu hình
                    </button>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
