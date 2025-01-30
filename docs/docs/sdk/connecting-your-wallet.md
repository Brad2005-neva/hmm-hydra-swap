# Connecting your wallet

To connect your wallet, you will need to create an instance of the SDK with the optional wallet prop to sign transactions.

## Props

| Name                 | Type                | Description                                                                                                          |
| -------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| network              | Network             | One of either `mainnet`, `testnet`, `devnet` or `localnet` this informs which programIds are supplied to the system. |
| connectionOrEndpoint | Connection / string | The RPC endpoint the application will be connecting to.                                                              |
| wallet (Optional)    | Wallet              | An optional wallet to sign transactions. If left out a readonly SDK will be created.                                 |

## Example

```
  const sdk = useMemo(
    () => HydraSDK.create(network, connection, wallet),
    [connection, wallet, network]
  );
```
