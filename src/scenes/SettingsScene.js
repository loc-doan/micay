// src/scenes/SettingsScene.js
// Settings screen for audio and game options

import saveSystem from '../systems/SaveSystem.js';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this._soundEnabled = saveSystem.getSetting('soundEnabled');
    this._musicEnabled = saveSystem.getSetting('musicEnabled');

    this._buildBackground(W, H);
    this._buildTitle(W, H);
    this._buildToggles(W, H);
    this._buildResetSection(W, H);
    this._buildBackButton(W, H);

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  _buildBackground(W, H) {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1A0500, 0x1A0500, 0x2D1000, 0x2D1000, 1);
    bg.fillRect(0, 0, W, H);

    // Panel
    bg.fillStyle(0x000000, 0.4);
    bg.fillRoundedRect(W / 2 - 300, 60, 600, H - 120, 20);
    bg.lineStyle(2, 0xFF6B35, 0.5);
    bg.strokeRoundedRect(W / 2 - 300, 60, 600, H - 120, 20);
    bg.setDepth(0);
  }

  _buildTitle(W, H) {
    this.add.text(W / 2, 110, '⚙ CÀI ĐẶT', {
      fontFamily: 'Georgia, serif',
      fontSize: '38px',
      fontStyle: 'bold',
      color: '#FF6B35',
      stroke: '#FFD700',
      strokeThickness: 2
    }).setOrigin(0.5).setDepth(2);
  }

  _buildToggles(W, H) {
    const settings = [
      { key: 'soundEnabled', label: '🔊 Âm Thanh', value: this._soundEnabled },
      { key: 'musicEnabled', label: '🎵 Nhạc Nền', value: this._musicEnabled }
    ];

    settings.forEach((s, i) => {
      const ty = 200 + i * 90;
      this._createToggle(W / 2, ty, s.label, s.key, s.value);
    });
  }

  _createToggle(x, y, label, key, initialValue) {
    let currentValue = initialValue;

    // Label
    this.add.text(x - 100, y, label, {
      fontFamily: 'Quicksand',
      fontSize: '22px',
      color: '#FFE4B5'
    }).setOrigin(1, 0.5).setDepth(2);

    // Toggle track
    const trackGfx = this.add.graphics().setDepth(2);
    const knob = this.add.graphics().setDepth(3);

    const drawToggle = (on) => {
      trackGfx.clear();
      trackGfx.fillStyle(on ? 0x4CAF50 : 0x555555, 1);
      trackGfx.fillRoundedRect(x - 40, y - 16, 80, 32, 16);
      trackGfx.lineStyle(2, on ? 0x66BB6A : 0x777777, 1);
      trackGfx.strokeRoundedRect(x - 40, y - 16, 80, 32, 16);

      // Inner shine
      trackGfx.fillStyle(0xFFFFFF, 0.1);
      trackGfx.fillRoundedRect(x - 38, y - 14, 76, 12, 12);

      knob.clear();
      const kx = on ? x + 22 : x - 22;
      knob.fillStyle(0xFFFFFF, 1);
      knob.fillCircle(kx, y, 14);
      knob.fillStyle(0xEEEEEE, 0.5);
      knob.fillCircle(kx - 3, y - 3, 5);
    };

    drawToggle(currentValue);

    // Status text
    const statusText = this.add.text(x + 60, y, currentValue ? 'BẬT' : 'TẮT', {
      fontFamily: 'Quicksand',
      fontSize: '16px',
      color: currentValue ? '#4CAF50' : '#888888'
    }).setOrigin(0, 0.5).setDepth(2);

    // Click area
    const hitArea = this.add.rectangle(x, y, 80, 32, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(4);

    hitArea.on('pointerdown', () => {
      currentValue = !currentValue;
      drawToggle(currentValue);
      statusText.setText(currentValue ? 'BẬT' : 'TẮT');
      statusText.setColor(currentValue ? '#4CAF50' : '#888888');
      saveSystem.setSetting(key, currentValue);

      // Animate knob
      this.tweens.add({
        targets: knob,
        x: currentValue ? 22 : -22,
        duration: 150,
        ease: 'Power2'
      });
    });
  }

  _buildResetSection(W, H) {
    // Separator
    const sepGfx = this.add.graphics().setDepth(2);
    sepGfx.lineStyle(1, 0xFF6B35, 0.3);
    sepGfx.strokeRect(W / 2 - 200, 420, 400, 0);

    this.add.text(W / 2, 460, '⚠ Nguy Hiểm', {
      fontFamily: 'Quicksand',
      fontSize: '16px',
      color: '#FF4444'
    }).setOrigin(0.5).setDepth(2);

    // Reset button
    const resetContainer = this.add.container(W / 2, 510).setDepth(5);
    const resetGfx = this.add.graphics();
    resetGfx.fillStyle(0x8B0000, 1);
    resetGfx.fillRoundedRect(-120, -22, 240, 44, 10);
    resetGfx.lineStyle(2, 0xFF4444, 0.7);
    resetGfx.strokeRoundedRect(-120, -22, 240, 44, 10);
    resetContainer.add(resetGfx);

    const resetText = this.add.text(0, 0, '🗑 XÓA TIẾN TRÌNH', {
      fontFamily: 'Quicksand',
      fontSize: '18px',
      color: '#FF8888'
    }).setOrigin(0.5);
    resetContainer.add(resetText);

    const hitArea = this.add.rectangle(W / 2, 510, 240, 44, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(6);

    hitArea.on('pointerover', () => {
      this.tweens.add({ targets: resetContainer, scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });
    hitArea.on('pointerout', () => {
      this.tweens.add({ targets: resetContainer, scaleX: 1, scaleY: 1, duration: 100 });
    });
    hitArea.on('pointerdown', () => {
      this._showResetConfirm(W, H);
    });
  }

  _showResetConfirm(W, H) {
    // Confirmation dialog
    const overlay = this.add.graphics().setDepth(20);
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, W, H);

    const dialog = this.add.container(W / 2, H / 2).setDepth(21);
    const dialogBg = this.add.graphics();
    dialogBg.fillStyle(0x2D1000, 1);
    dialogBg.fillRoundedRect(-200, -100, 400, 200, 16);
    dialogBg.lineStyle(2, 0xFF4444, 1);
    dialogBg.strokeRoundedRect(-200, -100, 400, 200, 16);
    dialog.add(dialogBg);

    const confirmText = this.add.text(0, -50, 'Bạn chắc chắn muốn\nxóa toàn bộ tiến trình?', {
      fontFamily: 'Quicksand',
      fontSize: '18px',
      color: '#FFE4B5',
      align: 'center'
    }).setOrigin(0.5);
    dialog.add(confirmText);

    // YES button
    const yesGfx = this.add.graphics();
    yesGfx.fillStyle(0x8B0000, 1);
    yesGfx.fillRoundedRect(-90, 20, 80, 36, 8);
    dialog.add(yesGfx);
    const yesText = this.add.text(-50, 38, 'XÓA', { fontFamily: 'Quicksand', fontSize: '16px', color: '#FF8888' }).setOrigin(0.5);
    dialog.add(yesText);

    // NO button
    const noGfx = this.add.graphics();
    noGfx.fillStyle(0x226622, 1);
    noGfx.fillRoundedRect(10, 20, 80, 36, 8);
    dialog.add(noGfx);
    const noText = this.add.text(50, 38, 'HỦY', { fontFamily: 'Quicksand', fontSize: '16px', color: '#90EE90' }).setOrigin(0.5);
    dialog.add(noText);

    const yesHit = this.add.rectangle(W / 2 - 50, H / 2 + 38, 80, 36, 0x000000, 0).setInteractive({ useHandCursor: true }).setDepth(22);
    yesHit.on('pointerdown', () => {
      saveSystem.reset();
      overlay.destroy();
      dialog.destroy();
      yesHit.destroy();
      noHit.destroy();
      this._showResetSuccess(W, H);
    });

    const noHit = this.add.rectangle(W / 2 + 50, H / 2 + 38, 80, 36, 0x000000, 0).setInteractive({ useHandCursor: true }).setDepth(22);
    noHit.on('pointerdown', () => {
      overlay.destroy();
      dialog.destroy();
      yesHit.destroy();
      noHit.destroy();
    });
  }

  _showResetSuccess(W, H) {
    const msg = this.add.text(W / 2, H / 2, '✓ Đã xóa tiến trình!', {
      fontFamily: 'Quicksand',
      fontSize: '28px',
      color: '#4CAF50'
    }).setOrigin(0.5).setDepth(25);

    this.tweens.add({
      targets: msg,
      alpha: 0,
      y: H / 2 - 50,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => msg.destroy()
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

export default SettingsScene;

