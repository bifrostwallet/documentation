# WalletConnect

Bifrost Wallet is a [WalletConnect](https://walletconnect.com/) **certified wallet**, built with [Reown WalletKit](https://docs.reown.com/).

## Namespaces

| Namespace | Chains | Session methods (summary) | How to get the address |
| --- | --- | --- | --- |
| `eip155` | EVM networks | `eth_*`, `personal_sign`, typed data, … | Session CAIP-10 **or** `eth_accounts` |
| `bip122` | Bitcoin, Litecoin, Dogecoin | `sendTransfer`, `getAccountAddresses`, `signPsbt`, `signMessage` | Session CAIP-10, `bip122_addressesChanged`, or `getAccountAddresses` |
| `xrpl` | XRP Ledger | `xrpl_signTransaction` only | Session CAIP-10 only (no get-accounts RPC) |

## Important constraints

* Sessions are gated by the wallet’s **mainnet vs testnet** mode. A mainnet-only proposal fails if the user is in testnet mode (and the reverse).
* Bifrost keeps a limited number of concurrent sessions (currently five). Older sessions may be pruned.
* UTXO and XRPL methods are available over WalletConnect (`bip122` / `xrpl` namespaces).
* After connect, read approved accounts from `session.namespaces.<ns>.accounts` ([CAIP-10](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md)). See [Connect](connect.md#reading-accounts-after-connect).

## Guides

* [Connect](connect.md): AppKit, QR, mobile deep links, accounts after connect, One-Click Auth
* [EVM Blockchains](evm-blockchains.md)
* [UTXO Blockchains](utxo-blockchains.md)
* [XRP Ledger](xrp-ledger.md)

## References

* [Reown docs](https://docs.reown.com/)
* [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md)
* [CAIP-10](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md)
