import { useState, useCallback, useRef, useEffect } from 'react';
import { sounds } from '../utils/soundEffects';

interface SpeakButtonProps {
  text: string;
  size?: 'sm' | 'md';
}

export const SpeakButton: React.FC<SpeakButtonProps> = ({ text, size = 'md' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isSoundEnabled = (): boolean => {
    const saved = localStorage.getItem('numsenseParentSettings');
    if (!saved) return true;
    try {
      return JSON.parse(saved).soundEnabled !== false;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const speak = useCallback(() => {
    if (!text) return;
    if (!isSoundEnabled()) return;

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
    }

    sounds.playClick();

    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(text)}`;
      const audio = new Audio(url);
      
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
      };

      audioRef.current = audio;
      audio.play().catch((err) => {
        console.error('Audio playback failed:', err);
        setIsSpeaking(false);
        if (audioRef.current === audio) {
          audioRef.current = null;
        }
      });
    } catch (e) {
      console.error('Error starting text-to-speech:', e);
      setIsSpeaking(false);
    }
  }, [text]);

  const sizeClasses = size === 'sm'
    ? 'h-9 w-9 text-lg'
    : 'h-11 w-11 text-xl';

  return (
    <button
      type="button"
      onClick={speak}
      className={`${sizeClasses} grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#FFD39A] to-[#FFB74D] text-white shadow-sm transition-all active:scale-90 ${
        isSpeaking ? 'animate-pulse ring-2 ring-[#FFD39A]/50 shadow-md' : 'hover:shadow-md hover:scale-105'
      }`}
      aria-label="Đọc yêu cầu bài tập"
      title="Nghe yêu cầu bài tập"
    >
      {isSpeaking ? '🔊' : '🔈'}
    </button>
  );
};
