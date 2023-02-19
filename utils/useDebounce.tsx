import { useEffect, useRef } from 'react';

export default function useDebounce(value: string, delay: number) {
  let debouncedValue = useRef<string>();

  useEffect(() => {
    const handler = setTimeout(() => {
      debouncedValue.current = value;
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue.current;
}
