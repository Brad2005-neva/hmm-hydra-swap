import { Ctx, PoolInfo } from "../../types";
import { from, map, mergeMap, Observable, range, switchMap } from "rxjs";
import { LoaderFinder } from "../LoaderFinder";
import { KeyFinder } from "../KeyFinder";

async function deriveKeyAndInfo(
  keys: KeyFinder,
  loader: LoaderFinder,
  index: number
) {
  const [key, info] = await Promise.all([
    keys.poolState(index),
    loader.poolState(index).info(),
  ]);
  return { key, info };
}

export function getAllPoolsAsStream(
  ctx: Ctx,
  _count?: number
): Observable<PoolInfo> {
  const keys = KeyFinder.fromCtx(ctx);
  const loaders = LoaderFinder.new(ctx, keys);
  return loaders
    .globalState()
    .stream()
    .pipe(
      map((globalState) => globalState?.account.data.poolCount ?? 0),
      switchMap((count) => range(0, count)),
      mergeMap((num) => from(deriveKeyAndInfo(keys, loaders, num))),
      map(({ key, info }) => ({
        key: key,
        info: info.data,
      }))
    );
}

export async function getAllPoolsAsList(
  ctx: Ctx,
  start = 0,
  limit = 20
): Promise<PoolInfo[]> {
  const keys = KeyFinder.fromCtx(ctx);
  const loaders = LoaderFinder.new(ctx, keys);
  const info = await loaders.globalState().info();
  const { poolCount } = info.data;
  const list: PoolInfo[] = [];
  for (let i = start; i < Math.min(start + limit, poolCount); i++) {
    const item = await deriveKeyAndInfo(keys, loaders, i);
    list.push({ ...item, info: item.info.data });
  }
  return list;
}
