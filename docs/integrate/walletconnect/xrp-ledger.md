# XRP Ledger

WalletConnect namespace: `xrpl`.

## Chain IDs

| Blockchain | CAIP-2 Chain ID |
| --- | --- |
| XRP Ledger | `xrpl:0` |
| XRP Ledger testnet | `xrpl:1` |

## Methods

### xrpl_signTransaction

Sign an XRPL transaction. Bifrost can autofill missing fields and optionally submit the signed transaction.

**Params**

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `tx_json` | object | required | Transaction JSON (`TransactionType` + fields) |
| `autofill` | boolean | `true` | Fill sequence, fee, last ledger sequence, etc. |
| `submit` | boolean | `true` | Submit to the network after signing |

**Result:** `{ tx_json }`: signed transaction envelope fields returned by the wallet.

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

## Example

```javascript title="xrpl-sign.js"
const result = await client.request({
  topic: session.topic,
  chainId: "xrpl:0",
  request: {
    method: "xrpl_signTransaction",
    params: {
      autofill: true,
      submit: true,
      tx_json: {
        TransactionType: "Payment",
        Account: "r…",
        Destination: "r…",
        Amount: "1000000",
      },
    },
  },
});
```

## References

* [XRPL transaction formats](https://xrpl.org/docs/references/protocol/transactions)
* [WalletConnect XRPL](https://docs.reown.com/)
