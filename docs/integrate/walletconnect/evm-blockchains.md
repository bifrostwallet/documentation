# EVM Blockchains

WalletConnect namespace: `eip155`.

Chains are offered according to the user’s mainnet/testnet mode. Use CAIP-2 IDs with the `eip155:` prefix (not `eip:`).

## Mainnet

<table><thead><tr><th width="200">Network</th><th>CAIP-2 Chain ID</th></tr></thead><tbody><tr><td>Flare</td><td>eip155:14</td></tr><tr><td>Songbird</td><td>eip155:19</td></tr><tr><td>Ethereum</td><td>eip155:1</td></tr><tr><td>Arbitrum One</td><td>eip155:42161</td></tr><tr><td>Optimism</td><td>eip155:10</td></tr><tr><td>Base</td><td>eip155:8453</td></tr><tr><td>Polygon</td><td>eip155:137</td></tr><tr><td>BNB Smart Chain</td><td>eip155:56</td></tr><tr><td>XDC</td><td>eip155:50</td></tr><tr><td>HyperEVM</td><td>eip155:999</td></tr></tbody></table>

## Testnet

<table><thead><tr><th width="220">Network</th><th>CAIP-2 Chain ID</th></tr></thead><tbody><tr><td>Flare Coston2</td><td>eip155:114</td></tr><tr><td>Songbird Coston</td><td>eip155:16</td></tr><tr><td>Ethereum Sepolia</td><td>eip155:11155111</td></tr><tr><td>Arbitrum Sepolia</td><td>eip155:421614</td></tr><tr><td>Optimism Sepolia</td><td>eip155:11155420</td></tr><tr><td>Base Sepolia</td><td>eip155:84532</td></tr><tr><td>Polygon Amoy</td><td>eip155:80002</td></tr><tr><td>BNB Smart Chain testnet</td><td>eip155:97</td></tr><tr><td>XDC Apothem</td><td>eip155:51</td></tr><tr><td>HyperEVM testnet</td><td>eip155:998</td></tr></tbody></table>

## Methods

Supported for WalletConnect session requests:

| Method | Notes |
| --- | --- |
| `eth_accounts` | Approved accounts for the session |
| `eth_requestAccounts` | May prompt if needed |
| `eth_sendTransaction` | Sign and submit |
| `eth_signTypedData` | EIP-712 |
| `eth_signTypedData_v3` | EIP-712 v3 |
| `eth_signTypedData_v4` | EIP-712 v4 |
| `personal_sign` | Message signing |
| `wallet_requestPermissions` | `eth_accounts` |
| `wallet_watchAsset` | Track ERC-20 |
| `wallet_scanQRCode` | Device QR scanner |

### Request chain

Session requests must include a `chainId` in CAIP-2 form (for example `eip155:14`). Bifrost does not emit EVM `chainChanged` / `accountsChanged` over WalletConnect when the user changes network in the app. Plan UI around explicit chain selection in your session namespaces.

## References

* [EIP-155](https://eips.ethereum.org/EIPS/eip-155)
* [CAIP-2 for eip155](https://github.com/ChainAgnostic/namespaces/blob/main/eip155/caip2.md)
