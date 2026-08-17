# List

Bifrost Wallet curates off-chain metadata (logos, names, links) for assets that appear in the wallet. The source of truth is [`bifrostwallet/assets`](https://github.com/bifrostwallet/assets). Published data is available as an NPM package and via CDN; see [Consuming Assets](consuming-assets.md).

## What you can list

| Type | Form | Status |
| --- | --- | --- |
| [FTSO provider](ftso-provider.md) | [bifrostwallet.com/list/provider](https://bifrostwallet.com/list/provider) | Self-serve |
| [Dapp](dapp.md) | [bifrostwallet.com/list/dapp](https://bifrostwallet.com/list/dapp) | Curated (self-serve expanding) |

Start at [bifrostwallet.com/list](https://bifrostwallet.com/list/) for the listing hub. Additional asset types may be documented here as the assets repository grows. There are **no paid listing fees** for the flows covered in these docs.

## How provider submissions work

```
Provider → listing form (sign) → verified → curated into bifrostwallet/assets → NPM package
```

You do not need a GitHub account to submit a provider through the listing form. Curators review before the listing goes live; submission does not guarantee acceptance.

For FTSO providers, acceptance into the catalog (name and logo) is separate from `listed: true`, which Bifrost Wallet uses for picker visibility. See [FTSO provider](ftso-provider.md#catalog-vs-listed).
