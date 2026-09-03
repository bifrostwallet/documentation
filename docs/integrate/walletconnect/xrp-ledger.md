# XRP Ledger

WalletConnect namespace: `xrpl`.

## Chain IDs

| Blockchain | CAIP-2 Chain ID |
| --- | --- |
| XRP Ledger | `xrpl:0` |
| XRP Ledger testnet | `xrpl:1` |

## Getting the user’s address

There is **no** `xrpl_getAccounts` (or similar) over WalletConnect. After session approval, read CAIP-10 accounts from the session and strip the chain prefix.

```javascript title="xrpl-accounts.js"
// After: const session = await approval();
const caip10 = session.namespaces.xrpl?.accounts?.[0];
// e.g. "xrpl:0:rN7n7otQDd6FczFgLdlqtyMVrn3LNU8Z"
if (!caip10) throw new Error("No XRPL account in session");

const [, chainRef, address] = caip10.split(":");
const chainId = `xrpl:${chainRef}`; // "xrpl:0" or "xrpl:1"

console.log(address); // classic r-address — use as tx_json.Account
```

Reown’s XRPL RPC only defines signing methods; address discovery is session metadata ([CAIP-10](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md)).

## Methods

Bifrost supports **one** XRPL session method:

| Method | Supported |
| --- | --- |
| `xrpl_signTransaction` | yes |
| `xrpl_signTransactionFor` | no (multi-sign; Reown documents it, Bifrost does not) |

### xrpl_signTransaction

Sign an XRPL transaction. Bifrost can autofill missing fields and optionally submit the signed transaction.

**Params**

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `tx_json` | object | required | Transaction JSON (`TransactionType` + fields) |
| `autofill` | boolean | `true` | Fill sequence, fee, last ledger sequence, etc. |
| `submit` | boolean | `true` | Submit to the network after signing |

**Result:** `{ tx_json }` — signed transaction envelope fields returned by the wallet (includes autofilled fields, `TxnSignature`, and usually `hash` when submitted).

Set `submit: false` if you want a signed payload to broadcast yourself (you must serialize to `tx_blob` and submit to an XRPL node).

### Supported TransactionType values

* `Payment`
* `TrustSet`
* `OfferCreate`
* `OfferCancel`
* `NFTokenCreateOffer`
* `NFTokenAcceptOffer`
* `NFTokenCancelOffer`
* `AMMDeposit`
* `AMMWithdraw`
* `AccountSet`
* `AccountDelete`
* `CheckCreate`
* `CheckCash`
* `CheckCancel`

Other transaction types are rejected.

## Connect + Payment example

```javascript title="xrpl-connect-and-pay.js"
import { SignClient } from "@walletconnect/sign-client";

const client = await SignClient.init({
  projectId: process.env.REOWN_PROJECT_ID,
  metadata: {
    name: "My XRPL Dapp",
    description: "Example",
    url: "https://example.com",
    icons: ["https://example.com/icon.png"],
  },
});

const { uri, approval } = await client.connect({
  requiredNamespaces: {
    xrpl: {
      methods: ["xrpl_signTransaction"],
      chains: ["xrpl:0"],
      events: [],
    },
  },
});

// Desktop: show `uri` as a QR code.
// Mobile: open bifrostwallet://wc?uri=${encodeURIComponent(uri)}
const session = await approval();

const caip10 = session.namespaces.xrpl.accounts[0];
const address = caip10.split(":")[2];
const chainId = "xrpl:0";

const result = await client.request({
  topic: session.topic,
  chainId,
  request: {
    method: "xrpl_signTransaction",
    params: {
      autofill: true,
      submit: true,
      tx_json: {
        TransactionType: "Payment",
        Account: address,
        Destination: "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
        Amount: "1000000", // 1 XRP in drops
      },
    },
  },
});

console.log(result.tx_json.hash);
```

### TrustSet example

```javascript title="xrpl-trustset.js"
const result = await client.request({
  topic: session.topic,
  chainId: "xrpl:0",
  request: {
    method: "xrpl_signTransaction",
    params: {
      autofill: true,
      submit: true,
      tx_json: {
        TransactionType: "TrustSet",
        Account: address,
        LimitAmount: {
          currency: "USD",
          issuer: "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
          value: "1000",
        },
      },
    },
  },
});
```

## Events

Propose `events: []` for XRPL unless you need something specific. Do not rely on `accountsChanged` / `chainChanged` over WalletConnect for XRPL — re-read `session.namespaces.xrpl.accounts` after reconnect if the user pairs again.

## References

* [XRPL transaction formats](https://xrpl.org/docs/references/protocol/transactions)
* [Reown XRPL RPC](https://docs.reown.com/advanced/multichain/rpc-reference/xrpl-rpc)
* [CAIP-10](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md)
