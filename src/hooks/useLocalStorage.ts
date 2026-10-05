import { useState, useEffect } from 'react';

const PREFIX = 'app:v1:';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const fullKey = key.startsWith(PREFIX) ? key : `${PREFIX}${key}`;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return initialValue;
      const item = window.localStorage.getItem(fullKey);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`[useLocalStorage] Error reading key "${fullKey}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      setStoredValue((current) => {
        const valueToStore = value instanceof Function ? value(current) : value;
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(fullKey, JSON.stringify(valueToStore));
          }
        } catch (writeErr) {
          console.warn(`[useLocalStorage] Error writing key "${fullKey}":`, writeErr);
        }
        return valueToStore;
      });
    } catch (err) {
      console.warn(`[useLocalStorage] Error in setValue for "${fullKey}":`, err);
    }
  };

  const removeValue = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(fullKey);
      }
      setStoredValue(initialValue);
    } catch (err) {
      console.warn(`[useLocalStorage] Error removing key "${fullKey}":`, err);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === fullKey && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          // ignore parsing error from other tabs
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fullKey]);

  return [storedValue, setValue, removeValue];
}
