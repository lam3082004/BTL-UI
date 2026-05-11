import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { MathOperation } from '../types';

const avatarOptions = ['👧', '👦', '🧒', '👶', '🌟', '🎈'];

const operationLabels: Record<MathOperation, string> = {
  [MathOperation.ADDITION]: 'Cộng',
  [MathOperation.SUBTRACTION]: 'Trừ',
  [MathOperation.MULTIPLICATION]: 'Nhân',
  [MathOperation.DIVISION]: 'Chia',
};

export const AddChildPage: React.FC = () => {
  const navigate = useNavigate();
  const { token, isLoading, requireAuth } = useAuth();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(avatarOptions[0]);
  const [minNumber, setMinNumber] = useState(1);
  const [maxNumber, setMaxNumber] = useState(10);
  const [operations, setOperations] = useState<MathOperation[]>([MathOperation.ADDITION]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requireAuth('/parent-login');
  }, [isLoading, token]);

  const toggleOperation = (operation: MathOperation) => {
    setOperations((current) => {
      if (current.includes(operation)) {
        return current.length === 1 ? current : current.filter((item) => item !== operation);
      }
      return [...current, operation];
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Vui lòng nhập tên của trẻ');
      return;
    }

    if (minNumber > maxNumber) {
      setError('Số nhỏ nhất không được lớn hơn số lớn nhất');
      return;
    }

    setIsSaving(true);
    try {
      await client.post('/children', {
        name: name.trim(),
        avatar,
        minNumber,
        maxNumber,
        allowedOperations: operations,
      });
      navigate('/parent-dashboard');
    } catch (err) {
      setError('Không thể thêm hồ sơ trẻ. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-b from-teal/10 to-blue/10">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={() => navigate('/parent-dashboard')}
            className="text-3xl text-teal hover:scale-110 transition"
          >
            ←
          </button>
          <div className="text-center flex-1">
            <p className="text-gray-600 text-sm font-semibold">HỒ SƠ MỚI</p>
            <h1 className="text-3xl font-bold text-text">THÊM TRẺ</h1>
          </div>
          <div className="text-4xl">{avatar}</div>
        </div>

        <motion.form
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-8 shadow-soft space-y-8"
        >
          {error && (
            <div className="bg-warning/30 text-text rounded-2xl p-4 text-center font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-lg font-bold text-text mb-3">Tên của trẻ</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ví dụ: Bé Minh"
              className="w-full rounded-2xl border-2 border-gray-200 px-4 py-4 text-lg outline-none focus:border-teal"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-text mb-3">Ảnh đại diện</label>
            <div className="grid grid-cols-6 gap-3">
              {avatarOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAvatar(option)}
                  className={`min-h-touch rounded-2xl text-3xl border-2 transition ${
                    avatar === option ? 'border-teal bg-teal/10' : 'border-gray-200 bg-white'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-bold text-text mb-4">Phạm vi số</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-sm font-semibold text-gray-600 mb-2">Số nhỏ nhất</span>
                <input
                  type="number"
                  min={0}
                  max={1000}
                  value={minNumber}
                  onChange={(event) => setMinNumber(Number(event.target.value))}
                  className="w-full rounded-2xl border-2 border-gray-200 px-4 py-4 text-lg outline-none focus:border-teal"
                />
              </div>
              <div>
                <span className="block text-sm font-semibold text-gray-600 mb-2">Số lớn nhất</span>
                <input
                  type="number"
                  min={0}
                  max={1000}
                  value={maxNumber}
                  onChange={(event) => setMaxNumber(Number(event.target.value))}
                  className="w-full rounded-2xl border-2 border-gray-200 px-4 py-4 text-lg outline-none focus:border-teal"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-lg font-bold text-text mb-4">Phép tính</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(MathOperation).map((operation) => {
                const selected = operations.includes(operation);
                return (
                  <button
                    key={operation}
                    type="button"
                    onClick={() => toggleOperation(operation)}
                    className={`min-h-touch rounded-2xl border-2 px-4 py-3 font-bold transition ${
                      selected ? 'border-teal bg-teal text-white' : 'border-gray-200 bg-white text-text'
                    }`}
                  >
                    {operationLabels[operation]}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary w-full py-4 text-lg font-bold disabled:opacity-50"
          >
            {isSaving ? 'Đang lưu...' : 'Thêm trẻ mới'}
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
};
