import { useRef, useCallback } from 'react';
type Callback<T extends any[]> = (...args: T) => void;

export function useThrottle<T extends any[]>(callback: Callback<T>, limit: number) {
  const inThrottleRef = useRef(false);

  const throttledCallback = useCallback((...args: T) => { 
    if (inThrottleRef.current) {
      return;
    }
    callback(...args);
    inThrottleRef.current = true;
    setTimeout(() => {
      inThrottleRef.current = false;
    }, limit);
  }, [callback, limit]);
  
  return throttledCallback;
}
