// src/main.js
// Entry point - Phaser game configuration and initialization

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { LevelSelectScene } from './scenes/LevelSelectScene.js';
import { GameScene } from './scenes/GameScene.js';
import { ResultScene } from './scenes/ResultScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import GAME_CONFIG from './data/config.js';

// Try to create AudioContext; some browsers require user gesture first
let audioContext;
try {
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
} catch (e) {
  audioContext = undefined;
}

const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  backgroundColor: '#1a0a00',
  parent: 'game-container',
  scene: [
    BootScene,
    MainMenuScene,
    LevelSelectScene,
    GameScene,
    ResultScene,
    SettingsScene
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT
  },
  audio: audioContext ? { context: audioContext } : {},
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true
  },
  resolution: window.devicePixelRatio || 1,
  autoRound: true,
  fps: {
    target: 60,
    forceSetTimeOut: false
  }
};

// Create the game
const game = new Phaser.Game(config);

// Make game globally accessible for debugging
if (GAME_CONFIG.DEBUG_MODE) {
  window.__GAME__ = game;
}

export default game;
