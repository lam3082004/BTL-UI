import { useEffect, useState, type FC } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const isIos = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
};

const isStandalone = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  return (
    window.matchMedia?.('(display-mode: standalone)')?.matches === true ||
    // iOS Safari legacy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).standalone === true
  );
};

export const PwaStatusBanner: FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [offlineReadyToast, setOfflineReadyToast] = useState(false);

  const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
    immediate: true,
    onOfflineReady() {
      setOfflineReadyToast(true);
    },
  });

  // Auto-update silently when a new SW is available (no banner).
  useEffect(() => {
    if (!needRefresh) {
      return;
    }
    void updateServiceWorker(true);
  }, [needRefresh, updateServiceWorker]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (!offlineReady) {
      return;
    }

    const timer = window.setTimeout(() => setOfflineReadyToast(false), 3000);
    return () => window.clearTimeout(timer);
  }, [offlineReady]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const showOffline = !isOnline;
  const showInstall = Boolean(deferredPrompt);
  const showIosInstallHint = isIos() && !isStandalone() && !showInstall;
  const showReadyToast = offlineReadyToast && isOnline && !showInstall;

  if (!showOffline && !showInstall && !showIosInstallHint && !showReadyToast) {
    return null;
  }

  const message = showOffline
    ? 'Bạn đang ngoại tuyến. NumSense vẫn dùng được các nội dung đã lưu.'
    : showInstall
      ? 'Cài NumSense lên màn hình chính để mở như một ứng dụng.'
      : showIosInstallHint
        ? 'Trên iPhone/iPad: bấm nút Chia sẻ → “Add to Home Screen” để cài NumSense.'
        : 'NumSense đã sẵn sàng dùng offline.';

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4 pointer-events-none">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-soft backdrop-blur pointer-events-auto">
        <p className="text-sm font-semibold text-text">{message}</p>
        <div className="flex items-center gap-2">
          {showInstall ? (
            <button className="btn-secondary px-4 py-2 text-sm" onClick={handleInstall}>
              Cài đặt
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
