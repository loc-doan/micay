// src/scenes/LevelSelectScene.js
// Level selection screen with card-based UI

import LEVELS from '../data/levels.js';
import saveSystem from '../systems/SaveSystem.js';
import { DrawingUtils } from '../utils/DrawingUtils.js';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this._buildBackground(W, H);
    this._buildHeader(W, H);
    this._buildLevelCards(W, H);
    this._buildBackButton(W, H);

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  _buildBackground(W, H) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1A0500, 0x1A0500, 0x3D1000, 0x3D1000, 1);
    bg.fillRect(0, 0, W, H);

    // Decorative stripes
    for (let i = 0; i < W; i += 80) {
      bg.fillStyle(0xFF2200, 0.03);
      bg.fillRect(i, 0, 40, H);
    }

    // Top/bottom borders
    bg.fillStyle(0xFF6B35, 0.6);
    bg.fillRect(0, 0, W, 4);
    bg.fillRect(0, H - 4, W, 4);
    bg.setDepth(0);
  }

  _buildHeader(W, H) {
    // Header background
    const headerBg = this.add.graphics();
    headerBg.fillStyle(0x000000, 0.4);
    headerBg.fillRect(0, 0, W, 80);
    headerBg.setDepth(1);

    this.add.text(W / 2, 40, '📋 CHỌN MÀN CHƠI', {
      fontFamily: 'Georgia, serif',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#FF6B35',
      stroke: '#FFD700',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(2);

    // Unlocked progress
    const unlocked = saveSystem.getUnlockedLevel();
    const total = LEVELS.length;
    this.add.text(W - 20, 40, `Đã mở: ${unlocked}/${total}`, {
      fontFamily: 'Quicksand',
      fontSize: '16px',
      color: '#FFB347'
    }).setOrigin(1, 0.5).setDepth(2);
  }

  _buildLevelCards(W, H) {
    const cols = 5;
    const rows = 2;
    const cardW = 220;
    const cardH = 145;
    const padX = 24;
    const padY = 20;
    const startX = (W - (cols * cardW + (cols - 1) * padX)) / 2;
    const startY = 100;

    LEVELS.forEach((level, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * (cardW + padX);
      const cy = startY + row * (cardH + padY);
      this._createLevelCard(level, cx, cy, cardW, cardH);
    });
  }

  _createLevelCard(level, x, y, w, h) {
    const isUnlocked = saveSystem.isLevelUnlocked(level.id);
    const stars = saveSystem.getLevelStars(level.id);
    const highScore = saveSystem.getLevelHighScore(level.id);

    const container = this.add.container(x, y).setDepth(5);

    // Card background
    const cardGfx = this.add.graphics();

    if (isUnlocked) {
      // Unlocked card
      const cardBgColor = level.bgColor || 0xFF6B35;
      const darkVersion = Phaser.Display.Color.ValueToColor(cardBgColor);
      darkVersion.darken(30);

      cardGfx.fillStyle(darkVersion.color, 1);
      cardGfx.fillRoundedRect(0, 0, w, h, 12);
      cardGfx.fillStyle(cardBgColor, 0.4);
      cardGfx.fillRoundedRect(0, 0, w, h * 0.6, 12);
      cardGfx.lineStyle(2, cardBgColor, 0.8);
      cardGfx.strokeRoundedRect(0, 0, w, h, 12);

      // Shine
      cardGfx.fillStyle(0xFFFFFF, 0.08);
      cardGfx.fillRoundedRect(4, 4, w - 8, h * 0.3, 8);
    } else {
      // Locked card
      cardGfx.fillStyle(0x1A0A00, 1);
      cardGfx.fillRoundedRect(0, 0, w, h, 12);
      cardGfx.lineStyle(2, 0x444444, 0.6);
      cardGfx.strokeRoundedRect(0, 0, w, h, 12);
    }

    container.add(cardGfx);

    if (isUnlocked) {
      // Level number badge
      const badgeGfx = this.add.graphics();
      badgeGfx.fillStyle(0xFF6B35, 1);
      badgeGfx.fillCircle(20, 20, 18);
      badgeGfx.lineStyle(2, 0xFFD700, 1);
      badgeGfx.strokeCircle(20, 20, 18);
      container.add(badgeGfx);

      const levelNumText = this.add.text(20, 20, `${level.id}`, {
        fontFamily: 'Quicksand',
        fontSize: '18px',
        fontStyle: 'bold',
        color: '#FFFFFF'
      }).setOrigin(0.5);
      container.add(levelNumText);

      // Level name
      const nameText = this.add.text(w / 2, 50, level.name, {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#FFE4B5',
        wordWrap: { width: w - 20 }
      }).setOrigin(0.5, 0.5);
      container.add(nameText);

      // Subtitle
      const subText = this.add.text(w / 2, 70, level.subtitle, {
        fontFamily: 'Quicksand',
        fontSize: '11px',
        color: 'rgba(255,228,181,0.7)',
        wordWrap: { width: w - 20 }
      }).setOrigin(0.5, 0.5);
      container.add(subText);

      // Target money
      const targetText = this.add.text(w / 2, 90, `🎯 ${level.targetMoney.toLocaleString()}đ`, {
        fontFamily: 'Quicksand',
        fontSize: '12px',
        color: '#FFD700'
      }).setOrigin(0.5);
      container.add(targetText);

      if (highScore > 0) {
        const scoreText = this.add.text(w / 2, 106, `Best: ${highScore.toLocaleString()}đ`, {
          fontFamily: 'Quicksand',
          fontSize: '10px',
          color: '#90EE90'
        }).setOrigin(0.5);
        container.add(scoreText);
      }

      // Stars
      const starGfx = this.add.graphics();
      for (let s = 0; s < 3; s++) {
        const sx = w / 2 - 20 + s * 20;
        DrawingUtils.drawStar(starGfx, sx, h - 16, 8, s < stars);
      }
      container.add(starGfx);

      // Difficulty indicators
      const diffGfx = this.add.graphics();
      for (let d = 0; d < Math.min(level.difficulty, 5); d++) {
        diffGfx.fillStyle(d < 3 ? 0xFF6B35 : 0xFF2200, 1);
        diffGfx.fillCircle(8 + d * 12, h - 16, 4);
      }
      container.add(diffGfx);

      // Interaction
      const hitArea = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0)
        .setInteractive({ useHandCursor: true });
      container.add(hitArea);

      hitArea.on('pointerover', () => {
        this.tweens.add({ targets: container, scaleX: 1.06, scaleY: 1.06, duration: 120 });
      });
      hitArea.on('pointerout', () => {
        this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 120 });
      });
      hitArea.on('pointerdown', () => {
        this.tweens.add({ targets: container, scaleX: 0.94, scaleY: 0.94, duration: 80, yoyo: true });
        this.time.delayedCall(150, () => {
          this.cameras.main.fadeOut(300, 0, 0, 0);
          this.time.delayedCall(300, () => {
            this.scene.start('GameScene', { levelId: level.id });
          });
        });
      });
    } else {
      // Lock icon
      const lockGfx = this.add.graphics();
      lockGfx.fillStyle(0x333333, 1);
      lockGfx.fillRoundedRect(w / 2 - 12, h / 2 - 16, 24, 20, 4);
      lockGfx.lineStyle(5, 0x333333, 1);
      lockGfx.strokeCircle(w / 2, h / 2 - 20, 10);
      lockGfx.fillStyle(0x666666, 1);
      lockGfx.fillCircle(w / 2, h / 2 - 4, 4);
      container.add(lockGfx);

      // Level number (dimmed)
      const levelNumText = this.add.text(w / 2, h / 2 + 20, `Màn ${level.id}`, {
        fontFamily: 'Quicksand',
        fontSize: '14px',
        color: 'rgba(255,255,255,0.3)'
      }).setOrigin(0.5);
      container.add(levelNumText);
    }

    // Entrance animation
    container.setAlpha(0);
    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 300,
      delay: level.id * 60,
      ease: 'Power2'
    });
  }

  _buildBackButton(W, H) {
    const backBtn = this.add.container(80, H - 40).setDepth(10);
    const btnGfx = this.add.graphics();
    btnGfx.fillStyle(0x444444, 1);
    btnGfx.fillRoundedRect(-60, -20, 120, 40, 10);
    backBtn.add(btnGfx);

    const backText = this.add.text(0, 0, '◀ QUAY LẠI', {
      fontFamily: 'Quicksand',
      fontSize: '16px',
      color: '#FFE4B5'
    }).setOrigin(0.5);
    backBtn.add(backText);

    const hitArea = this.add.rectangle(80, H - 40, 120, 40, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(11);
    hitArea.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(300, () => this.scene.start('MainMenuScene'));
    });
    hitArea.on('pointerover', () => {
      this.tweens.add({ targets: backBtn, scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    hitArea.on('pointerout', () => {
      this.tweens.add({ targets: backBtn, scaleX: 1, scaleY: 1, duration: 100 });
    });
  }
}

export default LevelSelectScene;

