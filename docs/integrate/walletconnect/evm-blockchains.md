# EVM Blockchains

WalletConnect namespace: `eip155`.

Chains are offered according to the user’s mainnet/testnet mode. Use CAIP-2 IDs with the `eip155:` prefix (not `eip:`).

## Mainnet

<table><thead><tr><th width="200">Network</th><th>CAIP-2 Chain ID</th></tr></thead><tbody><tr><td>Flare</td><td>eip155:14</td></tr><tr><td>Songbird</td><td>eip155:19</td></tr><tr><td>Ethereum</td><td>eip155:1</td></tr><tr><td>Arbitrum One</td><td>eip155:42161</td></tr><tr><td>Optimism</td><td>eip155:10</td></tr><tr><td>Base</td><td>eip155:8453</td></tr><tr><td>Polygon</td><td>eip155:137</td></tr><tr><td>BNB Smart Chain</td><td>eip155:56</td></tr><tr><td>XDC</td><td>eip155:50</td></tr><tr><td>HyperEVM</td><td>eip155:999</td></tr></tbody></table>

## Testnet

<table><thead><tr><th width="220">Network</th><th>CAIP-2 Chain ID</th></tr></thead><tbody><tr><td>Flare Coston2</td><td>eip155:114</td></tr><tr><td>Songbird Coston</td><td>eip155:16</td></tr><tr><td>Ethereum Sepolia</td><td>eip155:11155111</td></tr><tr><td>Arbitrum Sepolia</td><td>eip155:421614</td></tr><tr><td>Optimism Sepolia</td><td>eip155:11155420</td></tr><tr><td>Base Sepolia</td><td>eip155:84532</td></tr><tr><td>Polygon Amoy</td><td>eip155:80002</td></tr><tr><td>BNB Smart Chain testnet</td><td>eip155:97</td></tr><tr><td>XDC Apothem</td><td>eip155:51</td></tr><tr><td>HyperEVM testnet</td><td>eip155:998</td></tr></tbody></table>

## Getting the user’s address

Prefer the approved session accounts (CAIP-10). You can also call `eth_accounts` / `eth_requestAccounts` on the session.

```javascript title="evm-accounts.js"
// From session (always available after approval)
const caip10 = session.namespaces.eip155?.accounts?.[0];
// e.g. "eip155:14:0xabc…"
const address = caip10?.split(":")[2];

// Or via JSON-RPC on the session
const accounts = await client.request({
  topic: session.topic,
  chainId: "eip155:14",
  request: { method: "eth_accounts", params: [] },
});
// accounts === ["0xabc…"]
```

## Methods

Supported for WalletConnect session requests:

| Method | Notes |
| --- | --- |
| `eth_accounts` | Approved accounts for the session |
| `eth_requestAccounts` | May prompt if needed |
| `eth_sendTransaction` | Sign and submit |
| `eth_signTypedData` | EIP-712 |
| `eth_signTypedData_v3` | EIP-712 v3 |
| `eth_signTypedData_v4` | EIP-712 v4 |
| `personal_sign` | Message signing |
| `wallet_requestPermissions` | `eth_accounts` |
| `wallet_watchAsset` | Track ERC-20 |
| `wallet_scanQRCode` | Device QR scanner |

`wallet_switchEthereumChain` / `wallet_addEthereumChain` may appear in wallet metadata; treat session `chainId` on each request as the source of truth for which chain the call targets.

### Request chain

Session requests must include a `chainId` in CAIP-2 form (for example `eip155:14`). Bifrost does not emit EVM `chainChanged` / `accountsChanged` over WalletConnect when the user changes network in the app. Plan UI around explicit chain selection in your session namespaces.

## Connect + send transaction example

```javascript title="evm-connect-and-send.js"
import { SignClient } from "@walletconnect/sign-client";

const client = await SignClient.init({
  projectId: process.env.REOWN_PROJECT_ID,
  metadata: {
    name: "My EVM Dapp",
    description: "Example",
    url: "https://example.com",
    icons: ["https://example.com/icon.png"],
  },
});

const chainId = "eip155:14"; // Flare

const { uri, approval } = await client.connect({
  requiredNamespaces: {
    eip155: {
      methods: [
        "eth_accounts",
        "eth_requestAccounts",
        "eth_sendTransaction",
        "personal_sign",
        "eth_signTypedData_v4",
      ],
      chains: [chainId],
      events: ["accountsChanged", "chainChanged"],
    },
  },
});

// Desktop: show `uri` as a QR code.
// Mobile: open bifrostwallet://wc?uri=${encodeURIComponent(uri)}
const session = await approval();

const from = session.namespaces.eip155.accounts[0].split(":")[2];

const txHash = await client.request({
  topic: session.topic,
  chainId,
  request: {
    method: "eth_sendTransaction",
    params: [
      {
        from,
        to: "0x0000000000000000000000000000000000000001",
        value: "0x0",
        data: "0x",
      },
    ],
  },
});
```

### personal_sign example

```javascript title="evm-personal-sign.js"
const address = session.namespaces.eip155.accounts[0].split(":")[2];

const signature = await client.request({
  topic: session.topic,
  chainId: "eip155:14",
  request: {
    method: "personal_sign",
    params: [
      // hex-encoded UTF-8 message, then address
      "0x48656c6c6f20426966726f7374",
      address,
    ],
  },
});
```

### eth_signTypedData_v4 example

```javascript title="evm-typed-data.js"
const address = session.namespaces.eip155.accounts[0].split(":")[2];

const signature = await client.request({
  topic: session.topic,
  chainId: "eip155:14",
  request: {
    method: "eth_signTypedData_v4",
    params: [
      address,
      JSON.stringify({
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          Mail: [{ name: "contents", type: "string" }],
        },
        primaryType: "Mail",
        domain: {
          name: "Example",
          version: "1",
          chainId: 14,
          verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
        },
        message: { contents: "Hello Bifrost" },
      }),
    ],
  },
});
```

## References

* [EIP-155](https://eips.ethereum.org/EIPS/eip-155)
* [CAIP-2 for eip155](https://github.com/ChainAgnostic/namespaces/blob/main/eip155/caip2.md)
* [CAIP-10](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md)
