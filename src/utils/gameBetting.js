import { ethers } from 'ethers';
import { 
  getPlaceBetTransactionData,
  getClaimWinningsTransactionData,
  getRecordWinTransactionData,
  getRecordLossTransactionData,
  generateBetId,
  getTokenBalance, 
  getNativeBalance,
  getPendingWinnings,
  getBetDetails,
  CONTRACT_ADDRESS,
  CONTRACT_ABI
} from './contractUtils';

/**
 * Game Betting Service
 * Handles all betting transactions for the falling bird game with treasury system
 */
export class GameBettingService {
  constructor(sendTransaction, wallet) {
    this.sendTransaction = sendTransaction;
    this.wallet = wallet;
    this.currentBetId = null;
  }

  /**
   * Place a bet (transfer tokens to contract treasury)
   * @param {number} amount - Amount to bet in GBT tokens
   * @param {number} maxMultiplier - Maximum expected multiplier (default 10x)
   * @returns {Promise<{betId: string, txHash: string}>}
   */
  async placeBet(amount, maxMultiplier = 10.0) {
    try {
      // Generate unique bet ID
      const betId = generateBetId();
      this.currentBetId = betId;
      
      console.log(`Placing bet: ${amount} GBT with max multiplier: ${maxMultiplier}x`);
      
      // Create transaction to transfer tokens to contract with max multiplier
      const txData = getPlaceBetTransactionData(betId, amount, maxMultiplier);
      
      // Send transaction using Privy
      const result = await this.sendTransaction(txData, {
        address: this.wallet.address
      });
      
      return {
        betId,
        txHash: result.transactionHash
      };
    } catch (error) {
      console.error('Error placing bet:', error);
      throw new Error('Failed to place bet');
    }
  }

  /**
   * Handle a win - record win on blockchain and calculate pending winnings
   * @param {string} betId - The bet identifier
   * @param {number} betAmount - Original bet amount
   * @param {number} multiplier - Win multiplier (1.0x = 1.0, 1.5x = 1.5, etc.)
   * @returns {Promise<{winnings: number, canClaim: boolean, message: string}>}
   */
  async handleWin(betId, betAmount, multiplier) {
    try {
      // Calculate winnings
      const winnings = betAmount * multiplier;
      
      console.log(`Recording win on blockchain: Bet: ${betAmount} GBT, Multiplier: ${multiplier}x, Winnings: ${winnings} GBT`);
      
      try {
        // Record the win on the blockchain (self-recording)
        const txData = getRecordWinTransactionData(betId, multiplier);
        console.log('Sending recordWin transaction with data:', txData);
        
        const result = await this.sendTransaction(txData, {
          address: this.wallet.address
        });
        
        console.log('Win recorded on blockchain! Transaction hash:', result.transactionHash);
        
        return {
          betId,
          winnings: winnings,
          canClaim: true,
          txHash: result.transactionHash,
          message: `Congratulations! You won ${winnings.toFixed(2)} GBT (${multiplier}x multiplier)`
        };
      } catch (blockchainError) {
        console.error('Failed to record win on blockchain:', blockchainError);
        // If blockchain recording fails, still return the win info for display
        return {
          betId,
          winnings: winnings,
          canClaim: false, // Can't claim if not recorded on chain
          message: `Win calculated: ${winnings.toFixed(2)} GBT (${multiplier}x), but failed to record on blockchain`
        };
      }
    } catch (error) {
      console.error('Error handling win:', error);
      throw new Error('Failed to process win');
    }
  }

  /**
   * Handle a loss - tokens stay in contract treasury
   * @param {string} betId - The bet identifier  
   * @param {number} betAmount - Amount that was lost
   * @param {string} betTxHash - Transaction hash from when bet was placed
   * @returns {Promise<{lossAmount: number, txHash: string}>}
   */
  async handleLoss(betId, betAmount, betTxHash) {
    try {
      console.log(`Recording loss on blockchain: Bet ID: ${betId}, Amount: ${betAmount} GBT`);
      
      try {
        // Record the loss on the blockchain (self-recording)
        const txData = getRecordLossTransactionData(betId);
        
        const result = await this.sendTransaction(txData, {
          address: this.wallet.address
        });
        
        console.log('Loss recorded on blockchain! Transaction hash:', result.transactionHash);
        
        return {
          betId,
          lossAmount: betAmount,
          txHash: result.transactionHash,
          message: `Loss recorded: ${betAmount} GBT tokens remain in treasury`
        };
      } catch (blockchainError) {
        console.error('Failed to record loss on blockchain:', blockchainError);
        // Return original bet transaction as fallback
        return {
          betId,
          lossAmount: betAmount,
          txHash: betTxHash,
          message: `Sorry! You lost ${betAmount} GBT tokens`
        };
      }
    } catch (error) {
      console.error('Error handling loss:', error);
      throw new Error('Failed to process loss');
    }
  }

  /**
   * Claim pending winnings from treasury
   * @returns {Promise<string>} Transaction hash
   */
  async claimWinnings() {
    try {
      const txData = getClaimWinningsTransactionData();
      
      const result = await this.sendTransaction(txData, {
        address: this.wallet.address
      });
      
      return result.transactionHash;
    } catch (error) {
      console.error('Error claiming winnings:', error);
      throw new Error('Failed to claim winnings');
    }
  }
  
  /**
   * Get updated balances and pending winnings after a game
   * @param {object} provider - Ethereum provider
   * @returns {Promise<{tokenBalance: string, nativeBalance: string, pendingWinnings: string}>}
   */
  async getUpdatedBalances(provider) {
    try {
      const [tokenBalance, nativeBalance, pendingWinnings] = await Promise.all([
        getTokenBalance(provider, this.wallet.address),
        getNativeBalance(provider, this.wallet.address),
        getPendingWinnings(provider, this.wallet.address)
      ]);

      return {
        tokenBalance: parseFloat(tokenBalance),
        nativeBalance: parseFloat(nativeBalance),
        pendingWinnings: parseFloat(pendingWinnings)
      };
    } catch (error) {
      console.error('Error fetching updated balances:', error);
      throw new Error('Failed to fetch updated balances');
    }
  }
  
  /**
   * Get bet details
   * @param {object} provider - Ethereum provider
   * @param {string} betId - Bet identifier
   */
  async getBetDetails(provider, betId) {
    try {
      return await getBetDetails(provider, this.wallet.address, betId);
    } catch (error) {
      console.error('Error getting bet details:', error);
      throw new Error('Failed to get bet details');
    }
  }
}

/**
 * Alternative implementation for a more sophisticated betting system
 * This would require additional smart contract functions
 */
export class AdvancedGameBettingService {
  constructor(sendTransaction, wallet) {
    this.sendTransaction = sendTransaction;
    this.wallet = wallet;
    this.treasuryAddress = '0x0000000000000000000000000000000000000000'; // Would be set to actual treasury
  }

  /**
   * Place bet by transferring tokens to a game contract or treasury
   * @param {number} amount - Amount to bet
   */
  async placeBetToTreasury(amount) {
    // This would transfer tokens to a treasury contract
    // The treasury would hold the tokens and pay out winnings
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI);
    const amountWei = ethers.parseEther(amount.toString());
    const data = contract.interface.encodeFunctionData('transfer', [
      this.treasuryAddress, 
      amountWei
    ]);
    
    const txData = {
      to: CONTRACT_ADDRESS,
      data: data,
      value: '0x0'
    };
    
    return await this.sendTransaction(txData, {
      address: this.wallet.address
    });
  }

  /**
   * Claim winnings from treasury (would require backend signing)
   * This is more complex and would typically require:
   * 1. A backend service to verify game results
   * 2. Treasury contract with payout functions
   * 3. Proper game state management
   */
  // eslint-disable-next-line no-unused-vars
  async claimWinnings(amount, gameId, signature) {
    // This would be implemented with a proper treasury contract
    // that can verify game results and pay out winnings
    throw new Error('Advanced betting system requires treasury contract deployment');
  }
}

/**
 * New treasury-based betting flow:
 * 
 * 1. PLACE BET: User calls placeBet() → transfers tokens to contract treasury
 * 2. PLAY GAME: Game runs independently 
 * 3a. WIN: Call handleWin() → records win, user can claim winnings from treasury
 * 3b. LOSS: Call handleLoss() → tokens stay in treasury (house keeps them)
 * 4. CLAIM: Winners can call claimWinnings() → transfers winnings from treasury to user
 * 
 * This is a proper casino-style system with:
 * - Contract treasury holding all bets
 * - Winners paid from treasury pool  
 * - House keeps losses for sustainability
 * - Transparent on-chain win/loss records
 * 
 * Production improvements needed:
 * - Backend service to verify game results and call recordWin/recordLoss
 * - House edge calculations
 * - Maximum bet limits
 * - Anti-fraud measures
 * - Fairness proofs/provably fair system
 */
