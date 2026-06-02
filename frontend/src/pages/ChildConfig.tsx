import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';
import { Child, EnabledLesson, LessonActivity, MathOperation } from '../types';
import {
  getChildVisual,
  getLocalChildById,
  maxVisualNumber,
  normalizeAllowedLessons,
  normalizeChildConfig,
  toBackendOperations,
  upsertLocalChild,
} from '../utils/childVisuals';

const operations = [
  { value: LessonActivity.COUNTING, label: 'Học đếm', icon: '🍎' },
  { value: MathOperation.ADDITION, label: 'Cộng', icon: '+' },
  { value: MathOperation.SUBTRACTION, label: 'Trừ', icon: '🎈' },
  { value: MathOperation.MULTIPLICATION, label: 'Nhân', icon: '×' },
  { value: MathOperation.DIVISION, label: 'Chia', icon: '🍬' },
  { value: LessonActivity.FRACTIONS, label: 'Phân số', icon: '🍕' },
  { value: LessonActivity.TIME, label: 'Xem giờ', icon: '⏰' },
  { value: LessonActivity.MEASUREMENT, label: 'Đo lường', icon: '📏' },
];

export const ChildConfig: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [minNumber, setMinNumber] = useState(1);
  const [maxNumber, setMaxNumber] = useState(10);
  const [selectedOperations, setSelectedOperations] = useState<EnabledLesson[]>([LessonActivity.COUNTING, MathOperation.ADDITION]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchChild = async () => {
      if (!childId) return;
      try {
        const response = await client.get(`/children/${childId}`);
        const normalized = normalizeChildConfig(response.data);
        setChild(normalized);
        setMinNumber(normalized.minNumber);
        setMaxNumber(normalized.maxNumber);
        setSelectedOperations(normalized.allowedOperations);
      } catch (err) {
        const localChild = getLocalChildById(childId);
        if (localChild) {
          const normalized = normalizeChildConfig(localChild);
          setChild(normalized);
          setMinNumber(normalized.minNumber);
          setMaxNumber(normalized.maxNumber);
          setSelectedOperations(normalized.allowedOperations);
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChild();
  }, [childId]);

  const toggleOperation = (operation: EnabledLesson) => {
    setSelectedOperations((current) => {
      if (current.includes(operation)) {
        return current.length === 1 ? current : current.filter((item) => item !== operation);
      }
      return [...current, operation];
    });
  };

  const handleSave = async () => {
    if (!childId) return;
    const safeMin = Math.max(1, Math.min(maxVisualNumber, Math.min(minNumber, maxNumber)));
    const safeMax = Math.max(safeMin, Math.min(maxVisualNumber, Math.max(minNumber, maxNumber)));
    const enabledLessons = normalizeAllowedLessons(selectedOperations);

    setIsSaving(true);
    try {
      const localPayload = {
        minNumber: safeMin,
        maxNumber: safeMax,
        allowedOperations: enabledLessons,
      };
      const backendPayload = {
        minNumber: safeMin,
        maxNumber: safeMax,
        allowedOperations: toBackendOperations(enabledLessons),
      };
      const token = localStorage.getItem('jwtToken');
      if (token) {
        await client.put(`/children/${childId}/config`, backendPayload);
      }
      if (child) {
        const updatedChild = { ...child, ...localPayload };
        upsertLocalChild(updatedChild);
        
        // Cập nhật sessionStorage nếu đây là bé đang hoạt động để bài học cập nhật ngay lập tức
        const currentActiveStr = sessionStorage.getItem('selectedChild');
        if (currentActiveStr) {
          const currentActive = JSON.parse(currentActiveStr) as Child;
          if (currentActive.id === childId) {
            sessionStorage.setItem('selectedChild', JSON.stringify(updatedChild));
          }
        }
      }
      navigate('/parent-dashboard');
    } catch (err) {
      if (child) {
        const updatedChild = { ...child, minNumber: safeMin, maxNumber: safeMax, allowedOperations: enabledLessons };
        upsertLocalChild(updatedChild);
        
        const currentActiveStr = sessionStorage.getItem('selectedChild');
        if (currentActiveStr) {
          const currentActive = JSON.parse(currentActiveStr) as Child;
          if (currentActive.id === childId) {
            sessionStorage.setItem('selectedChild', JSON.stringify(updatedChild));
          }
        }
        navigate('/parent-dashboard');
      }
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="app-screen grid place-items-center">
        <div className="text-2xl text-[#71C9E8] font-extrabold">Đang tải...</div>
      </main>
    );
  }

  const visual = getChildVisual(child);

  return (
    <main className="app-screen px-8 py-9">
      <div className="screen-top">
        <button className="circle-button" onClick={() => navigate('/parent-dashboard')} aria-label="Quay lại">
          ←
        </button>
        <div className="text-center">
          <p className="text-gray-400 font-extrabold">CÀI ĐẶT CẤU HÌNH</p>
          <h1 className="app-title">{child?.name?.toUpperCase()}</h1>
        </div>
        <div className="kid-chip">
          <span style={{ backgroundColor: visual.color }}>{visual.avatar}</span>
        </div>
      </div>

      <section className="soft-card mt-10 p-7">
        <h2 className="text-2xl font-extrabold mb-8">🔢 Phạm vi số</h2>
        {[
          {
            label: 'Số nhỏ nhất',
            value: minNumber,
            setter: (val: number) => {
              const newMin = Math.max(1, Math.min(maxVisualNumber, val));
              setMinNumber(newMin);
              if (newMin > maxNumber) setMaxNumber(newMin);
            },
            color: '#9DD9E8',
          },
          {
            label: 'Số lớn nhất',
            value: maxNumber,
            setter: (val: number) => {
              const newMax = Math.max(1, Math.min(maxVisualNumber, val));
              setMaxNumber(newMax);
              if (newMax < minNumber) setMinNumber(newMax);
            },
            color: '#FFD39A',
          },
        ].map((item) => (
          <div key={item.label} className="mb-9">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-lg font-bold text-gray-600">{item.label}</span>
              <strong className="rounded-[14px] px-5 py-3 text-xl text-white" style={{ backgroundColor: item.color }}>
                {item.value}
              </strong>
            </div>
            <div className="grid grid-cols-[48px_1fr_48px] items-center gap-3">
              <button
                type="button"
                className="circle-button h-12 w-12 text-2xl"
                onClick={() => item.setter(item.value - 1)}
                aria-label={`Giảm ${item.label.toLowerCase()}`}
              >
                −
              </button>
              <input
                type="range"
                min="1"
                max={maxVisualNumber}
                value={item.value}
                onChange={(event) => item.setter(Number(event.target.value))}
                className="w-full"
              />
              <button
                type="button"
                className="circle-button h-12 w-12 text-2xl"
                onClick={() => item.setter(item.value + 1)}
                aria-label={`Tăng ${item.label.toLowerCase()}`}
              >
                +
              </button>
            </div>
            <div className="mt-4 flex justify-between text-gray-400">
              <span>1</span>
              <span>{maxVisualNumber}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="soft-card mt-7 p-7">
        <h2 className="text-2xl font-extrabold mb-6">🍎 Dạng bài được bật</h2>
        <div className="space-y-4">
          {operations.map((operation) => {
            const enabled = selectedOperations.includes(operation.value);
            return (
              <button
                key={operation.value}
                type="button"
                onClick={() => toggleOperation(operation.value)}
                className={`flex w-full items-center justify-between rounded-[16px] border-2 p-4 transition ${
                  enabled ? 'border-[#FFD39A]' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-5">
                  <span className={`grid h-12 w-12 place-items-center rounded-full text-3xl font-extrabold ${enabled ? 'bg-[#FFD39A]' : 'bg-gray-100 text-gray-300'}`}>
                    {operation.icon}
                  </span>
                  <strong className="text-xl">{operation.label}</strong>
                </div>
                <span className={`relative h-9 w-16 rounded-full ${enabled ? 'bg-[#FFD39A]' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition ${enabled ? 'left-8' : 'left-1'}`} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <button className="primary-pill mt-8 w-full" onClick={handleSave} disabled={isSaving}>
        💾 Lưu cài đặt
      </button>
    </main>
  );
};
