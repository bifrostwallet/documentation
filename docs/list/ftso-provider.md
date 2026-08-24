# FTSO Provider

List your FTSO data provider (and its validators) so Bifrost Wallet and other apps can show your logo, description, and entity metadata on Flare and Songbird.

One listing covers your **provider identity** and nested **validator NodeIDs**. Validators are not a separate listing type.

**List:** [bifrostwallet.com/list/provider](https://bifrostwallet.com/list/provider)

## Prerequisites

* A registered FTSO entity on Flare (`eip155:14`) or Songbird (`eip155:19`)
* Control of the entity **identity address** (you will sign with it)
* A logo the form can convert (PNG or WebP); see [logo requirements](#logo-requirements)

## Submit via the listing form

1. Open [bifrostwallet.com/list/provider](https://bifrostwallet.com/list/provider)
2. Connect the wallet that holds your identity address (or paste the address). Bifrost loads entity data from the on-chain EntityManager and detects the network.
3. Enter name, description, website, optional social links, and upload your logo
4. Confirm the **Listing acknowledgement** checkbox
5. Sign EIP-712 typed data with the **identity address**
6. Submit: your listing is verified and curated into [`bifrostwallet/assets`](https://github.com/bifrostwallet/assets)

Submitting again updates a pending submission. To change a live listing later, go through the form again.

## Logo requirements

Upload **PNG or WebP** at least **128×128**. Larger images are fine; the form cover-fits and converts to the catalog form before hash/sign:

* Opaque **128×128** WebP on a solid white background
* Maximum file size **24 KB**
* Stored as `logo.webp`; `logoHash` is the SHA-256 of those WebP bytes

Preview shows the **converted** WebP. New intake rejects anything that is not exactly this final form.

## What gets stored

Each provider lives under `data/providers/<eip155-14|eip155-19>/<identityAddress>/` with `info.json`, `logo.webp`, and `signatures.json`.

| Field | Signed by identity? | Source |
| --- | --- | --- |
| `name`, `description`, `websiteURL`, `links` | yes | You |
| `identityAddress` and EntityManager addresses / `publicKey` / `validators` | yes | On-chain + you sign the snapshot |
| `acknowledgedResponsibilities` | yes | Portal checkbox (`true` for new submissions) |
| `logoHash` | yes | SHA-256 of `logo.webp` |
| `logoURL` | no | Relative hosting path |
| `listed` | no | Granted by curators |
| `managementGroup` | no | Synced from that chain’s PollingManagementGroup (Flare and Songbird are separate groups) |
| `domainLinked` | no | Refreshed nightly from your website’s [domain linkage](#domain-linkage-optional-recommended) proof |
| `dualNetwork` | no | Curator-maintained: same brand present on both Flare and Songbird in the catalog |
| `firstTransaction` | no | Earliest known on-chain activity |

Signatures use **EIP-712** (`eth_signTypedData_v4`, domain `Bifrost Assets`). The signed JSON excludes `logoURL`, `listed`, `managementGroup`, `domainLinked`, `dualNetwork`, and `firstTransaction`.

The signature requirement is a **self-signature** by your identity address. Entries that predate the repository's public launch are grandfathered until **1 November 2026**; after that date, entries without a valid self-signature are delisted until signed.

### Domain linkage (optional, recommended)

Prove that your listing website is controlled by the same entity as the FTSO **identity address**. Publish a CAIP-2 prefixed record (`eip155:<chainId>:<identityAddress>`) using either or both methods below:

* **File:** `https://your-site/.well-known/providers.txt` (records separated by commas)
* **DNS TXT:** name `_providers.<your-host>` (value is the same record payload)

The listing form shows the exact value to copy for your entity.

#### One network or both

| Situation | Example contents |
| --- | --- |
| Flare only | `eip155:14:0xabc…` |
| Songbird only | `eip155:19:0xdef…` |
| Both (same website) | `eip155:14:0xabc…,eip155:19:0xdef…` |

```bash
curl -sS https://example.com/.well-known/providers.txt
# eip155:14:0x…,eip155:19:0x…

dig +short TXT _providers.example.com
# "eip155:14:0x…,eip155:19:0x…"
```

The unsigned `domainLinked` flag is refreshed nightly; you can pre-check with tooling in [`bifrostwallet/assets`](https://github.com/bifrostwallet/assets) (`./yarn verify:provider-domains`).

## Catalog vs `listed`

Accepted submissions enter the **catalog** with name, logo, and metadata. That data is available for confirmations, deep links, and apps that already know the provider.

`listed: true` is curator-granted and is what Bifrost Wallet uses for **picker / discovery** UIs. Requirements include:

* Private outreach on file (sealed via the listing portal)
* `domainLinked: true`
* Trustworthy / Resilient / Independent bar (signed `acknowledgedResponsibilities`)
* **Available** participation: actively submitting and earning FSP rewards with healthy uptime; running FDC, FSP, feed provider, validators, and an RPC node; enough self-bond, vote power, and stake

### Initial listing guidelines

Curator bar for new `listed: true`:

| Network | Guideline |
| --- | --- |
| **Flare** | Self-bond ≥ **10M FLR**; ≥ **2** validators; ≥ **20** unique P-chain stakers **and** ≥ **2M FLR** external stake; WFLR vote power ≥ **100M FLR**; prefer brands that already have a Songbird (canary) catalog entry |
| **Songbird** | WSGB vote power ≥ **50M** |

**Grandfathering:** providers listed before the repository went public keep `listed: true` until **1 November 2026** without completing domain linkage or ownership signatures. From that date, listed providers without `domainLinked: true` and a valid self-signature are delisted, and relisted when the requirements are met.

### Guidance for apps that consume provider data

1. **Hide** providers without `listed` in searchable picker lists
2. **Show** all providers when a choice is already made (confirmations, details)

See [Consuming Assets](consuming-assets.md).

## References

* [bifrostwallet/assets](https://github.com/bifrostwallet/assets)
* [Flare FTSO docs](https://dev.flare.network/)
