# Consuming Assets

The supported way to consume Bifrost’s curated listings is [`@bifrostwallet/assets`](https://www.npmjs.com/package/@bifrostwallet/assets): an audited, zero-dependency package. Version-lock the release you ship, and read listings from that package. Source of truth: [`bifrostwallet/assets`](https://github.com/bifrostwallet/assets). Package notes: [`CONSUMERS.md`](https://github.com/bifrostwallet/assets/blob/main/CONSUMERS.md).

Most consumers are dapps and frontends. Their main job is listing every listed provider in comparison lists and pickers.

To list a provider, follow [FTSO provider](ftso-provider.md) and the [assets README](https://github.com/bifrostwallet/assets/blob/main/README.md).

## Install

```bash
npm install @bifrostwallet/assets@<version> --save-exact
```

Yarn: `yarn add @bifrostwallet/assets@<version> --exact`. pnpm: `pnpm add @bifrostwallet/assets@<version> --save-exact`. Commit the lockfile with that pin.

`--save-exact` pins the catalog you chose. A newer release cannot slip in until you change that pin. Yarn `--exact` and pnpm `--save-exact` do the same thing.

## Refresh logos when you bump

A version bump is incomplete until you refresh icons.

Download the git tag for the new pin before you ship. The tag is `v` plus the package version. Upload that release’s `providers/**/logo.webp` files to your CDN or backend, and keep the relative paths.

## Provider lookup

Chain ids are CAIP-2. These examples use Bifrost Wallet on Flare (`eip155:14`). `getProvider` matches `identityAddress` case-insensitively and returns `null` when that identity is not in this package version. An unknown chain id throws.

```typescript title="example.ts"
import {
  getListedProviders,
  getProvider,
  resolveAssetURL,
} from "@bifrostwallet/assets";

// Comparison lists and pickers: listed: true only
const listed = getListedProviders("eip155:14");

// Confirmations and details, including entries that are not listed.
// This identity is Bifrost Wallet. getProvider returns null when it is absent.
const provider = getProvider(
  "eip155:14",
  "0x1650d2760baee638c034200dedcbe17b050d0364",
);
if (!provider) throw new Error("Provider is not in this package version");

const logoURL = resolveAssetURL(
  provider.logoURL,
  "https://cdn.example.com/assets/",
);
```

The package entry is CommonJS. `require("@bifrostwallet/assets")` exposes the same `getListedProviders`, `getProvider`, and `resolveAssetURL`.

| UI | Call |
| --- | --- |
| Comparison lists and provider **picker** / discovery | `getListedProviders` (`listed: true` only) |
| Confirmations and details | `getProvider`, including entries with `listed: false` |

## Logos

Each listing’s `logoURL` is a relative path, such as `providers/eip155-14/<identity>/logo.webp`. `logoHash` is the SHA-256 of that file. The npm package does not include logo files.

After you version-lock the package, download that same tagged GitHub release, or clone that tag, once in your build. The tag is `v` plus the package version. Upload `providers/**/logo.webp` from that tag to a CDN or backend you control, and keep the relative paths. Do this again for every new pin. A version bump that skips the upload is incomplete.

`resolveAssetURL(logoURL, base)` only joins the relative path to the base you pass. The example base `https://cdn.example.com/assets/` is the directory that contains `providers/`. When you pass a base, the call does not fall back to GitHub or to Bifrost’s CDN.

A listing whose file is missing on your host is a broken image. Your host returns 404. That is typical for a provider added in the new catalog, until you upload its logo.

A path you already uploaded keeps showing the old file. If the catalog logo changed, that file is stale, and `logoHash` no longer matches.

Pass your host on every call. A GitHub raw fallback runs only when you omit the base or pass an empty one. Do not use that fallback.

`resolveAssetURL` works the same way for any listing’s `logoURL` (tokens and dapps included).

Catalog logos are WebP (`logo.webp`).

## Optional checks

Most apps can skip this. There are two checks. There is no signature over the curated catalog yet.

### Logo hash

`logoHash` is the SHA-256 of `logo.webp`, as 64 lowercase hex characters, with no `0x` prefix. Hash the bytes you serve and compare them to `provider.logoHash`. A match means that CDN file was not swapped. Use the platform you already have. Do not add a dependency for this.

Node:

```js
import { createHash } from "node:crypto";

const digest = createHash("sha256").update(logoBytes).digest("hex");
if (digest !== provider.logoHash) throw new Error("logo hash mismatch");
```

Browsers, with Web Crypto:

```js
const digest = await crypto.subtle.digest("SHA-256", logoBytes);
const hex = [...new Uint8Array(digest)]
  .map((byte) => byte.toString(16).padStart(2, "0"))
  .join("");
if (hex !== provider.logoHash) throw new Error("logo hash mismatch");
```

### Provider signature

The operator signature covers the signed fields: name, description, logo hash, website, links, identity, and the responsibilities acknowledgement. `logoHash` is one of those fields. Curator fields such as `listed` are not in that payload.

`signatures.json` is in the git listing. It is not in the npm package. Clone or download the same tag (`v` plus the package version) and, in that checkout, run:

```bash
./yarn verify:providers
```

That script uses `viem` as a dev dependency of [`bifrostwallet/assets`](https://github.com/bifrostwallet/assets). Do not add `viem` to your production app.

Self-signatures are grandfathered until 31 December 2026. `./yarn verify:providers` without `--strict` is the current check. `--strict` requires a self-signature on every provider, and that mode waits until after 31 December 2026.

## Provenance

Releases are staged with npm Trusted Publishing (OIDC). The publish step sets `NPM_CONFIG_PROVENANCE`. The workflow is [`.github/workflows/release.yml`](https://github.com/bifrostwallet/assets/blob/main/.github/workflows/release.yml).

Confirm the green check on the npm version page. You can also run `npm audit signatures`. See [Viewing package provenance](https://docs.npmjs.com/viewing-package-provenance/).
