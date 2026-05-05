import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';
import { Child, MathOperation } from '../types';

// Operation icons and colors
const operationConfig: Record<MathOperation, { icon: string; color: string; label: string }> = {
  [MathOperation.ADDITION]: { icon: '➕', color: 'bg-orange-500', label: 'Cộng' },
  [MathOperation.SUBTRACTION]: { icon: '➖', color: 'bg-blue-500', label: 'Trừ' },
  [MathOperation.MULTIPLICATION]: { icon: '✖️', color: 'bg-gray-500', label: 'Nhân' },
  [MathOperation.DIVISION]: { icon: '➗', color: 'bg-gray-500', label: 'Chia' },
};

// iOS-style toggle component
const Toggle: React.FC<{ enabled: boolean; onChange: (value: boolean) => void }> = ({
  enabled,
  onChange,
}) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-8 w-16 rounded-full transition-colors ${
      enabled ? 'bg-teal' : 'bg-gray-300'
    }`}
  >
    <motion.div
      className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
      animate={{ left: enabled ? '30px' : '2px' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    />
  </button>
);

export const ChildConfig: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [minNumber, setMinNumber] = useState(1);
  const [maxNumber, setMaxNumber] = useState(10);
  const [operations, setOperations] = useState<MathOperation[]>([MathOperation.ADDITION]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (childId) {
      fetchChild(childId);
    }
  }, [childId]);

  const fetchChild = async (id: string) => {
    try {
      const response = await client.get(`/children/${id}`);
      setChild(response.data);
      setMinNumber(response.data.minNumber);
      setMaxNumber(response.data.maxNumber);
      setOperations(response.data.allowedOperations);
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi khi tải thông tin trẻ' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOperationToggle = (op: MathOperation) => {
    setOperations((prev) =>
      prev.includes(op) ? prev.filter((o) => o !== op) : [...prev, op],
    );
  };

  const handleSave = async () => {
    if (!childId) return;

    setIsSaving(true);
    try {
      await client.put(`/children/${childId}/config`, {
        minNumber,
        maxNumber,
        allowedOperations: operations,
      });
      setMessage({ type: 'success', text: 'Cấu hình đã được lưu!' });
      setTimeout(() => navigate('/parent-dashboard'), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi khi lưu cấu hình' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-2xl text-teal font-bold">Đang tải...</div>
      </div>
    );
  }

  const childIcon = child?.name === 'Bé Bo' ? '📖' : child?.name === 'Bé Thỏ' ? '🐰' : child?.name === 'Bé Bi' ? '🎈' : '✨';

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-b from-teal/10 to-blue/10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <button
            onClick={() => navigate('/parent-dashboard')}
            className="text-3xl text-teal hover:scale-110 transition"
          >
            ←
          </button>
          <div className="text-center flex-1">
            <p className="text-gray-600 text-sm font-semibold">CÀI ĐẶT CẤU HÌNH</p>
            <h1 className="text-3xl font-bold text-text">{child?.name}</h1>
          </div>
          <div className="text-4xl">{childIcon}</div>
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-2xl text-white text-center font-semibold ${
              message.type === 'success' ? 'bg-green-500' : 'bg-warning'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Config Form */}
        <motion.div
          className="bg-white rounded-3xl p-8 shadow-soft space-y-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Number Range Sliders */}
          <div>
            <label className="flex items-center gap-2 text-lg font-bold text-text mb-6">
              <span className="bg-blue text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                📊
              </span>
              Phạm vi số
            </label>

            <div className="space-y-6">
              {/* Min Number Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-text">Số nhỏ nhất</label>
                  <span className="text-2xl font-bold text-teal">{minNumber}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={minNumber}
                  onChange={(e) => setMinNumber(parseInt(e.target.value))}
                  className="w-full h-3 bg-blue/30 rounded-full appearance-none cursor-pointer accent-teal"
                />
              </div>

              {/* Max Number Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-text">Số lớn nhất</label>
                  <span className="text-2xl font-bold text-teal">{maxNumber}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  value={maxNumber}
                  onChange={(e) => setMaxNumber(parseInt(e.target.value))}
                  className="w-full h-3 bg-green/30 rounded-full appearance-none cursor-pointer accent-teal"
                />
              </div>
            </div>
          </div>

          {/* Operations Toggle */}
          <div className="border-t-2 border-gray-200 pt-8">
            <label className="flex items-center gap-2 text-lg font-bold text-text mb-6">
              <span className="bg-green text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                ➕
              </span>
              Phép tính được phép
            </label>

            <div className="space-y-4">
              {Object.values(MathOperation).map((op) => {
                const config = operationConfig[op];
                const isEnabled = operations.includes(op);
                return (
                  <div key={op} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
                    {/* Operation Icon & Label */}
                    <div className="flex items-center gap-4">
                      <div className={`${config.color} text-white rounded-full w-10 h-10 flex items-center justify-center text-xl`}>
                        {config.icon}
                      </div>
                      <span className="font-semibold text-text">{config.label}</span>
                    </div>

                    {/* Toggle Switch */}
                    <Toggle
                      enabled={isEnabled}
                      onChange={(value) => {
                        if (value) {
                          setOperations([...operations, op]);
                        } else {
                          setOperations(operations.filter((o) => o !== op));
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed mt-8"
          >
            {isSaving ? '⏳ Đang lưu...' : '💾 Lưu cài đặt'}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};
