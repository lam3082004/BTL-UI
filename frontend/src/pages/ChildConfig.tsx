import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';
import { Child, MathOperation } from '../types';
import { getChildVisual, getLocalChildById, upsertLocalChild } from '../utils/childVisuals';

const operations = [
  { value: MathOperation.ADDITION, label: 'Cộng', icon: '+' },
  { value: MathOperation.SUBTRACTION, label: 'Trừ', icon: '−' },
  { value: MathOperation.MULTIPLICATION, label: 'Nhân', icon: '×' },
  { value: MathOperation.DIVISION, label: 'Chia', icon: '÷' },
];

export const ChildConfig: React.FC = () => {
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  const [child, setChild] = useState<Child | null>(null);
  const [minNumber, setMinNumber] = useState(1);
  const [maxNumber, setMaxNumber] = useState(10);
  const [selectedOperations, setSelectedOperations] = useState<MathOperation[]>([MathOperation.ADDITION]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchChild = async () => {
      if (!childId) return;
      try {
        const response = await client.get(`/children/${childId}`);
        setChild(response.data);
        setMinNumber(response.data.minNumber);
        setMaxNumber(response.data.maxNumber);
        setSelectedOperations(response.data.allowedOperations?.length ? response.data.allowedOperations : [MathOperation.ADDITION]);
      } catch (err) {
        const localChild = getLocalChildById(childId);
        if (localChild) {
          setChild(localChild);
          setMinNumber(localChild.minNumber);
          setMaxNumber(localChild.maxNumber);
          setSelectedOperations(localChild.allowedOperations?.length ? localChild.allowedOperations : [MathOperation.ADDITION]);
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChild();
  }, [childId]);

  const toggleOperation = (operation: MathOperation) => {
    setSelectedOperations((current) => {
      if (current.includes(operation)) {
        return current.length === 1 ? current : current.filter((item) => item !== operation);
      }
      return [...current, operation];
    });
  };

  const handleSave = async () => {
    if (!childId) return;
    const safeMin = Math.min(minNumber, maxNumber);
    const safeMax = Math.max(minNumber, maxNumber);

    setIsSaving(true);
    try {
      const payload = {
        minNumber: safeMin,
        maxNumber: safeMax,
        allowedOperations: selectedOperations,
      };
      const token = localStorage.getItem('jwtToken');
      if (token) {
        await client.put(`/children/${childId}/config`, payload);
      }
      if (child) {
        upsertLocalChild({ ...child, ...payload });
      }
      navigate('/parent-dashboard');
    } catch (err) {
      if (child) {
        upsertLocalChild({ ...child, minNumber: safeMin, maxNumber: safeMax, allowedOperations: selectedOperations });
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
          { label: 'Số nhỏ nhất', value: minNumber, setter: setMinNumber, color: '#9DD9E8' },
          { label: 'Số lớn nhất', value: maxNumber, setter: setMaxNumber, color: '#FFD39A' },
        ].map((item) => (
          <div key={item.label} className="mb-9">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-lg font-bold text-gray-600">{item.label}</span>
              <strong className="rounded-[14px] px-5 py-3 text-xl text-white" style={{ backgroundColor: item.color }}>
                {item.value}
              </strong>
            </div>
            <input
              type="range"
              min="1"
              max="1000"
              value={item.value}
              onChange={(event) => item.setter(Number(event.target.value))}
              className="w-full"
            />
            <div className="mt-4 flex justify-between text-gray-400">
              <span>1</span>
              <span>1000</span>
            </div>
          </div>
        ))}
      </section>

      <section className="soft-card mt-7 p-7">
        <h2 className="text-2xl font-extrabold mb-6">➕ Phép tính được phép</h2>
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
