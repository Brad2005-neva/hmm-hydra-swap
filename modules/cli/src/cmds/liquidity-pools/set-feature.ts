import { FeatureType } from "@hydraprotocol/sdk";
import { CommandBuilder } from "yargs";
import { render } from "../../helpers";
import { setFeature, SetFeatureArgs, setFeatureMultisig } from "../../sdk";
import { DefaultArgs } from "../../sdk/types";

export const command = "set-feature";

export const description = "Set Feature";

export const builder: CommandBuilder<DefaultArgs, SetFeatureArgs> = (yargs) =>
  yargs
    .options({
      enable: { type: "boolean" },
      disable: { type: "boolean" },
      type: {
        type: "string",
        choices: [
          FeatureType.AddLiquidity,
          FeatureType.All,
          FeatureType.CreatePublicPools,
          FeatureType.RemoveLiquidity,
          FeatureType.Swap,
        ],
        demandOption: true,
      },
    })
    .check(({ enable, disable }) => {
      if (enable && !disable) {
        return true;
      }
      if (!enable && disable) {
        return true;
      }
      return "--enable or --disable must be set";
    });

export const handler = async (a: SetFeatureArgs) => {
  const method = a.multisigSafe ? setFeatureMultisig : setFeature;

  render(await method(a));
};
