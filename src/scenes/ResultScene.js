// src/scenes/ResultScene.js
// Level result screen (win/lose) with stars, stats, and navigation

import { DrawingUtils } from '../utils/DrawingUtils.js';
import saveSystem from '../systems/SaveSystem.js';

export class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data) {
    this.resultData = data;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const d = this.resultData;

    this._buildBackground(W, H, d.success);
    this._buildResultPanel(W, H, d);
    this._buildButtons(W, H, d);
    this._buildDecorations(W, H, d);

    this.cameras.main.fadeIn(600, 0, 0, 0);
  }

  _buildBackground(W, H, success) {
    const bg = this.add.graphics().setDepth(0);

    if (success) {
      bg.fillGradientStyle(0x0A2A00, 0x0A2A00, 0x1A5C00, 0x1A5C00, 1);
    } else {
      bg.fillGradientStyle(0x1A0000, 0x1A0000, 0x4A0000, 0x4A0000, 1);
    }
    bg.fillRect(0, 0, W, H);

    // Decorative particle dots
    for (let i = 0; i < 30; i++) {
      const px = Phaser.Math.Between(0, W);
      const py = Phaser.Math.Between(0, H);
      const r = Phaser.Math.Between(1, 4);
      bg.fillStyle(success ? 0xFFD700 : 0xFF4444, 0.15);
      bg.fillCircle(px, py, r);
    }
  }

  _buildResultPanel(W, H, d) {
    // Main panel
    const panelGfx = this.add.graphics().setDepth(5);
    panelGfx.fillStyle(0x0A0300, 0.9);
    panelGfx.fillRoundedRect(W / 2 - 340, 60, 680, H - 120, 24);
    panelGfx.lineStyle(4, d.success ? 0x4CAF50 : 0xF44336, 0.9);
    panelGfx.strokeRoundedRect(W / 2 - 340, 60, 680, H - 120, 24);
    panelGfx.fillStyle(d.success ? 0x1A5C00 : 0x3A0000, 0.4);
    panelGfx.fillRoundedRect(W / 2 - 336, 64, 672, 80, 20);

    // Result title
    const titleColor = d.success ? '#4CAF50' : '#F44336';
    const titleText = d.success ? '🎉 LEVEL HOÀN THÀNH!' : '😢 LEVEL THẤT BẠI';

    this.add.text(W / 2, 110, titleText, {
      fontFamily: 'Georgia, serif',
      fontSize: '40px',
      fontStyle: 'bold',
      color: titleColor,
      stroke: d.success ? '#FFD700' : '#AA0000',
      strokeThickness: 2,
      shadow: { offsetX: 0, offsetY: 0, color: titleColor, blur: 20, fill: true }
    }).setOrigin(0.5).setDepth(10);

    // Level name
    this.add.text(W / 2, 160, `Màn ${d.levelId}: ${d.levelData.name}`, {
      fontFamily: 'Quicksand',
      fontSize: '18px',
      color: '#FFB347'
    }).setOrigin(0.5).setDepth(10);

    // Stars
    if (d.success) {
      this._buildStars(W, H, d.stars);
    }

    // Stats
    this._buildStats(W, H, d);
  }

  _buildStars(W, H, stars) {
    const starPositions = [W / 2 - 80, W / 2, W / 2 + 80];
    const starSizes = [30, 40, 30];
    const delays = [200, 0, 400];

    const starGfx = this.add.graphics().setDepth(10);
    starGfx.setAlpha(0);

    starPositions.forEach((sx, i) => {
      const filled = i < stars;
      // Draw star with offset position
      const tempGfx = this.add.graphics().setDepth(10).setAlpha(0);
      DrawingUtils.drawStar(tempGfx, sx, 230, starSizes[i], filled);

      this.tweens.add({
        targets: tempGfx,
        alpha: 1,
        scaleX: filled ? [0, 1.3, 1] : 1,
        scaleY: filled ? [0, 1.3, 1] : 1,
        duration: filled ? 400 : 200,
        delay: delays[i],
        ease: 'Back.easeOut'
      });

      // Sparkle for earned stars
      if (filled) {
        this.time.delayedCall(delays[i] + 100, () => {
          for (let j = 0; j < 8; j++) {
            const angle = (j / 8) * Math.PI * 2;
            const sparkGfx = this.add.graphics().setDepth(12);
            sparkGfx.fillStyle(0xFFD700, 1);
            sparkGfx.fillCircle(sx, 230, 3);
            this.tweens.add({
              targets: sparkGfx,
              x: Math.cos(angle) * 40,
              y: Math.sin(angle) * 40,
              alpha: 0,
              duration: 500,
              ease: 'Power2',
              onComplete: () => sparkGfx.destroy()
            });
          }
        });
      }
    });

    // Star rating text
    const ratingTexts = ['', 'Đạt yêu cầu', 'Xuất sắc!', 'Hoàn hảo! ★'];
    this.add.text(W / 2, 275, ratingTexts[stars] || '', {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#FFD700'
    }).setOrigin(0.5).setDepth(10);
  }

  _buildStats(W, H, d) {
    const statsY = d.success ? 310 : 230;

    const statsData = [
      {
        label: 'Doanh Thu',
        value: `${d.money.toLocaleString()}đ`,
        target: `/ ${d.levelData.targetMoney.toLocaleString()}đ`,
        color: d.money >= d.levelData.targetMoney ? '#4CAF50' : '#F44336',
        icon: '💰'
      },
      {
        label: 'Khách Đã Phục Vụ',
        value: `${d.served}`,
        target: ' người',
        color: '#90EE90',
        icon: '👥'
      },
      {
        label: 'Khách Bỏ Đi',
        value: `${d.lost}`,
        target: ' người',
        color: d.lost > 3 ? '#F44336' : '#FF9800',
        icon: '😤'
      },
      {
        label: 'Tỷ Lệ Hài Lòng',
        value: `${d.satisfactionRate}%`,
        target: '',
        color: d.satisfactionRate > 70 ? '#4CAF50' : '#FF9800',
        icon: '⭐'
      }
    ];

    const statGfx = this.add.graphics().setDepth(10);
    statsData.forEach((stat, i) => {
      const sy = statsY + i * 70;
      const cx = W / 2;

      // Stat row background
      statGfx.fillStyle(0xFFFFFF, 0.05);
      statGfx.fillRoundedRect(cx - 280, sy - 10, 560, 52, 8);

      const statContainer = this.add.container(cx, sy + 16).setDepth(11).setAlpha(0);

      const iconText = this.add.text(-250, 0, stat.icon, { fontSize: '22px' }).setOrigin(0, 0.5);
      const labelText = this.add.text(-210, 0, stat.label, {
        fontFamily: 'Quicksand',
        fontSize: '16px',
        color: '#FFE4B5'
      }).setOrigin(0, 0.5);
      const valueText = this.add.text(220, 0, stat.value, {
        fontFamily: '"Segoe UI", Arial',
        fontSize: '20px',
        fontStyle: 'bold',
        color: stat.color
      }).setOrigin(1, 0.5);
      const targetText = this.add.text(222, 0, stat.target, {
        fontFamily: 'Quicksand',
        fontSize: '13px',
        color: 'rgba(255,228,181,0.5)'
      }).setOrigin(0, 0.5);

      statContainer.add([iconText, labelText, valueText, targetText]);

      this.tweens.add({
        targets: statContainer,
        alpha: 1,
        x: cx,
        duration: 300,
        delay: 400 + i * 150,
        ease: 'Power2'
      });
    });

    // Separator
    const sepGfx = this.add.graphics().setDepth(10);
    sepGfx.lineStyle(1, 0xFF6B35, 0.3);
    sepGfx.strokeRect(W / 2 - 280, statsY + statsData.length * 70 - 5, 560, 0);
  }

  _buildButtons(W, H, d) {
    const buttonsY = H - 110;
    const buttons = d.success ? [
      { label: '▶ MÀN TIẾP THEO', color: 0x4CAF50, callback: () => this._nextLevel(d) },
      { label: '🔄 CHƠI LẠI', color: 0xFF6B35, callback: () => this._replay(d) },
      { label: '📋 CHỌN MÀN', color: 0x9C27B0, callback: () => this._levelSelect() }
    ] : [
      { label: '🔄 THỬ LẠI', color: 0xFF6B35, callback: () => this._replay(d) },
      { label: '📋 CHỌN MÀN', color: 0x9C27B0, callback: () => this._levelSelect() },
      { label: '🏠 MENU CHÍNH', color: 0x607D8B, callback: () => this._mainMenu() }
    ];

    const btnW = 190;
    const totalW = buttons.length * btnW + (buttons.length - 1) * 16;
    const startX = W / 2 - totalW / 2;

    buttons.forEach((btn, i) => {
      const bx = startX + i * (btnW + 16) + btnW / 2;

      const container = this.add.container(bx, buttonsY).setDepth(15).setAlpha(0);

      const btnGfx = this.add.graphics();
      btnGfx.fillStyle(btn.color, 1);
      btnGfx.fillRoundedRect(-btnW / 2, -24, btnW, 48, 12);
      btnGfx.lineStyle(2, 0xFFFFFF, 0.25);
      btnGfx.strokeRoundedRect(-btnW / 2, -24, btnW, 48, 12);
      btnGfx.fillStyle(0xFFFFFF, 0.12);
      btnGfx.fillRoundedRect(-btnW / 2 + 4, -20, btnW - 8, 20, 8);
      container.add(btnGfx);

      const btnText = this.add.text(0, 0, btn.label, {
        fontFamily: 'Quicksand',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#FFFFFF'
      }).setOrigin(0.5);
      container.add(btnText);

      this.tweens.add({
        targets: container,
        alpha: 1,
        duration: 300,
        delay: 800 + i * 100,
        ease: 'Back.easeOut'
      });

      const hitArea = this.add.rectangle(bx, buttonsY, btnW, 48, 0x000000, 0)
        .setInteractive({ useHandCursor: true })
        .setDepth(16);
      hitArea.on('pointerover', () => {
        this.tweens.add({ targets: container, scaleX: 1.06, scaleY: 1.06, duration: 100 });
      });
      hitArea.on('pointerout', () => {
        this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
      });
      hitArea.on('pointerdown', () => {
        this.tweens.add({ targets: container, scaleX: 0.94, scaleY: 0.94, duration: 80, yoyo: true });
        this.time.delayedCall(150, btn.callback);
      });
    });
  }

  _buildDecorations(W, H, d) {
    // Noodle bowl illustration
    const decGfx = this.add.graphics().setDepth(3);
    DrawingUtils.drawNoodleBowl(decGfx, 120, H - 100, 0.7, 0xFF4500, true);
    DrawingUtils.drawNoodleBowl(decGfx, W - 120, H - 100, 0.7, 0xFF6B35, true);

    if (d.success) {
      // Confetti effect
      for (let i = 0; i < 20; i++) {
        const confetti = this.add.graphics().setDepth(6);
        const px = Phaser.Math.Between(W / 2 - 300, W / 2 + 300);
        const colors = [0xFFD700, 0xFF6B35, 0x4CAF50, 0x9C27B0, 0x2196F3];
        confetti.fillStyle(Phaser.Math.RND.pick(colors), 0.9);
        confetti.fillRect(0, 0, Phaser.Math.Between(6, 14), Phaser.Math.Between(6, 14));

        this.tweens.add({
          targets: confetti,
          x: Phaser.Math.Between(-100, 100),
          y: H + 100,
          angle: Phaser.Math.Between(-360, 360),
          alpha: 0,
          duration: Phaser.Math.Between(1500, 3000),
          delay: Phaser.Math.Between(0, 1000),
          ease: 'Power1',
          onStart: () => { confetti.x = px; confetti.y = -20; },
          onComplete: () => confetti.destroy()
        });
      }
    }
  }

  _nextLevel(d) {
    const nextId = d.levelId + 1;
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      if (nextId <= 10 && saveSystem.isLevelUnlocked(nextId)) {
        this.scene.start('GameScene', { levelId: nextId });
      } else {
        this.scene.start('LevelSelectScene');
      }
    });
  }

  _replay(d) {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('GameScene', { levelId: d.levelId });
    });
  }

  _levelSelect() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('LevelSelectScene');
    });
  }

  _mainMenu() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
      this.scene.start('MainMenuScene');
    });
  }
}

export default ResultScene;

