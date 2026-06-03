import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client';
import { Child, LessonActivity, MathOperation } from '../types';
import { upsertLocalChild } from '../utils/childVisuals';
import { sounds } from '../utils/soundEffects';

const avatars = ['🦊', '🐼', '🦄', '🐯', '🐻', '🐰', '🐱', '🐸'];
const colors = ['#FFD39A', '#9DD9E8', '#9DE8D0', '#F7A6B8', '#C78BE8'];

interface AddChildModalProps {
  open: boolean;
  initialChild?: Child | null;
  onClose: () => void;
  onChildAdded: (child: Child) => void;
}

export const AddChildModal: React.FC<AddChildModalProps> = ({ open, initialChild, onClose, onChildAdded }) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(avatars[0]);
  const [color, setColor] = useState(colors[0]);
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(initialChild);

  useEffect(() => {
    if (!open) return;
    setName(initialChild?.name || '');
    setAvatar(initialChild?.avatar || avatars[0]);
    setColor(colors[0]);
  }, [initialChild, open]);

  const resetForm = () => {
    setName(initialChild?.name || '');
    setAvatar(initialChild?.avatar || avatars[0]);
    setColor(colors[0]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    const child: Child = {
      ...(initialChild || {}),
      id: initialChild?.id || `local-${Date.now()}`,
      name: name.trim(),
      avatar,
      minNumber: initialChild?.minNumber || 1,
      maxNumber: initialChild?.maxNumber || 10,
      allowedOperations: initialChild?.allowedOperations || [LessonActivity.COUNTING, MathOperation.ADDITION],
    };

    setIsSaving(true);
    try {
      const token = localStorage.getItem('jwtToken');
      if (token) {
        const response = isEditing
          ? await client.put(`/children/${child.id}`, { name: child.name, avatar: child.avatar })
          : await client.post('/children', child);
        onChildAdded(response.data || child);
      } else {
        upsertLocalChild(child);
        onChildAdded(child);
      }
      sounds.playSuccess();
      resetForm();
      onClose();
    } catch (err) {
      upsertLocalChild(child);
      onChildAdded(child);
      sounds.playSuccess();
      resetForm();
      onClose();
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { sounds.playClick(); onClose(); }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-[28px] bg-white/95 p-7 shadow-2xl backdrop-blur-md"
            style={{ border: '1px solid rgba(255,255,255,0.6)' }}
          >
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#9DE8D0] to-[#71C9EE] text-4xl shadow-md">
                👶
              </div>
              <h2 className="text-2xl font-extrabold">{isEditing ? 'Sửa hồ sơ' : 'Thêm hồ sơ mới'}</h2>
              <p className="mt-1 text-sm font-bold text-gray-400">{isEditing ? 'Cập nhật tên và avatar của bé' : 'Tạo hồ sơ cho bé yêu'}</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Name input */}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên của bé"
                autoFocus
                className="w-full rounded-[16px] border-2 border-gray-200 bg-white px-4 py-4 text-lg font-bold outline-none transition focus:border-[#71C9EE] focus:shadow-md"
              />

              {/* Avatar picker */}
              <p className="mt-5 mb-3 text-sm font-extrabold text-gray-500">Chọn Avatar:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {avatars.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => { sounds.playClick(); setAvatar(item); }}
                    className={`grid h-12 w-12 place-items-center rounded-full text-2xl transition-all duration-200 ${
                      avatar === item
                        ? 'scale-110 ring-3 ring-[#71C9EE] shadow-md'
                        : 'opacity-50 hover:opacity-80'
                    }`}
                    style={{ backgroundColor: avatar === item ? color : '#F3F4F6' }}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {/* Color picker */}
              <p className="mt-5 mb-3 text-sm font-extrabold text-gray-500">Chọn màu nền:</p>
              <div className="flex justify-center gap-3">
                {colors.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-label="Chọn màu"
                    onClick={() => { sounds.playClick(); setColor(item); }}
                    className={`h-10 w-10 rounded-full transition-all duration-200 ${
                      color === item ? 'scale-110 ring-3 ring-gray-400 shadow-md' : 'opacity-60 hover:opacity-90'
                    }`}
                    style={{ backgroundColor: item }}
                  />
                ))}
              </div>

              {/* Preview */}
              <div className="mt-5 flex items-center justify-center gap-3">
                <div
                  className="grid h-14 w-14 place-items-center rounded-full text-3xl shadow-sm transition-all"
                  style={{ backgroundColor: color }}
                >
                  {avatar}
                </div>
                <span className="text-lg font-extrabold text-gray-600">
                  {name.trim() || 'Bé yêu'}
                </span>
              </div>

              {/* Action buttons */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { sounds.playClick(); resetForm(); onClose(); }}
                  className="rounded-full border-2 border-gray-200 py-3 text-base font-extrabold text-gray-500 transition hover:bg-gray-50 active:scale-95"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !name.trim()}
                  className="rounded-full bg-gradient-to-r from-[#71C9EE] to-[#9DE8D0] py-3 text-base font-extrabold text-white shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? '...' : isEditing ? 'Lưu' : '✨ Thêm'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
