import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets, useLogout } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, authenticated, fundWallet } = usePrivy();
  const { wallets } = useWallets();
  const { logout } = useLogout();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [currentChainId, setCurrentChainId] = useState(null);
  const [error, setError] = useState(null);

  // Fetch wallet balance and current chain
  useEffect(() => {
    const fetchWalletData = async () => {
      if (wallets.length > 0) {
        const wallet = wallets[0]; // Use the first connected wallet
        try {
          // Use wallet's provider if available, else fallback to external provider
          let provider;
          if (wallet.connector?.ethersProvider) {
            provider = wallet.connector.ethersProvider;
          } else {
            provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'); // Replace with your Infura ID
          }
          const balanceWei = await provider.getBalance(wallet.address);
          const balanceEth = ethers.formatEther(balanceWei);
          setBalance(balanceEth);

          // Get current chain ID
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
  const handleSwitchNetwork = async (chainId) => {
    if (wallets.length === 0) {
      setError('No wallet connected');
      return;
    }

    const wallet = wallets[0];
    const targetChainId = chainId.split(':')[1]; // Extract numeric chain ID (e.g., '1' from 'eip155:1')

    try {
      if (wallet.connector?.ethersProvider) {
        const provider = wallet.connector.ethersProvider;
        await provider.send('wallet_switchEthereumChain', [{ chainId: `0x${parseInt(targetChainId).toString(16)}` }]);
        setCurrentChainId(chainId);
        setError(null);
      } else {
        setError('Wallet does not support network switching');
      }
    } catch (err) {
      if (err.code === 4902) {
        try {
          await wallet.connector.ethersProvider.send('wallet_addEthereumChain', [
            {
              chainId: `0x${parseInt(targetChainId).toString(16)}`,
              chainName: targetChainId === '1' ? 'Ethereum Mainnet' : 'Sepolia Testnet',
              rpcUrls: [targetChainId === '1' ? 'https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID' : 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID'],
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              blockExplorerUrls: [targetChainId === '1' ? 'https://etherscan.io' : 'https://sepolia.etherscan.io']
            }
          ]);
          setCurrentChainId(chainId);
          setError(null);
        } catch (addErr) {
          setError('Failed to add network');
          console.error(addErr);
        }
      } else {
        setError('Failed to switch network');
        console.error(err);
      }
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
      <div style={containerStyle}>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const wallet = wallets[0]; // Primary wallet

  return (
    <div className="profile-container" style={containerStyle}>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>🐦 Profile</h1>
      
      <div style={{ marginBottom: '20px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Wallet Details</h2>
        {wallet ? (
          <>
            <p><strong>Address:</strong> {wallet.address}</p>
            <p><strong>Network:</strong> {currentChainId || 'Loading...'}</p>
            <p><strong>Balance:</strong> {balance ? `${parseFloat(balance).toFixed(4)} ETH` : 'Loading...'}</p>
          </>
        ) : (
          <p>No wallet connected. Please connect a wallet via the login interface.</p>
        )}
      </div>

      <div style={{ marginBottom: '20px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Wallet Actions</h2>
        <button
          style={buttonStyle}
          onClick={handleFundWallet}
          disabled={wallets.length === 0}
        >
          Fund Wallet (MoonPay)
        </button>
        <button
          style={buttonStyle}
          onClick={() => handleSwitchNetwork('eip155:1')}
          disabled={currentChainId === 'eip155:1' || wallets.length === 0}
        >
          Ethereum Mainnet
        </button>
        <button
          style={buttonStyle}
          onClick={() => handleSwitchNetwork('eip155:11155111')}
          disabled={currentChainId === 'eip155:11155111' || wallets.length === 0}
        >
          Sepolia Testnet
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button style={buttonStyle} onClick={handleLogout}>
          Log Out
        </button>
        <button style={buttonStyle} onClick={() => navigate('/')}>
          Back to Game
        </button>
      </div>

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  background: 'linear-gradient(to bottom, #87CEEB, #B0E0E6)',
  fontFamily: 'Arial, sans-serif',
  textAlign: 'center',
  padding: '20px'
};

const buttonStyle = {
  padding: '12px 24px',
  fontSize: '16px',
  backgroundColor: '#6A6FF5',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  margin: '5px',
  opacity: ({ disabled }) => (disabled ? 0.5 : 1),
  pointerEvents: ({ disabled }) => (disabled ? 'none' : 'auto')
};

export default Profile;