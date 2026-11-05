# Consuming Assets

The supported way to consume Bifrost’s curated listings is [`@bifrostwallet/assets`](https://www.npmjs.com/package/@bifrostwallet/assets): an audited, zero-dependency package. Version-lock the release you ship, and read listings from that package. Source of truth: [`bifrostwallet/assets`](https://github.com/bifrostwallet/assets). Package notes: [`CONSUMERS.md`](https://github.com/bifrostwallet/assets/blob/main/CONSUMERS.md).

To list a provider, follow [FTSO provider](ftso-provider.md) and the [assets README](https://github.com/bifrostwallet/assets/blob/main/README.md).

## Install

```bash
npm install @bifrostwallet/assets --save-exact
```

Yarn: `yarn add @bifrostwallet/assets --exact`. pnpm: `pnpm add @bifrostwallet/assets --save-exact`. Commit the lockfile with that pin. Upgrade only when you want a newer catalog, then upload that release’s provider icons again.

## Provider lookup

Chain ids are CAIP-2. These examples use Bifrost Wallet on Flare (`eip155:14`). `getProvider` matches `identityAddress` case-insensitively and returns `null` when that identity is not in this package version. An unknown chain id throws.

```typescript title="example.ts"
import {
  getListedProviders,
  getProvider,
  resolveAssetURL,
} from "@bifrostwallet/assets";

// Picker / discovery: listed: true only
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
| Provider **picker** / discovery | `getListedProviders` (`listed: true` only) |
| Confirmations and details | `getProvider`, including entries with `listed: false` |

## Logos

Each listing’s `logoURL` is a relative path, such as `providers/eip155-14/<identity>/logo.webp`. The package includes the provider icon files at those paths. Upload `providers/**/logo.webp` to a CDN or backend you control, and keep the relative paths.

Always pass that host to `resolveAssetURL(logoURL, base)`. The example base `https://cdn.example.com/assets/` is the directory that contains `providers/`. Serve every logo from the base you pass in. GitHub and Bifrost’s CDN are not logo hosts for your app.

`resolveAssetURL` works the same way for any listing’s `logoURL` (tokens and dapps included).

Catalog logos are WebP (`logo.webp`).
