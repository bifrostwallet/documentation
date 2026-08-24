# Methods

All methods below are available on the injected `window.ethereum` provider in Bifrost’s in-app browser unless noted.

## Wallet-handled methods

These are handled by Bifrost (UI and/or local logic), not only proxied to a public RPC.

| Method | Description |
| --- | --- |
| `eth_accounts` | Returns approved accounts for this origin, or `[]` |
| `eth_requestAccounts` | Prompts for connection; returns approved accounts |
| `eth_chainId` | Current chain ID as hex string |
| `net_version` | Current chain ID as decimal string |
| `eth_sendTransaction` | Sign and submit a transaction (`from` must be approved) |
| `eth_signTypedData` | EIP-712 typed data (treated as v4) |
| `eth_signTypedData_v3` | EIP-712 typed data v3 |
| `eth_signTypedData_v4` | EIP-712 typed data v4 |
| `personal_sign` | Sign a UTF-8 / hex message |
| `personal_ecRecover` | Recover address from a `personal_sign` signature (no UI) |
| `wallet_getPermissions` | Returns `eth_accounts` permission info if connected |
| `wallet_requestPermissions` | Request `eth_accounts` (same connect flow) |
| `wallet_revokePermissions` | Revoke `eth_accounts`; emits `accountsChanged` with `[]` |
| `wallet_watchAsset` | Prompt to track a custom ERC-20 token |
| `wallet_scanQRCode` | Open the device QR scanner |
| `wallet_switchEthereumChain` | Switch to a built-in, active EVM chain |
| `wallet_addEthereumChain` | Switch to a built-in chain (does **not** add arbitrary networks) |

### Permissions

Only the `eth_accounts` permission is supported. Other permission keys in `wallet_requestPermissions` are denied.

### `wallet_watchAsset`

Use for ERC-20 style assets. NFT / ERC-721 watch flows are not supported.

## Passthrough (public RPC)

Unrecognized methods with array `params` are forwarded to Bifrost’s public JSON-RPC for the active chain. Typical read calls work when the node supports them, for example:

* `eth_call`
* `eth_getBalance`
* `eth_blockNumber`
* `eth_getTransactionReceipt`
* `eth_getTransactionCount`

Signing or broadcasting that requires the user’s key must use the wallet-handled methods above (for example use `eth_sendTransaction`, not a raw key on the client).

## Explicitly unsupported

These methods are rejected by Bifrost:

| Method | Notes |
| --- | --- |
| `eth_sign` | Use `personal_sign` or typed data |
| `eth_signTypedData_v1` | Use v3 / v4 |
| `eth_signTypedData_v2` | Use v3 / v4 |
| `eth_decrypt` | Not implemented |
| `eth_getEncryptionPublicKey` | Not implemented |

Also not available on the injected provider (use [WalletConnect](../walletconnect/) instead):

* `xrpl_signTransaction`
* UTXO methods: `sendTransfer`, `getAccountAddresses`, `signPsbt`, `signMessage`

## References

* [EIP-1193](https://eips.ethereum.org/EIPS/eip-1193)
* [EIP-712](https://eips.ethereum.org/EIPS/eip-712)
* [EIP-747 (`wallet_watchAsset`)](https://eips.ethereum.org/EIPS/eip-747)
