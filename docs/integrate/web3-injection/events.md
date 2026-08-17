# Events

Subscribe with `ethereum.on(eventName, handler)` and unsubscribe with `ethereum.removeListener`.

## Emitted events

| Event | Payload | When |
| --- | --- | --- |
| `accountsChanged` | `string[]` | Approved accounts change, or access is revoked (`[]`) |
| `chainChanged` | hex `chainId` string | Active network changes |
| `networkChanged` | decimal chain ID string | Same as `chainChanged` (MetaMask-compatible legacy) |

```javascript title="listen.js"
ethereum.on("accountsChanged", (accounts) => {
  if (accounts.length === 0) {
    // User disconnected this origin
  }
});

ethereum.on("chainChanged", (chainId) => {
  // Reload or update UI for the new chain
});
```

Bifrost suppresses duplicate events when the payload matches the last returned `eth_accounts` / `eth_chainId` / `net_version` value.

## Provider API surface

The injected provider supports `on` and `removeListener`. It does not expose `once` or `removeAllListeners`.

## References

* [EIP-1193 events](https://eips.ethereum.org/EIPS/eip-1193#events-1)
