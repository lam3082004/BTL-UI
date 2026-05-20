import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { LessonActivity, MathOperation } from '../types';
import { getLocalChildren, upsertLocalChild } from '../utils/childVisuals';

const avatars = ['🦊', '🐼', '🦄', '🐯', '🐻'];
const colors = ['#FFD39A', '#9DD9E8', '#9DE8D0', '#F7A6B8', '#C78BE8'];

export const AddChildPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(avatars[0]);
  const [color, setColor] = useState(colors[0]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    const child = {
      id: `local-${Date.now()}`,
      name: name.trim(),
      avatar,
      minNumber: 1,
      maxNumber: 10,
      allowedOperations: [LessonActivity.COUNTING, MathOperation.ADDITION],
    };

    setIsSaving(true);
    try {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        await client.post('/children', child);
      } else {
        upsertLocalChild(child);
      }
      navigate('/parent-dashboard');
    } catch (err) {
      upsertLocalChild(child);
      navigate('/parent-dashboard');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="app-screen px-8 py-9">
      <div className="screen-top items-center">
        <button className="circle-button" onClick={() => navigate('/parent-dashboard')} aria-label="Quay lại">
          ←
        </button>
        <div className="text-center">
          <p className="text-gray-400 font-extrabold">NumSense</p>
          <h1 className="app-title">THÊM HỒ SƠ</h1>
        </div>
        <div className="w-14" />
      </div>

      <form onSubmit={handleSubmit} className="soft-card mt-10 p-7">
        <h2 className="mb-6 text-3xl font-extrabold">Thêm hồ sơ mới</h2>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Tên của bé"
          className="w-full rounded-[14px] border-2 border-gray-200 bg-white px-4 py-4 text-lg font-bold outline-none focus:border-[#71C9EE]"
        />

        <p className="mt-7 mb-3 font-extrabold">Chọn Avatar:</p>
        <div className="flex justify-between">
          {avatars.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setAvatar(item)}
              className={`grid h-12 w-12 place-items-center rounded-full text-3xl transition ${avatar === item ? 'ring-2 ring-text' : 'opacity-60'}`}
              style={{ backgroundColor: avatar === item ? color : '#F3F4F6' }}
            >
              {item}
            </button>
          ))}
        </div>

        <p className="mt-7 mb-3 font-extrabold">Chọn màu nền:</p>
        <div className="flex gap-4">
          {colors.map((item) => (
            <button
              key={item}
              type="button"
              aria-label="Chọn màu"
              onClick={() => setColor(item)}
              className={`h-11 w-11 rounded-full transition ${color === item ? 'ring-4 ring-text' : ''}`}
              style={{ backgroundColor: item }}
            />
          ))}
        </div>

        <div className="mt-9 grid grid-cols-2 gap-4">
          <button type="button" onClick={() => navigate('/parent-dashboard')} className="outline-pill">
            Hủy
          </button>
          <button type="submit" disabled={isSaving || !name.trim()} className="primary-pill">
            Thêm
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm font-bold text-gray-400">
        Hiện có {getLocalChildren().length} hồ sơ trong bảng điều khiển.
      </p>
    </main>
  );
};
