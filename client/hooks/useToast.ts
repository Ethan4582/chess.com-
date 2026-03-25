import { useState, useCallback } from 'react';

export interface Toast {
  id: number;
  message: string;
}

let toastCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string) => {
    const id = ++toastCounter;
    setToasts(prev => [...prev.slice(-4), { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return { toasts, addToast };
}
