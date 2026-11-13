# Consuming Assets

[`@bifrostwallet/assets`](https://www.npmjs.com/package/@bifrostwallet/assets) is the curated catalog of data providers, validators, tokens, contracts, and dapps for Bifrost Wallet. Tokens, contracts, and dapps are curated by the Bifrost team.

The default is an exact version pin, then `const assets = createAssets()`. `baseURL` is optional. Omit it and logo URLs use jsDelivr pinned to that exact package version. Use `logoURL` directly. The example logs `provider.logoURL`.

Source of truth: [`bifrostwallet/assets`](https://github.com/bifrostwallet/assets). Package notes: [README](https://github.com/bifrostwallet/assets/blob/main/README.md).

To list a provider, follow [Data provider](ftso-provider.md).

## Install

Install the latest release and commit the lockfile. The current release is on [npm](https://www.npmjs.com/package/@bifrostwallet/assets).

```sh
npm install @bifrostwallet/assets --save-exact
```

```sh
yarn add @bifrostwallet/assets --exact
```

## Default usage

`createAssets()` is the package entry. `baseURL` is optional. Omit it and logo URLs use jsDelivr for this release tag:

```text
https://cdn.jsdelivr.net/gh/bifrostwallet/assets@<version>/data/
```

`<version>` is the package version you install and its git tag. That tag is written into the package at build time. Returned `logoURL` values are absolute. A missing record is still `null`.

An exact-version jsDelivr URL is immutable and never goes stale ([Caching](https://www.jsdelivr.com/documentation#id-caching)). Cache headers last one year, and the file is stored permanently.

Don't load lists or logos from `raw.githubusercontent.com`. GitHub's raw file host is not a CDN: it rate-limits requests per IP and returns HTTP 429 under load. jsDelivr is built for this traffic.

The example reads one provider on `eip155:14` (Flare).

```typescript
import { createAssets } from "@bifrostwallet/assets";

const assets = createAssets();
const provider = assets.getProvider(
  "eip155:14",
  "0x1650d2760baee638c034200dedcbe17b050d0364",
);

// provider.logoURL is an absolute URL
console.log(provider?.logoURL);
```

Pass `baseURL` when you host the files yourself. The examples further down do that.

## Accessors

Chain ids are [CAIP-2](https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md): `eip155:14` (Flare), `eip155:19` (Songbird), and `xrpl:0` (XRPL). An unknown chain id throws. A missing provider returns `null`.

Picker and discovery views use providers with `listed: true`. A confirmation or a transaction detail still shows a provider the user already chose, including one that is not listed.

### Listed providers

`assets.getListedProviders(chainId)` returns providers with `listed: true`. `assets.getProviders(chainId)` returns every provider on that chain. `assets.getProvider(chainId, identityAddress)` returns one provider, or `null`, and the address match ignores case. `assets.getManagementGroupProviders(chainId)` returns providers with `managementGroup: true`.

```typescript
import { createAssets } from "@bifrostwallet/assets";

const assets = createAssets({
  baseURL: "https://assets.example.com/",
});
const listed = assets.getListedProviders("eip155:14");
```

That call uses `eip155:14` (Flare). With `baseURL` set, `logoURL` is absolute on that host, for example `https://assets.example.com/providers/eip155-14/0x1650d2760baee638c034200dedcbe17b050d0364/logo.webp` on `eip155-14` (Flare).

### Listed validators

`assets.getListedValidators(chainId)` returns one entry per NodeID for providers with `listed: true`, in that provider order. Each entry has `nodeId`, `identityAddress`, `name`, and the operating provider's `logoURL`. `assets.getValidators(chainId)` returns every validator on the chain, including validators of providers that are not listed.

### Validators for one identity

`assets.getValidatorsByIdentity(chainId, identityAddress)` returns that provider's validators. The address match ignores case, and a missing identity returns an empty array. `assets.findProviderByValidator(chainId, nodeId)` returns the provider that operates that NodeID, or `null`. The NodeID includes the `NodeID-` prefix.

### Tokens, contracts, and dapps

Dapps are a catalog like tokens, providers, and contracts.

`assets.getTokens(chainId)`, `assets.getToken(chainId, address)`, `assets.getNativeToken(chainId)`, and `assets.getXrplToken(issuer, currency)` read the token catalog. `getXrplToken` keeps the issuer and currency case. `assets.getContracts` and `assets.getContract` read contract names. `assets.getDapps()` returns every dapp, and `assets.getDapp(slug)` returns one dapp or `null`. `assets.getDappCategories()` returns the browser chips. Show a dapp with `logoURL`, the same as a provider or token. The records themselves are described in [CONTRIBUTING.md](https://github.com/bifrostwallet/assets/blob/main/CONTRIBUTING.md).

## Check logo integrity (optional)

Use this when you download logos. These checks are optional.

`verifyLogoHash(bytes, logoHash)` is true when the SHA-256 of the decoded file bytes equals `logoHash`: 64 lowercase hex characters, no `0x` prefix. `fetchLogo(entry)` is a convenience that downloads `logoURL` and runs that check in one step.

```typescript
import { createAssets, verifyLogoHash } from "@bifrostwallet/assets";

const assets = createAssets();
const provider = assets.getProvider(
  "eip155:14",
  "0x1650d2760baee638c034200dedcbe17b050d0364",
);

const response = await fetch(provider.logoURL);
const bytes = new Uint8Array(await response.arrayBuffer());
console.log(verifyLogoHash(bytes, provider.logoHash));
```

## Self-hosting logos

Self-hosting is optional. `logoURL` is a path such as `providers/…/logo.webp`, and `baseURL` is joined to that path. `baseURL` must start with `https://`. A trailing slash is optional. Upload again when you install a new package version. The default jsDelivr URL changes with the version. A copy you host does not.

1. Clone [https://github.com/bifrostwallet/assets](https://github.com/bifrostwallet/assets) and check out the tag that matches the `@bifrostwallet/assets` version you installed. Tags have no `v` prefix.

   ```sh
   git clone https://github.com/bifrostwallet/assets
   cd assets
   git checkout <version>
   ```

2. Upload only the `logo.webp` files from `data/` to your own host, keeping `tokens/`, `providers/`, `dapps/`, and `contracts/projects/`. Point the package's `baseURL` at that host. Serve those directories at the host root.

   Google Cloud. `--exclude` is a Python regular expression. It skips every relative path that does not end in `logo.webp`, and `--recursive` still walks the directories:

   ```sh
   gcloud storage rsync data gs://<your-bucket> --recursive --exclude='^(?!.*logo\.webp$).*'
   ```

   Amazon S3. Filters run in order and the last match wins, so exclude everything first, then include `logo.webp`. `*` matches `/`:

   ```sh
   aws s3 sync data s3://<your-bucket> --exclude '*' --include '*logo.webp'
   ```

   ```typescript
   import { createAssets } from "@bifrostwallet/assets";

   const assets = createAssets({
     baseURL: "https://assets.example.com/",
   });
   ```

## Provider verification

Operator signatures ship from `@bifrostwallet/assets/signatures`, so a normal import does not download them. Some listings stay unsigned until 31 December 2026 (date to be confirmed with the provider community). Curator fields such as `listed` sit outside the signature. An unknown chain throws. A missing provider or signature returns an empty array.

The signature is EIP-712 (`eth_signTypedData_v4`) over `ProviderListing`, self-signed by the identity address. Changing any signed field needs a new signature. `logoHash` is the SHA-256 of `logo.webp`: 64 lowercase hex characters, with no `0x` prefix.

**Domain**

| Field | Value |
| --- | --- |
| `name` | `"Bifrost Assets"` |
| `version` | `"1"` |
| `chainId` | The id in `eip155-<id>`. Flare is 14. Songbird is 19. |
| `salt` | `EIP712_DOMAIN_SALT`, the precomputed `keccak256` of the UTF-8 string `https://bifrostwallet.com` |

The example is a provider on `eip155:14` (Flare).

```typescript
import { verifyTypedData } from "viem";
import { getProviderListingVerification } from "@bifrostwallet/assets/signatures";

const [entry] = getProviderListingVerification(
  "eip155:14",
  "0x1650d2760baee638c034200dedcbe17b050d0364",
);
await verifyTypedData(entry); // true
```

`getProviderSignatures(chainId, identityAddress)`, also from `@bifrostwallet/assets/signatures`, returns that identity's signature record, or `null` when this version has none.

`EIP712_DOMAIN_SALT`, `PROVIDER_LISTING_TYPES`, `PROVIDER_LISTING_PRIMARY_TYPE`, and `providerListingTypedData({ message, chain })` are exported from `@bifrostwallet/assets` for anyone building the typed data themselves.

## jsDelivr `all.json` (legacy)

Fetch provider `all.json` from jsDelivr on `@main` when you are not installing the package. `logoURL` in that file is already absolute and uses the same `@main` snapshot. There is no token `all.json`. Token lists are not published that way; use `createAssets`.

`@main` is the moving catalog, not a release tag. Provider `all.json` logo URLs in this repository use that unpinned branch. Updates there can take up to 12 hours to appear because jsDelivr caches branch URLs for up to 12 hours ([Caching](https://www.jsdelivr.com/documentation#id-caching)). The npm package pins the version you install so its logos match that snapshot.

Use the jsDelivr URL above instead of raw GitHub.

Compared with the package and logos you host:

- No version pin. The URL is `@main`, so changes arrive unannounced and can break you.
- List and logo requests from your users go to jsDelivr.
- Providers and their validator NodeIDs only. No tokens, contracts, dapps, or dapp categories.
- No TypeScript types, and no helpers for lookups, listed filters, or finding a provider from a validator.
- No signature checks. Those ship on `@bifrostwallet/assets/signatures`.

1. Fetch `https://cdn.jsdelivr.net/gh/bifrostwallet/assets@main/data/providers/<chain>/all.json`. The chain directory uses a hyphen, such as `eip155-14` (Flare) or `eip155-19` (Songbird).
2. For listed providers, keep records with `listed: true`. Check `logoHash` against the logo bytes before you display the image. `logoURL` is absolute.
3. For listed validator NodeIDs, read `validators` on those records. The logo is the provider logo.

```js
const response = await fetch(
  "https://cdn.jsdelivr.net/gh/bifrostwallet/assets@main/data/providers/eip155-14/all.json",
);
const providers = await response.json();
const listed = providers.filter((provider) => provider.listed);
const logoURL = listed[0]?.logoURL;
const nodeIds = listed.flatMap((provider) => provider.validators);
```

`logoURL` is an absolute jsDelivr URL on `@main`, for example `https://cdn.jsdelivr.net/gh/bifrostwallet/assets@main/data/providers/eip155-14/0x1650d2760baee638c034200dedcbe17b050d0364/logo.webp` on `eip155-14` (Flare). `nodeIds` starts with NodeIDs such as `NodeID-5oLazJm5PtV8JFb2GpzuCVMZdi1GxkwYP`.

## Provenance

A GitHub Release tagged with the package version stages the package through npm Trusted Publishing, with provenance. The publish step sets `NPM_CONFIG_PROVENANCE`. The workflow is [`.github/workflows/release.yml`](https://github.com/bifrostwallet/assets/blob/main/.github/workflows/release.yml). Pin with `--exact` or `--save-exact`, as above.

Confirm the provenance badge on the npm version page. You can also run `npm audit signatures`. See [Viewing package provenance](https://docs.npmjs.com/viewing-package-provenance/).
