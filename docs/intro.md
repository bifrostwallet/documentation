---
slug: /
sidebar_label: Quickstart
sidebar_position: 1
title: Quickstart
---

# Quickstart

Bifrost Wallet is a self-custody multi-chain wallet with an in-app dapp browser and a [WalletConnect certified](integrate/walletconnect/) integration. These docs cover two jobs:

1. **Integrate**: connect your dapp to Bifrost ([WalletConnect](integrate/walletconnect/) preferred; [Web3 injection](integrate/web3-injection/) in the in-app browser)
2. **List**: add an FTSO provider or dapp to Bifrost’s curated assets

## Integrate a dapp

| Path | When to use |
| --- | --- |
| [WalletConnect](integrate/walletconnect/) | **Preferred.** Users connect from any browser or another wallet app, including **UTXO** and **XRP Ledger**, which are WalletConnect-only |
| [Web3 Injection](integrate/web3-injection/) | Users open your site in Bifrost’s in-app browser (EVM) |

You need your own [Reown Cloud](https://cloud.reown.com/) project ID for WalletConnect. Do not use Bifrost’s.

## List an asset

Curated logos and metadata live in [`bifrostwallet/assets`](https://github.com/bifrostwallet/assets) and power Bifrost Wallet and third-party consumers.

| Type | Form |
| --- | --- |
| [FTSO provider](list/ftso-provider.md) | [bifrostwallet.com/list/provider](https://bifrostwallet.com/list/provider) |
| [Dapp](list/dapp.md) | [bifrostwallet.com/list/dapp](https://bifrostwallet.com/list/dapp) |

See [List overview](list/) for how submissions work and [Consuming Assets](list/consuming-assets.md) if you want to use the published data in your own software.
