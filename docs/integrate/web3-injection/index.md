# Web3 Injection

When a user opens your dapp in Bifrost Wallet’s **in-app browser**, Bifrost injects an EIP-1193 provider as `window.ethereum` and announces itself via [EIP-6963](https://eips.ethereum.org/EIPS/eip-6963).

:::info
Injection is **EVM only**. Bitcoin, Litecoin, Dogecoin, and XRP Ledger are available through [WalletConnect](../walletconnect/), not the injected provider.
:::

## Provider identity

| Property | Value |
| --- | --- |
| `window.ethereum` | Always set in the in-app browser |
| EIP-6963 `rdns` | `com.bifrostwallet` |
| EIP-6963 `name` | `Bifrost Wallet` |
| `ethereum.isBifrost` | `true` |
| Default chain (mainnet mode) | Flare (`0xe` / `14`) |
| Default chain (testnet mode) | Flare Coston2 (`0x72` / `114`) |

:::warning
The provider also sets `isMetaMask: true` for compatibility with older dapps. Prefer EIP-6963 or `ethereum.isBifrost` when detecting Bifrost among multiple wallets.
:::

## Next steps

* [Getting Started](getting-started.md): detect, connect, send a transaction
* [Methods](methods.md): full RPC surface
* [Events](events.md): `accountsChanged`, `chainChanged`, …
* [Supported Chains](chains.md): EVM networks available in the browser

## References

* [EIP-1193: Ethereum Provider JavaScript API](https://eips.ethereum.org/EIPS/eip-1193)
* [EIP-6963: Multi Injected Provider Discovery](https://eips.ethereum.org/EIPS/eip-6963)
