import { concat, interval, switchMap, take, timer } from "rxjs";
import { captureValues } from "../test-utils";
import { sendDefaultAfter } from "./sendDefaultAfter";

test("sendDefaultAfter", async () => {
  const s = timer(100).pipe(
    switchMap(() => concat(interval().pipe(take(4)), timer(100)))
  );
  const items = await captureValues(
    sendDefaultAfter(-999, 50, s),
    undefined,
    150
  );
  expect(items).toEqual([-999, 0, 1, 2, 3, 0]);
});
