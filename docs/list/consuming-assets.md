# Consuming Assets

Most consumers only have a frontend. Pin [`@bifrostwallet/assets`](https://www.npmjs.com/package/@bifrostwallet/assets) and import it in the app, or read it on a backend and serve JSON. Both paths should self-host logos. Source of truth: [`bifrostwallet/assets`](https://github.com/bifrostwallet/assets). Package notes: [`CONSUMERS.md`](https://github.com/bifrostwallet/assets/blob/main/CONSUMERS.md).

To list a provider, follow [FTSO provider](ftso-provider.md).

## Pin the package

```bash
npm install @bifrostwallet/assets@<version> --save-exact
```

Yarn: `yarn add @bifrostwallet/assets@<version> --exact`. pnpm: `pnpm add @bifrostwallet/assets@<version> --save-exact`.

`--save-exact` and `--exact` pin one version so a newer catalog cannot slip in unnoticed. Commit the lockfile.

## Self-host logos

Host the logo files yourself, for example on Cloud Storage or S3. Upload them from CI, from the git tag that matches the pinned package version. Both package paths below pass that host as `base`.

Do this the first time, and again every time you bump the pin, before you ship. The git tag is `v` plus the package version. Logo files are not in the npm package.

From that tag, copy every logo tree you serve to your CDN or backend. Keep the relative paths.

* `data/providers/**/logo.webp` (provider icons). A `logoURL` looks like `providers/eip155-14/<identity>/logo.webp`
* `data/tokens/**/logo.webp` (EVM and XRPL token icons)
* `data/dapps/**/logo.webp` (dapp icons)
* `data/contracts/**/logo.webp` (contract logos). A shared project logo is `data/contracts/projects/<slug>/logo.webp`. A contract may also keep its own `logo.webp` beside its JSON

Published contract records include `project`, `projectName`, `logoURL`, and `logoHash`. Contracts are no longer linked to dapps. A published `logoURL` is `contracts/projects/<slug>/logo.webp`, or that contract’s own logo when the file beside its JSON is present.

A version bump without this upload is incomplete. A new provider whose file you did not upload is a 404 from your host. A path you already uploaded keeps the old file, and `logoHash` no longer matches if the logo changed.

Copy commands are in [Upload examples](#upload-examples).

`logoURL` in the package is a relative path. Pass your host to `resolveAssetURL(logoURL, base)`. When you pass a base, it joins that path to your host. The example base is the directory that contains `providers/`, `tokens/`, `dapps/`, and `contracts/`.

If `base` is omitted or empty, `resolveAssetURL` falls back to GitHub (`https://raw.githubusercontent.com/bifrostwallet/assets/main/data/`, the `main` branch). That works, but it is not recommended: GitHub raw is not a CDN, it is rate-limited, and it serves `main` rather than the pinned version.

## Frontend

Install with an exact pin, as above. Import the package in the app. The catalog is in the bundle. Call `resolveAssetURL(logoURL, base)` in the browser. `base` is your logo host.

```tsx title="FlareTokenList.tsx"
import { getTokens, resolveAssetURL } from "@bifrostwallet/assets";

const base = "https://cdn.example.com/assets/";

export function FlareTokenList() {
  const tokens = getTokens("eip155:14");
  return (
    <ul>
      {tokens.map((token) => (
        <li key={token.address ?? "native"}>
          <img alt="" src={resolveAssetURL(token.logoURL, base)} />
          {token.symbol}
        </li>
      ))}
    </ul>
  );
}
```

`getTokens("eip155:14")` is the Flare list, including the native gas token (`address` is `null`). Chain ids are CAIP-2. An unknown chain id throws. The package entry is CommonJS. `require("@bifrostwallet/assets")` exposes the same functions.

Provider pickers use the same `base`:

```typescript title="providers.ts"
import {
  getListedProviders,
  getProvider,
  resolveAssetURL,
} from "@bifrostwallet/assets";

const base = "https://cdn.example.com/assets/";

// Comparison lists and pickers: listed: true only
const listed = getListedProviders("eip155:14");

// Confirmations and details, including entries that are not listed.
// This identity is Bifrost Wallet. getProvider returns null when it is absent.
const provider = getProvider(
  "eip155:14",
  "0x1650d2760baee638c034200dedcbe17b050d0364",
);
const logoURL = provider && resolveAssetURL(provider.logoURL, base);
```

`getProvider` matches `identityAddress` case-insensitively.

| UI | Call |
| --- | --- |
| Comparison lists and provider **picker** / discovery | `getListedProviders` (`listed: true` only) |
| Confirmations and details | `getProvider`, including entries with `listed: false` |

`resolveAssetURL` works the same way for any listing’s `logoURL` (token icons, dapp icons, and contract logos). Pass that listing’s `logoURL`. Catalog logos are WebP.

## Backend

Read the package on the server, resolve URLs there, and serve JSON. The frontend fetches that JSON and does not install the package. `logoURL` values in the response are already absolute.

```js
import { writeFileSync } from "node:fs";
import { getListedProviders, resolveAssetURL } from "@bifrostwallet/assets";

const base = "https://cdn.example.com/assets/";
const listed = getListedProviders("eip155:14").map((provider) => ({
  ...provider,
  logoURL: resolveAssetURL(provider.logoURL, base),
}));
writeFileSync("flare-providers.json", JSON.stringify(listed));
```

`getListedProviders` is the comparison list and picker (`listed: true` only). Use `getProviders` when the file should also include providers that are not listed. The same pattern works for `getTokens`. Upload the file next to the logos if you want one hosted JSON file. Name it whatever you want. One request. Its `logoURL` values already point at your host.

## Without the package (backwards compatible, not recommended) {#without-the-package}

Use this only when a frontend cannot install `@bifrostwallet/assets`. Prefer the package paths above. GitHub raw is not a CDN, and it is rate-limited. Pin a release tag `v<version>` (`v` plus the package version). Do not fetch `main`.

`all.json` exists only for tokens and providers, one file per chain directory. The directory name uses a hyphen (`eip155-14`), not a CAIP-2 colon. There is no combined `data/tokens/all.json`.

```js
const tag = "v<version>";
const base = `https://raw.githubusercontent.com/bifrostwallet/assets/${tag}/data/`;

const tokens = await fetch(new URL("tokens/eip155-14/all.json", base)).then((res) =>
  res.json(),
);
const providers = await fetch(new URL("providers/eip155-14/all.json", base)).then(
  (res) => res.json(),
);

const tokensWithLogos = tokens.map((token) => ({
  ...token,
  logoURL: new URL(token.logoURL, base).href,
}));
```

A token `logoURL` is relative to `data/`: `tokens/eip155-14/<address>/logo.webp`, `tokens/eip155-14/native/logo.webp`, or `tokens/xrpl-0/<issuer>/<currency>/logo.webp`. `new URL(logoURL, base)` joins that path to the tag. Songbird providers are `providers/eip155-19/all.json`. Other token chains are the same shape as `tokens/eip155-14/all.json`.

A provider `logoURL` in `all.json` is already an absolute `raw.githubusercontent.com` URL on `main`. `new URL` leaves an absolute URL unchanged, so those icons still come from `main`, not from the tag you fetched.

## Do and do not

DO: pin with `--save-exact` / `--exact` and commit the lockfile.

DO NOT: depend on a `^` range. A newer catalog can slip in without a logo refresh.

DO: at each pin bump, copy every logo tree you serve from the tag `v` plus the version onto a host you control, and keep the relative paths. Provider icons are `data/providers/**/logo.webp`. Token icons are `data/tokens/**/logo.webp`. Dapp icons are `data/dapps/**/logo.webp`. Contract logos are `data/contracts/**/logo.webp`. If you want one JSON file, generate it with `getListedProviders` or `getProviders` plus `resolveAssetURL`, and upload it next to the logos.

DO NOT: build a new app on GitHub raw. [Without the package](#without-the-package) is backwards compatible and not recommended. Do not use Bifrost’s CDN as a logo host.

DO: call `resolveAssetURL(logoURL, yourBase)` and serve icons from your host.

DO NOT: serve icons from `node_modules`.

DO: import `getListedProviders` and `getProvider` for a picker. Import `@bifrostwallet/assets/signatures` only if you will verify.

DO NOT: assume signatures are fields on each provider from the main listing.

DO: in CI at pin-bump, compare logo bytes to `logoHash`. You can also recover the operator signature with `viem`.

DO NOT: require every frontend to install `viem`, or to recover EIP-712 signatures in the browser. There is no catalog signature to require.

## Upload examples

From a checkout of tag `v<version>`:

```bash
gcloud storage rsync data/providers gs://YOUR_BUCKET/assets/providers \
  --recursive \
  --exclude=".*\.json$"
gcloud storage rsync data/tokens gs://YOUR_BUCKET/assets/tokens \
  --recursive \
  --exclude=".*\.json$"
gcloud storage rsync data/dapps gs://YOUR_BUCKET/assets/dapps \
  --recursive \
  --exclude=".*\.json$"
gcloud storage rsync data/contracts gs://YOUR_BUCKET/assets/contracts \
  --recursive \
  --exclude=".*\.json$"
```

See [Upload objects](https://cloud.google.com/storage/docs/uploading-objects).

```bash
# Providers: chain/identity/logo.webp
aws s3 sync data/providers s3://YOUR_BUCKET/assets/providers \
  --exclude "*" \
  --include "*/*/logo.webp"

# EVM tokens: chain/address/logo.webp and chain/native/logo.webp.
# XRPL issued tokens: xrpl-0/issuer/currency/logo.webp.
aws s3 sync data/tokens s3://YOUR_BUCKET/assets/tokens \
  --exclude "*" \
  --include "*/*/logo.webp" \
  --include "*/*/*/logo.webp"

# Dapp icons: slug/logo.webp
aws s3 sync data/dapps s3://YOUR_BUCKET/assets/dapps \
  --exclude "*" \
  --include "*/logo.webp"

# Contract projects: projects/<slug>/logo.webp
# Per-contract logos: <chain>/<address>/logo.webp beside the contract JSON
aws s3 sync data/contracts s3://YOUR_BUCKET/assets/contracts \
  --exclude "*" \
  --include "*/*/logo.webp"
```

See [`aws s3 sync`](https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html).

Run the same copy on every pin bump. Object keys stay under the base you pass to `resolveAssetURL` (`providers/…`, `tokens/…`, `dapps/…`, `contracts/…`). Dapp icons are only `dapps/<slug>/logo.webp`. Contract logos are `contracts/projects/<slug>/logo.webp`, or `contracts/<chain>/<address>/logo.webp` when that contract has its own `logo.webp`.

## Optional checks

Most picker UIs skip this. Run it in CI, or on a backend, when you bump the pin.

### Logo hash

`logoHash` is the SHA-256 of `logo.webp`: 64 lowercase hex characters, no `0x` prefix. Compare it with the bytes you uploaded.

Node:

```js
import { createHash } from "node:crypto";

const digest = createHash("sha256").update(logoBytes).digest("hex");
if (digest !== provider.logoHash) throw new Error("logo hash mismatch");
```

Browsers:

```js
const digest = await crypto.subtle.digest("SHA-256", logoBytes);
const hex = [...new Uint8Array(digest)]
  .map((byte) => byte.toString(16).padStart(2, "0"))
  .join("");
if (hex !== provider.logoHash) throw new Error("logo hash mismatch");
```

A check in the client at request time is optional. Use it when you do not fully trust the host that serves the icon.

### Provider signature

The operator signature covers name, description, logo hash, website, links, identity, and the responsibilities acknowledgement. `logoHash` is one of those fields. Curator fields such as `listed` are not. The pin and npm provenance bind those fields.

Signatures ship as a separate entry. Importing `@bifrostwallet/assets` does not download them.

```js
import { getProviderSignatures } from "@bifrostwallet/assets/signatures";

const record = getProviderSignatures("eip155:14", provider.identityAddress);
```

`getProviderSignatures` returns `null` when this version has no signature file for that identity. Some listings stay unsigned until 31 December 2026. That date is preliminary, not a fixed deadline.

Recover the EIP-712 `ProviderListing` signer and compare it to `identityAddress`. [`viem`](https://viem.sh) `recoverTypedDataAddress` does that recovery. `record.verificationInstructions` states the domain and the field order. Do this in CI or on a backend. A picker should not recover signatures in the browser.

## Provenance

Releases are staged with npm Trusted Publishing (OIDC). The publish step sets `NPM_CONFIG_PROVENANCE`. The workflow is [`.github/workflows/release.yml`](https://github.com/bifrostwallet/assets/blob/main/.github/workflows/release.yml). Pin with `--exact` or `--save-exact`, as above.

Confirm the green check on the npm version page. You can also run `npm audit signatures`. See [Viewing package provenance](https://docs.npmjs.com/viewing-package-provenance/).
