import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets, useLogout } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

const Profile = () => {
  const { user, authenticated, fundWallet } = usePrivy();
  const { wallets } = useWallets();
  const { logout } = useLogout();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [currentChainId, setCurrentChainId] = useState(null);
  const [error, setError] = useState(null);

  const SOMNIA_TESTNET = {
    chainId: 50312,
    name: 'Somnia Testnet',
    rpcUrl: 'https://dream-rpc.somnia.network/',
    nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
    blockExplorerUrl: 'https://shannon-explorer.somnia.network/'
  };

  // Fetch wallet balance and current chain
  useEffect(() => {
    const fetchWalletData = async () => {
      if (wallets.length > 0) {
        const wallet = wallets[0];
        try {
          let provider;
          if (wallet.connector?.ethersProvider) {
            provider = wallet.connector.ethersProvider;
          } else {
            // Default to Somnia testnet RPC
            provider = new ethers.JsonRpcProvider(SOMNIA_TESTNET.rpcUrl);
          }
          const balanceWei = await provider.getBalance(wallet.address);
          const balanceEth = ethers.formatEther(balanceWei);
          setBalance(balanceEth);

          const network = await provider.getNetwork();
          setCurrentChainId(`eip155:${network.chainId}`);
        } catch (err) {
          setError('Failed to fetch wallet data');
          console.error(err);
        }
      }
    };
    fetchWalletData();
  }, [wallets]);

  // Handle network switch
  const handleSwitchNetwork = async () => {
    if (wallets.length === 0) {
      setError('No wallet connected');
      return;
    }

    const wallet = wallets[0];

    try {
      if (wallet.connector?.ethersProvider) {
        const provider = wallet.connector.ethersProvider;
        
        // Try to switch to Somnia testnet
        try {
          await provider.send('wallet_switchEthereumChain', [
            { chainId: `0x${SOMNIA_TESTNET.chainId.toString(16)}` }
          ]);
          setCurrentChainId(`eip155:${SOMNIA_TESTNET.chainId}`);
          setError(null);
        } catch (switchError) {
          // If network doesn't exist, add it
          if (switchError.code === 4902) {
            await provider.send('wallet_addEthereumChain', [
              {
                chainId: `0x${SOMNIA_TESTNET.chainId.toString(16)}`,
                chainName: SOMNIA_TESTNET.name,
                rpcUrls: [SOMNIA_TESTNET.rpcUrl],
                nativeCurrency: SOMNIA_TESTNET.nativeCurrency,
                blockExplorerUrls: [SOMNIA_TESTNET.blockExplorerUrl]
              }
            ]);
            setCurrentChainId(`eip155:${SOMNIA_TESTNET.chainId}`);
            setError(null);
          } else {
            throw switchError;
          }
        }
      } else {
        setError('Wallet does not support network switching');
      }
    } catch (err) {
      setError('Failed to switch to Somnia testnet');
      console.error(err);
    }
  };

  const getNetworkDisplayName = () => {
    if (!currentChainId) return 'Discovering realm...';
    
    const chainId = currentChainId.split(':')[1];
    switch (chainId) {
      case '50312':
        return 'Somnia Testnet';
      case '1':
        return 'Ethereum Mainnet';
      case '11155111':
        return 'Sepolia Testnet';
      default:
        return `Chain ${chainId}`;
    }
  };

  // Handle funding via MoonPay
  const handleFundWallet = async () => {
    if (wallets.length === 0) {
      setError('No wallet connected');
      return;
    }

    try {
      await fundWallet(wallets[0].address);
      setError(null);
    } catch (err) {
      setError('Failed to initiate funding');
      console.error(err);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      setError('Failed to log out');
      console.error(err);
    }
  };

  if (!authenticated) {
    return (
      <div className="page-container">
        {/* Floating magical elements */}
        <div className="floating-elements">
          <div className="floating-element">🔮</div>
          <div className="floating-element">🌙</div>
          <div className="floating-element">✨</div>
          <div className="floating-element">🌟</div>
        </div>

        <div className="flex flex-col items-center justify-center w-full h-full p-6">
          <div className="text-6xl mb-6" style={{ animation: 'gentle-float 3s ease-in-out infinite' }}>
            🔐
          </div>
          <div className="ghibli-card w-full max-w-sm p-6">
            <h2 className="ghibli-title text-2xl mb-4 text-center">
              Forbidden Forest
            </h2>
            <p className="text-slate-600 text-sm text-center" style={{ fontFamily: 'Comfortaa, cursive' }}>
              The magical forest spirits require authentication to reveal the treasures within. 
              Please return to the entrance and present your credentials.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const wallet = wallets[0];
  const isButtonDisabled = (chainId) => 
    currentChainId === chainId || wallets.length === 0;

  return (
    <div className="page-container">
      {/* Floating magical elements */}
      <div className="floating-elements">
        <div className="floating-element">💎</div>
        <div className="floating-element">🦋</div>
        <div className="floating-element">🌸</div>
        <div className="floating-element">⭐</div>
      </div>

      <div className="flex flex-col items-center justify-start w-full h-full p-5 overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2" style={{ animation: 'gentle-float 4s ease-in-out infinite' }}>🐦</div>
          <h1 className="ghibli-title text-3xl">Adventurer's Codex</h1>
          <div className="text-sm text-emerald-700 opacity-70 mt-1" style={{ fontFamily: 'Kalam, cursive' }}>
            ~ Your Magical Compendium ~
          </div>
        </div>
        
        {/* Wallet Details Card */}
        <div className="ghibli-card w-full max-w-sm p-6 mb-4 relative">
          {/* Decorative corner elements */}
          <div className="absolute top-2 right-2 text-lg opacity-30">🌿</div>
          <div className="absolute bottom-2 left-2 text-lg opacity-30">🍃</div>
          
          <h2 className="ghibli-title text-xl mb-4 text-center flex items-center justify-center gap-2">
            <span>💫</span> Spirit Wallet <span>💫</span>
          </h2>
          
          {wallet ? (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                <p className="text-slate-700 text-sm font-medium mb-1">
                  🏠 Sanctuary Address:
                </p>
                <div className="font-mono text-xs bg-white bg-opacity-80 px-3 py-2 rounded-lg break-all border border-blue-200">
                  {wallet.address}
                </div>
              </div>
              
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                <p className="text-slate-700 text-sm font-medium">
                  🌍 Realm: {getNetworkDisplayName()}
                </p>
              </div>
              
              <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-100">
                <p className="text-slate-700 text-sm font-medium">
                  💰 Treasure: {balance ? 
                    `${parseFloat(balance).toFixed(4)} SSM` : 'Counting coins...'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-slate-600 text-sm" style={{ fontFamily: 'Comfortaa, cursive' }}>
                No spirit wallet found in this realm. Please summon one through the portal entrance.
              </p>
            </div>
          )}
        </div>

        {/* Wallet Actions Card */}
        <div className="ghibli-card w-full max-w-sm p-6 mb-4 relative">
          {/* Decorative elements */}
          <div className="absolute top-2 left-2 text-lg opacity-30">⚡</div>
          <div className="absolute bottom-2 right-2 text-lg opacity-30">🔥</div>
          
          <h2 className="ghibli-title text-xl mb-6 text-center flex items-center justify-center gap-2">
            <span>🎭</span> Magical Actions <span>🎭</span>
          </h2>
          
          <div className="space-y-3">
            <button
              className={`ghibli-button ghibli-button-green w-full py-4 px-5 text-base font-bold flex items-center justify-center gap-3 ${
                wallets.length === 0 ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              onClick={handleFundWallet}
              disabled={wallets.length === 0}
            >
              <span className="text-xl">💰</span>
              Fund with Moon Magic
              <span className="text-xl">🌙</span>
            </button>
            
            <button
              className={`ghibli-button w-full py-4 px-5 text-base font-bold flex items-center justify-center gap-3 ${
                currentChainId === `eip155:${SOMNIA_TESTNET.chainId}` || wallets.length === 0 ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              onClick={handleSwitchNetwork}
              disabled={currentChainId === `eip155:${SOMNIA_TESTNET.chainId}` || wallets.length === 0}
            >
              <span className="text-xl">🏰</span>
              Somnia Testnet
              <span className="text-xl">👑</span>
            </button>
            
            
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex gap-3 w-full max-w-sm mt-2">
          <button 
            className="ghibli-button ghibli-button-red flex-1 py-3 px-4 text-base font-bold flex items-center justify-center gap-2"
            onClick={handleLogout}
          >
            <span className="text-lg">🚪</span>
            Logout
          </button>
          <button 
            className="ghibli-button flex-1 py-3 px-4 text-base font-bold flex items-center justify-center gap-2"
            onClick={() => navigate('/')}
          >
            <span className="text-lg">🎮</span>
            Home
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 max-w-sm w-full">
            <div className="flex items-center gap-2 text-red-600 text-sm text-center">
              <span>⚠️</span>
              <span style={{ fontFamily: 'Comfortaa, cursive' }}>{error}</span>
            </div>
          </div>
        )}

        {/* Bottom decorative quote */}
        <div className="mt-6 text-xs text-emerald-600 opacity-60 text-center max-w-xs" style={{ fontFamily: 'Kalam, cursive' }}>
          "The winds carry more than just leaves... they carry dreams and possibilities."
        </div>
      </div>
    </div>
  );
};

export default Profile;