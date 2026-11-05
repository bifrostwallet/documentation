# Consuming Assets

The supported way to consume Bifrost’s curated listings is [`@bifrostwallet/assets`](https://www.npmjs.com/package/@bifrostwallet/assets): an audited, zero-dependency package. Version-lock the release you ship, and read listings from that package. Source of truth: [`bifrostwallet/assets`](https://github.com/bifrostwallet/assets). Package notes: [`CONSUMERS.md`](https://github.com/bifrostwallet/assets/blob/main/CONSUMERS.md).

Most consumers are dapps and frontends. Their main job is listing every listed provider in comparison lists and pickers.

To list a provider, follow [FTSO provider](ftso-provider.md) and the [assets README](https://github.com/bifrostwallet/assets/blob/main/README.md).

## Install

```bash
npm install @bifrostwallet/assets@<version> --save-exact
```

Yarn: `yarn add @bifrostwallet/assets@<version> --exact`. pnpm: `pnpm add @bifrostwallet/assets@<version> --save-exact`. Commit the lockfile with that pin. Upgrade only when you want a newer catalog, then upload that release’s provider icons again.

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

After you version-lock the package, download that same tagged GitHub release, or clone that tag, once in your build. The tag is `v` plus the package version. Upload `providers/**/logo.webp` from that tag to a CDN or backend you control, and keep the relative paths. Pinning the tag to the package version keeps those files matched to `logoHash`.

Always pass that host to `resolveAssetURL(logoURL, base)`. The example base `https://cdn.example.com/assets/` is the directory that contains `providers/`. Serve every logo from the base you pass in. GitHub and Bifrost’s CDN are not logo hosts for your app.

`resolveAssetURL` works the same way for any listing’s `logoURL` (tokens and dapps included).

Catalog logos are WebP (`logo.webp`).

## Optional checks

Most apps can skip this. The package has no helper for these checks.

### Compare logo bytes to `logoHash`

`logoHash` is the SHA-256 of the logo file. It is 64 lowercase hex characters, with no `0x` prefix. Hash the bytes you fetched from your own host, and compare that digest to `logoHash`.

```javascript title="logo-hash.js"
const bytes = new Uint8Array(await (await fetch(logoURL)).arrayBuffer());
const digest = await crypto.subtle.digest("SHA-256", bytes);
const hex = [...new Uint8Array(digest)]
  .map((byte) => byte.toString(16).padStart(2, "0"))
  .join("");

if (hex !== provider.logoHash) {
  throw new Error("Logo bytes do not match logoHash");
}
```

In Node, `createHash("sha256").update(bytes).digest("hex")` from `node:crypto` returns the same hex string.

### Check provider signatures

The operator signature covers the signed listing fields, including `logoHash`. `signatures.json` is in the git tag, not in the npm package. Clone tag `v<version>` of [`bifrostwallet/assets`](https://github.com/bifrostwallet/assets) and run the check there.

```bash
git clone --depth 1 --branch v<version> https://github.com/bifrostwallet/assets.git
cd assets
./yarn install
./yarn verify:providers
```

`viem` is a dev dependency of that repository. The published package does not depend on it. Do not add `viem` to your app.

Self-signatures are grandfathered until 31 December 2026. Until that date, run `./yarn verify:providers` without `--strict`. After that date, run `./yarn verify:providers --strict`.

## Confirm npm provenance

Trusted Publishing uses OIDC. On the npm version page, a green check means npm linked that publish to the source commit. See [Viewing package provenance](https://docs.npmjs.com/viewing-package-provenance/).

```bash
npm audit signatures
```

`npm audit signatures` checks the registry signatures of the packages in your install.
