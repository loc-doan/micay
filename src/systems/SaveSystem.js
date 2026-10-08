// src/systems/SaveSystem.js
// Handles LocalStorage save/load for game progress

const SAVE_KEY = 'spicy_noodle_shop_save';

const DEFAULT_SAVE = {
  unlockedLevel: 1,
  levelStars: {},
  levelHighScores: {},
  totalMoney: 0,
  totalCustomersServed: 0,
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    debugMode: false
  }
};

export class SaveSystem {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Merge with defaults to handle missing keys
        return { ...DEFAULT_SAVE, ...parsed, settings: { ...DEFAULT_SAVE.settings, ...(parsed.settings || {}) } };
      }
    } catch (e) {
      console.warn('[SaveSystem] Failed to load save data:', e);
    }
    return { ...DEFAULT_SAVE, levelStars: {}, levelHighScores: {} };
  }

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('[SaveSystem] Failed to save data:', e);
    }
  }

  reset() {
    this.data = { ...DEFAULT_SAVE, levelStars: {}, levelHighScores: {} };
    localStorage.removeItem(SAVE_KEY);
  }

  getUnlockedLevel() {
    return this.data.unlockedLevel || 1;
  }

  getLevelStars(levelId) {
    return this.data.levelStars[levelId] || 0;
  }

  getLevelHighScore(levelId) {
    return this.data.levelHighScores[levelId] || 0;
  }

  isLevelUnlocked(levelId) {
    return levelId <= this.getUnlockedLevel();
  }

  completeLevel(levelId, stars, money) {
    // Update stars (keep best)
    const prevStars = this.getLevelStars(levelId);
    if (stars > prevStars) {
      this.data.levelStars[levelId] = stars;
    }

    // Update high score
    const prevScore = this.getLevelHighScore(levelId);
    if (money > prevScore) {
      this.data.levelHighScores[levelId] = money;
    }

    // Unlock next level
    if (levelId >= this.data.unlockedLevel) {
      this.data.unlockedLevel = Math.min(levelId + 1, 10);
    }

    this.data.totalMoney += money;
    this.save();
  }

  getSetting(key) {
    return this.data.settings[key];
  }

  setSetting(key, value) {
    this.data.settings[key] = value;
    this.save();
  }

  getTotalMoney() {
    return this.data.totalMoney;
  }
}

// Singleton instance
export const saveSystem = new SaveSystem();
export default saveSystem;

