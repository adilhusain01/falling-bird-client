import { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { getPendingWinnings } from './contractUtils';
import { XPHERE_TESTNET_RPC } from '../config/constants';

/**
 * Hook to manage pending winnings for the current wallet
 */
export const usePendingWinnings = () => {
  const { wallets } = useWallets();
  const [pendingWinnings, setPendingWinnings] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setError('Failed to fetch pending winnings');
      setPendingWinnings('0');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingWinnings();
  }, [wallets.length]); // eslint-disable-line react-hooks/exhaustive-deps

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