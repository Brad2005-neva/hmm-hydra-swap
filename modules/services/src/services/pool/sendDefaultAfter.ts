import { concat, Observable, of, timeout } from "rxjs";

// Provide a default value for a stream after a given time period
export function sendDefaultAfter<T>(
  defaultValue: T,
  time: number,
  stream: Observable<T>
) {
  return stream.pipe(
    timeout({
      first: time,
      with: () => {
        return concat(of(defaultValue), stream);
      },
    })
  );
}
