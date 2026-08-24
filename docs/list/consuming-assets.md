# Consuming Assets

Use Bifrost’s curated asset data in your own application. Source of truth: [`bifrostwallet/assets`](https://github.com/bifrostwallet/assets). Published as [`@bifrostwallet/assets`](https://www.npmjs.com/package/@bifrostwallet/assets) (zero runtime dependencies).

## Install

```bash
npm install @bifrostwallet/assets
```

Or install with Yarn or pnpm using the same package name.

## Quick start

Examples use **Bifrost Wallet** on Flare (`eip155:14`).

```typescript title="example.ts"
import {
  getProvider,
  getListedProviders,
  findProviderByValidator,
  getNativeToken,
  getToken,
} from "@bifrostwallet/assets";

// Chain ids are CAIP-2 (e.g. "eip155:14", "eip155:19")
const bifrost = getProvider("eip155:14", "0x1650d2760baee638c034200dedcbe17b050d0364");
const logoURL = bifrost?.logoURL; // already absolute in the published package

const byNode = findProviderByValidator(
  "eip155:14",
  "NodeID-5oLazJm5PtV8JFb2GpzuCVMZdi1GxkwYP",
); // → Bifrost Wallet

const picker = getListedProviders("eip155:14"); // listed: true only

const flr = getNativeToken("eip155:14"); // address === null
// WNAT / WFLR on Flare (lookup is case-insensitive)
const wflr = getToken("eip155:14", "0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d");
```

CommonJS:

```js
const { getProvider, getListedProviders, getNativeToken } = require("@bifrostwallet/assets");

const bifrost = getProvider("eip155:14", "0x1650d2760baee638c034200dedcbe17b050d0364");
```

Bump the package version to pick up data releases. The npm package page ships the same quick-start examples.

## Visibility for providers

| UI | Rule |
| --- | --- |
| Provider **picker** / discovery | Show only `listed: true` (`getListedProviders`) |
| Already-selected provider (confirmations, details) | Show the entry even if `listed` is false (`getProvider` / `getProviders`) |

Beyond `listed`, entries carry curator-maintained metadata you can surface: `managementGroup` (that chain’s FTSO Management Group membership — Flare and Songbird are separate), `domainLinked` (verified website↔identity linkage), `dualNetwork` (same brand on both Flare and Songbird), and `firstTransaction` (earliest known on-chain activity; useful for "active since" displays). These fields are not covered by the provider's ownership signature.

## Provider data model

Each provider entry (`data/providers/<chain>/<identityAddress>/info.json`):

| Field | Notes |
| --- | --- |
| `name`, `description`, `websiteURL`, `links` | Self-reported, covered by the provider signature |
| `identityAddress` and EntityManager addresses / `publicKey` / `validators` | Canonical key (lowercased) plus on-chain snapshot |
| `acknowledgedResponsibilities` | Portal checkbox (`true` for new submissions); signature-covered |
| `logoHash` | SHA-256 of `logo.webp`, signature-covered integrity anchor |
| `logoURL` | Relative in git; **absolute** (GitHub raw by default) in the NPM package |
| `listed` | Curator-granted flag for provider-picker UIs |
| `managementGroup` | That chain’s FTSO Management Group membership (Flare and Songbird each have their own PollingManagementGroup) |
| `domainLinked` | Website↔identity linkage, refreshed periodically |
| `dualNetwork` | Same brand on Flare and Songbird |
| `firstTransaction` | Earliest known on-chain activity (may be absent) |

Ownership proof lives in `signatures.json` beside each entry. Grandfathering for pre-public entries ends **1 November 2026**.

## Without NPM

**Not recommended.** Prefer the NPM package so you get typed helpers, baked-in data, and release versioning. Fetching GitHub raw aggregates is a fallback only:

```
https://raw.githubusercontent.com/bifrostwallet/assets/main/data/providers/eip155-14/all.json
https://raw.githubusercontent.com/bifrostwallet/assets/main/data/tokens/eip155-14/all.json
```

Relative `logoURL` values in git resolve against:

```
https://raw.githubusercontent.com/bifrostwallet/assets/main/data/
```

(that is the default base for `resolveAssetURL`).

For production or sensitive applications, **do not rely on GitHub’s CDN for logos**. Mirror catalog media to your own bucket or CDN and resolve `logoURL` against that base (or rewrite absolute URLs after install).

## Logo / media format

Catalog logos are **WebP** (`logo.webp`). The listing form accepts PNG or WebP and converts before sign. Use each entry’s `logoURL` (WebP). Logos are **not** bundled in the NPM package; only URLs. Host those URLs from your own bucket or CDN when availability or trust in a third-party CDN matters.

## Optional CDN / signed manifest

If you operate your own static mirror, compare section hashes from `getSectionHashes()` to a published `manifest.json`, then verify with `verifyManifest` (`MANIFEST_PUBLIC_KEY` is exported from the package). Prefer the NPM package for data, and your own bucket or CDN for logos.

## Migration note

The older [`ftso-signal-providers`](https://github.com/bifrostwallet/ftso-signal-providers) repository is deprecated. Migrate to `@bifrostwallet/assets`.
