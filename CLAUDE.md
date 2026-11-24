# Bifrost Wallet documentation

Public developer docs for [docs.bifrostwallet.com](https://docs.bifrostwallet.com). Pages are Markdown in `docs/`. The sidebar is `sidebars.js`. Theme CSS is `src/css/custom.css`.

## Build

Use the Node version in `.node-version`. It matches `.nvmrc` and `engines.node`. Invoke Yarn only as `./yarn`. Do not use Corepack or a global Yarn.

```bash
./yarn install --immutable
./yarn start
./yarn lint
./yarn build
./yarn serve
```

`./yarn build` runs the Docusaurus build, then `scripts/csp/postbuild.mjs`, which strips executable inline scripts for the site content security policy. `onBrokenLinks` is `throw`. Published URLs use a trailing slash.

## Docs style

Match the pages already in `docs/`.

- One H1, and it is the page title. Front matter exists only on `docs/intro.md`. Register a new page in `sidebars.js`.
- Second person, present tense, short paragraphs. Number a procedure. Compare options in a table. Unordered lists use `*`.
- **Bold** the constraint or the preferred path. Use `:::info` or `:::warning` only for a limit a reader can miss.
- Fence code with a language tag. JavaScript and TypeScript samples use double quotes. Set `title=` when the sample is a file. Put API names, chain ids, and fields in backticks.
- Use a typographic apostrophe (’), an ellipsis (…), an em dash (—), and × for dimensions, as the current pages do.
- Link other pages with a relative path. External links are `https` URLs. Close a guide with a References list when it cites specs.
- The product name is Bifrost Wallet. Prefer WalletConnect. Web3 injection is the in-app browser and is EVM only. Integrators use their own Reown project ID.

## Biome

`./yarn lint` is `biome check`. `./yarn lint:fix` writes fixes. `biome.jsonc` is the config: recommended rules, two-space indent, line width 100, double quotes, semicolons, trailing commas, and LF. Biome covers JS, TS, and JSON, not Markdown. Shell and YAML are `./yarn lint:shell` and `./yarn lint:yaml`. Leave `noUnresolvedImports` off because Yarn PnP is not resolvable. Do not disable a rule to land a change.

## Pins

Keep the pins intact. Versions in `package.json` are exact. `engines.node`, `engines.yarn`, and `packageManager` (including its sha256) stay aligned with `.node-version`, `.nvmrc`, and the Yarn binary in `.yarn/releases`. Do not hand-edit `yarn.lock`, `.yarn/cache`, `.pnp.cjs`, `.pnp.loader.mjs`, `.yarn/yarn-binary-hash.txt`, or `package-attestations.json`.

Workflows run on `ubuntu-24.04`. Actions and images are pinned to a full SHA or digest. Pass untrusted `${{ }}` values through step `env:` and read them as quoted shell variables, never inside `run:`. Do not add dependencies. `enableScripts` stays false.

## Approval

These do not need approval: `git commit`, a non-force `git push` of the current feature branch, amending or fixing up an unpushed commit, `gh pr create`, and `gh pr edit`, `gh pr comment`, or a review-thread reply on the pull request this work opened.

These still need approval: pushing to or creating `main` or a release or tag ref, creating a tag, `git push --tags`, deleting a remote branch, amending or rewriting a pushed commit, writing git config, `sudo`, Docker or Kubernetes changes, a gcloud command that is not read-only, and any other mutating `gh` or `gh api` call. Branch protection on `main` blocks a direct push to `main`.
