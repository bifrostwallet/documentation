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
        "eth_signTypedData_v4",
        "eth_sendTransaction",
        "personal_sign",
      ],
      chains: ["eip155:14"],
      events: ["accountsChanged", "chainChanged"],
    },
  },
});

// Desktop: show `uri` as a QR code.
// Mobile: open bifrostwallet://wc?uri=${encodeURIComponent(uri)}
const session = await approval();
```

:::info
Prefer listing only methods you call. Bifrost may advertise additional methods in its wallet metadata; document the [methods that work](evm-blockchains.md) for your integration.
:::

## References

* [Reown AppKit](https://docs.reown.com/appkit/overview)
* [WalletConnect mobile linking](https://docs.walletconnect.network/wallet-sdk/ios/mobile-linking)
* [CAIP-10 account IDs](https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md)
