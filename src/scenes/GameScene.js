// src/scenes/GameScene.js
// Main gameplay scene - the heart of the game

import LEVELS from '../data/levels.js';
import DISHES from '../data/dishes.js';
import INGREDIENTS from '../data/ingredients.js';
import GAME_CONFIG from '../data/config.js';
import { DrawingUtils } from '../utils/DrawingUtils.js';
import { MoneySystem } from '../systems/MoneySystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import saveSystem from '../systems/SaveSystem.js';

// ─── Customer states ────────────────────────────────────────────────────────
const CustomerState = {
  ENTERING: 'entering',
  WAITING: 'waiting',
  SERVED: 'served',
  LEAVING: 'leaving'
};

// ─── Cooking states ──────────────────────────────────────────────────────────
const CookingState = {
  IDLE: 'idle',
  COLLECTING: 'collecting',
  COOKING: 'cooking',
  READY: 'ready'
};

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.levelId = data.levelId || 1;
    this.levelData = LEVELS.find(l => l.id === this.levelId) || LEVELS[0];
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Systems
    this.moneySystem = new MoneySystem();
    this.audio = new AudioSystem(this);
    this.audio.init(
      saveSystem.getSetting('soundEnabled'),
      saveSystem.getSetting('musicEnabled')
    );

    // State
    this.customers = [];
    this.selectedIngredients = [];
    this.pots = [];
    this.prepState = CookingState.IDLE;
    this.timeLeft = this.levelData.duration;
    this.isPaused = false;
    this.tutorialActive = this.levelData.hasTutorial;
    this.tutorialStep = 0;
    this.gameOver = false;
    this.nextCustomerId = 0;
    this.lastSpawnTime = 0;
    this.spawnCooldown = this.levelData.customerSpawnRate * 1000;
    this.pendingFeedbacks = [];
    this._animTime = 0;
    this._availableSeats = [0, 1, 2, 3, 4, 5, 6].slice(0, this.levelData.maxCustomers);
    this._seatOccupied = {};

    // Build scene
    this._buildKitchen(W, H);
    this._buildIngredientArea(W, H);
    this._buildHUD(W, H);
    this._buildCookingStation(W, H);
    this._buildPauseButton(W, H);
    this._setupDebugMode();

    // Unlock audio context on first pointerdown
    this.input.once('pointerdown', () => {
      if (this.sound && this.sound.context && this.sound.context.state === 'suspended') {
        this.sound.context.resume();
      }
    });

    // Dynamic graphics layers
    this._dynamicGfx = this.add.graphics().setDepth(30);
    this._uiGfx = this.add.graphics().setDepth(50);
    this._effectsGfx = this.add.graphics().setDepth(60);

    // Customer display containers
    this._customerContainers = {};

    // Tutorial
    if (this.tutorialActive) {
      this.time.delayedCall(500, () => this._startTutorial());
    } else {
      this._spawnCustomerNow();
    }

    // Main update loop
    this._gameTimer = this.time.addEvent({
      delay: 1000,
      callback: this._onSecondTick,
      callbackScope: this,
      loop: true
    });

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // BUILD METHODS
  // ──────────────────────────────────────────────────────────────────────────

  _buildKitchen(W, H) {
    const kitchenGfx = this.add.graphics().setDepth(1);

    // Background wall
    kitchenGfx.fillGradientStyle(0x2D1005, 0x2D1005, 0x4A2010, 0x4A2010, 1);
    kitchenGfx.fillRect(0, 0, W, H);

    // Wall decorations
    for (let i = 0; i < W; i += 120) {
      kitchenGfx.fillStyle(0xFF2200, 0.04);
      kitchenGfx.fillRect(i, 0, 60, H);
    }

    // Ceiling lanterns
    this._drawCeilingLanterns(kitchenGfx, W);

    // Customer area (dining section – starts just below HUD progress bar at y=70)
    kitchenGfx.fillStyle(0x1A0800, 0.5);
    kitchenGfx.fillRect(0, 70, W, 150);

    // Customer area separator (wood counter divider)
    kitchenGfx.fillStyle(0x5C3D1A, 1);
    kitchenGfx.fillRect(0, 218, W, 14);
    kitchenGfx.fillStyle(0x8B6914, 0.5);
    kitchenGfx.fillRect(0, 218, W, 5);

    // Kitchen counter/work area
    kitchenGfx.fillStyle(0x3D2010, 1);
    kitchenGfx.fillRect(0, 232, W, 204);

    // Main counter top
    DrawingUtils.drawCounter(kitchenGfx, 0, 232, W, 204);

    // Floor
    kitchenGfx.fillStyle(0x1A0800, 1);
    kitchenGfx.fillRect(0, 436, W, H - 436);

    // Floor tiles
    kitchenGfx.lineStyle(1, 0x2D1200, 0.5);
    for (let i = 0; i < W; i += 80) {
      kitchenGfx.strokeRect(i, 436, 80, 80);
    }

    // Background walls behind kitchen - shelves
    kitchenGfx.fillStyle(0x5C3D1A, 1);
    kitchenGfx.fillRect(0, 240, W, 10);

    // Draw tables for customers (adjusted for new seat y=180)
    this._customerSeats = GAME_CONFIG.CUSTOMER_SEATS.slice(0, this.levelData.maxCustomers);
    this._customerSeats.forEach((seat, i) => {
      // Table surface
      const tgfx = this.add.graphics().setDepth(2);
      tgfx.fillStyle(0x5C3D1A, 1);
      tgfx.fillRoundedRect(seat.x - 35, seat.y + 18, 70, 32, 5);
      tgfx.fillStyle(0x7A5230, 1);
      tgfx.fillRoundedRect(seat.x - 35, seat.y + 18, 70, 7, 5);

      // Chair
      tgfx.fillStyle(0x4A2D10, 1);
      tgfx.fillRoundedRect(seat.x - 20, seat.y + 48, 40, 18, 4);
      tgfx.fillStyle(0x8B5A2B, 1);
      tgfx.fillRoundedRect(seat.x - 20, seat.y + 48, 40, 5, 4);
    });
  }

  _drawCeilingLanterns(g, W) {
    const positions = [0.12, 0.3, 0.5, 0.7, 0.88];
    positions.forEach(xRatio => {
      const lx = W * xRatio;
      g.lineStyle(2, 0x8B4513, 0.7);
      g.strokeRect(lx, 0, 0, 25);
      g.fillStyle(0xFF2200, 1);
      g.fillRoundedRect(lx - 10, 25, 20, 30, 4);
      g.fillStyle(0xFF6666, 0.4);
      g.fillRoundedRect(lx - 6, 29, 7, 18, 3);
      g.fillStyle(0xCC1100, 1);
      g.fillRect(lx - 8, 25, 16, 4);
      g.fillRect(lx - 8, 51, 16, 4);
      g.fillStyle(0xFFAA00, 0.15);
      g.fillCircle(lx, 40, 28);
    });
  }

  _buildIngredientArea(W, H) {
    // Ingredient shelf background
    const shelfGfx = this.add.graphics().setDepth(3);
    shelfGfx.fillStyle(0x0F0500, 1);
    shelfGfx.fillRect(0, 436, W, H - 436);
    shelfGfx.fillStyle(0x5C3D1A, 1);
    shelfGfx.fillRect(0, 436, W, 10);
    shelfGfx.fillStyle(0x8B6914, 0.4);
    shelfGfx.fillRect(0, 436, W, 4);

    // Ingredient shelf label
    shelfGfx.fillStyle(0x2D1500, 0.8);
    shelfGfx.fillRect(0, 440, 120, 30);

    this.add.text(60, 455, 'NGUYÊN LIỆU', {
      fontFamily: 'Quicksand',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#FF6B35'
    }).setOrigin(0.5).setDepth(4);

    // Draw ingredient boxes
    const available = this.levelData.availableIngredients;
    const boxW = Math.min(110, (W - 20) / available.length - 5);
    const boxH = 90;
    const totalWidth = available.length * (boxW + 5) - 5;
    const startX = (W - totalWidth) / 2;

    this._ingredientBoxes = [];

    available.forEach((ingId, idx) => {
      const ing = INGREDIENTS[ingId];
      if (!ing) return;
      const bx = startX + idx * (boxW + 5);
      const by = 448;

      const boxGfx = this.add.graphics().setDepth(4);
      DrawingUtils.drawIngredientBox(boxGfx, bx, by, boxW, boxH, ingId, ing.name);
      this._ingredientBoxes.push({ gfx: boxGfx, ingId, x: bx, y: by, w: boxW, h: boxH });

      // Ingredient name label
      this.add.text(bx + boxW / 2, by + boxH - 12, ing.name, {
        fontFamily: 'Quicksand',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#FFFFFF'
      }).setOrigin(0.5).setDepth(6);

      // Click area
      const hitArea = this.add.rectangle(bx + boxW / 2, by + boxH / 2, boxW, boxH, 0x000000, 0)
        .setInteractive({ useHandCursor: true })
        .setDepth(7);

      hitArea.on('pointerdown', () => {
        if (this.isPaused || this.gameOver) return;
        this._pickIngredient(ingId, bx + boxW / 2, by + boxH / 2);
      });

      hitArea.on('pointerover', () => {
        boxGfx.setAlpha(0.85);
        this.tweens.add({ targets: boxGfx, scaleX: 1.04, scaleY: 1.04, duration: 100, ease: 'Power2' });
      });

      hitArea.on('pointerout', () => {
        boxGfx.setAlpha(1);
        this.tweens.add({ targets: boxGfx, scaleX: 1, scaleY: 1, duration: 100 });
      });
    });
  }

  _buildCookingStation(W, H) {
    // 3 Pots
    const potStartX = 150;
    const potSpacing = 140;

    for (let i = 0; i < 3; i++) {
      const px = potStartX + i * potSpacing;
      const potObj = {
        id: i,
        x: px,
        y: 305,
        state: CookingState.IDLE,
        dish: null,
        progress: 0,
        timer: 0,
        stoveGfx: this.add.graphics().setDepth(5),
        potGfx: this.add.graphics().setDepth(6),
        progressBg: this.add.graphics().setDepth(8),
        progressFill: this.add.graphics().setDepth(9),
        progressText: this.add.text(px, 430, '', { fontFamily: 'Quicksand', fontSize: '11px', color: '#FFFFFF' }).setOrigin(0.5).setDepth(10),
        dishGfx: this.add.graphics().setDepth(15),
        dishText: this.add.text(px, 350, '', { fontFamily: 'Quicksand', fontSize: '12px', color: '#90EE90', align: 'center', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5).setDepth(16).setVisible(false),
        discardBtn: this.add.container(px, 395).setDepth(10).setVisible(false)
      };

      this.add.text(px, 405, 'NỒI ' + (i + 1), {
        fontFamily: 'Quicksand', fontSize: '11px', color: '#FFB347'
      }).setOrigin(0.5).setDepth(7);

      DrawingUtils.drawStove(potObj.stoveGfx, px, 340, 1.0, false);
      DrawingUtils.drawCookingPot(potObj.potGfx, px, 305, 0.9, 0);

      const discardGfx = this.add.graphics();
      discardGfx.fillStyle(0x8B0000, 1);
      discardGfx.fillRoundedRect(-30, -14, 60, 28, 8);
      discardGfx.lineStyle(1, 0xCC3333, 1);
      discardGfx.strokeRoundedRect(-30, -14, 60, 28, 8);
      potObj.discardBtn.add(discardGfx);
      potObj.discardBtn.add(this.add.text(0, 0, '🗑 ĐỔ', {
        fontFamily: 'Quicksand', fontSize: '10px', fontStyle: 'bold', color: '#FFCCCC'
      }).setOrigin(0.5));

      const discardHit = this.add.rectangle(px, 395, 60, 28, 0x000000, 0).setInteractive({ useHandCursor: true }).setDepth(11);
      discardHit.on('pointerdown', () => {
        if (potObj.state === CookingState.READY) {
          this._showFeedback(px, 330, 'Đã bỏ tô mì!', 0xFF9800);
          this.audio.play('customer_leave');
          this._clearPot(potObj);
        }
      });
      discardHit.on('pointerover', () => {
        if (potObj.discardBtn.visible) this.tweens.add({ targets: potObj.discardBtn, scaleX: 1.1, scaleY: 1.1, duration: 100 });
      });
      discardHit.on('pointerout', () => {
        this.tweens.add({ targets: potObj.discardBtn, scaleX: 1, scaleY: 1, duration: 100 });
      });
      potObj.discardHit = discardHit;

      this.pots.push(potObj);
    }

    // Prep Board
    const prepGfx = this.add.graphics().setDepth(5);
    prepGfx.fillStyle(0x7A5230, 1);
    prepGfx.fillRoundedRect(600, 240, 300, 110, 10);
    prepGfx.lineStyle(2, 0x8B6914, 0.8);
    prepGfx.strokeRoundedRect(600, 240, 300, 110, 10);
    prepGfx.fillStyle(0xA0703A, 0.5);
    prepGfx.fillRoundedRect(604, 244, 292, 50, 8);

    this.add.text(750, 258, 'BẢNG CHUẨN BỊ', { fontFamily: 'Quicksand', fontSize: '11px', fontStyle: 'bold', color: '#FFD700' }).setOrigin(0.5).setDepth(7);

    // Cook button
    this._cookBtn = this.add.container(750, 380).setDepth(10);
    this._cookBtnGfx = this.add.graphics();
    this._drawCookButton(false);
    this._cookBtn.add(this._cookBtnGfx);
    this._cookBtnText = this.add.text(0, 0, '🔥 NẤU MÌ', { fontFamily: 'Quicksand', fontSize: '17px', fontStyle: 'bold', color: '#FFFFFF' }).setOrigin(0.5);
    this._cookBtn.add(this._cookBtnText);

    const cookHit = this.add.rectangle(750, 380, 160, 42, 0x000000, 0).setInteractive({ useHandCursor: true }).setDepth(11);
    cookHit.on('pointerdown', () => this._onCookPressed());
    cookHit.on('pointerover', () => { this.tweens.add({ targets: this._cookBtn, scaleX: 1.06, scaleY: 1.06, duration: 100 }); });
    cookHit.on('pointerout', () => { this.tweens.add({ targets: this._cookBtn, scaleX: 1, scaleY: 1, duration: 100 }); });

    // Clear button
    const clearGfx = this.add.graphics().setDepth(10);
    clearGfx.fillStyle(0x8B0000, 0.8);
    clearGfx.fillRoundedRect(920, 362, 40, 40, 8);
    clearGfx.lineStyle(1, 0xFF4444, 0.6);
    clearGfx.strokeRoundedRect(920, 362, 40, 40, 8);
    this.add.text(940, 382, '✕', { fontFamily: 'Quicksand', fontSize: '18px', color: '#FF8888' }).setOrigin(0.5).setDepth(11);
    const clearHit = this.add.rectangle(940, 382, 40, 40, 0x000000, 0).setInteractive({ useHandCursor: true }).setDepth(12);
    clearHit.on('pointerdown', () => this._clearIngredients());
    clearHit.on('pointerover', () => clearGfx.setAlpha(0.7));
    clearHit.on('pointerout', () => clearGfx.setAlpha(1));
    this.add.text(940, 412, 'XÓA', { fontFamily: 'Quicksand', fontSize: '9px', color: '#FF8888' }).setOrigin(0.5).setDepth(11);

    // Recipe book button
    const recipeBtn = this.add.container(1120, 380).setDepth(10);
    const recBtnGfx = this.add.graphics();
    recBtnGfx.fillStyle(0xFF6B35, 1);
    recBtnGfx.fillRoundedRect(-60, -20, 120, 40, 10);
    recBtnGfx.lineStyle(2, 0xFFD700, 1);
    recBtnGfx.strokeRoundedRect(-60, -20, 120, 40, 10);
    recBtnGfx.fillStyle(0xFFFFFF, 0.15);
    recBtnGfx.fillRoundedRect(-56, -16, 112, 16, 8);
    recipeBtn.add(recBtnGfx);
    recipeBtn.add(this.add.text(0, 0, '📖 CÔNG THỨC', { fontFamily: 'Quicksand', fontSize: '13px', fontStyle: 'bold', color: '#FFFFFF' }).setOrigin(0.5));
    const recHit = this.add.rectangle(1120, 380, 120, 40, 0x000000, 0).setInteractive({ useHandCursor: true }).setDepth(11);
    recHit.on('pointerdown', () => this._showRecipeBookModal());
    recHit.on('pointerover', () => { this.tweens.add({ targets: recipeBtn, scaleX: 1.06, scaleY: 1.06, duration: 100 }); });
    recHit.on('pointerout', () => { this.tweens.add({ targets: recipeBtn, scaleX: 1, scaleY: 1, duration: 100 }); });

    // Selected ingredients display
    this._selectedIngGfx = this.add.graphics().setDepth(8);
    this._selectedIngTexts = [];

    // Recipe hint panel
    this._recipeGfx = this.add.graphics().setDepth(8);
    this._recipeText = this.add.text(0, 0, '', { fontFamily: 'Quicksand', fontSize: '10px', color: '#FFE4B5', lineSpacing: 2 }).setDepth(9);
  }

  _drawCookButton(active) {
    this._cookBtnGfx.clear();
    const color = active ? 0xFF6B35 : 0x666666;
    this._cookBtnGfx.fillStyle(color, 1);
    this._cookBtnGfx.fillRoundedRect(-80, -21, 160, 42, 12);
    this._cookBtnGfx.lineStyle(2, active ? 0xFFD700 : 0x444444, 1);
    this._cookBtnGfx.strokeRoundedRect(-80, -21, 160, 42, 12);
    if (active) {
      this._cookBtnGfx.fillStyle(0xFFFFFF, 0.15);
      this._cookBtnGfx.fillRoundedRect(-76, -17, 152, 18, 8);
    }
  }

  _buildHUD(W, H) {
    // HUD background - slim 64px
    const hudGfx = this.add.graphics().setDepth(20);
    hudGfx.fillStyle(0x0A0300, 0.94);
    hudGfx.fillRect(0, 0, W, 64);
    // bottom gradient line
    hudGfx.lineStyle(2, 0xFF6B35, 0.6);
    hudGfx.strokeRect(0, 0, W, 64);
    hudGfx.lineStyle(1, 0xFF9800, 0.25);
    hudGfx.lineBetween(0, 65, W, 65);

    // Level name
    this.add.text(16, 10, `MÀN ${this.levelId}: ${this.levelData.name.toUpperCase()}`, {
      fontFamily: 'Quicksand',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#FF6B35'
    }).setDepth(21);

    // Difficulty dots
    const diffGfx = this.add.graphics().setDepth(21);
    for (let d = 0; d < this.levelData.difficulty; d++) {
      diffGfx.fillStyle(d < 3 ? 0xFF6B35 : 0xFF2200, 1);
      diffGfx.fillCircle(16 + d * 12, 50, 4);
    }

    // Money display
    this._moneyBg = this.add.graphics().setDepth(20);
    this._moneyBg.fillStyle(0x1A5C00, 0.8);
    this._moneyBg.fillRoundedRect(W / 2 - 115, 6, 230, 52, 10);
    this._moneyBg.lineStyle(1, 0x4CAF50, 0.5);
    this._moneyBg.strokeRoundedRect(W / 2 - 115, 6, 230, 52, 10);

    this.add.text(W / 2, 18, 'DOANH THU', {
      fontFamily: 'Quicksand',
      fontSize: '10px',
      fontStyle: 'bold',
      color: 'rgba(144,238,144,0.7)',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(21);

    this._moneyText = this.add.text(W / 2, 42, '0đ / ' + this.levelData.targetMoney.toLocaleString() + 'đ', {
      fontFamily: 'Quicksand',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#FFD700'
    }).setOrigin(0.5).setDepth(21);

    // Timer
    this._timerBg = this.add.graphics().setDepth(20);
    this._timerBg.fillStyle(0x1A1A4A, 0.8);
    this._timerBg.fillRoundedRect(W - 175, 6, 110, 52, 10);
    this._timerBg.lineStyle(1, 0x4466CC, 0.5);
    this._timerBg.strokeRoundedRect(W - 175, 6, 110, 52, 10);

    this.add.text(W - 120, 18, 'THỜI GIAN', {
      fontFamily: 'Quicksand',
      fontSize: '10px',
      fontStyle: 'bold',
      color: 'rgba(144,144,255,0.7)',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(21);

    this._timerText = this.add.text(W - 120, 42, '3:00', {
      fontFamily: 'Quicksand',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#6699FF'
    }).setOrigin(0.5).setDepth(21);

    // Customers served
    this._servedBg = this.add.graphics().setDepth(20);
    this._servedBg.fillStyle(0x1A0A4A, 0.8);
    this._servedBg.fillRoundedRect(W - 295, 6, 110, 52, 10);
    this._servedBg.lineStyle(1, 0x9966FF, 0.5);
    this._servedBg.strokeRoundedRect(W - 295, 6, 110, 52, 10);

    this.add.text(W - 240, 18, 'ĐÃ PHỤC VỤ', {
      fontFamily: 'Quicksand',
      fontSize: '10px',
      fontStyle: 'bold',
      color: 'rgba(180,144,255,0.7)',
      letterSpacing: 1
    }).setOrigin(0.5).setDepth(21);

    this._servedText = this.add.text(W - 240, 42, '0', {
      fontFamily: 'Quicksand',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#CC99FF'
    }).setOrigin(0.5).setDepth(21);

    // Progress bar (money goal) — right under HUD
    this._goalBg = this.add.graphics().setDepth(20);
    this._goalBg.fillStyle(0x1A0800, 1);
    this._goalBg.fillRect(0, 64, W, 6);
    this._goalFill = this.add.graphics().setDepth(21);
  }

  _buildPauseButton(W, H) {
    const pauseContainer = this.add.container(W - 40, 34).setDepth(25);
    const pauseGfx = this.add.graphics();
    pauseGfx.fillStyle(0x333333, 0.8);
    pauseGfx.fillCircle(0, 0, 18);
    pauseGfx.lineStyle(1, 0x888888, 0.8);
    pauseGfx.strokeCircle(0, 0, 18);
    pauseGfx.fillStyle(0xFFFFFF, 0.8);
    pauseGfx.fillRect(-7, -8, 5, 16);
    pauseGfx.fillRect(2, -8, 5, 16);
    pauseContainer.add(pauseGfx);

    const pauseHit = this.add.circle(W - 40, 34, 18, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(26);
    pauseHit.on('pointerdown', () => this._togglePause());
    pauseHit.on('pointerover', () => pauseContainer.setScale(1.1));
    pauseHit.on('pointerout', () => pauseContainer.setScale(1));

    this._pauseContainer = pauseContainer;
    this._pauseGfx = pauseGfx;
    this._pauseHit = pauseHit;
    this._paused = false;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // CUSTOMER SYSTEM
  // ──────────────────────────────────────────────────────────────────────────

  _spawnCustomerNow() {
    if (this.gameOver) return;
    const activeCnt = this.customers.filter(c => c.state !== CustomerState.LEAVING && c.state !== CustomerState.SERVED).length;
    if (activeCnt >= this.levelData.maxCustomers) return;

    // Find free seat
    const freeSeat = this._customerSeats.findIndex((s, i) => !this._seatOccupied[i]);
    if (freeSeat === -1) return;

    this._seatOccupied[freeSeat] = true;

    const seatPos = this._customerSeats[freeSeat];
    const availDishes = this.levelData.availableDishes;
    const dishId = availDishes[Phaser.Math.Between(0, availDishes.length - 1)];
    const dish = DISHES[dishId];
    const customerType = Phaser.Math.Between(0, 6);
    const waitTime = (this.levelData.maxWaitTime || GAME_CONFIG.customerWaitTimeBase) * 1000;

    const customer = {
      id: this.nextCustomerId++,
      seatIndex: freeSeat,
      x: seatPos.x,
      y: seatPos.y,
      type: customerType,
      dishId,
      dish,
      state: CustomerState.ENTERING,
      waitTimeTotal: waitTime,
      waitTimeLeft: waitTime,
      mood: 'happy',
      patience: 1.0,
      container: null,
      gfx: null,
      waitBarGfx: null,
      orderBubble: null,
      bubbleText: null
    };

    this.customers.push(customer);
    this._createCustomerDisplay(customer, seatPos);
    this.audio.play('customer_arrive');

    // Animate entrance
    customer.container.x = -60;
    this.tweens.add({
      targets: customer.container,
      x: seatPos.x,
      duration: 600,
      ease: 'Back.easeOut',
      onComplete: () => {
        customer.state = CustomerState.WAITING;
        this._showOrderBubble(customer);
        this._startCustomerTimer(customer);
        this._updateRecipeHint();
      }
    });
  }

  _createCustomerDisplay(customer, pos) {
    const container = this.add.container(pos.x, pos.y).setDepth(15);
    customer.container = container;

    // Customer character graphic
    const gfx = this.add.graphics();
    DrawingUtils.drawCustomer(gfx, 0, 0, customer.type, 'happy', 0.8);
    customer.gfx = gfx;
    container.add(gfx);

    // Wait timer bar background
    const waitBarBg = this.add.graphics();
    waitBarBg.fillStyle(0x333333, 0.8);
    waitBarBg.fillRoundedRect(-30, -62, 60, 8, 4);
    container.add(waitBarBg);

    // Wait timer bar fill
    const waitBarFill = this.add.graphics();
    waitBarFill.fillStyle(0x4CAF50, 1);
    waitBarFill.fillRoundedRect(-30, -62, 60, 8, 4);
    customer.waitBarGfx = waitBarFill;
    container.add(waitBarFill);

    this._customerContainers[customer.id] = container;
  }

  _showOrderBubble(customer) {
    if (!customer.container || !customer.dish) return;

    const bubbleW = 130;
    const bubbleH = 78;
    const GAP = 10; // gap between customer body edge and bubble

    // Determine if bubble goes LEFT or RIGHT of customer
    // Default: right side. If too close to right edge, go left.
    let goLeft = customer.x + 45 + GAP + bubbleW > 1265;
    let bubbleX, tailTipX;
    if (goLeft) {
      bubbleX = customer.x - 45 - GAP - bubbleW;
      tailTipX = bubbleX + bubbleW;
    } else {
      bubbleX = customer.x + 45 + GAP;
      tailTipX = bubbleX;
    }
    // Clamp horizontally
    bubbleX = Phaser.Math.Clamp(bubbleX, 4, 1280 - bubbleW - 4);

    // Vertical: center of bubble aligns with customer body center (~y-10)
    let bubbleY = customer.y - 10 - bubbleH / 2;
    // Make sure bubble stays below HUD (74px)
    if (bubbleY < 76) bubbleY = 76;
    // Make sure it doesn't go below kitchen counter area (y~215)
    if (bubbleY + bubbleH > 215) bubbleY = 215 - bubbleH;

    const bubbleGfx = this.add.graphics().setDepth(18);
    customer.orderBubbleGfx = bubbleGfx;

    // Bubble shadow
    bubbleGfx.fillStyle(0x000000, 0.25);
    bubbleGfx.fillRoundedRect(bubbleX + 3, bubbleY + 3, bubbleW, bubbleH, 12);

    // Bubble body - cream white
    bubbleGfx.fillStyle(0xFFFAF0, 0.97);
    bubbleGfx.fillRoundedRect(bubbleX, bubbleY, bubbleW, bubbleH, 12);

    // Bubble border
    bubbleGfx.lineStyle(2.5, 0xFF6B35, 1);
    bubbleGfx.strokeRoundedRect(bubbleX, bubbleY, bubbleW, bubbleH, 12);

    // Inner highlight
    bubbleGfx.fillStyle(0xFFFFFF, 0.35);
    bubbleGfx.fillRoundedRect(bubbleX + 4, bubbleY + 4, bubbleW - 8, 14, 8);

    // Arrow/tail pointing to the customer
    const tailMidY = bubbleY + bubbleH / 2;
    if (goLeft) {
      // Arrow points RIGHT (toward customer on the right)
      bubbleGfx.fillStyle(0xFFFAF0, 0.97);
      bubbleGfx.fillTriangle(
        tailTipX, tailMidY - 7,
        tailTipX, tailMidY + 7,
        tailTipX + 12, tailMidY
      );
      // Re-draw border on arrow
      bubbleGfx.lineStyle(2.5, 0xFF6B35, 1);
      bubbleGfx.strokeTriangle(
        tailTipX, tailMidY - 7,
        tailTipX, tailMidY + 7,
        tailTipX + 12, tailMidY
      );
    } else {
      // Arrow points LEFT (toward customer on the left)
      bubbleGfx.fillStyle(0xFFFAF0, 0.97);
      bubbleGfx.fillTriangle(
        tailTipX, tailMidY - 7,
        tailTipX, tailMidY + 7,
        tailTipX - 12, tailMidY
      );
      bubbleGfx.lineStyle(2.5, 0xFF6B35, 1);
      bubbleGfx.strokeTriangle(
        tailTipX, tailMidY - 7,
        tailTipX, tailMidY + 7,
        tailTipX - 12, tailMidY
      );
    }

    // Mini dish illustration inside bubble (left side of bubble)
    const dishGfx = this.add.graphics().setDepth(19);
    customer.dishPreviewGfx = dishGfx;
    DrawingUtils.drawNoodleBowl(dishGfx, bubbleX + 30, bubbleY + bubbleH / 2 + 6, 0.42, customer.dish.primaryColor, false);

    // Dish name text (right of dish icon)
    const dishNameText = this.add.text(bubbleX + 62, bubbleY + 20, customer.dish.name, {
      fontFamily: 'Quicksand',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#AA2200',
      wordWrap: { width: 62 },
      lineSpacing: 1
    }).setOrigin(0, 0).setDepth(20);
    customer.orderText = dishNameText;

    // Spice level indicator
    const spiceDots = this.add.graphics().setDepth(20);
    const dotsStartX = bubbleX + 62;
    const dotsY = bubbleY + bubbleH - 16;
    for (let s = 0; s < customer.dish.spiceLevel; s++) {
      spiceDots.fillStyle(0xFF2200, 1);
      spiceDots.fillCircle(dotsStartX + s * 10, dotsY, 4);
      spiceDots.lineStyle(1, 0x880000, 0.6);
      spiceDots.strokeCircle(dotsStartX + s * 10, dotsY, 4);
    }
    // Spice label
    const spiceLabel = this.add.text(dotsStartX - 2, dotsY - 8, 'ĐỘ CAY:', {
      fontFamily: 'Quicksand',
      fontSize: '8px',
      color: '#CC4400'
    }).setDepth(20);
    customer.spiceDots = spiceDots;
    customer.spiceLabel = spiceLabel;

    // Pop-in animation
    const allBubbleParts = [bubbleGfx, dishGfx, dishNameText, spiceDots, spiceLabel];
    allBubbleParts.forEach(p => p.setAlpha(0).setScale(0.7));
    this.tweens.add({
      targets: allBubbleParts,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 280,
      ease: 'Back.easeOut'
    });

    // Make bubble clickable for serving
    const hitArea = this.add.rectangle(bubbleX + bubbleW / 2, bubbleY + bubbleH / 2, bubbleW, bubbleH, 0x000000, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(21);
    customer.hitArea = hitArea;

    hitArea.on('pointerover', () => {
      const matchPot = this.pots.find(p => p.state === CookingState.READY && p.dish.id === customer.dishId);
      if (matchPot) {
        bubbleGfx.setAlpha(0.85);
      }
    });

    hitArea.on('pointerout', () => {
      bubbleGfx.setAlpha(1);
    });

    hitArea.on('pointerdown', () => {
      const matchPot = this.pots.find(p => p.state === CookingState.READY && p.dish.id === customer.dishId);
      if (matchPot && customer.state === CustomerState.WAITING) {
        this._serveDishToCustomer(customer);
      }
    });
  }

  _startCustomerTimer(customer) {
    customer._timerEvent = this.time.addEvent({
      delay: 100,
      callback: () => this._tickCustomerTimer(customer),
      callbackScope: this,
      loop: true
    });
  }

  _tickCustomerTimer(customer) {
    if (customer.state !== CustomerState.WAITING || this.isPaused) return;

    customer.waitTimeLeft -= 100;
    customer.patience = customer.waitTimeLeft / customer.waitTimeTotal;

    // Update mood
    const p = customer.patience;
    let newMood = 'happy';
    if (p < GAME_CONFIG.customerPatience.impatient) newMood = 'angry';
    else if (p < GAME_CONFIG.customerPatience.neutral) newMood = 'impatient';
    else if (p < GAME_CONFIG.customerPatience.happy) newMood = 'neutral';

    if (newMood !== customer.mood) {
      customer.mood = newMood;
      this._redrawCustomer(customer);
    }

    // Update wait bar
    if (customer.waitBarGfx) {
      customer.waitBarGfx.clear();
      const barColor = p > 0.6 ? 0x4CAF50 : p > 0.3 ? 0xFF9800 : 0xF44336;
      customer.waitBarGfx.fillStyle(barColor, 1);
      customer.waitBarGfx.fillRoundedRect(-30, -62, 60 * p, 8, 4);
    }

    // Customer leaves
    if (customer.waitTimeLeft <= 0) {
      this._customerLeaves(customer);
    }
  }

  _redrawCustomer(customer) {
    if (!customer.gfx) return;
    customer.gfx.clear();
    DrawingUtils.drawCustomer(customer.gfx, 0, 0, customer.type, customer.mood, 0.8);
  }

  _customerLeaves(customer) {
    if (customer.state === CustomerState.LEAVING || customer.state === CustomerState.SERVED) return;
    customer.state = CustomerState.LEAVING;
    if (customer._timerEvent) customer._timerEvent.remove();

    this.moneySystem.recordLostCustomer();
    this.audio.play('customer_leave');
    this._showFeedback(customer.x, customer.y - 70, 'Khách đã rời đi! 😤', 0xF44336);
    this._freeSeat(customer);

    // Animate leaving
    if (customer.container) {
      this.tweens.add({
        targets: customer.container,
        x: -80,
        alpha: 0,
        duration: 700,
        ease: 'Power2.easeIn',
        onComplete: () => this._destroyCustomer(customer)
      });
    }

    this._cleanupBubble(customer);
    this._updateServedCounter();
  }


  _freeSeat(customer) {
    this._seatOccupied[customer.seatIndex] = false;
  }

  _destroyCustomer(customer) {
    if (customer.container) {
      customer.container.destroy();
      customer.container = null;
    }
    const idx = this.customers.indexOf(customer);
    if (idx !== -1) this.customers.splice(idx, 1);
  }

  _cleanupBubble(customer) {
    if (customer.orderBubbleGfx) { customer.orderBubbleGfx.destroy(); customer.orderBubbleGfx = null; }
    if (customer.dishPreviewGfx) { customer.dishPreviewGfx.destroy(); customer.dishPreviewGfx = null; }
    if (customer.orderText) { customer.orderText.destroy(); customer.orderText = null; }
    if (customer.spiceDots) { customer.spiceDots.destroy(); customer.spiceDots = null; }
    if (customer.spiceLabel) { customer.spiceLabel.destroy(); customer.spiceLabel = null; }
    if (customer.hitArea) { customer.hitArea.destroy(); customer.hitArea = null; }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // INGREDIENT & COOKING
  // ──────────────────────────────────────────────────────────────────────────

  _pickIngredient(ingId, fromX, fromY) {
    if (this.selectedIngredients.length >= 8) {
      this._showFeedback(fromX, fromY - 20, 'Đã đủ nguyên liệu!', 0xFF9800);
      return;
    }
    this.selectedIngredients.push(ingId);
    this.audio.play('pickup');

    const flyGfx = this.add.graphics().setDepth(35);
    DrawingUtils.drawIngredientIcon(flyGfx, fromX, fromY, ingId, 0.7);

    const targetX = 620 + (this.selectedIngredients.length - 1) % 5 * 54;
    const targetY = 285;

    this.tweens.add({
      targets: flyGfx,
      x: targetX - fromX,
      y: targetY - fromY,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 400,
      ease: 'Power2.easeOut',
      onComplete: () => {
        flyGfx.destroy();
        this._updatePrepBoard();
        this._checkCanCook();
      }
    });

    this._updateRecipeHint();
    this.prepState = CookingState.COLLECTING;
  }

  _updatePrepBoard() {
    this._selectedIngTexts.forEach(t => t.destroy());
    this._selectedIngTexts = [];
    this._selectedIngGfx.clear();

    this.selectedIngredients.forEach((ingId, i) => {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const x = 625 + col * 52;
      const y = 270 + row * 45;

      this._selectedIngGfx.fillStyle(0x2D1500, 0.8);
      this._selectedIngGfx.fillRoundedRect(x - 20, y - 20, 40, 40, 6);
      this._selectedIngGfx.lineStyle(1, 0xFF6B35, 0.5);
      this._selectedIngGfx.strokeRoundedRect(x - 20, y - 20, 40, 40, 6);
      DrawingUtils.drawIngredientIcon(this._selectedIngGfx, x, y, ingId, 0.5);

      const ing = INGREDIENTS[ingId];
      const label = this.add.text(x, y + 22, ing ? ing.name : ingId, { fontFamily: 'Quicksand', fontSize: '8px', color: '#FFB347' }).setOrigin(0.5).setDepth(9);
      this._selectedIngTexts.push(label);
    });
  }

  _checkCanCook() {
    const hasIngredients = this.selectedIngredients.length >= 2;
    const hasFreePot = this.pots.some(p => p.state === CookingState.IDLE);
    this._drawCookButton(hasIngredients && hasFreePot);
  }

  _clearIngredients() {
    this.selectedIngredients = [];
    this._selectedIngGfx.clear();
    this._selectedIngTexts.forEach(t => t.destroy());
    this._selectedIngTexts = [];
    this.prepState = CookingState.IDLE;
    this._drawCookButton(false);
    this._updateRecipeHint();
  }

  _onCookPressed() {
    if (this.isPaused || this.gameOver) return;
    
    if (this.selectedIngredients.length < 2) {
      this._showFeedback(750, 350, 'Cần ít nhất 2 nguyên liệu!', 0xFF9800);
      return;
    }

    const pot = this.pots.find(p => p.state === CookingState.IDLE);
    if (!pot) {
      this._showFeedback(750, 350, 'Hết nồi trống!', 0xFF9800);
      return;
    }

    const matchedDish = this._matchRecipe(this.selectedIngredients);
    if (!matchedDish) {
      this._showFeedback(750, 350, 'Công thức không hợp lệ!', 0xF44336);
      this.audio.play('wrong_dish');
      return;
    }

    pot.state = CookingState.COOKING;
    pot.dish = matchedDish;
    pot.progress = 0;
    pot.timer = matchedDish.cookingTime;
    
    this.audio.play('cook_start');
    this._clearIngredients();

    this._showFeedback(pot.x, 280, 'Đang nấu...', 0xFF6B35);

    const cookingInterval = 100;
    pot._cookingEvent = this.time.addEvent({
      delay: cookingInterval,
      callback: () => {
        if (this.isPaused) return;
        pot.progress += cookingInterval;
        const pct = Math.min(pot.progress / pot.timer, 1);
        this._updateCookingBar(pot, pct);
        this._redrawPot(pot, pct);
        if (pct >= 1) {
          pot._cookingEvent.remove();
          this._onCookingComplete(pot);
        }
      },
      loop: true
    });
    
    this._checkCanCook();
  }

  _matchRecipe(selectedIngredients) {
    const available = this.levelData.availableDishes;
    let bestMatch = null;
    let bestScore = 0;

    for (const dishId of available) {
      const dish = DISHES[dishId];
      if (!dish) continue;

      const required = dish.requiredIngredients;
      let hasAll = true;
      for (const req of required) {
        if (!selectedIngredients.includes(req)) {
          hasAll = false;
          break;
        }
      }
      if (hasAll) {
        let score = 0;
        for (const ing of selectedIngredients) {
          if (required.includes(ing) || (dish.optionalIngredients && dish.optionalIngredients.includes(ing))) {
            score++;
          }
        }
        if (score > bestScore) {
          bestScore = score;
          bestMatch = dish;
        }
      }
    }
    return bestMatch;
  }

  _updateCookingBar(pot, progress) {
    pot.progressBg.clear();
    pot.progressBg.fillStyle(0x1A0800, 0.9);
    pot.progressBg.fillRoundedRect(pot.x - 55, 420, 110, 16, 6);
    pot.progressBg.lineStyle(1, 0x555555, 1);
    pot.progressBg.strokeRoundedRect(pot.x - 55, 420, 110, 16, 6);

    pot.progressFill.clear();
    const barColor = progress < 0.5 ? 0xFF6B35 : progress < 0.8 ? 0xFFD700 : 0x4CAF50;
    pot.progressFill.fillStyle(barColor, 1);
    pot.progressFill.fillRoundedRect(pot.x - 53, 422, Math.max(2, 106 * progress), 12, 5);

    const pct = Math.round(progress * 100);
    pot.progressText.setText(pct + '%');
  }

  _redrawPot(pot, progress) {
    pot.potGfx.clear();
    DrawingUtils.drawCookingPot(pot.potGfx, pot.x, 305, 0.9, progress);

    pot.stoveGfx.clear();
    DrawingUtils.drawStove(pot.stoveGfx, pot.x, 340, 1.0, true);
    DrawingUtils.drawSteam(pot.stoveGfx, pot.x, 268, progress);
  }

  _onCookingComplete(pot) {
    pot.state = CookingState.READY;
    this.audio.play('cook_done');

    pot.progressText.setText('SẴN SÀNG');
    pot.progressFill.clear();
    pot.progressFill.fillStyle(0x4CAF50, 1);
    pot.progressFill.fillRoundedRect(pot.x - 53, 422, 106, 12, 5);

    pot.dishGfx.clear();
    DrawingUtils.drawNoodleBowl(pot.dishGfx, pot.x, 310, 0.7, pot.dish.primaryColor, true);

    pot.dishText.setText(pot.dish.name).setVisible(true);
    pot.discardBtn.setVisible(true);

    this._showFeedback(pot.x, 280, '✓ Xong!', 0x4CAF50);
    this._checkCanCook();
    
    pot.stoveGfx.clear();
    DrawingUtils.drawStove(pot.stoveGfx, pot.x, 340, 1.0, true);
  }

  _clearPot(pot) {
    pot.dishGfx.clear();
    pot.dishText.setVisible(false);
    pot.discardBtn.setVisible(false);
    
    if (pot._cookingEvent) pot._cookingEvent.remove();
    
    pot.state = CookingState.IDLE;
    pot.dish = null;
    
    pot.progressBg.clear();
    pot.progressFill.clear();
    pot.progressText.setText('');
    
    pot.potGfx.clear();
    DrawingUtils.drawCookingPot(pot.potGfx, pot.x, 305, 0.9, 0);
    pot.stoveGfx.clear();
    DrawingUtils.drawStove(pot.stoveGfx, pot.x, 340, 1.0, false);
    
    this._checkCanCook();
  }

  _serveDishToCustomer(customer) {
    const pot = this.pots.find(p => p.state === CookingState.READY && p.dish.id === customer.dishId);
    if (!pot) return;

    this.audio.play('serve');

    const maxWait = customer.waitTimeTotal;
    const waitUsed = maxWait - customer.waitTimeLeft;
    const waitPct = waitUsed / maxWait;

    let multiplier = 0;
    for (const rule of GAME_CONFIG.moneyMultipliers) {
      if (waitPct <= rule.maxWait) {
        multiplier = rule.multiplier;
        break;
      }
    }

    const earnings = Math.floor(pot.dish.price * multiplier);
    this.moneySystem.addMoney(earnings);

    const serveFlyGfx = this.add.graphics().setDepth(100);
    DrawingUtils.drawNoodleBowl(serveFlyGfx, 0, 0, 0.5, pot.dish.primaryColor, true);
    serveFlyGfx.setPosition(pot.x, pot.y);

    this.tweens.add({
      targets: serveFlyGfx,
      x: customer.x,
      y: customer.y - 40,
      duration: 300,
      ease: 'Power2.easeOut',
      onComplete: () => {
        serveFlyGfx.destroy();
        this._showMoneyPopup(customer.x, customer.y - 80, earnings);
      }
    });

    customer.state = CustomerState.SERVED;
    if (customer._timerEvent) customer._timerEvent.remove();
    this._cleanupBubble(customer);
    this._freeSeat(customer);
    this._updateHUD();

    customer.gfx.clear();
    DrawingUtils.drawCustomer(customer.gfx, 0, 0, customer.type, 'happy', 0.8);

    this.tweens.add({
      targets: customer.container,
      y: customer.container.y - 20,
      duration: 200,
      yoyo: true,
      repeat: 1
    });

    this.time.delayedCall(800, () => {
      if (!customer.container) return;
      customer.state = CustomerState.LEAVING;
      this.tweens.add({
        targets: customer.container,
        x: 1350,
        alpha: 0,
        duration: 1000,
        ease: 'Power1.easeIn',
        onComplete: () => this._destroyCustomer(customer)
      });
    });

    this._clearPot(pot);
    this._updateServedCounter();
  }

  _updateRecipeHint() {
    this._recipeGfx.clear();
    this._recipeText.setText('');

    const waitingCustomers = this.customers.filter(c => c.state === CustomerState.WAITING);
    if (waitingCustomers.length === 0) return;

    const ordersText = waitingCustomers.slice(0, 3).map(c => '• ' + c.dish.name).join('\n');

    this._recipeGfx.fillStyle(0x0A0300, 0.7);
    this._recipeGfx.fillRoundedRect(1050, 230, 215, 90, 8);
    this._recipeGfx.lineStyle(1, 0xFF6B35, 0.3);
    this._recipeGfx.strokeRoundedRect(1050, 230, 215, 90, 8);

    this._recipeText.setText('📋 ĐƠN HÀNG:\n' + ordersText).setPosition(1060, 240).setDepth(9);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HUD & TIMER
  // ──────────────────────────────────────────────────────────────────────────

  _onSecondTick() {
    if (this.isPaused || this.gameOver) return;

    this.timeLeft--;
    this._updateHUD();

    // Spawn customer
    const elapsed = this.levelData.duration - this.timeLeft;
    if (this.timeLeft > 5 && !this.tutorialActive) {
      const timeSinceLast = elapsed * 1000 - this.lastSpawnTime;
      if (timeSinceLast >= this.spawnCooldown) {
        this.lastSpawnTime = elapsed * 1000;
        this._spawnCustomerNow();
      }
    }

    // Check end conditions
    if (this.timeLeft <= 0) {
      this._endGame();
    }

    // Check if target reached (optional early win condition — keep playing for more stars)
    // We don't end early to allow earning more stars
  }

  _updateHUD() {
    const money = this.moneySystem.getMoney();
    const target = this.levelData.targetMoney;

    this._moneyText.setText(`${money.toLocaleString()}đ / ${target.toLocaleString()}đ`);

    // Timer display
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
    this._timerText.setText(timeStr);
    this._timerText.setColor(this.timeLeft < 30 ? '#FF4444' : this.timeLeft < 60 ? '#FF9800' : '#6699FF');

    // Served counter
    this._servedText.setText(this.moneySystem.customersServed.toString());

    // Goal progress bar
    this._goalFill.clear();
    const pct = Math.min(money / target, 1);
    const barW = this.scale.width * pct;
    this._goalFill.fillStyle(pct >= 1 ? 0x4CAF50 : 0xFF6B35, 1);
    this._goalFill.fillRect(0, 64, barW, 6);

    // Timer flash
    if (this.timeLeft <= 30 && this.timeLeft % 2 === 0) {
      this._timerText.setAlpha(0.5);
    } else {
      this._timerText.setAlpha(1);
    }
  }

  _updateServedCounter() {
    this._servedText.setText(this.moneySystem.customersServed.toString());
    this._updateRecipeHint();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // FEEDBACK & EFFECTS
  // ──────────────────────────────────────────────────────────────────────────

  _showFeedback(x, y, message, color) {
    const text = this.add.text(x, y, message, {
      fontFamily: 'Quicksand',
      fontSize: '16px',
      fontStyle: 'bold',
      color: `#${color.toString(16).padStart(6, '0')}`,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(80);

    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 1500,
      ease: 'Power2.easeOut',
      onComplete: () => text.destroy()
    });
  }

  _showMoneyPopup(x, y, amount) {
    // Coin graphic
    const coinGfx = this.add.graphics().setDepth(81);
    DrawingUtils.drawMoneyCoin(coinGfx, x, y, 0.8);

    const amountText = this.add.text(x + 20, y, `+${amount}đ`, {
      fontFamily: 'Quicksand',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#FFD700',
      stroke: '#CC8800',
      strokeThickness: 2
    }).setOrigin(0, 0.5).setDepth(81);

    this.tweens.add({
      targets: [coinGfx, amountText],
      y: y - 70,
      alpha: 0,
      duration: 1600,
      ease: 'Power2.easeOut',
      onComplete: () => { coinGfx.destroy(); amountText.destroy(); }
    });

    // Money counter animation
    this.tweens.add({
      targets: this._moneyText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      yoyo: true
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // PAUSE
  // ──────────────────────────────────────────────────────────────────────────

  _togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this._showPauseOverlay();
    } else {
      this._hidePauseOverlay();
    }
  }

  _showPauseOverlay() {
    const W = this.scale.width;
    const H = this.scale.height;

    this._pauseOverlay = this.add.graphics().setDepth(90);
    this._pauseOverlay.fillStyle(0x000000, 0.7);
    this._pauseOverlay.fillRect(0, 0, W, H);

    this._pausePanel = this.add.container(W / 2, H / 2).setDepth(91);

    const panelGfx = this.add.graphics();
    panelGfx.fillStyle(0x2D1000, 1);
    panelGfx.fillRoundedRect(-200, -150, 400, 300, 20);
    panelGfx.lineStyle(3, 0xFF6B35, 0.8);
    panelGfx.strokeRoundedRect(-200, -150, 400, 300, 20);
    this._pausePanel.add(panelGfx);

    const pauseTitle = this.add.text(0, -100, '⏸ TẠM DỪNG', {
      fontFamily: 'Georgia, serif',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#FF6B35'
    }).setOrigin(0.5);
    this._pausePanel.add(pauseTitle);

    const btns = [
      { label: '▶ TIẾP TỤC', callback: () => this._togglePause(), color: 0x4CAF50 },
      { label: '📋 CHỌN MÀN', callback: () => this._goToLevelSelect(), color: 0x9C27B0 },
      { label: '🏠 MENU CHÍNH', callback: () => this._goToMainMenu(), color: 0x607D8B }
    ];

    btns.forEach((btn, i) => {
      const by = -20 + i * 70;
      const btnGfx = this.add.graphics();
      btnGfx.fillStyle(btn.color, 1);
      btnGfx.fillRoundedRect(-120, by - 22, 240, 44, 10);
      btnGfx.lineStyle(2, 0xFFFFFF, 0.2);
      btnGfx.strokeRoundedRect(-120, by - 22, 240, 44, 10);
      this._pausePanel.add(btnGfx);

      const btnText = this.add.text(0, by, btn.label, {
        fontFamily: 'Quicksand',
        fontSize: '18px',
        color: '#FFFFFF'
      }).setOrigin(0.5);
      this._pausePanel.add(btnText);

      const hitArea = this.add.rectangle(W / 2, H / 2 + by, 240, 44, 0x000000, 0)
        .setInteractive({ useHandCursor: true })
        .setDepth(92);
      hitArea.on('pointerdown', btn.callback);
      this._pausePanel.hitAreas = this._pausePanel.hitAreas || [];
      this._pausePanel.hitAreas.push(hitArea);
    });
  }

  _hidePauseOverlay() {
    if (this._pauseOverlay) { this._pauseOverlay.destroy(); this._pauseOverlay = null; }
    if (this._pausePanel) {
      if (this._pausePanel.hitAreas) {
        this._pausePanel.hitAreas.forEach(h => h.destroy());
      }
      this._pausePanel.destroy();
      this._pausePanel = null;
    }
  }

  _goToLevelSelect() {
    this._cleanup();
    this.scene.start('LevelSelectScene');
  }

  _goToMainMenu() {
    this._cleanup();
    this.scene.start('MainMenuScene');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TUTORIAL
  // ──────────────────────────────────────────────────────────────────────────

  _startTutorial() {
    this._tutorialSteps = [
      {
        text: '👋 Chào mừng đến Quán Mì Cay!\nKhách sẽ ngồi xuống và đặt món.',
        highlight: null,
        nextDelay: 3500
      },
      {
        text: '📦 Click vào hộp nguyên liệu\nở phía dưới để lấy nguyên liệu.',
        highlight: { x: 640, y: 500, w: 800, h: 80 },
        nextDelay: 3500
      },
      {
        text: '🍲 Sau khi lấy đủ nguyên liệu,\nấn nút "NẤU MÌ" để nấu!',
        highlight: { x: 560, y: 380, w: 180, h: 50 },
        nextDelay: 3500
      },
      {
        text: '🍜 Khi mì chín, ấn "GIAO MÓN"\nhoặc click vào khách để phục vụ!',
        highlight: { x: 870, y: 350, w: 220, h: 160 },
        nextDelay: 3500
      },
      {
        text: '💰 Phục vụ nhanh = nhận nhiều tiền hơn!\nChúc may mắn! 🌶',
        highlight: null,
        nextDelay: 3000
      }
    ];

    this._showTutorialStep(0);
  }

  _showTutorialStep(stepIdx) {
    if (stepIdx >= this._tutorialSteps.length) {
      this._endTutorial();
      return;
    }

    const step = this._tutorialSteps[stepIdx];
    const W = this.scale.width;
    const H = this.scale.height;

    if (this._tutorialOverlay) this._tutorialOverlay.destroy();
    if (this._tutorialBox) this._tutorialBox.destroy();
    if (this._tutorialHighlight) this._tutorialHighlight.destroy();

    this._tutorialOverlay = this.add.graphics().setDepth(100);
    this._tutorialOverlay.fillStyle(0x000000, 0.6);
    this._tutorialOverlay.fillRect(0, 0, W, H);

    // Highlight area
    if (step.highlight) {
      const hl = step.highlight;
      this._tutorialHighlight = this.add.graphics().setDepth(101);
      this._tutorialHighlight.lineStyle(3, 0xFFD700, 1);
      this._tutorialHighlight.strokeRoundedRect(hl.x - hl.w / 2, hl.y - hl.h / 2, hl.w, hl.h, 8);
      // Clear overlay in highlight area (show game underneath)
      this._tutorialHighlight.fillStyle(0xFFFFFF, 0.1);
      this._tutorialHighlight.fillRoundedRect(hl.x - hl.w / 2, hl.y - hl.h / 2, hl.w, hl.h, 8);
    }

    // Tutorial box
    this._tutorialBox = this.add.container(W / 2, H / 2).setDepth(102);
    const boxGfx = this.add.graphics();
    boxGfx.fillStyle(0x1A0500, 0.97);
    boxGfx.fillRoundedRect(-250, -80, 500, 160, 16);
    boxGfx.lineStyle(3, 0xFF6B35, 1);
    boxGfx.strokeRoundedRect(-250, -80, 500, 160, 16);
    boxGfx.fillStyle(0xFF6B35, 0.15);
    boxGfx.fillRoundedRect(-246, -76, 492, 60, 12);
    this._tutorialBox.add(boxGfx);

    const stepText = this.add.text(0, -20, step.text, {
      fontFamily: 'Quicksand',
      fontSize: '18px',
      color: '#FFE4B5',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5);
    this._tutorialBox.add(stepText);

    const progressText = this.add.text(0, 50, `${stepIdx + 1} / ${this._tutorialSteps.length}`, {
      fontFamily: 'Quicksand',
      fontSize: '13px',
      color: 'rgba(255,107,53,0.7)'
    }).setOrigin(0.5);
    this._tutorialBox.add(progressText);

    const skipText = this.add.text(220, 50, 'BỎ QUA ▶', {
      fontFamily: 'Quicksand',
      fontSize: '13px',
      color: '#FF9800'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    skipText.on('pointerdown', () => this._endTutorial());
    this._tutorialBox.add(skipText);

    // Auto-advance
    this.time.delayedCall(step.nextDelay, () => {
      this._showTutorialStep(stepIdx + 1);
    });
  }

  _endTutorial() {
    this.tutorialActive = false;
    if (this._tutorialOverlay) { this._tutorialOverlay.destroy(); this._tutorialOverlay = null; }
    if (this._tutorialBox) { this._tutorialBox.destroy(); this._tutorialBox = null; }
    if (this._tutorialHighlight) { this._tutorialHighlight.destroy(); this._tutorialHighlight = null; }

    this._spawnCustomerNow();
    this.lastSpawnTime = 0;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // GAME END
  // ──────────────────────────────────────────────────────────────────────────

  _endGame() {
    if (this.gameOver) return;
    this.gameOver = true;
    if (this._gameTimer) this._gameTimer.remove();
    this.pots.forEach(p => { if (p._cookingEvent) p._cookingEvent.remove(); });

    const stats = this.moneySystem.getStats();
    const stars = this.moneySystem.calculateStars(stats.money, this.levelData.starThresholds);
    const success = stars >= 1;

    if (success) {
      saveSystem.completeLevel(this.levelId, stars, stats.money);
    }

    this.audio.play(success ? 'level_complete' : 'level_fail');

    this.time.delayedCall(800, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.scene.start('ResultScene', {
          levelId: this.levelId,
          success,
          stars,
          money: stats.money,
          target: this.levelData.targetMoney,
          served: stats.served,
          lost: stats.lost,
          satisfactionRate: stats.satisfactionRate,
          levelData: this.levelData
        });
      });
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RECIPE BOOK MODAL
  // ──────────────────────────────────────────────────────────────────────────

  _showRecipeBookModal() {
    if (this._recipeModalOpen) return;
    this._recipeModalOpen = true;

    const W = this.scale.width;
    const H = this.scale.height;

    // Overlay
    const overlay = this.add.graphics().setDepth(95);
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, W, H);
    this._recipeModalOverlay = overlay;

    // Modal container
    const modal = this.add.container(W / 2, H / 2).setDepth(96);
    this._recipeModal = modal;

    const mw = 680;
    const mh = 500;

    // Background book parchment
    const bgGfx = this.add.graphics();
    bgGfx.fillStyle(0x2D1405, 1);
    bgGfx.fillRoundedRect(-mw / 2, -mh / 2, mw, mh, 16);
    bgGfx.lineStyle(3, 0xFF6B35, 1);
    bgGfx.strokeRoundedRect(-mw / 2, -mh / 2, mw, mh, 16);
    bgGfx.fillStyle(0x3E1C07, 0.7);
    bgGfx.fillRoundedRect(-mw / 2 + 10, -mh / 2 + 10, mw - 20, 50, 10);
    modal.add(bgGfx);

    // Title
    const titleText = this.add.text(0, -mh / 2 + 35, '📖 SỔ TAY CÔNG THỨC MÌ CAY', {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    modal.add(titleText);

    // Close button
    const closeBtn = this.add.text(mw / 2 - 30, -mh / 2 + 35, '✕', {
      fontFamily: 'Quicksand',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#FF6B6B'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this._closeRecipeBookModal());
    modal.add(closeBtn);

    // List dishes for this level
    const availDishes = this.levelData.availableDishes;
    const cardH = 92;
    const startY = -mh / 2 + 80;

    availDishes.forEach((dishId, i) => {
      const dish = DISHES[dishId];
      if (!dish) return;

      const dy = startY + i * (cardH + 8);

      // Card bg
      const cardGfx = this.add.graphics();
      cardGfx.fillStyle(0x1F0B02, 0.85);
      cardGfx.fillRoundedRect(-mw / 2 + 20, dy, mw - 40, cardH, 8);
      cardGfx.lineStyle(1, 0x8B4513, 0.7);
      cardGfx.strokeRoundedRect(-mw / 2 + 20, dy, mw - 40, cardH, 8);
      modal.add(cardGfx);

      // Dish preview
      const dishMiniGfx = this.add.graphics();
      DrawingUtils.drawNoodleBowl(dishMiniGfx, -mw / 2 + 65, dy + cardH / 2, 0.46, dish.primaryColor, false);
      modal.add(dishMiniGfx);

      // Dish name & price
      const nameText = this.add.text(-mw / 2 + 115, dy + 18, dish.name, {
        fontFamily: 'Quicksand',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#FFE4B5'
      });
      const priceText = this.add.text(-mw / 2 + 115, dy + 40, `Giá: ${dish.price}đ  |  Nấu: ${dish.cookingTime / 1000}s`, {
        fontFamily: 'Quicksand',
        fontSize: '12px',
        color: '#FFB347'
      });
      modal.add([nameText, priceText]);

      // Required ingredients list label
      const reqLabel = this.add.text(-mw / 2 + 115, dy + 62, 'Cần:', {
        fontFamily: 'Quicksand',
        fontSize: '11px',
        color: '#90EE90'
      });
      modal.add(reqLabel);

      // Ingredient icons
      const ingGfx = this.add.graphics();
      dish.requiredIngredients.forEach((ingId, idx) => {
        const ix = -mw / 2 + 160 + idx * 45;
        const iy = dy + 68;
        DrawingUtils.drawIngredientIcon(ingGfx, ix, iy, ingId, 0.38);

        const ingName = INGREDIENTS[ingId] ? INGREDIENTS[ingId].name : ingId;
        const ingText = this.add.text(ix, iy + 14, ingName, {
          fontFamily: 'Quicksand',
          fontSize: '9px',
          color: '#FFE4B5'
        }).setOrigin(0.5);
        modal.add(ingText);
      });
      modal.add(ingGfx);
    });

    // Animate modal pop in
    modal.setScale(0.85);
    modal.setAlpha(0);
    this.tweens.add({
      targets: modal,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
  }

  _closeRecipeBookModal() {
    if (this._recipeModal) {
      this._recipeModal.destroy();
      this._recipeModal = null;
    }
    if (this._recipeModalOverlay) {
      this._recipeModalOverlay.destroy();
      this._recipeModalOverlay = null;
    }
    this._recipeModalOpen = false;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // DEBUG MODE (Requirement 28)
  // ──────────────────────────────────────────────────────────────────────────

  _setupDebugMode() {
    this._debugActive = saveSystem.getSetting('debugMode') || GAME_CONFIG.DEBUG_MODE;

    // Toggle with key 'D'
    this.input.keyboard.on('keydown-D', () => {
      this._debugActive = !this._debugActive;
      saveSystem.setSetting('debugMode', this._debugActive);
      if (this._debugContainer) {
        this._debugContainer.setVisible(this._debugActive);
      }
      this._showFeedback(120, 100, this._debugActive ? 'Debug: ON' : 'Debug: OFF', 0x90EE90);
    });

    // Build debug HUD container
    this._debugContainer = this.add.container(10, 75).setDepth(150);
    const dbgBg = this.add.graphics();
    dbgBg.fillStyle(0x000000, 0.85);
    dbgBg.fillRoundedRect(0, 0, 220, 120, 8);
    dbgBg.lineStyle(1, 0x00FF00, 0.8);
    dbgBg.strokeRoundedRect(0, 0, 220, 120, 8);
    this._debugContainer.add(dbgBg);

    this._debugText = this.add.text(10, 8, '', {
      fontFamily: 'Consolas, monospace',
      fontSize: '11px',
      color: '#00FF00',
      lineSpacing: 3
    });
    this._debugContainer.add(this._debugText);
    this._debugContainer.setVisible(this._debugActive);
  }

  _updateDebugOverlay() {
    if (!this._debugActive || !this._debugText) return;

    const fps = Math.round(this.game.loop.actualFps);
    const activeCustomers = this.customers.filter(c => c.state === CustomerState.WAITING).length;
    const orders = this.customers
      .filter(c => c.state === CustomerState.WAITING)
      .map(c => c.dishId.replace('spicy_', ''))
      .join(', ');

    const text = [
      `[DEBUG MODE] (Press D to toggle)`,
      `FPS: ${fps}`,
      `Level: ${this.levelId} (${this.levelData.name})`,
      `Money: ${this.moneySystem.getMoney()}đ / ${this.levelData.targetMoney}đ`,
      `Customers: ${activeCustomers} waiting (${this.moneySystem.customersServed} served)`,
      `Orders: ${orders || 'None'}`,
      `Pots: ` + this.pots.map(p => `[${p.id+1}:${p.state}]`).join(' ')
    ].join('\n');

    this._debugText.setText(text);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // UPDATE LOOP
  // ──────────────────────────────────────────────────────────────────────────

  update(time, delta) {
    if (this.isPaused || this.gameOver) return;
    this._animTime += delta * 0.001;

    // Update debug info if enabled
    this._updateDebugOverlay();
  }

  _cleanup() {
    if (this._gameTimer) this._gameTimer.remove();
    this.pots.forEach(p => { if (p._cookingEvent) p._cookingEvent.remove(); });
    this.customers.forEach(c => {
      if (c._timerEvent) c._timerEvent.remove();
    });
    this._closeRecipeBookModal();
    this._hidePauseOverlay();
    this.isPaused = false;
  }

  shutdown() {
    this._cleanup();
  }
}

export default GameScene;

