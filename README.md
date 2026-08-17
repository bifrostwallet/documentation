# Bifrost Wallet documentation

Developer documentation for [docs.bifrostwallet.com](https://docs.bifrostwallet.com): integrate with Bifrost Wallet and list curated assets.

## Requirements

- Node **24.18.0** (see `.node-version`)
- Yarn **4.17.1** via the committed `./yarn` launcher (do **not** use Corepack or a global Yarn)

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

## License

[MIT](LICENSE) © Bifrost Software Ltd
