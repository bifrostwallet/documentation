# Consuming Assets

Pin [`@bifrostwallet/assets`](https://www.npmjs.com/package/@bifrostwallet/assets), copy provider logos onto a host you control, and read the list from the package or from one JSON file on that host. Most consumers are dapps and frontends. Their main job is comparison lists and pickers.

Source of truth: [`bifrostwallet/assets`](https://github.com/bifrostwallet/assets). Package notes: [`CONSUMERS.md`](https://github.com/bifrostwallet/assets/blob/main/CONSUMERS.md). To list a provider, follow [FTSO provider](ftso-provider.md) and the [assets README](https://github.com/bifrostwallet/assets/blob/main/README.md).

## 1. Pin the package

```bash
npm install @bifrostwallet/assets@<version> --save-exact
```

Yarn: `yarn add @bifrostwallet/assets@<version> --exact`. pnpm: `pnpm add @bifrostwallet/assets@<version> --save-exact`.

`--save-exact` and `--exact` pin one version so a newer catalog cannot slip in unnoticed. Commit the lockfile with that pin.

When you bump that pin, download the new tag and upload that release’s logo files before you ship. A version bump without refreshing icons is incomplete. The steps are under [Copy logos](#2-copy-logos-and-one-json-file-if-you-want-one).

## 2. Copy logos, and one JSON file if you want one

Do this the first time you adopt a pin, and again whenever you bump it.

Logo files are not in the npm package. Token, dapp, and contract logo files are not in it either. Each provider `logoURL` is a relative path such as `providers/eip155-14/<identity>/logo.webp`. `logoHash` is the SHA-256 of that file. Catalog logos are WebP (`logo.webp`).

Download or clone the git tag that matches the pin. The tag is `v` plus that version. In the tag the files are `data/providers/**/logo.webp`. Upload them so the key stays `providers/**/logo.webp`. [Copy commands](#copy-commands) for Cloud Storage and S3 are below.

`resolveAssetURL(logoURL, base)` only joins that relative path to the base you pass. The base is the directory that contains `providers/`, for example `https://cdn.example.com/assets/`. When you pass a base, the call does not fall back to GitHub or to Bifrost’s CDN. Pass a base on every call. The GitHub raw fallback runs only when you omit the base or pass an empty one. Do not use that fallback.

A missing file is a broken image. Your host returns 404. That is a provider you have not uploaded yet. A path you already uploaded keeps the old file. If this pin changed the logo, that file is stale and `logoHash` no longer matches.

`resolveAssetURL` works the same way for any listing’s `logoURL` (tokens and dapps included).

If you want one JSON file on your host, write it in this same step and upload it next to the logos. Name the file yourself.

```typescript title="host-catalog.ts"
import { writeFileSync } from "node:fs";
import { getListedProviders, resolveAssetURL } from "@bifrostwallet/assets";

const base = "https://cdn.example.com/assets/";
const listed = getListedProviders("eip155:14").map((provider) => ({
  ...provider,
  logoURL: resolveAssetURL(provider.logoURL, base),
}));

writeFileSync("listed-providers.json", `${JSON.stringify(listed)}\n`);
```

`getProviders("eip155:14")` is the same list plus providers that are not `listed`. Use it when the file should include those entries.

## 3. Read at runtime

Import the helpers, or fetch the one JSON file from your host. One request. It does not use GitHub or Bifrost.

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

A picker imports this entry only. Signatures are a separate package entry. Import that entry on purpose in a check, not from these helpers. A list UI does not need it. The export path is not fixed in the published package yet.

## Copy commands

Run these from a checkout of tag `v<version>`. Re-run them on every pin bump. The destination folder is named `providers`, so the keys match `logoURL`.

[Cloud Storage](https://cloud.google.com/storage/docs/uploading-objects):

```bash
gcloud storage rsync data/providers gs://EXAMPLE_BUCKET/assets/providers \
  --recursive \
  --exclude=".*" \
  --include=".*logo\.webp$"
```

[S3](https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html):

```bash
aws s3 sync data/providers s3://EXAMPLE_BUCKET/assets/providers \
  --exclude "*" \
  --include "*/*/logo.webp"
```

## Optional checks

Most picker frontends skip this. Run it in CI, or on a backend, when you bump the pin.

### Logo hash

`logoHash` is the SHA-256 of `logo.webp`, as 64 lowercase hex characters, with no `0x` prefix. Hash the bytes you serve and compare them to `provider.logoHash`. A match means that file was not swapped. Use the platform you already have. The package has no helper for this.

A runtime check is optional. Use it when you fetch icons from a host you do not fully trust at request time.

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

### Operator signature

The operator EIP-712 signature covers the operator fields, including `logoHash`. `listed` and the other curator fields are unsigned. The exact pin and npm provenance bind those fields. There is no signature over the catalog.

Self-signatures are grandfathered until 31 December 2026.

Use the signatures entry for the signed payload. `viem` can verify that EIP-712 signature.

## Provenance

Releases use npm Trusted Publishing (OIDC). Pin with `--save-exact` or `--exact`. A green check on the npm version page means that publish is linked to the source commit. `npm audit signatures` checks the registry signatures. See [Viewing package provenance](https://docs.npmjs.com/viewing-package-provenance/). The publish workflow is [`.github/workflows/release.yml`](https://github.com/bifrostwallet/assets/blob/main/.github/workflows/release.yml).
