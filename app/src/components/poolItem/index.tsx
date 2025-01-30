import { FC, useCallback } from "react";
import {
  PoolDescriptor,
  useLoaderFinder,
  useLoaderStream,
} from "@hydraprotocol/services";
import { Asset, Decimal } from "@hydraprotocol/sdk";
import { TokenPrices } from "@types";
import { LiquidityPoolListing } from "@ui/poolListing/LiquidityPoolListing";
import { PoolView } from "@ui/poolListing/PoolView";
import { PoolListing } from "@ui/poolListing/PoolListing";
import { ButtonActions } from "@ui/poolListing/ButtonActions";
import { TitleCell } from "@ui/hydraPage/poolCell";
import {
  getLpTokenBalanceInUSD,
  getSharePercent,
  getTVLInUSD,
  scaleToUSD,
} from "./lib";
import { useFlow } from "@components/flows";

interface PoolItemProps {
  type: "all" | "liquidity";
  poolDescriptor: PoolDescriptor;
  tokenAInit: Asset;
  tokenBInit: Asset;
  isDoubleDip?: boolean;
  hasWithdraw?: boolean;
  isDisable?: boolean;
  hasUndip?: boolean;
  inRange?: boolean;
  tokenPrices: TokenPrices;
}

const PoolItem: FC<PoolItemProps> = ({
  type,
  poolDescriptor,
  hasWithdraw,
  tokenPrices,
  tokenAInit,
  tokenBInit,
}) => {
  const { startDepositFlow, startWithdrawFlow } = useFlow();
  const doDeposit = useCallback(
    () => startDepositFlow(tokenAInit, tokenBInit, poolDescriptor),
    [startDepositFlow, tokenAInit, tokenBInit, poolDescriptor]
  );

  const doWithdrawal = useCallback(() => {
    startWithdrawFlow(tokenAInit, tokenBInit, poolDescriptor);
  }, [startWithdrawFlow, tokenAInit, tokenBInit, poolDescriptor]);

  const finder = useLoaderFinder(poolDescriptor);
  const poolState = useLoaderStream(() => finder.poolState());
  const tokenXVault = useLoaderStream(() => finder.tokenXVault());
  const tokenYVault = useLoaderStream(() => finder.tokenYVault());
  const lpTokenMint = useLoaderStream(() => finder.lpTokenMint());
  const lpTokenAssociatedAccount = useLoaderStream(() =>
    finder.lpTokenAssociatedAccount()
  );
  const lpMintLoaded = Boolean(lpTokenMint);

  // sort X and Y to deliver A and B
  const [tokenAVault, tokenBVault] =
    `${tokenXVault?.account.data.mint}` === `${tokenAInit.address}`
      ? [tokenXVault, tokenYVault]
      : [tokenYVault, tokenXVault];

  // extract data from accounts
  const cValue = poolState?.account.data.cValue ?? 0;
  const lpTokenDecimals = lpTokenMint?.account.data.decimals ?? 0;
  const lpTokenSupplyUnscaled = lpTokenMint?.account.data.supply ?? 0n;
  const lpTokenUserBalance =
    lpTokenAssociatedAccount?.account.data.amount ?? 0n;

  // extact data from input
  const tokenADecimals = BigInt(tokenAInit?.decimals ?? 0);
  const tokenBDecimals = BigInt(tokenBInit?.decimals ?? 0);
  const tokenAVaultBalanceUnscaled = tokenAVault?.account.data.amount ?? 0n;
  const tokenBVaultBalanceUnscaled = tokenBVault?.account.data.amount ?? 0n;

  // Get scaled amounts

  const lpTokenBalance = Decimal.from(
    lpTokenUserBalance,
    BigInt(lpTokenDecimals)
  );

  const lpTokenSupply = Decimal.from(
    lpTokenSupplyUnscaled,
    BigInt(lpTokenDecimals)
  );

  const scaledTokenAPrice = scaleToUSD(tokenPrices[tokenAInit.symbol]);

  const scaledTokenBPrice = scaleToUSD(tokenPrices[tokenBInit.symbol]);

  const tokenAVaultBalance = Decimal.from(
    tokenAVaultBalanceUnscaled,
    tokenADecimals
  );

  const tokenBVaultBalance = Decimal.from(
    tokenBVaultBalanceUnscaled,
    tokenBDecimals
  );

  // Do calculations
  const lpTVLInUSD = getTVLInUSD({
    scaledTokenAPrice,
    scaledTokenBPrice,
    tokenAVaultBalance,
    tokenBVaultBalance,
  });
  const sharePercent = getSharePercent({ lpTokenBalance, lpTokenSupply });
  const lpTokenBalanceInUSD = getLpTokenBalanceInUSD({
    lpTVLInUSD,
    sharePercent,
  });
  const showWithdraw = Boolean(hasWithdraw && lpTokenUserBalance > 0n);

  return (
    <>
      <PoolView
        cValue={cValue}
        type={type}
        tokenAInit={tokenAInit}
        tokenBInit={tokenBInit}
      >
        {
          {
            all: (
              <PoolListing
                title={
                  <TitleCell
                    tokenA={tokenAInit}
                    tokenB={tokenBInit}
                    address={`${lpTokenMint?.pubkey}`}
                  />
                }
                lpTokenMintDecimals={lpTokenDecimals}
                lpTokenSupply={lpTokenSupply}
                lpTVLInUSD={lpTVLInUSD}
                lpMintLoaded={lpMintLoaded}
              />
            ),
            liquidity: (
              <LiquidityPoolListing
                title={
                  <TitleCell
                    tokenA={tokenAInit}
                    tokenB={tokenBInit}
                    address={`${lpTokenAssociatedAccount?.pubkey}`}
                  />
                }
                lpTokenBalance={lpTokenBalance}
                lpTokenBalanceInUSD={lpTokenBalanceInUSD}
                lpTokenDecimals={lpTokenDecimals}
                sharePercent={sharePercent}
                lpMintLoaded={lpMintLoaded}
              />
            ),
          }[type]
        }
        <ButtonActions
          showWithdraw={showWithdraw}
          onDepositClicked={doDeposit}
          onWithdrawClicked={doWithdrawal}
        />
      </PoolView>
    </>
  );
};

export default PoolItem;
