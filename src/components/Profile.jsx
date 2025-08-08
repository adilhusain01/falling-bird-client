import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets, useLogout, useSendTransaction } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { 
  getTokenBalance, 
  canClaimFaucet, 
  getTimeUntilNextClaim, 
  formatTimeRemaining,
  getNativeBalance,
  getClaimFaucetTransactionData
} from '../utils/contractUtils';

const Profile = () => {
  const { authenticated, fundWallet } = usePrivy();
  const { wallets } = useWallets();
  const { logout } = useLogout();
  const { sendTransaction } = useSendTransaction();
  const navigate = useNavigate();
  const [balance, setBalance] = useState('0'); // STT balance
  const [tokenBalance, setTokenBalance] = useState('0'); // GBT token balance
  const [canClaim, setCanClaim] = useState(false);
  const [timeUntilClaim, setTimeUntilClaim] = useState(0);
  const [currentChainId, setCurrentChainId] = useState(null);
  const [error, setError] = useState(null);
  const [isClaimingTokens, setIsClaimingTokens] = useState(false);
  const [lastClaimTx, setLastClaimTx] = useState(null);

  const SOMNIA_TESTNET = {
    chainId: 50312,
    name: 'Somnia Testnet',
    rpcUrl: 'https://dream-rpc.somnia.network/',
    nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
    blockExplorerUrl: 'https://shannon-explorer.somnia.network/'
  };

  // Fetch wallet balance, token balance, and faucet status
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

          // Fetch native balance (STT)
          const nativeBalance = await getNativeBalance(provider, wallet.address);
          setBalance(nativeBalance);

          // Fetch token balance (GBT)
          const gbtBalance = await getTokenBalance(provider, wallet.address);
          setTokenBalance(gbtBalance);

          // Check faucet eligibility
          const canClaimFromFaucet = await canClaimFaucet(provider, wallet.address);
          setCanClaim(canClaimFromFaucet);

          // Get time until next claim if can't claim now
          if (!canClaimFromFaucet) {
            const timeUntilNext = await getTimeUntilNextClaim(provider, wallet.address);
            setTimeUntilClaim(timeUntilNext);
          }

          // Get current chain ID
          const network = await provider.getNetwork();
          setCurrentChainId(`eip155:${network.chainId}`);
          
          setError(null);
        } catch (err) {
          setError('Failed to fetch wallet data');
          console.error(err);
        }
      }
    };
    
    fetchWalletData();
    
    // Set up interval to refresh faucet status every 30 seconds
    const interval = setInterval(fetchWalletData, 30000);
    
    return () => clearInterval(interval);
  }, [wallets, SOMNIA_TESTNET.rpcUrl]);

  // Handle token claiming
  const handleClaimTokens = async () => {
    if (!wallets.length || !canClaim || isClaimingTokens) return;

    const wallet = wallets[0];
    setIsClaimingTokens(true);
    setError(null);

    try {
      // Check if we're on Somnia testnet
      if (currentChainId !== `eip155:${SOMNIA_TESTNET.chainId}`) {
        setError('Please switch to Somnia Testnet first');
        setIsClaimingTokens(false);
        return;
      }

      // Get transaction data for claiming faucet tokens
      const txData = getClaimFaucetTransactionData();
      
      // Use Privy's sendTransaction to sign and send the transaction
      const result = await sendTransaction(txData, {
        address: wallet.address
      });
      
      setLastClaimTx(result.transactionHash);
      
      // Wait a moment for the transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Refresh balances after successful claim
      let provider;
      if (wallet.connector?.ethersProvider) {
        provider = wallet.connector.ethersProvider;
      } else {
        provider = new ethers.JsonRpcProvider(SOMNIA_TESTNET.rpcUrl);
      }
      
      const nativeBalance = await getNativeBalance(provider, wallet.address);
      setBalance(nativeBalance);
      
      const gbtBalance = await getTokenBalance(provider, wallet.address);
      setTokenBalance(gbtBalance);
      
      // Update faucet status
      setCanClaim(false);
      const timeUntilNext = await getTimeUntilNextClaim(provider, wallet.address);
      setTimeUntilClaim(timeUntilNext);
      
      setError(null);
    } catch (err) {
      console.error('Error claiming tokens:', err);
      if (err.message.includes('Faucet cooldown not met')) {
        setError('You need to wait before claiming again');
      } else if (err.message.includes('insufficient funds')) {
        setError('Insufficient STT balance for gas fees');
      } else if (err.message.includes('User rejected')) {
        setError('Transaction was cancelled');
      } else {
        setError('Failed to claim tokens. Please try again.');
      }
    } finally {
      setIsClaimingTokens(false);
    }
  };

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
                  ⚡ STT Balance: {balance !== null ? 
                    `${parseFloat(balance).toFixed(4)} STT` : 'Counting coins...'}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Used for gas fees on Somnia network
                </p>
              </div>
              
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                <p className="text-slate-700 text-sm font-medium">
                  🪙 GBT Tokens: {tokenBalance !== null ? 
                    `${parseFloat(tokenBalance).toFixed(2)} GBT` : 'Loading...'}
                </p>
                <div className="mt-1 h-2 w-full bg-purple-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
                    style={{ width: `${Math.min(100, (parseFloat(tokenBalance) / 10000) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  Game currency for placing bets
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
            {/* Claim Tokens Button */}
            <button
              className={`ghibli-button w-full py-4 px-5 text-base font-bold flex items-center justify-center gap-3 ${
                !canClaim || isClaimingTokens || wallets.length === 0 || currentChainId !== `eip155:${SOMNIA_TESTNET.chainId}`
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'ghibli-button-green'
              }`}
              onClick={handleClaimTokens}
              disabled={!canClaim || isClaimingTokens || wallets.length === 0 || currentChainId !== `eip155:${SOMNIA_TESTNET.chainId}`}
            >
              <span className="text-xl">🪙</span>
              {isClaimingTokens ? (
                <>
                  <span className="animate-spin text-lg">🌀</span>
                  Claiming...
                </>
              ) : canClaim ? (
                <>
                  Claim 1000 GBT
                  <span className="text-xl">✨</span>
                </>
              ) : (
                <>
                  {formatTimeRemaining(timeUntilClaim)}
                  <span className="text-xl">⏰</span>
                </>
              )}
            </button>
            
            {/* Fund Wallet Button */}
          
            
           
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
            Play Game
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

        {/* Success message for token claims */}
        {lastClaimTx && (
          <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 max-w-sm w-full">
            <div className="text-green-600 text-sm text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span>🎉</span>
                <span style={{ fontFamily: 'Comfortaa, cursive' }}>
                  Successfully claimed 1000 GBT!
                </span>
              </div>
              <div className="text-xs text-green-500 break-all">
                Tx: {lastClaimTx}
              </div>
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


//0x42C07c27BC76796F02c9775343bbD3005A527FaA