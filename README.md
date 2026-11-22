# Bifrost Wallet documentation

Developer documentation for [docs.bifrostwallet.com](https://docs.bifrostwallet.com): integrate with Bifrost Wallet and list curated assets.

## Requirements

- Node **24.22.3** (see `.node-version`)
- Yarn **4.18.1** via the committed `./yarn` launcher (do **not** use Corepack or a global Yarn)

## Local development

```bash
./yarn install --immutable
./yarn start
```

```bash
./yarn build
./yarn serve
```

```bash
./yarn lint
./yarn lint:fix
./yarn security:check
```

Content lives under `docs/`. Sidebar: `sidebars.js`. Theme: `src/css/custom.css`.

## Security

Report vulnerabilities as described in [SECURITY.md](SECURITY.md).

### Repository rules checked in CI

- **Runtime lanes:** every `tsconfig*.json` declares one module lane. Node services, CLIs, scripts and tests use `module` and `moduleResolution` `NodeNext` (`tsc` emits to `dist`, `node` runs it). UI that a bundler emits (Vite, Expo/Metro) uses `module` `Preserve` with `moduleResolution` `Bundler`. Any other pair, such as `ESNext` with `Bundler`, is refused: it type-checks imports Node cannot resolve at run time. A config that sets neither key must extend a local `tsconfig*.json` that the check also scans (not a package config, not `./node_modules/...`). Checked by `scripts/security/verify-tsconfig-lanes.sh`.
- **Version tags:** a workflow that runs on tags filters them as `x.y.z` only (`'[0-9]+.[0-9]+.[0-9]+'`) and never runs for every tag. A tag or ref reaches a `run` script through step `env` and is read as a quoted shell variable, never as a `${{ }}` expression inside `run`: a tag name is attacker-controlled text, and Actions expands `${{ }}` before the shell starts. Multi-line commands use `run: |`, because a plain or quoted `run:` value that continues onto another line is folded into one command. Checked by `scripts/security/verify-version-tags.sh`.
- **Build origin:** `package-attestations.json` records the source repository of every package that publishes provenance. CI checks registry signatures and build attestations when the lockfile changes. Checked by `scripts/security/verify-attestations.sh`.

## License

[MIT](LICENSE) © Bifrost Software Ltd
