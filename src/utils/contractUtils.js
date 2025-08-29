import { ethers } from 'ethers';

// GoofyBirdToken contract address on Xphere testnet
export const CONTRACT_ADDRESS = '0xFd4987665521b9D3d9a85956EC09d210A4BdB13B';

// Contract ABI - includes all functions we need
export const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "claimFaucet",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "initialOwner",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "allowance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientAllowance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "needed",
				"type": "uint256"
			}
		],
		"name": "ERC20InsufficientBalance",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "approver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidApprover",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "receiver",
				"type": "address"
			}
		],
		"name": "ERC20InvalidReceiver",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSender",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "ERC20InvalidSpender",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "EnforcedPause",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ExpectedPause",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "ReentrancyGuardReentrantCall",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "betId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "BetLost",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "betId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "BetPlaced",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "betId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "multiplier",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "winnings",
				"type": "uint256"
			}
		],
		"name": "BetWon",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "burn",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "claimWinnings",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "betId",
				"type": "bytes32"
			},
			{
				"internalType": "bool",
				"name": "isWin",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "multiplier",
				"type": "uint256"
			}
		],
		"name": "emergencySettleBet",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "FaucetClaim",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "betId",
				"type": "bytes32"
			}
		],
		"name": "markBetClaimed",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "mint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "pause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Paused",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "betId",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "maxMultiplier",
				"type": "uint256"
			}
		],
		"name": "placeBet",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "betId",
				"type": "bytes32"
			}
		],
		"name": "recordLoss",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "betId",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "multiplier",
				"type": "uint256"
			}
		],
		"name": "recordWin",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_cooldown",
				"type": "uint256"
			}
		],
		"name": "setFaucetCooldown",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "TreasuryWithdraw",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "unpause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Unpaused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "WinningsClaimed",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdrawTreasuryExcess",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "BASE_MULTIPLIER",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "bets",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "multiplier",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "placedAt",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "minDuration",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "maxMultiplier",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "claimed",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "settled",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "canClaimFaucet",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "FAUCET_AMOUNT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "faucetCooldown",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "betId",
				"type": "bytes32"
			}
		],
		"name": "getBet",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "multiplier",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "placedAt",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "maxMultiplier",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "claimed",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "settled",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "betId",
				"type": "bytes32"
			}
		],
		"name": "getMaxAllowedMultiplier",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			}
		],
		"name": "getPendingWinnings",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTreasuryStats",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "balance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalBets",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalWinnings",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "INITIAL_SUPPLY",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "lastFaucetClaim",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MAX_MULTIPLIER",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MIN_GAME_DURATION",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paused",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "pendingWinnings",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "timeUntilNextClaim",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalBetsPlaced",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalWinningsClaimed",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "treasuryBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

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
 * @param {string} betId - Unique bet identifier
 * @param {number} amount - Amount to bet
 * @param {number} maxMultiplier - Maximum expected multiplier (e.g., 5.0 for 5x)
 */
export const getPlaceBetTransactionData = (betId, amount, maxMultiplier = 10.0) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI);
  const amountWei = ethers.parseEther(amount.toString());
  const maxMultiplierBasisPoints = Math.floor(maxMultiplier * 10000);
  const data = contract.interface.encodeFunctionData('placeBet', [betId, amountWei, maxMultiplierBasisPoints]);
  
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
    throw error;
  }
};

/**
 * Get bet details with anti-cheat information
 * @param {*} provider - Ethereum provider
 * @param {string} playerAddress - Player's address
 * @param {string} betId - Bet identifier
 */
export const getBetDetails = async (provider, playerAddress, betId) => {
  try {
    const contract = getContract(provider);
    const [amount, multiplier, placedAt, maxMultiplier, claimed, settled, exists] = await contract.getBet(playerAddress, betId);
    return {
      amount: ethers.formatEther(amount),
      multiplier: Number(multiplier),
      placedAt: Number(placedAt),
      maxMultiplier: Number(maxMultiplier),
      claimed,
      settled,
      exists
    };
  } catch (error) {
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
 * Self-record a win on the blockchain (called by player)
 * @param {*} signer - Player's wallet signer
 * @param {string} betId - Bet identifier
 * @param {number} multiplier - Win multiplier (1.5 for 1.5x)
 */
export const recordWinOnChain = async (signer, betId, multiplier) => {
  try {
    const contract = getContractWithSigner(signer);
    // Convert multiplier to basis points (1.5x = 15000)
    const multiplierBasisPoints = Math.floor(multiplier * 10000);
    const tx = await contract.recordWin(betId, multiplierBasisPoints);
    return tx;
  } catch (error) {
    throw error;
  }
};

/**
 * Self-record a loss on the blockchain (called by player)
 * @param {*} signer - Player's wallet signer
 * @param {string} betId - Bet identifier
 */
export const recordLossOnChain = async (signer, betId) => {
  try {
    const contract = getContractWithSigner(signer);
    const tx = await contract.recordLoss(betId);
    return tx;
  } catch (error) {
    throw error;
  }
};

/**
 * Get transaction data for self-recording a win
 */
export const getRecordWinTransactionData = (betId, multiplier) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI);
  const multiplierBasisPoints = Math.floor(multiplier * 10000);
  const data = contract.interface.encodeFunctionData('recordWin', [betId, multiplierBasisPoints]);
  
  return {
    to: CONTRACT_ADDRESS,
    data: data,
    value: '0x0'
  };
};

/**
 * Get transaction data for self-recording a loss
 */
export const getRecordLossTransactionData = (betId) => {
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI);
  const data = contract.interface.encodeFunctionData('recordLoss', [betId]);
  
  return {
    to: CONTRACT_ADDRESS,
    data: data,
    value: '0x0'
  };
};

/**
 * Get maximum allowed multiplier for a bet based on time
 * @param {*} provider - Ethereum provider
 * @param {string} playerAddress - Player's address
 * @param {string} betId - Bet identifier
 */
export const getMaxAllowedMultiplier = async (provider, playerAddress, betId) => {
  try {
    const contract = getContract(provider);
    const maxMultiplier = await contract.getMaxAllowedMultiplier(playerAddress, betId);
    return Number(maxMultiplier) / 10000; // Convert from basis points
  } catch (error) {
    return 0;
  }
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


export const getNativeBalance = async (provider, address) => {
  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    throw error;
  }
};
