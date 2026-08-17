const sidebars = {
  docs: [
    "intro",
    {
      type: "category",
      label: "Integrate",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "WalletConnect",
          link: { type: "doc", id: "integrate/walletconnect/index" },
          items: [
            "integrate/walletconnect/connect",
            "integrate/walletconnect/evm-blockchains",
            "integrate/walletconnect/utxo-blockchains",
            "integrate/walletconnect/xrp-ledger",
          ],
        },
        {
          type: "category",
          label: "Web3 Injection",
          link: { type: "doc", id: "integrate/web3-injection/index" },
          items: [
            "integrate/web3-injection/getting-started",
            "integrate/web3-injection/methods",
            "integrate/web3-injection/events",
            "integrate/web3-injection/chains",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "List",
      link: { type: "doc", id: "list/index" },
      collapsed: false,
      items: ["list/ftso-provider", "list/dapp", "list/consuming-assets"],
    },
  ],
};

export default sidebars;
