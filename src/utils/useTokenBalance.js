import { useState, useEffect, useCallback } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { getTokenBalance, getNativeBalance } from './contractUtils';
import { XPHERE_TESTNET } from '../config/constants';

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
        provider = new ethers.JsonRpcProvider(XPHERE_TESTNET.rpcUrl);
      }

      // Fetch both balances in parallel
      const [gbtBalance, xptBalance] = await Promise.all([
        getTokenBalance(provider, wallet.address),
        getNativeBalance(provider, wallet.address)
      ]);

      setTokenBalance(gbtBalance);
      setNativeBalance(xptBalance);
    } catch (err) {
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
