# Consuming Assets

Self-hosting logos is the standard way to use [`@bifrostwallet/assets`](https://www.npmjs.com/package/@bifrostwallet/assets). Upload `data/` from the matching git tag, pass the public URL where you uploaded `data/` as `baseURL` to `createAssets`, and use the optional checks when you want to verify what you serve. [GitHub (backwards compatible)](#github-backwards-compatible) reads provider listings from GitHub raw on `main`. That path is not recommended. There is no token `all.json`.

Source of truth: [`bifrostwallet/assets`](https://github.com/bifrostwallet/assets). Package notes: [README](https://github.com/bifrostwallet/assets/blob/main/README.md).

To list a provider, follow [FTSO provider](ftso-provider.md).

## 1. Pin the package

Pin one version and commit the lockfile.

```sh
npm install @bifrostwallet/assets@<version> --save-exact
```

```sh
yarn add @bifrostwallet/assets@<version> --exact
```

## 2. Self-hosting

Logo files are not in the npm package. Upload all of `data/` (providers, tokens, dapps, contracts) from the git tag that matches the pinned version. The tag is `v` plus the package version. Do this from CI the first time, and again every time you bump the pin, before you ship.

Host the files yourself, for example on Cloud Storage or S3. Keep the relative paths. `baseURL` is the public URL where you uploaded `data/`, for example `https://assets.example.com/`. A package `logoURL` looks like `providers/eip155-14/<identity>/logo.webp`. See [Upload objects](https://cloud.google.com/storage/docs/uploading-objects) and [`aws s3 sync`](https://docs.aws.amazon.com/cli/latest/reference/s3/sync.html).

Import `createAssets` and call it the same way in a browser, a dapp, or on a server. `logoURL` in the package is a relative path. `createAssets({ baseURL })` joins it to that public URL, so each returned `logoURL` is absolute. `baseURL` must start with `https://`. A trailing slash is optional. Chain ids are CAIP-2. Call these once per chain (`eip155:14` for Flare, `eip155:19` for Songbird). An unknown chain id throws. A missing record is `null`.

The same object reads tokens with `getTokens`, `getToken`, `getNativeToken`, and `getXrplToken`, contracts with `getContracts` and `getContract`, and browser chips with `getDappCategories`. The examples below stay on listed FTSO providers and validators.

### Get all listed providers

`assets.getListedProviders(chainId)` returns providers with `listed: true`. `assets.getProviders(chainId)` returns every provider on that chain. `assets.getProvider(chainId, identityAddress)` returns one provider, or `null`. The address match ignores case.

```js
import { createAssets } from "@bifrostwallet/assets";

const assets = createAssets({ baseURL: "https://assets.example.com/" });

const listed = assets.getListedProviders("eip155:14");
```

### Get all listed validators

`assets.getListedValidators(chainId)` returns the validators of providers with `listed: true`. Each entry has the validator NodeID and the owning provider’s identity address and name. A provider’s validators stay together, in `getProviders` order. `assets.getValidators(chainId)` is the same list for every provider. `assets.getValidatorsByIdentity(chainId, identityAddress)` matches the address without regard to case and returns `[]` when that provider has none.

```js
import { createAssets } from "@bifrostwallet/assets";

const assets = createAssets({ baseURL: "https://assets.example.com/" });

const listedValidators = assets.getListedValidators("eip155:14");
const bifrostValidators = assets.getValidatorsByIdentity(
  "eip155:14",
  "0x1650d2760baee638c034200dedcbe17b050d0364",
);
```

`assets.findProviderByValidator(chainId, nodeId)` returns the provider for one NodeID, or `null`. The NodeID includes the `NodeID-` prefix.

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

Not recommended. Read provider listings from GitHub raw. These files track `main`. Each `logoURL` is already absolute. The directory name uses a hyphen (`eip155-14`), not a CAIP-2 colon. There is no token `all.json`.

1. Fetch `https://raw.githubusercontent.com/bifrostwallet/assets/main/data/providers/<chain>/all.json`.
2. Listed providers are the records with `listed: true`. Use each record’s `logoURL` as the image address.
3. Listed validators are the `validators` arrays on those records. Each entry is a NodeID string.

```js
const providers = await fetch(
  "https://raw.githubusercontent.com/bifrostwallet/assets/main/data/providers/eip155-14/all.json",
).then((res) => res.json());

const listed = providers.filter((provider) => provider.listed);

const listedValidators = listed.flatMap((provider) =>
  provider.validators.map((nodeId) => ({
    nodeId,
    name: provider.name,
    logoURL: provider.logoURL,
  })),
);
```

## Provenance

Releases are staged with npm Trusted Publishing (OIDC). The publish step sets `NPM_CONFIG_PROVENANCE`. The workflow is [`.github/workflows/release.yml`](https://github.com/bifrostwallet/assets/blob/main/.github/workflows/release.yml). Pin with `--exact` or `--save-exact`, as above.

Confirm the green check on the npm version page. You can also run `npm audit signatures`. See [Viewing package provenance](https://docs.npmjs.com/viewing-package-provenance/).
