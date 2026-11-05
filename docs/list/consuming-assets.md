# Consuming Assets

Self-hosting logos is the standard way to use [`@bifrostwallet/assets`](https://www.npmjs.com/package/@bifrostwallet/assets). Upload `data/` from the matching git tag, pass that host as `base`, and use the optional checks when you want to verify what you serve. [GitHub (backwards compatible)](#github-backwards-compatible) covers the package with no `base`, or `all.json` from a tag.

Source of truth: [`bifrostwallet/assets`](https://github.com/bifrostwallet/assets). Package notes: [`CONSUMERS.md`](https://github.com/bifrostwallet/assets/blob/main/CONSUMERS.md).

To list a provider, follow [FTSO provider](ftso-provider.md).

## 1. Pin the package

```bash
npm install @bifrostwallet/assets@<version> --save-exact
```

Yarn: `yarn add @bifrostwallet/assets@<version> --exact`. pnpm: `pnpm add @bifrostwallet/assets@<version> --save-exact`.

An exact pin keeps a newer catalog from arriving unnoticed. Commit the lockfile.

## 2. Self-hosted logos

Upload `data/` from the git tag that matches the pinned version. The tag is `v` plus the package version. Logo files are not in the npm package. Do this the first time, and again every time you bump the pin, before you ship.

Host the files yourself, for example on Cloud Storage or S3, and upload them from CI. `base` is the URL of that `data/` directory. It contains `providers/`, `tokens/`, `dapps/`, and `contracts/`, for example `https://cdn.example.com/assets/`. See [Upload objects](https://cloud.google.com/storage/docs/uploading-objects) and [`aws s3 sync`](https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html).

`logoURL` in the package is a relative path. `resolveAssetURL(logoURL, base)` joins it to your host. The [frontend](#frontend) and [backend](#backend) examples pass that `base`.

### Frontend {#frontend}

Import the package in the app so the catalog is in the bundle. Call `resolveAssetURL(logoURL, base)` in the browser. The same `base` works for `getTokens`, `getListedProviders`, and `getProvider`. Chain ids are CAIP-2.

```tsx title="FlareTokenList.tsx"
import { getTokens, resolveAssetURL } from "@bifrostwallet/assets";

const base = "https://cdn.example.com/assets/";

export function FlareTokenList() {
  return (
    <ul>
      {getTokens("eip155:14").map((token) => (
        <li key={token.address ?? "native"}>
          <img alt="" src={resolveAssetURL(token.logoURL, base)} />
          {token.symbol}
        </li>
      ))}
    </ul>
  );
}
```

### Backend {#backend}

Read the package on the server, resolve URLs with your `base`, and serve JSON. The frontend fetches that file and does not install the package. `getListedProviders` is `listed: true` only; `getProviders` includes the rest.

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

### Optional checks

Most picker UIs skip this. Run it in CI, or on a backend, when you bump the pin.

#### Logo hash

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

A check in the client at request time is optional.

#### Provider signature

The operator signature covers name, description, logo hash, website, links, identity, and the responsibilities acknowledgement. `logoHash` is one of those fields. Curator fields such as `listed` are not. The pin and npm provenance bind those fields.

Signatures ship as a separate entry. Importing `@bifrostwallet/assets` does not download them.

```js
import { getProviderSignatures } from "@bifrostwallet/assets/signatures";

const record = getProviderSignatures("eip155:14", provider.identityAddress);
```

`getProviderSignatures` returns `null` when this version has no signature file for that identity. Some listings stay unsigned until 31 December 2026. That date is preliminary, not a fixed deadline.

Recover the EIP-712 `ProviderListing` signer and compare it to `identityAddress`. [`viem`](https://viem.sh) `recoverTypedDataAddress` does that recovery. `record.verificationInstructions` states the domain and the field order. Do this in CI or on a backend. A picker should not recover signatures in the browser.

## 3. GitHub (backwards compatible) {#github-backwards-compatible}

Use this when you are not hosting the logo files. Call `resolveAssetURL(logoURL)` with no `base`, or fetch `all.json` from a release tag without installing the package.

With no `base`, the helper joins the relative `logoURL` to GitHub raw. The current package uses `https://raw.githubusercontent.com/bifrostwallet/assets/main/data/`. Once the version-tag change ships, that prefix is the git tag that matches the pinned version (`v` plus that version) instead of `main`.

```tsx title="FlareTokenList.tsx"
import { getTokens, resolveAssetURL } from "@bifrostwallet/assets";

const tokens = getTokens("eip155:14").map((token) => ({
  ...token,
  logoURL: resolveAssetURL(token.logoURL),
}));
```

The same omitted `base` works in the backend example above.

### Without the package

Fetch one chain file from the release tag `v` plus the version. `all.json` exists for tokens and providers, one file per chain directory, such as `tokens/eip155-14/all.json` and `providers/eip155-14/all.json`.

```js
const tag = "v<version>";
const base = `https://raw.githubusercontent.com/bifrostwallet/assets/${tag}/data/`;

const tokens = await fetch(new URL("tokens/eip155-14/all.json", base)).then((res) =>
  res.json(),
);

const withLogos = tokens.map((token) => ({
  ...token,
  logoURL: new URL(token.logoURL, base).href,
}));
```

Provider logo URLs in `all.json` are already absolute and point at `raw.githubusercontent.com` on `main`, so `new URL` leaves them unchanged.

## Provenance

Releases are staged with npm Trusted Publishing (OIDC). The publish step sets `NPM_CONFIG_PROVENANCE`. The workflow is [`.github/workflows/release.yml`](https://github.com/bifrostwallet/assets/blob/main/.github/workflows/release.yml). Pin with `--exact` or `--save-exact`, as above.

Confirm the green check on the npm version page. You can also run `npm audit signatures`. See [Viewing package provenance](https://docs.npmjs.com/viewing-package-provenance/).
