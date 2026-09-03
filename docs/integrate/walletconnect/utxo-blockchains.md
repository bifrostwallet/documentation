# UTXO Blockchains

WalletConnect namespace: `bip122`. Available for Bitcoin, Litecoin, and Dogecoin.

## Chain IDs

| Blockchain | CAIP-2 Chain ID |
| --- | --- |
| Bitcoin | `bip122:000000000019d6689c085ae165831e93` |
| Litecoin | `bip122:12a765e31ffd4059bada1e25190f6e98` |
| Dogecoin | `bip122:1a91e3dace36e2be3bf030a65679fe82` |
| Bitcoin Testnet4 | `bip122:00000000da84f2bafbbc53dee25a72ae` |
| Litecoin testnet | `bip122:4966625a4b2851d9fdee139e56211a0d` |
| Dogecoin testnet | `bip122:bb0a78264637406b6360aad926284d54` |

## Getting the user’s address

After approval, session accounts are CAIP-10. Bifrost also emits `bip122_addressesChanged` with a richer address set (UTXOs + unused receive/change). Prefer that event for balance discovery; use the session account as the connected identity.

```javascript title="utxo-accounts.js"
const BTC = "bip122:000000000019d6689c085ae165831e93";

const caip10 = session.namespaces.bip122?.accounts?.find((a) =>
  a.startsWith(`${BTC}:`),
);
// e.g. "bip122:000000000019d6689c085ae165831e93:bc1q…"
const account = caip10; // pass full CAIP-10 or the address suffix to methods below
const address = caip10?.slice(BTC.length + 1);
```

## Methods

### sendTransfer

Build, sign, and broadcast a simple transfer. Bifrost constructs the PSBT (including optional OP_RETURN memo).

**Params**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `account` | string | yes | Account / address |
| `recipientAddress` | string | yes | Destination |
| `amount` | string | yes | Amount in the chain’s base unit convention used by Bifrost |
| `changeAddress` | string | no | Change output |
| `memo` | hex string | no | OP_RETURN payload |

**Result:** `{ txid: string }`

### getAccountAddresses

Return addresses (with optional public keys and derivation paths) for UTXO discovery and balance calculation.

**Params:** `{ account: string }`

**Result:** array of `{ address, publicKey?, path? }`

### signPsbt

Sign a PSBT supplied by the dapp.

**Params**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `account` | string | yes | Account |
| `psbt` | string | yes | Base64 PSBT |
| `signInputs` | array | yes | `{ address, index, sighashTypes? }[]` |
| `broadcast` | boolean | no | Default `false`. If `true`, all inputs must be owned by the wallet |

### signMessage

Sign a message with ECDSA.

**Params**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `account` | string | yes | Account (CAIP-10 style `bip122:…:address` accepted) |
| `message` | string | yes | Message to sign |
| `address` | string | no | Specific address |
| `protocol` | `"ecdsa"` \| `"bip322"` | no | Default `"ecdsa"`. **Only `ecdsa` is supported** |

## Events

### bip122_addressesChanged

Emitted after session approval (per approved UTXO chain) so the dapp can discover addresses that may hold UTXOs, plus unused receive/change addresses.

```javascript title="utxo-listen-addresses.js"
client.on("session_event", ({ params }) => {
  if (params.event.name === "bip122_addressesChanged") {
    const addresses = params.event.data; // [{ address, publicKey?, path? }, …]
    const chainId = params.chainId;
    // Monitor returned addresses for UTXOs and balance
  }
});
```

Example `session_event` payload:

```json
{
  "id": 1675759795769537,
  "topic": "95d6aca451b8e3c6d9d176761bf786f1cc0a6d38dffd31ed896306bb37f6ae8d",
  "params": {
    "event": {
      "name": "bip122_addressesChanged",
      "data": [
        {
          "address": "bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu",
          "publicKey": "0330d54fd0dd420a6e5f8d3624f5f3482cae350f79d5f0753bf5beef9c2d91af3c",
          "path": "m/84'/0'/0'/0/0"
        }
      ]
    },
    "chainId": "bip122:000000000019d6689c085ae165831e93"
  }
}
```

:::info
Bifrost emits one `bip122_addressesChanged` event per approved account and chain ID. The first object in the data array is the connected account’s first external address. The payload also includes addresses with UTXOs and a window of unused receive/change addresses.
:::

## Connect + transfer example

```javascript title="utxo-connect-and-send.js"
import { SignClient } from "@walletconnect/sign-client";

const BTC = "bip122:000000000019d6689c085ae165831e93";

const client = await SignClient.init({
  projectId: process.env.REOWN_PROJECT_ID,
  metadata: {
    name: "My UTXO Dapp",
    description: "Example",
    url: "https://example.com",
    icons: ["https://example.com/icon.png"],
  },
});

client.on("session_event", ({ params }) => {
  if (params.event.name === "bip122_addressesChanged") {
    console.log(params.chainId, params.event.data);
  }
});

const { uri, approval } = await client.connect({
  requiredNamespaces: {
    bip122: {
      methods: [
        "sendTransfer",
        "getAccountAddresses",
        "signPsbt",
        "signMessage",
      ],
      chains: [BTC],
      events: ["bip122_addressesChanged"],
    },
  },
});

// Desktop: show `uri` as a QR code.
// Mobile: open bifrostwallet://wc?uri=${encodeURIComponent(uri)}
const session = await approval();

const account = session.namespaces.bip122.accounts.find((a) =>
  a.startsWith(`${BTC}:`),
);

const { txid } = await client.request({
  topic: session.topic,
  chainId: BTC,
  request: {
    method: "sendTransfer",
    params: {
      account,
      recipientAddress: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
      amount: "10000",
    },
  },
});
```

### getAccountAddresses example

```javascript title="utxo-get-addresses.js"
const addresses = await client.request({
  topic: session.topic,
  chainId: BTC,
  request: {
    method: "getAccountAddresses",
    params: { account },
  },
});
// [{ address, publicKey?, path? }, …]
```

### signMessage example

```javascript title="utxo-sign-message.js"
const signature = await client.request({
  topic: session.topic,
  chainId: BTC,
  request: {
    method: "signMessage",
    params: {
      account,
      message: "Hello Bifrost",
      protocol: "ecdsa",
    },
  },
});
```

## References

* [BIP-122 CAIP-2](https://github.com/ChainAgnostic/namespaces/blob/main/bip122/caip2.md)
* [BIP-122 CAIP-10](https://github.com/ChainAgnostic/namespaces/blob/main/bip122/caip10.md)
* [WalletConnect Bitcoin RPC](https://docs.walletconnect.com/advanced/multichain/rpc-reference/bitcoin-rpc)
* [WalletConnect Litecoin RPC](https://docs.walletconnect.com/advanced/multichain/rpc-reference/litecoin-rpc)
* [WalletConnect Dogecoin RPC](https://docs.walletconnect.com/advanced/multichain/rpc-reference/dogecoin-rpc)
