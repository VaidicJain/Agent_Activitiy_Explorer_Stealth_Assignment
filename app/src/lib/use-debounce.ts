import { useCallback, useEffect, useRef } from "react";

/**
 * Debounced version of `callback`: `run` waits `delayMs` after its last call, always invokes the
 * latest `callback`, and any pending call is dropped on unmount. Both functions are stable
 * across renders unless `delayMs` changes.
 */
export function useDebounce<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs = 500,
) {
  const latestCallback = useRef(callback);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    latestCallback.current = callback;
  }, [callback]);

  const cancel = useCallback(() => clearTimeout(timer.current), []);

  const run = useCallback(
    (...args: Args) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => latestCallback.current(...args), delayMs);
    },
    [delayMs],
  );

  useEffect(() => cancel, [cancel]);

  return { run, cancel };
}
