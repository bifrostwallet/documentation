# Supported Chains

Injected dapp browser support applies to EVM chains Bifrost ships with `dApp` support enabled. The user’s wallet must also have that network active (mainnet vs testnet mode).

## Mainnet

<table><thead><tr><th width="200">Network</th><th>Chain ID</th><th>CAIP-2</th></tr></thead><tbody><tr><td>Flare</td><td>14</td><td>eip155:14</td></tr><tr><td>Songbird</td><td>19</td><td>eip155:19</td></tr><tr><td>Ethereum</td><td>1</td><td>eip155:1</td></tr><tr><td>Arbitrum One</td><td>42161</td><td>eip155:42161</td></tr><tr><td>Optimism</td><td>10</td><td>eip155:10</td></tr><tr><td>Base</td><td>8453</td><td>eip155:8453</td></tr><tr><td>Polygon</td><td>137</td><td>eip155:137</td></tr><tr><td>BNB Smart Chain</td><td>56</td><td>eip155:56</td></tr><tr><td>XDC</td><td>50</td><td>eip155:50</td></tr><tr><td>HyperEVM</td><td>999</td><td>eip155:999</td></tr></tbody></table>

## Testnet

<table><thead><tr><th width="220">Network</th><th>Chain ID</th><th>CAIP-2</th></tr></thead><tbody><tr><td>Flare Coston2</td><td>114</td><td>eip155:114</td></tr><tr><td>Songbird Coston</td><td>16</td><td>eip155:16</td></tr><tr><td>Ethereum Sepolia</td><td>11155111</td><td>eip155:11155111</td></tr><tr><td>Arbitrum Sepolia</td><td>421614</td><td>eip155:421614</td></tr><tr><td>Optimism Sepolia</td><td>11155420</td><td>eip155:11155420</td></tr><tr><td>Base Sepolia</td><td>84532</td><td>eip155:84532</td></tr><tr><td>Polygon Amoy</td><td>80002</td><td>eip155:80002</td></tr><tr><td>BNB Smart Chain testnet</td><td>97</td><td>eip155:97</td></tr><tr><td>XDC Apothem</td><td>51</td><td>eip155:51</td></tr><tr><td>HyperEVM testnet</td><td>998</td><td>eip155:998</td></tr></tbody></table>

## Defaults

* Mainnet mode opens the browser on **Flare** (`14`)
* Testnet mode opens on **Coston2** (`114`)

## Not available via injection

Bitcoin, Litecoin, Dogecoin, and XRP Ledger have no injected provider. Use [WalletConnect](../walletconnect/).
