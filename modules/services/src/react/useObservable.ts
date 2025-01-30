import { useEffect, useRef, useState, useCallback } from "react";
import { Observable, Subject } from "rxjs";

// Effectively gets a static handler for pushing values on an observable from within React
export function useReactiveCallback<T>() {
  const ref = useRef(null as any);
  if (!ref.current) {
    const subject = new Subject<T>();
    const callback = (value: T) => subject.next(value);

    const observable$ = subject.asObservable();

    ref.current = [callback, observable$] as const;
  }
  return ref.current;
}

// Turn an observable into react state
export function useObservable<T>(
  observable$: Observable<T>,
  initialValue: T
): [T, string, boolean] {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setErrorMsg] = useState<string>("");
  const [state, setState] = useState<"loading" | "result" | "error">("loading");

  const handleValue = useCallback((value) => {
    setValue(value);
    setState("result");
  }, []);

  const handleError = useCallback((err: { message: string }) => {
    setErrorMsg(err.message);
    setState("error");
  }, []);

  useSubscription(observable$, handleValue, handleError);

  return [value, error, state === "loading"];
}

// Subscribe to an observable as an effect
export function useSubscription<T>(
  obs$: Observable<T>,
  next: (value: T) => void,
  error?: (err: any) => void
) {
  useEffect(() => {
    const s = obs$.subscribe({
      next,
      error,
    });
    return () => s.unsubscribe();
  }, [obs$, next, error]);
}
