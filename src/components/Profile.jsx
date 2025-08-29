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
  getClaimFaucetTransactionData,
  getPendingWinnings,
  getClaimWinningsTransactionData
} from '../utils/contractUtils';

const Profile = () => {
  const { authenticated, fundWallet } = usePrivy();
  const { wallets } = useWallets();
  const { logout } = useLogout();
  const { sendTransaction } = useSendTransaction();
  const navigate = useNavigate();
  const [balance, setBalance] = useState('0'); // XPT balance
  const [tokenBalance, setTokenBalance] = useState('0'); // GBT token balance
  const [pendingWinnings, setPendingWinnings] = useState('0'); // Pending winnings
  const [isLoadingBalances, setIsLoadingBalances] = useState(true); // Loading state for balances
  const [canClaim, setCanClaim] = useState(false);
  const [timeUntilClaim, setTimeUntilClaim] = useState(0);
  const [currentChainId, setCurrentChainId] = useState(null);
  const [error, setError] = useState(null);
  const [isClaimingTokens, setIsClaimingTokens] = useState(false);
  const [isClaimingWinnings, setIsClaimingWinnings] = useState(false);
  const [lastClaimTx, setLastClaimTx] = useState(null);
  const [lastWinningsTx, setLastWinningsTx] = useState(null);

  const XPHERE_TESTNET = {
    chainId: 1998991,
    name: 'Xphere Testnet',
    rpcUrl: 'http://testnet.x-phere.com',
    nativeCurrency: { name: 'XPT', symbol: 'XPT', decimals: 18 },
    blockExplorerUrl: 'https://xpt.tamsa.io/'
  };

  // Fetch wallet balance, token balance, and faucet status
  useEffect(() => {
    const fetchWalletData = async () => {
      if (wallets.length > 0) {
        const wallet = wallets[0];
        setIsLoadingBalances(true);
        try {
          let provider;
          if (wallet.connector?.ethersProvider) {
            provider = wallet.connector.ethersProvider;
          } else {
            provider = new ethers.JsonRpcProvider(XPHERE_TESTNET.rpcUrl);
          }

          // Fetch native balance (XPT)
          const nativeBalance = await getNativeBalance(provider, wallet.address);
          setBalance(nativeBalance);

          // Fetch token balance (GBT) and pending winnings
          const [gbtBalance, winnings] = await Promise.all([
            getTokenBalance(provider, wallet.address),
            getPendingWinnings(provider, wallet.address)
          ]);
          setTokenBalance(gbtBalance);
          setPendingWinnings(winnings);

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
        } finally {
          setIsLoadingBalances(false);
        }
      } else {
        setIsLoadingBalances(false);
      }
    };
    
    fetchWalletData();
    
    // Set up interval to refresh faucet status every 30 seconds
    const interval = setInterval(fetchWalletData, 30000);
    
    return () => clearInterval(interval);
  }, [wallets, XPHERE_TESTNET.rpcUrl]);

  // Handle winnings claiming
  const handleClaimWinnings = async () => {
    if (!wallets.length || isClaimingWinnings || parseFloat(pendingWinnings) <= 0 || isLoadingBalances) return;

    const wallet = wallets[0];
    setIsClaimingWinnings(true);
    setError(null);

    try {
      // Check if we're on Xphere testnet
      if (currentChainId !== `eip155:${XPHERE_TESTNET.chainId}`) {
        setError('Please switch to Xphere Testnet first');
        setIsClaimingWinnings(false);
        return;
      }

      // Get transaction data for claiming winnings
      const txData = getClaimWinningsTransactionData();
      
      // Use Privy's sendTransaction to sign and send the transaction
      const result = await sendTransaction(txData, {
        address: wallet.address
      });
      
      setLastWinningsTx(result.transactionHash);
      
      // Wait a moment for the transaction to be processed
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Refresh balances after successful claim
      let provider;
      if (wallet.connector?.ethersProvider) {
        provider = wallet.connector.ethersProvider;
      } else {
        provider = new ethers.JsonRpcProvider(XPHERE_TESTNET.rpcUrl);
      }
      
      const [nativeBalance, gbtBalance, winnings] = await Promise.all([
        getNativeBalance(provider, wallet.address),
        getTokenBalance(provider, wallet.address),
        getPendingWinnings(provider, wallet.address)
      ]);
      setBalance(nativeBalance);
      setTokenBalance(gbtBalance);
      setPendingWinnings(winnings);
      
      setError(null);
    } catch (err) {
      console.error('Error claiming winnings:', err);
      if (err.message.includes('No winnings to claim')) {
        setError('No winnings available to claim');
      } else if (err.message.includes('insufficient funds')) {
        setError('Insufficient XPT balance for gas fees');
      } else if (err.message.includes('User rejected')) {
        setError('Transaction was cancelled');
      } else {
        setError('Failed to claim winnings. Please try again.');
      }
    } finally {
      setIsClaimingWinnings(false);
    }
  };

  // Handle token claiming
  const handleClaimTokens = async () => {
    if (!wallets.length || !canClaim || isClaimingTokens) return;

    const wallet = wallets[0];
    setIsClaimingTokens(true);
    setError(null);

    try {
      // Check if we're on Xphere testnet
      if (currentChainId !== `eip155:${XPHERE_TESTNET.chainId}`) {
        setError('Please switch to Xphere Testnet first');
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
        provider = new ethers.JsonRpcProvider(XPHERE_TESTNET.rpcUrl);
      }
      
      const [nativeBalance, gbtBalance, winnings] = await Promise.all([
        getNativeBalance(provider, wallet.address),
        getTokenBalance(provider, wallet.address),
        getPendingWinnings(provider, wallet.address)
      ]);
      setBalance(nativeBalance);
      setTokenBalance(gbtBalance);
      setPendingWinnings(winnings);
      
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
        setError('Insufficient XPT balance for gas fees');
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
        
      
        try {
          await provider.send('wallet_switchEthereumChain', [
            { chainId: `0x${XPHERE_TESTNET.chainId.toString(16)}` }
          ]);
          setCurrentChainId(`eip155:${XPHERE_TESTNET.chainId}`);
          setError(null);
        } catch (switchError) {
          // If network doesn't exist, add it
          if (switchError.code === 4902) {
            await provider.send('wallet_addEthereumChain', [
              {
                chainId: `0x${XPHERE_TESTNET.chainId.toString(16)}`,
                chainName: XPHERE_TESTNET.name,
                rpcUrls: [XPHERE_TESTNET.rpcUrl],
                nativeCurrency: XPHERE_TESTNET.nativeCurrency,
                blockExplorerUrls: [XPHERE_TESTNET.blockExplorerUrl]
              }
            ]);
            setCurrentChainId(`eip155:${XPHERE_TESTNET.chainId}`);
            setError(null);
          } else {
            throw switchError;
          }
        }
      } else {
        setError('Wallet does not support network switching');
      }
    } catch (err) {
      setError('Failed to switch to Xphere testnet');
      console.error(err);
    }
  };

  const getNetworkDisplayName = () => {
    if (!currentChainId) return 'Discovering realm...';
    
    const chainId = currentChainId.split(':')[1];
    switch (chainId) {
      case '1998991':
        return 'Xphere Testnet';
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
            <p className="text-secondary text-sm text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
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
          <h1 className="ghibli-title text-3xl">Catch Goofy Profile</h1>
          <div className="text-sm text-emerald-700 opacity-70 mt-1" style={{ fontFamily: 'Kalam, cursive' }}>
            ~ Your Game Stats & Wallet ~
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
              <div className="p-4 professional-card">
                <p className="text-primary text-sm font-medium mb-2">
                  🏠 Sanctuary Address:
                </p>
                <div className="font-mono text-xs text-accent bg-slate-800 px-3 py-2 rounded-lg break-all border border-slate-600">
                  {wallet.address}
                </div>
              </div>
              
              <div className="p-4 professional-card">
                <p className="text-primary text-sm font-medium">
                  🌍 Realm: {getNetworkDisplayName()}
                </p>
              </div>
              
              <div className="p-4 accent-card-blue">
                <p className="text-primary text-sm font-semibold">
                  ⚡ XPT Balance: {isLoadingBalances ? 
                    <span className="inline-flex items-center gap-1">
                      <span className="animate-spin">🌀</span>Loading...
                    </span> : 
                    `${parseFloat(balance).toFixed(4)} XPT`}
                </p>
                <p className="text-xs text-accent mt-1">
                  Used for gas fees on Xphere network
                </p>
              </div>
              
              <div className="p-4 accent-card-purple">
                <p className="text-primary text-sm font-semibold">
                  🪙 GBT Tokens: {isLoadingBalances ? 
                    <span className="inline-flex items-center gap-1">
                      <span className="animate-spin">🌀</span>Loading...
                    </span> : 
                    `${parseFloat(tokenBalance).toFixed(2)} GBT`}
                </p>
                <div className="mt-2 h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (parseFloat(tokenBalance) / 10000) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-secondary mt-1">
                  Game tokens for Catch Goofy
                </p>
              </div>
              
              {(parseFloat(pendingWinnings) > 0 || isLoadingBalances) && (
                <div className="p-4 accent-card-green">
                  <p className="text-primary text-sm font-semibold flex items-center gap-2">
                    🏆 Winnings: {isLoadingBalances ? 
                      <span className="inline-flex items-center gap-1">
                        <span className="animate-spin">🌀</span>Loading...
                      </span> : 
                      `${parseFloat(pendingWinnings).toFixed(2)} GBT`}
                   
                  </p>
                  <p className="text-xs text-success mt-1">
                    Winnings from your successful bets
                  </p>
                </div>
              )}

{parseFloat(pendingWinnings) > 0 && (
              <button
                className={`ghibli-button ghibli-button-green w-full py-4 px-5 text-base font-bold flex items-center justify-center gap-3 ${
                  isClaimingWinnings || wallets.length === 0 || currentChainId !== `eip155:${XPHERE_TESTNET.chainId}` || isLoadingBalances
                    ? 'opacity-60 cursor-not-allowed' 
                    : ''
                }`}
                onClick={handleClaimWinnings}
                disabled={isClaimingWinnings || wallets.length === 0 || currentChainId !== `eip155:${XPHERE_TESTNET.chainId}`}
              >
                <span className="text-xl">🏆</span>
                {isClaimingWinnings ? (
                  <>
                    <span className="animate-spin text-lg">🌀</span>
                    Claiming Winnings...
                  </>
                ) : (
                  <>
                    Claim {isLoadingBalances ? '...' : parseFloat(pendingWinnings).toFixed(2)} GBT
                    <span className="text-xl">✨</span>
                  </>
                )}
              </button>
            )}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-secondary text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
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
            {/* Claim Winnings Button */}

            
            {/* Claim Tokens Button */}
            <button
              className={`ghibli-button w-full py-4 px-5 text-base font-bold flex items-center justify-center gap-3 ${
                !canClaim || isClaimingTokens || wallets.length === 0 || currentChainId !== `eip155:${XPHERE_TESTNET.chainId}`
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'ghibli-button-green'
              }`}
              onClick={handleClaimTokens}
              disabled={!canClaim || isClaimingTokens || wallets.length === 0 || currentChainId !== `eip155:${XPHERE_TESTNET.chainId}`}
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
            Catch Goofy
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="mt-4 p-4 professional-card border-red-500/30 bg-red-500/10 max-w-sm w-full">
            <div className="flex items-center gap-2 text-error text-sm text-center">
              <span>⚠️</span>
              <span style={{ fontFamily: 'Inter, sans-serif' }}>{error}</span>
            </div>
          </div>
        )}

        {/* Success message for winnings claims */}
        {lastWinningsTx && (
          <div className="mt-4 p-4 professional-card border-green-500/30 bg-green-500/10 max-w-sm w-full">
            <div className="text-success text-sm text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span>🏆</span>
                <span style={{ fontFamily: 'Inter, sans-serif' }}>
                  Successfully claimed your winnings!
                </span>
              </div>
              <div className="text-xs text-secondary break-all">
                Tx: {lastWinningsTx}
              </div>
            </div>
          </div>
        )}
        
        {/* Success message for token claims */}
        {lastClaimTx && (
          <div className="mt-4 p-4 professional-card border-green-500/30 bg-green-500/10 max-w-sm w-full">
            <div className="text-success text-sm text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span>🎉</span>
                <span style={{ fontFamily: 'Inter, sans-serif' }}>
                  Successfully claimed 1000 GBT!
                </span>
              </div>
              <div className="text-xs text-secondary break-all">
                Tx: {lastClaimTx}
              </div>
            </div>
          </div>
        )}

        {/* Bottom decorative quote */}
        <div className="mt-6 text-xs text-muted opacity-60 text-center max-w-xs" style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic' }}>
          "Every catch brings you closer to greatness... ready to Catch Goofy?"
        </div>
      </div>
    </div>
  );
};

export default Profile;


