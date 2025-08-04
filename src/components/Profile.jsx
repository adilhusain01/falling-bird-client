import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets, useLogout } from '@privy-io/react-auth';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

// Styles for the Profile component
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%',
    padding: '20px',
    overflowY: 'auto',
  },
  title: {
    color: '#333',
    fontSize: '32px',
    marginBottom: '15px',
    textAlign: 'center',
  },
  section: {
    width: '100%',
    maxWidth: '340px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '15px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: '20px',
    color: '#444',
    marginBottom: '15px',
    textAlign: 'center',
  },
  text: {
    color: '#555',
    margin: '8px 0',
    fontSize: '14px',
    wordBreak: 'break-word',
  },
  button: {
    width: '100%',
    padding: '14px 20px',
    marginBottom: '12px',
    borderRadius: '25px',
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  primaryButton: {
    background: 'linear-gradient(45deg, #4ECDC4, #45B7B8)',
    color: 'white',
  },
  secondaryButton: {
    background: 'linear-gradient(45deg, #FF6B6B, #FF8E8E)',
    color: 'white',
  },
  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    width: '100%',
    maxWidth: '340px',
    marginTop: '10px',
  },
  error: {
    color: '#FF6B6B',
    marginTop: '15px',
    textAlign: 'center',
    fontSize: '14px',
  },
  walletAddress: {
    fontFamily: 'monospace',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: '6px 10px',
    borderRadius: '4px',
    wordBreak: 'break-all',
  },
};

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
            provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/6aeb4bc17cfe49b5bf0fe4db13799d8a'); // Replace with your Infura ID
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
      <div className="page-container">
        <div style={styles.container}>
          <h1 style={styles.title}>🔐</h1>
          <div style={styles.section}>
            <p style={styles.text}>Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  const wallet = wallets[0]; // Primary wallet
  const isButtonDisabled = (chainId) => 
    currentChainId === chainId || wallets.length === 0;

  return (
    <div className="page-container">
      <div style={styles.container}>
        <h1 style={styles.title}>🐦 Profile</h1>
        
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Wallet Details</h2>
          {wallet ? (
            <div>
              <p style={styles.text}>
                <strong>Address:</strong>
                <div style={styles.walletAddress}>
                  {wallet.address}
                </div>
              </p>
              <p style={styles.text}>
                <strong>Network:</strong> {currentChainId?.split(':')[1] ? 
                  `Ethereum ${currentChainId === 'eip155:1' ? 'Mainnet' : 'Sepolia Testnet'}` : 
                  'Loading...'}
              </p>
              <p style={styles.text}>
                <strong>Balance:</strong> {balance ? 
                  `${parseFloat(balance).toFixed(4)} ETH` : 'Loading...'}
              </p>
            </div>
          ) : (
            <p style={styles.text}>
              No wallet connected. Please connect a wallet via the login interface.
            </p>
          )}
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Wallet Actions</h2>
          <button
            style={{
              ...styles.button,
              ...styles.primaryButton,
              ...(wallets.length === 0 && styles.disabledButton)
            }}
            onClick={handleFundWallet}
            disabled={wallets.length === 0}
          >
            💰 Fund Wallet (MoonPay)
          </button>
          
          <button
            style={{
              ...styles.button,
              ...(isButtonDisabled('eip155:1') ? styles.disabledButton : styles.primaryButton)
            }}
            onClick={() => handleSwitchNetwork('eip155:1')}
            disabled={isButtonDisabled('eip155:1')}
          >
            ⛓️ Ethereum Mainnet
          </button>
          
          <button
            style={{
              ...styles.button,
              ...(isButtonDisabled('eip155:11155111') ? styles.disabledButton : styles.primaryButton)
            }}
            onClick={() => handleSwitchNetwork('eip155:11155111')}
            disabled={isButtonDisabled('eip155:11155111')}
          >
            ⛓️ Sepolia Testnet
          </button>
        </div>

        <div style={styles.buttonGroup}>
          <button 
            style={{
              ...styles.button,
              ...styles.secondaryButton,
              flex: 1,
              padding: '12px'
            }} 
            onClick={handleLogout}
          >
            🔒 Log Out
          </button>
          <button 
            style={{
              ...styles.button,
              ...styles.primaryButton,
              flex: 1,
              padding: '12px'
            }} 
            onClick={() => navigate('/')}
          >
            🎮 Back to Game
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}
      </div>
    </div>
  );
};

export default Profile;