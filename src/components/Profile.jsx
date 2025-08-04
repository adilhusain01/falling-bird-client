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
        <div className="flex flex-col items-center justify-start w-full h-full p-5 overflow-y-auto">
          <h1 className="text-gray-800 text-3xl mb-4 text-center">🔐</h1>
          <div className="w-full max-w-sm bg-white bg-opacity-90 rounded-2xl p-5 mb-4 shadow-lg">
            <p className="text-gray-600 my-2 text-sm break-words">Please log in to view your profile.</p>
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
      <div className="flex flex-col items-center justify-start w-full h-full p-5 overflow-y-auto">
        <h1 className="text-gray-800 text-3xl mb-4 text-center">🐦 Profile</h1>
        
        <div className="w-full max-w-sm bg-white bg-opacity-90 rounded-2xl p-5 mb-4 shadow-lg">
          <h2 className="text-xl text-gray-700 mb-4 text-center">Wallet Details</h2>
          {wallet ? (
            <div>
              <p className="text-gray-600 my-2 text-sm break-words">
                <strong>Address:</strong>
                <div className="font-mono bg-black bg-opacity-5 px-2.5 py-1.5 rounded mt-1 break-all">
                  {wallet.address}
                </div>
              </p>
              <p className="text-gray-600 my-2 text-sm break-words">
                <strong>Network:</strong> {currentChainId?.split(':')[1] ? 
                  `Ethereum ${currentChainId === 'eip155:1' ? 'Mainnet' : 'Sepolia Testnet'}` : 
                  'Loading...'}
              </p>
              <p className="text-gray-600 my-2 text-sm break-words">
                <strong>Balance:</strong> {balance ? 
                  `${parseFloat(balance).toFixed(4)} ETH` : 'Loading...'}
              </p>
            </div>
          ) : (
            <p className="text-gray-600 my-2 text-sm break-words">
              No wallet connected. Please connect a wallet via the login interface.
            </p>
          )}
        </div>

        <div className="w-full max-w-sm bg-white bg-opacity-90 rounded-2xl p-5 mb-4 shadow-lg">
          <h2 className="text-xl text-gray-700 mb-4 text-center">Wallet Actions</h2>
          <button
            className={`w-full py-3.5 px-5 mb-3 rounded-3xl border-none text-base font-bold cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 text-white ${
              wallets.length === 0 
                ? 'opacity-60 cursor-not-allowed bg-gradient-to-r from-teal-400 to-teal-500' 
                : 'bg-gradient-to-r from-teal-400 to-teal-500'
            }`}
            onClick={handleFundWallet}
            disabled={wallets.length === 0}
          >
            💰 Fund Wallet (MoonPay)
          </button>
          
          <button
            className={`w-full py-3.5 px-5 mb-3 rounded-3xl border-none text-base font-bold cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 text-white ${
              isButtonDisabled('eip155:1')
                ? 'opacity-60 cursor-not-allowed bg-gradient-to-r from-teal-400 to-teal-500'
                : 'bg-gradient-to-r from-teal-400 to-teal-500'
            }`}
            onClick={() => handleSwitchNetwork('eip155:1')}
            disabled={isButtonDisabled('eip155:1')}
          >
            ⛓️ Ethereum Mainnet
          </button>
          
          <button
            className={`w-full py-3.5 px-5 mb-3 rounded-3xl border-none text-base font-bold cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 text-white ${
              isButtonDisabled('eip155:11155111')
                ? 'opacity-60 cursor-not-allowed bg-gradient-to-r from-teal-400 to-teal-500'
                : 'bg-gradient-to-r from-teal-400 to-teal-500'
            }`}
            onClick={() => handleSwitchNetwork('eip155:11155111')}
            disabled={isButtonDisabled('eip155:11155111')}
          >
            ⛓️ Sepolia Testnet
          </button>
        </div>

        <div className="flex gap-2.5 w-full max-w-sm mt-2.5">
          <button 
            className="flex-1 py-3 px-5 rounded-3xl border-none text-base font-bold cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 text-white bg-gradient-to-r from-red-400 to-red-500"
            onClick={handleLogout}
          >
            🔒 Log Out
          </button>
          <button 
            className="flex-1 py-3 px-5 rounded-3xl border-none text-base font-bold cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center gap-2 text-white bg-gradient-to-r from-teal-400 to-teal-500"
            onClick={() => navigate('/')}
          >
            🎮 Back to Game
          </button>
        </div>

        {error && <p className="text-red-400 mt-4 text-center text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default Profile;