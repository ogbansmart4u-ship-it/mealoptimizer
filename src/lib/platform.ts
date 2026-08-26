/**
 * Platform detection helper for MealOptimiza.
 * Supports Web, PWA Standalone, and Native Capacitor (iOS / Android).
 */

export const isWeb = typeof window !== 'undefined';

export const isStandalonePWA = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
};

export const isCapacitorNative = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform();
};

export const getPlatform = (): 'ios' | 'android' | 'pwa' | 'web' => {
  if (typeof window === 'undefined') return 'web';
  const cap = (window as any).Capacitor;
  if (cap?.isNativePlatform()) {
    return cap.getPlatform() === 'ios' ? 'ios' : 'android';
  }
  if (isStandalonePWA()) return 'pwa';
  return 'web';
};

export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  const platform = getPlatform();
  if (platform === 'ios') return true;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
};

export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  const platform = getPlatform();
  if (platform === 'android') return true;
  return /Android/.test(navigator.userAgent);
};
