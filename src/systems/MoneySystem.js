// src/systems/MoneySystem.js
// Handles money calculations and reward multipliers

import GAME_CONFIG from '../data/config.js';

export class MoneySystem {
  constructor() {
    this.currentMoney = 0;
    this.totalEarned = 0;
    this.customersServed = 0;
    this.customersLost = 0;
  }

  reset() {
    this.currentMoney = 0;
    this.totalEarned = 0;
    this.customersServed = 0;
    this.customersLost = 0;
  }

  /**
   * Calculate reward based on wait ratio (0 = served immediately, 1 = barely served)
   */
  calculateReward(basePrice, waitRatio) {
    const multipliers = GAME_CONFIG.moneyMultipliers;
    let multiplier = multipliers[multipliers.length - 1].multiplier;

    for (const entry of multipliers) {
      if (waitRatio <= entry.maxWait) {
        multiplier = entry.multiplier;
        break;
      }
    }

    return Math.round(basePrice * multiplier);
  }

  addMoney(amount) {
    this.currentMoney += amount;
    this.totalEarned += amount;
    this.customersServed++;
    return amount;
  }

  recordLostCustomer() {
    this.customersLost++;
  }

  getMoney() {
    return this.currentMoney;
  }

  getStats() {
    return {
      money: this.currentMoney,
      totalEarned: this.totalEarned,
      served: this.customersServed,
      lost: this.customersLost,
      satisfactionRate: this.customersServed + this.customersLost > 0
        ? Math.round(this.customersServed / (this.customersServed + this.customersLost) * 100)
        : 100
    };
  }

  calculateStars(money, thresholds) {
    if (money >= thresholds.three) return 3;
    if (money >= thresholds.two) return 2;
    if (money >= thresholds.one) return 1;
    return 0;
  }
}

export default MoneySystem;

