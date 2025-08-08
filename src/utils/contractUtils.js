import { ethers } from 'ethers';

// GoofyBirdToken contract address on Somnia testnet
export const CONTRACT_ADDRESS = '0x42C07c27BC76796F02c9775343bbD3005A527FaA';

// Contract ABI - includes only the functions we need
export const CONTRACT_ABI = [
  // View functions
  'function balanceOf(address owner) view returns (uint256)',
  'function canClaimFaucet(address user) view returns (bool)',
  'function timeUntilNextClaim(address user) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  
  // Write functions
  'function claimFaucet() external',
  
  // Events
  'event FaucetClaim(address indexed user, uint256 amount)',
  'event Transfer(address indexed from, address indexed to, uint256 value)'
];

/**
 * Get contract instance with provider
 */
export const getContract = (provider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

/**
 * Get contract instance with signer for transactions
 */
export const getContractWithSigner = (signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

/**
 * Get token balance for an address
 */
export const getTokenBalance = async (provider, address) => {
  try {
    const contract = getContract(provider);
    const balance = await contract.balanceOf(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw error;
  }
};

/**
 * Check if user can claim from faucet
 */
export const canClaimFaucet = async (provider, address) => {
  try {
    const contract = getContract(provider);
    return await contract.canClaimFaucet(address);
  } catch (error) {
    console.error('Error checking faucet eligibility:', error);
    throw error;
  }
};

/**
 * Get time until next faucet claim
 */
export const getTimeUntilNextClaim = async (provider, address) => {
  try {
    const contract = getContract(provider);
    const timeInSeconds = await contract.timeUntilNextClaim(address);
    return Number(timeInSeconds);
  } catch (error) {
    console.error('Error getting time until next claim:', error);
    throw error;
  }
};

/**
 * Claim tokens from faucet
 */
export const claimFaucetTokens = async (signer) => {
  try {
    const contract = getContractWithSigner(signer);
    const tx = await contract.claimFaucet();
    return tx;
  } catch (error) {
    console.error('Error claiming faucet tokens:', error);
    throw error;
  }
};

/**
 * Get transaction data for claiming faucet tokens (for use with Privy signTransaction)
 */
export const getClaimFaucetTransactionData = () => {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI);
  const data = contract.interface.encodeFunctionData('claimFaucet', []);
  
  return {
    to: CONTRACT_ADDRESS,
    data: data,
    value: '0x0' // No ETH value needed for this transaction
  };
};

/**
 * Format time remaining in human readable format
 */
export const formatTimeRemaining = (seconds) => {
  if (seconds <= 0) return 'Ready to claim!';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

/**
 * Get native token (STT) balance
 */
export const getNativeBalance = async (provider, address) => {
  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error fetching native balance:', error);
    throw error;
  }
};
