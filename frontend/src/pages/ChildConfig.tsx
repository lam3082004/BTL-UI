import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';
import { Child, MathOperation } from '../types';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-primary">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-b from-primary/10 to-secondary/10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <button
          onClick={() => navigate('/parent-dashboard')}
          className="mb-6 text-primary hover:underline"
        >
          ← Quay lại
        </button>

        <h1 className="text-4xl font-bold text-primary mb-2">⚙️ Cấu Hình</h1>
        {child && <p className="text-gray-600 mb-8">{child.name}</p>}

        {/* Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-white ${
              message.type === 'success' ? 'bg-success' : 'bg-warning'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Config Form */}
        <motion.div
          className="bg-white rounded-lg p-8 shadow-md space-y-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Number Range Sliders */}
          <div>
            <label className="block text-lg font-semibold text-primary mb-4">
              📊 Phạm Vi Số (tối thiểu - tối đa)
            </label>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Số tối thiểu: <strong>{minNumber}</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max={Math.max(20, maxNumber - 1)}
                  value={minNumber}
                  onChange={(e) => setMinNumber(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Số tối đa: <strong>{maxNumber}</strong>
                </label>
                <input
                  type="range"
                  min={Math.min(1, minNumber + 1)}
                  max="100"
                  value={maxNumber}
                  onChange={(e) => setMaxNumber(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Operations Toggle */}
          <div>
            <label className="block text-lg font-semibold text-primary mb-4">
              ✏️ Loại Phép Tính
            </label>
            <div className="grid grid-cols-2 gap-4">
              {Object.values(MathOperation).map((op) => (
                <button
                  key={op}
                  onClick={() => handleOperationToggle(op)}
                  className={`p-4 rounded-lg font-semibold transition ${
                    operations.includes(op)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                  }`}
                >
                  {op === MathOperation.ADDITION && '➕ Cộng'}
                  {op === MathOperation.SUBTRACTION && '➖ Trừ'}
                  {op === MathOperation.MULTIPLICATION && '✖️ Nhân'}
                  {op === MathOperation.DIVISION && '➗ Chia'}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary bg-success text-white w-full py-4 text-lg font-semibold disabled:opacity-50"
          >
            {isSaving ? 'Đang lưu...' : '💾 Lưu Cấu Hình'}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};
