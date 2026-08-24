# Getting Started

Connect to Bifrost in the in-app browser, request accounts, and send a simple request.

## Detect Bifrost

Prefer EIP-6963. Fall back to `window.ethereum.isBifrost` if needed.

```javascript title="detect.js"
function getBifrostProvider() {
  return new Promise((resolve) => {
    const onAnnounce = (event) => {
      const { info, provider } = event.detail;
      if (info.rdns === "com.bifrostwallet") {
        window.removeEventListener("eip6963:announceProvider", onAnnounce);
        resolve(provider);
      }
    };

    window.addEventListener("eip6963:announceProvider", onAnnounce);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    // Fallback if no announcement arrives
    setTimeout(() => {
      window.removeEventListener("eip6963:announceProvider", onAnnounce);
      if (window.ethereum?.isBifrost) {
        resolve(window.ethereum);
      } else {
        resolve(null);
      }
    }, 100);
  });
}
```

## Request accounts

```javascript title="connect.js"
const ethereum = await getBifrostProvider();
if (!ethereum) throw new Error("Open this page in Bifrost Wallet");

const accounts = await ethereum.request({ method: "eth_requestAccounts" });
// accounts[0] is the single approved address for this origin
```

The user sees a permission prompt. Bifrost approves **one account** per origin.

## Sign typed data

Prefer **EIP-712** (`eth_signTypedData_v4`) over `personal_sign`. Typed data is clearer for users and safer for structured application messages.

```javascript title="sign-typed-data.js"
const from = accounts[0];
const chainId = Number(await ethereum.request({ method: "eth_chainId" }));

const signature = await ethereum.request({
  method: "eth_signTypedData_v4",
  params: [
    from,
    JSON.stringify({
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
        ],
        Greeting: [{ name: "text", type: "string" }],
      },
      primaryType: "Greeting",
      domain: {
        name: "My Dapp",
        version: "1",
        chainId,
      },
      message: {
        text: "Hello from my dapp",
      },
    }),
  ],
});
```

`personal_sign` is still supported when you need a plain UTF-8 / hex message; use typed data for anything structured.

## Send a transaction

```javascript title="send-transaction.js"
const txHash = await ethereum.request({
  method: "eth_sendTransaction",
  params: [
    {
      from: accounts[0],
      to: "0x…",
      value: "0x0",
      // data, gas, etc. as needed
    },
  ],
});
```

## Switch chain

```javascript title="switch-chain.js"
await ethereum.request({
  method: "wallet_switchEthereumChain",
  params: [{ chainId: "0xe" }], // Flare
});
```

`wallet_addEthereumChain` and `wallet_switchEthereumChain` only work for networks Bifrost already supports and that are active in the user’s wallet. You cannot register arbitrary custom RPCs.

## Listen for changes

```javascript title="events.js"
ethereum.on("accountsChanged", (accounts) => {
  // [] if the user revoked access
});

ethereum.on("chainChanged", (chainIdHex) => {
  // e.g. "0xe"
});
```

See [Events](events.md) and [Methods](methods.md) for the full surface.
