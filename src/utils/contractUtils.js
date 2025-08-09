import { ethers } from 'ethers';

// GoofyBirdToken contract address on Somnia testnet
export const CONTRACT_ADDRESS = '0x693A7f60371D47462847388e7903570139eE3CA1';

// Contract ABI - includes all functions we need
export const CONTRACT_ABI = [
  // View functions
  'function balanceOf(address owner) view returns (uint256)',
  'function canClaimFaucet(address user) view returns (bool)',
  'function timeUntilNextClaim(address user) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  
  // Betting system view functions
  'function getBet(address player, bytes32 betId) view returns (uint256 amount, uint256 multiplier, bool claimed, bool exists)',
  'function getPendingWinnings(address player) view returns (uint256)',
  'function getTreasuryStats() view returns (uint256 balance, uint256 totalBets, uint256 totalWinnings)',
  
  // Write functions
  'function claimFaucet() external',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function burn(uint256 amount) external',
  
  // Betting system write functions
  'function placeBet(bytes32 betId, uint256 amount) external',
  'function recordWin(address player, bytes32 betId, uint256 multiplier) external',
  'function recordLoss(address player, bytes32 betId) external',
  'function claimWinnings() external',
  'function markBetClaimed(bytes32 betId) external',
  
  // Events
  'event FaucetClaim(address indexed user, uint256 amount)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event BetPlaced(address indexed player, bytes32 indexed betId, uint256 amount)',
  'event BetWon(address indexed player, bytes32 indexed betId, uint256 amount, uint256 multiplier, uint256 winnings)',
  'event BetLost(address indexed player, bytes32 indexed betId, uint256 amount)',
  'event WinningsClaimed(address indexed player, uint256 amount)'
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
 * Get transaction data for claiming faucet tokens (for use with Privy sendTransaction)
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
 * Generate a unique bet ID
 */
export const generateBetId = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return ethers.id(`bet_${timestamp}_${random}`);
};

/**
 * Get transaction data for placing a bet
 * This transfers tokens to the contract treasury
 */
export const getPlaceBetTransactionData = (betId, amount) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI);
  const amountWei = ethers.parseEther(amount.toString());
  const data = contract.interface.encodeFunctionData('placeBet', [betId, amountWei]);
  
  return {
    to: CONTRACT_ADDRESS,
    data: data,
    value: '0x0'
  };
};

/**
 * Get transaction data for claiming winnings
 */
export const getClaimWinningsTransactionData = () => {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI);
  const data = contract.interface.encodeFunctionData('claimWinnings', []);
  
  return {
    to: CONTRACT_ADDRESS,
    data: data,
    value: '0x0'
  };
};

/**
 * Place a bet (transfer tokens to contract)
 * @param {*} signer - Wallet signer
 * @param {string} betId - Unique bet identifier
 * @param {number} amount - Amount of tokens to bet
 */
export const placeBet = async (signer, betId, amount) => {
  try {
    const contract = getContractWithSigner(signer);
    const amountWei = ethers.parseEther(amount.toString());
    const tx = await contract.placeBet(betId, amountWei);
    return tx;
  } catch (error) {
    console.error('Error placing bet:', error);
    throw error;
  }
};

/**
 * Claim pending winnings
 * @param {*} signer - Wallet signer
 */
export const claimWinnings = async (signer) => {
  try {
    const contract = getContractWithSigner(signer);
    const tx = await contract.claimWinnings();
    return tx;
  } catch (error) {
    console.error('Error claiming winnings:', error);
    throw error;
  }
};

/**
 * Get bet details
 * @param {*} provider - Ethereum provider
 * @param {string} playerAddress - Player's address
 * @param {string} betId - Bet identifier
 */
export const getBetDetails = async (provider, playerAddress, betId) => {
  try {
    const contract = getContract(provider);
    const [amount, multiplier, claimed, exists] = await contract.getBet(playerAddress, betId);
    return {
      amount: ethers.formatEther(amount),
      multiplier: Number(multiplier),
      claimed,
      exists
    };
  } catch (error) {
    console.error('Error getting bet details:', error);
    throw error;
  }
};

/**
 * Get pending winnings for a player
 * @param {*} provider - Ethereum provider
 * @param {string} playerAddress - Player's address
 */
export const getPendingWinnings = async (provider, playerAddress) => {
  try {
    const contract = getContract(provider);
    const winnings = await contract.getPendingWinnings(playerAddress);
    return ethers.formatEther(winnings);
  } catch (error) {
    console.error('Error getting pending winnings:', error);
    throw error;
  }
};

/**
 * Get treasury statistics
 * @param {*} provider - Ethereum provider
 */
export const getTreasuryStats = async (provider) => {
  try {
    const contract = getContract(provider);
    const [balance, totalBets, totalWinnings] = await contract.getTreasuryStats();
    return {
      balance: ethers.formatEther(balance),
      totalBets: ethers.formatEther(totalBets),
      totalWinnings: ethers.formatEther(totalWinnings)
    };
  } catch (error) {
    console.error('Error getting treasury stats:', error);
    throw error;
  }
};

/**
 * New betting system flow:
 * 1. PLACE BET: User transfers tokens to contract treasury
 * 2. GAME ENDS: Backend calls recordWin() or recordLoss() 
 * 3. WIN: User can claim winnings from treasury
 * 4. LOSS: Tokens stay in treasury (house keeps them)
 * 
 * This is a proper casino-style system where the house has an edge
 * and winners are paid from the treasury pool.
 */

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
