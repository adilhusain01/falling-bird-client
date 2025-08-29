import { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { getPendingWinnings } from './contractUtils';

/**
 * Hook to manage pending winnings for the current wallet
 */
export const usePendingWinnings = () => {
  const { wallets } = useWallets();
  const [pendingWinnings, setPendingWinnings] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const XPHERE_TESTNET_RPC = 'https://rpc.ankr.com/xphere_testnet';

  const fetchPendingWinnings = async () => {
    if (wallets.length === 0) {
      setPendingWinnings('0');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const wallet = wallets[0];
      let provider;

      if (wallet.connector?.ethersProvider) {
        provider = wallet.connector.ethersProvider;
      } else {
        provider = new ethers.JsonRpcProvider(XPHERE_TESTNET_RPC);
      }

      const winnings = await getPendingWinnings(provider, wallet.address);
      setPendingWinnings(winnings);
    } catch (err) {
      console.error('Error fetching pending winnings:', err);
      setError('Failed to fetch pending winnings');
      setPendingWinnings('0');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingWinnings();
  }, [wallets]);

  const refetch = () => {
    fetchPendingWinnings();
  };

  return {
    pendingWinnings: parseFloat(pendingWinnings),
    isLoading,
    error,
    refetch
  };
};