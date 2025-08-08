import { useState, useEffect, useCallback } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { getTokenBalance, getNativeBalance } from './contractUtils';

const SOMNIA_TESTNET = {
  chainId: 50312,
  rpcUrl: 'https://dream-rpc.somnia.network/',
};

export const useTokenBalance = () => {
  const { wallets } = useWallets();
  const [tokenBalance, setTokenBalance] = useState('0');
  const [nativeBalance, setNativeBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalances = useCallback(async () => {
    if (wallets.length === 0) return;

    const wallet = wallets[0];
    setIsLoading(true);
    setError(null);

    try {
      let provider;
      if (wallet.connector?.ethersProvider) {
        provider = wallet.connector.ethersProvider;
      } else {
        provider = new ethers.JsonRpcProvider(SOMNIA_TESTNET.rpcUrl);
      }

      // Fetch both balances in parallel
      const [gbtBalance, sttBalance] = await Promise.all([
        getTokenBalance(provider, wallet.address),
        getNativeBalance(provider, wallet.address)
      ]);

      setTokenBalance(gbtBalance);
      setNativeBalance(sttBalance);
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError('Failed to fetch balances');
    } finally {
      setIsLoading(false);
    }
  }, [wallets]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  const refetch = useCallback(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    tokenBalance: parseFloat(tokenBalance),
    nativeBalance: parseFloat(nativeBalance),
    isLoading,
    error,
    refetch
  };
};
