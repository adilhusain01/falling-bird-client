<PrivyProvider 
  appId="cmdx3unrh01cuk10bwfqveom6"
  config={{
  "appearance": {
    "accentColor": "#6A6FF5",
    "theme": "#FFFFFF",
    "showWalletLoginFirst": false,
    "logo": "https://auth.privy.io/logos/privy-logo.png",
    "walletChainType": "ethereum-only",
    "walletList": [
      "detected_ethereum_wallets",
      "metamask",
      "coinbase_wallet",
      "base_account",
      "rainbow",
      "wallet_connect"
    ]
  },
  "loginMethods": [
    "email",
    "wallet",
    "google",
    "github"
  ],
  "fundingMethodConfig": {
    "moonpay": {
      "useSandbox": true
    }
  },
  "embeddedWallets": {
    "requireUserPasswordOnCreate": false,
    "showWalletUIs": true,
    "ethereum": {
      "createOnLogin": "users-without-wallets"
    },
    "solana": {
      "createOnLogin": "off"
    }
  },
  "mfa": {
    "noPromptOnMfaRequired": false
  },
  "externalWallets": {
    "solana": {
      "connectors": {}
    }
  }
}}
>
  {children}
</PrivyProvider>