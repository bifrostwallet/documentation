# Connect

Pair Bifrost Wallet with your dapp using WalletConnect.

## Recommended: AppKit

For most dapps, use [Reown AppKit](https://docs.reown.com/appkit/overview) (or another WalletConnect modal that reads the wallet registry). AppKit opens Bifrost with the correct mobile link and shows a QR code on desktop. Create a project in [Reown Cloud](https://cloud.reown.com/) and pass **your** project ID.

## Pairing without AppKit

If you drive pairing yourself (Sign Client, custom UI):

1. Start a WalletConnect session and obtain a `wc:…` URI
2. **Desktop:** show the URI as a QR code for the user to scan in Bifrost
3. **Mobile open-in-wallet:** open Bifrost with the preferred deep link (below)
4. User approves the session proposal in Bifrost

### Preferred mobile link

```
bifrostwallet://wc?uri=<urlencoded-wc-uri>
```

That is the WalletConnect mobile-linking shape (`{wallet}/wc?uri={WC_URI}`). Prefer it over custom schemes that omit `/wc`.

Naked WalletConnect URIs (`wc:<topic>@2?relay-protocol=irn&symKey=…`) are for QR / copy-paste. Relay protocol must be `irn`.

### After approval

* **Android:** Bifrost may redirect back to the dapp using the session redirect metadata
* **iOS:** the user typically returns manually; Bifrost may show a confirmation toast instead of an automatic redirect

## Reading accounts after connect

Approved accounts are always on the session as [CAIP-10](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md) strings: `namespace:reference:address`.

```javascript title="read-accounts.js"
function addressFromCaip10(caip10) {
  const parts = caip10.split(":");
  return parts[parts.length - 1];
}

const session = await approval();

// EVM — also available via eth_accounts / eth_requestAccounts
const evm = session.namespaces.eip155?.accounts?.[0];
const evmAddress = evm && addressFromCaip10(evm);

// XRPL — no xrpl_getAccounts; session is the source of truth
const xrpl = session.namespaces.xrpl?.accounts?.[0];
const xrplAddress = xrpl && addressFromCaip10(xrpl);

// UTXO — also listen for bip122_addressesChanged for the fuller set
const btc = session.namespaces.bip122?.accounts?.find((a) =>
  a.startsWith("bip122:000000000019d6689c085ae165831e93:"),
);
const btcAddress = btc && addressFromCaip10(btc);
```

| Namespace | How to get the address |
| --- | --- |
| `eip155` | Session accounts **or** `eth_accounts` / `eth_requestAccounts` |
| `xrpl` | Session accounts only (no get-accounts RPC) |
| `bip122` | Session accounts **plus** `bip122_addressesChanged` / `getAccountAddresses` |

See the [EVM](evm-blockchains.md), [UTXO](utxo-blockchains.md), and [XRPL](xrp-ledger.md) pages for full request examples.

## One-Click Auth (SIWE)

Bifrost supports WalletConnect `session_authenticate` (One-Click Auth). Authenticate requests are handled with EIP-191 / `personal_sign` style signing for the `eip155` namespace.

## Session namespaces

Propose only chains and methods Bifrost supports (see the EVM / UTXO / XRPL pages). Include the namespaces your dapp needs:

* EVM dapps: `eip155`
* Bitcoin / Litecoin / Dogecoin: `bip122`
* XRPL: `xrpl`

You can combine namespaces in one session when the wallet approves.

## Example (Sign Client)

Lower-level alternative when you are not using AppKit:

```javascript title="pair.js"
import { SignClient } from "@walletconnect/sign-client";

const client = await SignClient.init({
  projectId: process.env.REOWN_PROJECT_ID,
  metadata: {
    name: "My Dapp",
    description: "Example dapp",
    url: "https://example.com",
    icons: ["https://example.com/icon.png"],
  },
});

const { uri, approval } = await client.connect({
  requiredNamespaces: {
    eip155: {
      methods: [
        "eth_accounts",
        "eth_sendTransaction",
        "personal_sign",
        "eth_signTypedData_v4",
      ],
      chains: ["eip155:14"],
      events: ["accountsChanged", "chainChanged"],
    },
  },
});

// Desktop: show `uri` as a QR code.
// Mobile: open bifrostwallet://wc?uri=${encodeURIComponent(uri)}
const session = await approval();
const address = session.namespaces.eip155.accounts[0].split(":")[2];
```

Multi-namespace proposal (EVM + XRPL):

```javascript title="pair-multi.js"
const { uri, approval } = await client.connect({
  requiredNamespaces: {
    eip155: {
      methods: ["eth_accounts", "eth_sendTransaction", "personal_sign"],
      chains: ["eip155:14"],
      events: ["accountsChanged", "chainChanged"],
    },
    xrpl: {
      methods: ["xrpl_signTransaction"],
      chains: ["xrpl:0"],
      events: [],
    },
  },
});

const session = await approval();
const flareAddress = session.namespaces.eip155.accounts[0].split(":")[2];
const xrpAddress = session.namespaces.xrpl.accounts[0].split(":")[2];
```

:::info
Prefer listing only methods you call. Bifrost may advertise additional methods in its wallet metadata; document the methods that work on the [EVM](evm-blockchains.md), [UTXO](utxo-blockchains.md), and [XRPL](xrp-ledger.md) pages.
:::

## References

* [Reown AppKit](https://docs.reown.com/appkit/overview)
* [WalletConnect mobile linking](https://docs.walletconnect.network/wallet-sdk/ios/mobile-linking)
* [CAIP-10 account IDs](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md)
