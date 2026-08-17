# WalletConnect

Bifrost Wallet is a [WalletConnect](https://walletconnect.com/) **certified wallet**, built with [Reown WalletKit](https://docs.reown.com/).

## Namespaces

| Namespace | Chains | Notes |
| --- | --- | --- |
| `eip155` | EVM networks | JSON-RPC |
| `bip122` | Bitcoin, Litecoin, Dogecoin | Unique UTXO RPC surface |
| `xrpl` | XRP Ledger | `xrpl_signTransaction` |

## Important constraints

* Sessions are gated by the wallet’s **mainnet vs testnet** mode. A mainnet-only proposal fails if the user is in testnet mode (and the reverse).
* Bifrost keeps a limited number of concurrent sessions (currently five). Older sessions may be pruned.
* UTXO and XRPL methods are available over WalletConnect (`bip122` / `xrpl` namespaces).

## Guides

* [Connect](connect.md): AppKit, QR, mobile deep links, One-Click Auth
* [EVM Blockchains](evm-blockchains.md)
* [UTXO Blockchains](utxo-blockchains.md)
* [XRP Ledger](xrp-ledger.md)

## References

* [Reown docs](https://docs.reown.com/)
* [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md)
