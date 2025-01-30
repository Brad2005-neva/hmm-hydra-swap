import * as addLiquidity from "./add-liquidity";
import * as initializeGlobalState from "./initialize-global-state";
import * as initializePoolState from "./initialize-pool-state";
import * as inspect from "./inspect";
import * as lsAccounts from "./ls-accounts";
import * as lsPools from "./ls-pools";
import * as removeLiquidity from "./remove-liquidity";
import * as setFeature from "./set-feature";
import * as setLimits from "./set-limits";
import * as setPricesOwner from "./set-prices-owner";
import * as swap from "./swap";
import * as transferGlobalAdmin from "./transfer-global-admin";
import * as transferPoolAdmin from "./transfer-pool-admin";

export const commands = [
  addLiquidity,
  initializeGlobalState,
  initializePoolState,
  inspect,
  lsAccounts,
  lsPools,
  removeLiquidity,
  setFeature,
  setLimits,
  setPricesOwner,
  swap,
  transferGlobalAdmin,
  transferPoolAdmin,
];
