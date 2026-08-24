# Dapp

Add your dapp to Bifrost Wallet’s curated in-app browser bookmarks so users can discover it with a title, description, logo, and supported chains.

**List:** [bifrostwallet.com/list/dapp](https://bifrostwallet.com/list/dapp)

:::info
Dapp entries are curated in [`bifrostwallet/assets`](https://github.com/bifrostwallet/assets). Self-serve through the listing form is live; the public catalog under `data/dapps/` fills as submissions are reviewed. There is **no listing fee**. Submissions require [domain linkage](#domain-linkage) proving control of the dapp URL.
:::

## What to prepare

| Field | Rules |
| --- | --- |
| `title` | 2–32 characters |
| `description` | 10–350 characters (printable ASCII) |
| `url` | `https` only; paths allowed; **no query parameters** |
| `logo` | Upload **PNG or WebP**, at least **128×128** (larger OK); form resizes to opaque **128×128** WebP ≤24 KB (`logo.webp`) |
| `chains` | One or more Bifrost-supported CAIP-2 chains (Flare, Songbird, and other mainnets offered in the form) |
| `category` | `dex`, `yield`, `nft`, `games`, or `other` |
| `categoryOther` | Required in the signed submission when `category` is `other` (2–32 characters); curators map it before catalog publish |
| Domain linkage | Required: put the **EVM signing address** in `/.well-known/bifrost-dapp.txt` and/or `_bifrost-dapp` DNS (see below) |

## Entry shape

Entries live under `data/dapps/<slug>/` where `slug` is derived from the hostname (for example `sparkdex.ai` → `sparkdex-ai`).

```json title="info.json"
{
  "title": "SparkDEX",
  "description": "Decentralized exchange on the Flare Network.",
  "url": "https://sparkdex.ai",
  "logoURL": "dapps/sparkdex-ai/logo.webp",
  "chains": ["eip155:14"],
  "category": "dex",
  "featured": false
}
```

`logoURL` is stored as a relative path and resolved by consumers against their asset base URL.

## How to request a listing

1. Open [bifrostwallet.com/list/dapp](https://bifrostwallet.com/list/dapp)
2. Enter title, description, HTTPS URL, logo, chains, and category
3. Add private contact details (encrypted before they leave the browser)
4. Publish [domain linkage](#domain-linkage) for the wallet that will sign, then verify it in the form
5. Sign EIP-712 typed data and submit

Submitting again updates a pending submission.

Signing uses an **EVM wallet** (EIP-712 domain on Flare) even if your dapp itself targets other chains (for example XRPL). Non-EVM-only connect is not supported yet.

### Domain linkage

Prove that the listed dapp URL is controlled by the same EVM wallet that signs the submission. This is separate from [FTSO provider linkage](ftso-provider.md#domain-linkage-optional-recommended).

Publish using either or both methods:

* **File:** `https://your-dapp-host/.well-known/bifrost-dapp.txt`
* **DNS TXT:** name `_bifrost-dapp.<your-dapp-host>`

**Contents:** the signing address — prefer bare lowercase hex:

```text
0xabc…def
```

That is enough. If the file or TXT already contains a Bifrost-supported EVM CAIP-10 account for the same address (for example `eip155:1:0x…`), that also counts. XRPL and UTXO CAIP-2 forms are not accepted for linkage yet — the listing signature is still EVM EIP-712.

Separators may be commas, semicolons, or whitespace; `#` starts a line comment.

```bash
curl -sS https://example.com/.well-known/bifrost-dapp.txt
# 0x…

dig +short TXT _bifrost-dapp.example.com
# "0x…"
```

The listing form shows the exact value for your connected wallet. Intake re-checks linkage live on submit and rejects submissions that are not linked.

## References

* [bifrostwallet/assets](https://github.com/bifrostwallet/assets)
* [Consuming Assets](consuming-assets.md)
* [FTSO provider domain linkage](ftso-provider.md#domain-linkage-optional-recommended) (different file/DNS names)
