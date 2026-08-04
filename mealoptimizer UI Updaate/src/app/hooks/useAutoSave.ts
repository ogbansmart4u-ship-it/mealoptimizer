import { useEffect, useRef } from 'react';

interface AutoSaveOptions {
  key: string;
  data: any;
  delay?: number;
  onSave?: () => void;
}

export function useAutoSave({ key, data, delay = 2000, onSave }: AutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (data && Object.keys(data).length > 0) {
        localStorage.setItem(key, JSON.stringify(data));
        onSave?.();
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, data, delay, onSave]);
}

export function getAutoSavedData<T>(key: string): T | null {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function clearAutoSavedData(key: string) {
  localStorage.removeItem(key);
}
