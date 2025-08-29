/**
 * Application constants and configuration
 */
import { xphereTestnet } from 'viem/chains';

// Network configuration
export const XPHERE_TESTNET_RPC = 'https://rpc.ankr.com/xphere_testnet';

// Complete Xphere testnet configuration
export const XPHERE_TESTNET = {
  chainId: xphereTestnet.id,
  name: xphereTestnet.name,
  rpcUrl: XPHERE_TESTNET_RPC,
  nativeCurrency: xphereTestnet.nativeCurrency,
  blockExplorers: xphereTestnet.blockExplorers,
  blockExplorerUrl: 'https://xpt.tamsa.io/'
};

// Chain configuration for xphereTestnet (for Privy)
export const customXphereTestnet = {
  ...xphereTestnet,
  rpcUrls: {
    default: {
      http: [XPHERE_TESTNET_RPC]
    },
    public: {
      http: [XPHERE_TESTNET_RPC]
    }
  }
};
