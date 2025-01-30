import { CommandBuilder } from "yargs";
import { render } from "../../helpers";
import { lsPools, LsPoolsArgs } from "../../sdk";
import { lsPoolsAll } from "../../sdk/lsPoolsAll";
import { DefaultArgs } from "../../sdk/types";

export const command = "ls";

export const description = "List pools";

export const builder: CommandBuilder<DefaultArgs, LsPoolsArgs> = (yargs) =>
  yargs.options({
    all: { alias: "a", type: "boolean" },
    start: { type: "number" },
    limit: { type: "number" },
  });

export const handler = async (a: LsPoolsArgs) => {
  if (!a.all) {
    const simple = await lsPools(a);
    render(
      simple.map(({ info, key }) => [info.poolId, key]),
      ["PoolID", "PublicKey"]
    );
    return;
  }

  const all = await lsPoolsAll(a);
  const renderable = all.reduce(
    (
      acc,
      { info, key, poolState, tokenXMint, tokenYMint, tokenXVault, tokenYVault }
    ) => {
      const { poolId } = info;

      return {
        ...acc,
        [poolId]: {
          key,
          tokenXMint,
          tokenYMint,
          poolState,
          tokenXVault,
          tokenYVault,
        },
      };
    },
    {}
  );

  render(renderable, ["Key", "Value"]);
};
