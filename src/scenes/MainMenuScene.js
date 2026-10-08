// src/scenes/MainMenuScene.js
// Main menu with animated background and navigation buttons

import { DrawingUtils } from '../utils/DrawingUtils.js';
import saveSystem from '../systems/SaveSystem.js';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
    this._steamParticles = [];
    this._customerDrawings = [];
    this._animTime = 0;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this._buildBackground(W, H);
    this._buildTitle(W, H);
    this._buildMenuButtons(W, H);
    this._buildDecorations(W, H);
    this._buildVersion(W, H);

    // Ambient animation loop
    this._bgGraphics = this.add.graphics();
    this._bgGraphics.setDepth(1);

    this.time.addEvent({
      delay: 50,
      callback: this._updateAnimations,
      callbackScope: this,
      loop: true
    });

    // Entrance animation
    this.cameras.main.fadeIn(600, 0, 0, 0);
  }

  _buildBackground(W, H) {
    // Main background gradient
    const bg = this.add.graphics();

    // Sky/wall gradient
    bg.fillGradientStyle(0x2D0A00, 0x2D0A00, 0x8B1A00, 0x8B1A00, 1);
    bg.fillRect(0, 0, W, H * 0.6);

    // Floor gradient
    bg.fillGradientStyle(0x3D1500, 0x3D1500, 0x1A0800, 0x1A0800, 1);
    bg.fillRect(0, H * 0.6, W, H * 0.4);

    // Lanterns on ceiling
    this._drawLanterns(bg, W);

    // Counter/bar in background
    bg.fillStyle(0x4A2810, 1);
    bg.fillRect(0, H * 0.55, W, 30);
    bg.fillStyle(0x6B3D18, 1);
    bg.fillRect(0, H * 0.55, W, 12);

    // Wall decorations
    bg.fillStyle(0xFF2200, 0.15);
    bg.fillRect(0, 0, W, 8);
    bg.fillRect(0, H - 8, W, 8);

    // Neon sign backing
    bg.fillStyle(0x1A0500, 0.7);
    bg.fillRoundedRect(W / 2 - 280, 60, 560, 180, 20);
    bg.lineStyle(3, 0xFF6B35, 0.8);
    bg.strokeRoundedRect(W / 2 - 280, 60, 560, 180, 20);

    bg.setDepth(0);
    this._mainBg = bg;

    // Kitchen view in background (bottom half)
    const kitchenBg = this.add.graphics();
    kitchenBg.setDepth(0);

    // Counter surface
    kitchenBg.fillStyle(0x5C3320, 1);
    kitchenBg.fillRect(0, H * 0.55 + 30, W, H * 0.15);

    // Kitchen items on counter
    DrawingUtils.drawCookingPot(kitchenBg, W * 0.25, H * 0.65, 0.7, 0);
    DrawingUtils.drawStove(kitchenBg, W * 0.25, H * 0.69, 0.7, false);
    DrawingUtils.drawCookingPot(kitchenBg, W * 0.75, H * 0.65, 0.7, 0);
  }

  _drawLanterns(g, W) {
    const lanternPositions = [0.1, 0.3, 0.5, 0.7, 0.9];
    lanternPositions.forEach(xRatio => {
      const lx = W * xRatio;
      const ly = 40;

      // String
      g.lineStyle(2, 0xA0522D, 0.8);
      g.strokeRect(lx, 0, 0, ly);

      // Lantern body
      g.fillStyle(0xFF2200, 1);
      g.fillRoundedRect(lx - 12, ly, 24, 36, 5);

      // Lantern highlight
      g.fillStyle(0xFF6666, 0.5);
      g.fillRoundedRect(lx - 8, ly + 4, 8, 20, 4);

      // Top/bottom caps
      g.fillStyle(0xCC1100, 1);
      g.fillRect(lx - 10, ly, 20, 5);
      g.fillRect(lx - 10, ly + 31, 20, 5);

      // Tassel
      g.lineStyle(2, 0xFFD700, 0.9);
      g.strokeRect(lx, ly + 36, 0, 12);
      g.fillStyle(0xFFD700, 0.9);
      g.fillCircle(lx, ly + 48, 3);

      // Glow
      g.fillStyle(0xFF4400, 0.1);
      g.fillCircle(lx, ly + 18, 30);
    });
  }

  _buildTitle(W, H) {
    // Glowing title text
    const titleStyle = {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '62px',
      fontStyle: 'bold',
      color: '#FF6B35',
      stroke: '#FFD700',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 0, color: '#FF4500', blur: 20, fill: true }
    };

    const title = this.add.text(W / 2, 130, '🍜 QUÁN MÌ CAY', titleStyle);
    title.setOrigin(0.5);
    title.setDepth(5);

    // Subtitle
    const subtitleStyle = {
      fontFamily: '"Segoe UI", Arial, sans-serif',
      fontSize: '22px',
      color: '#FFB347',
      letterSpacing: 8
    };
    const subtitle = this.add.text(W / 2, 195, 'SPICY NOODLE SHOP', subtitleStyle);
    subtitle.setOrigin(0.5);
    subtitle.setDepth(5);

    // Pulsing animation on title
    this.tweens.add({
      targets: title,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  _buildMenuButtons(W, H) {
    const buttons = [
      { label: '▶  CHƠI NGAY', scene: 'GameScene', color: 0xFF6B35, hoverColor: 0xFF8C42 },
      { label: '📋  CHỌN MÀN', scene: 'LevelSelectScene', color: 0x4CAF50, hoverColor: 0x66BB6A },
      { label: '⚙  CÀI ĐẶT', scene: 'SettingsScene', color: 0x9C27B0, hoverColor: 0xAB47BC }
    ];

    buttons.forEach((btn, i) => {
      const by = 300 + i * 82;
      const bw = 300;
      const bh = 62;

      // Button container
      const btnContainer = this.add.container(W / 2, by);
      btnContainer.setDepth(10);

      // Button background graphics
      const btnGfx = this.add.graphics();
      btnGfx.fillStyle(btn.color, 1);
      btnGfx.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 14);
      btnGfx.lineStyle(2, 0xFFFFFF, 0.3);
      btnGfx.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 14);
      // Shine
      btnGfx.fillStyle(0xFFFFFF, 0.15);
      btnGfx.fillRoundedRect(-bw / 2 + 4, -bh / 2 + 4, bw - 8, bh / 2 - 4, 10);

      // Shadow
      const shadow = this.add.graphics();
      shadow.fillStyle(0x000000, 0.3);
      shadow.fillRoundedRect(-bw / 2 + 4, -bh / 2 + 6, bw, bh, 14);

      // Text
      const btnText = this.add.text(0, 0, btn.label, {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#FFFFFF'
      });
      btnText.setOrigin(0.5);

      btnContainer.add([shadow, btnGfx, btnText]);

      // Hitbox
      const hitArea = this.add.rectangle(W / 2, by, bw, bh, 0x000000, 0)
        .setInteractive({ useHandCursor: true });

      hitArea.on('pointerover', () => {
        this.tweens.add({ targets: btnContainer, scaleX: 1.05, scaleY: 1.05, duration: 120 });
        btnGfx.clear();
        btnGfx.fillStyle(btn.hoverColor, 1);
        btnGfx.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 14);
        btnGfx.lineStyle(2, 0xFFFFFF, 0.4);
        btnGfx.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 14);
        btnGfx.fillStyle(0xFFFFFF, 0.2);
        btnGfx.fillRoundedRect(-bw / 2 + 4, -bh / 2 + 4, bw - 8, bh / 2 - 4, 10);
      });

      hitArea.on('pointerout', () => {
        this.tweens.add({ targets: btnContainer, scaleX: 1, scaleY: 1, duration: 120 });
        btnGfx.clear();
        btnGfx.fillStyle(btn.color, 1);
        btnGfx.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 14);
        btnGfx.lineStyle(2, 0xFFFFFF, 0.3);
        btnGfx.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 14);
        btnGfx.fillStyle(0xFFFFFF, 0.15);
        btnGfx.fillRoundedRect(-bw / 2 + 4, -bh / 2 + 4, bw - 8, bh / 2 - 4, 10);
      });

      hitArea.on('pointerdown', () => {
        this.tweens.add({ targets: btnContainer, scaleX: 0.95, scaleY: 0.95, duration: 80, yoyo: true });

        this.time.delayedCall(150, () => {
          if (btn.scene === 'GameScene') {
            // Start from the current highest level
            const startLevel = saveSystem.getUnlockedLevel();
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.time.delayedCall(400, () => {
              this.scene.start('GameScene', { levelId: Math.min(startLevel, 10) });
            });
          } else {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.time.delayedCall(400, () => {
              this.scene.start(btn.scene);
            });
          }
        });
      });

      hitArea.setDepth(11);

      // Entrance animation
      btnContainer.setAlpha(0);
      btnContainer.y -= 20;
      this.tweens.add({
        targets: btnContainer,
        alpha: 1,
        y: by,
        duration: 400,
        delay: 300 + i * 100,
        ease: 'Back.easeOut'
      });
    });
  }

  _buildDecorations(W, H) {
    // Total money display
    const totalMoney = saveSystem.getTotalMoney();
    if (totalMoney > 0) {
      const moneyBg = this.add.graphics();
      moneyBg.fillStyle(0x000000, 0.4);
      moneyBg.fillRoundedRect(W - 200, 20, 180, 36, 10);
      moneyBg.setDepth(5);

      this.add.text(W - 110, 38, `💰 ${totalMoney.toLocaleString()}đ`, {
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '16px',
        color: '#FFD700'
      }).setOrigin(0.5).setDepth(6);
    }

    // Bottom decorative noodle bowl illustrations
    const decorGfx = this.add.graphics();
    decorGfx.setDepth(4);
    DrawingUtils.drawNoodleBowl(decorGfx, 100, H - 80, 0.8, 0xFF4500, true);
    DrawingUtils.drawNoodleBowl(decorGfx, W - 100, H - 80, 0.8, 0xFF6B35, true);

    // Floating chili peppers decoration
    for (let i = 0; i < 8; i++) {
      const px = 60 + i * 160;
      const py = H * 0.52;
      const chiliGfx = this.add.graphics();
      chiliGfx.fillStyle(0xFF2200, 0.6);
      chiliGfx.fillEllipse(px, py, 6, 14);
      chiliGfx.fillStyle(0x228B22, 0.6);
      chiliGfx.fillRect(px - 1, py - 8, 2, 5);
      chiliGfx.setDepth(3);
    }
  }

  _buildVersion(W, H) {
    this.add.text(W - 10, H - 10, 'v1.0', {
      fontFamily: 'Quicksand',
      fontSize: '12px',
      color: 'rgba(255,180,100,0.4)'
    }).setOrigin(1, 1).setDepth(5);
  }

  _updateAnimations() {
    this._animTime += 0.05;

    if (this._bgGraphics) {
      this._bgGraphics.clear();

      // Animated steam from bowls
      const W = this.scale.width;
      const H = this.scale.height;
      DrawingUtils.drawSteam(this._bgGraphics, 100, H - 90, 1);
      DrawingUtils.drawSteam(this._bgGraphics, W - 100, H - 90, 1);

      // Animated flames in kitchen
      DrawingUtils.drawFlame(this._bgGraphics, W * 0.25 - 20, H * 0.69 - 5, 0.5);
      DrawingUtils.drawFlame(this._bgGraphics, W * 0.75 - 20, H * 0.69 - 5, 0.5);
    }
  }

  shutdown() {
    this._mainBg = null;
    this._bgGraphics = null;
  }
}

export default MainMenuScene;

