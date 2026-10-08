const fs = require('fs');
let code = fs.readFileSync('src/scenes/GameScene.js', 'utf8');

// 1. Init vars
code = code.replace(
  /this\.cookingState = CookingState\.IDLE;\s*this\.cookingDish = null;\s*this\.cookingProgress = 0;\s*this\.cookingTimer = 0;\s*this\.completedDish = null;/g,
  'this.pots = [];\n    this.prepState = CookingState.IDLE;'
);

// 2. Build cooking station
let idx1 = code.indexOf('_buildCookingStation(W, H) {');
let idx2 = code.indexOf('_drawCookButton(active)');
if (idx1 !== -1 && idx2 !== -1) {
  const newBuildCookingStation = `_buildCookingStation(W, H) {
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

  `;
  code = code.substring(0, idx1) + newBuildCookingStation + code.substring(idx2);
}

// 3. Replace cooking methods (from _pickIngredient up to _updateHUD)
idx1 = code.indexOf('_pickIngredient(ingId, fromX, fromY)');
idx2 = code.indexOf('_updateHUD() {');
if (idx1 !== -1 && idx2 !== -1) {
  const newCookingMethods = `_pickIngredient(ingId, fromX, fromY) {
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
        this._showMoneyAnimation(customer.x, customer.y - 80, earnings);
      }
    });

    customer.state = CustomerState.SERVED;
    this._cleanupBubble(customer);
    
    if (customer.waitBarGfx) customer.waitBarGfx.clear();

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

    const ordersText = waitingCustomers.slice(0, 3).map(c => '• ' + c.dish.name).join('\\n');

    this._recipeGfx.fillStyle(0x0A0300, 0.7);
    this._recipeGfx.fillRoundedRect(1050, 230, 215, 90, 8);
    this._recipeGfx.lineStyle(1, 0xFF6B35, 0.3);
    this._recipeGfx.strokeRoundedRect(1050, 230, 215, 90, 8);

    this._recipeText.setText('📋 ĐƠN HÀNG:\\n' + ordersText).setPosition(1060, 240).setDepth(9);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HUD & TIMER
  // ──────────────────────────────────────────────────────────────────────────

  `;
  
  // Actually from `_pickIngredient` down to `_onSecondTick()` 
  let nextIdx = code.indexOf('_onSecondTick() {');
  if (nextIdx !== -1) {
    code = code.substring(0, idx1) + newCookingMethods + code.substring(nextIdx);
  }
}

// 4. Update pointer events in _showOrderBubble
code = code.replace(
  /hitArea\.on\('pointerdown', \(\) => \{\s*if \(this\.completedDish && customer\.state === CustomerState\.WAITING\) \{\s*this\._serveDishToCustomer\(customer\);\s*\}\s*\}\);/g,
  `hitArea.on('pointerdown', () => {
      const matchPot = this.pots.find(p => p.state === CookingState.READY && p.dish.id === customer.dishId);
      if (matchPot && customer.state === CustomerState.WAITING) {
        this._serveDishToCustomer(customer);
      }
    });`
);

code = code.replace(
  /hitArea\.on\('pointerover', \(\) => \{\s*if \(this\.completedDish\) \{\s*bubbleGfx\.setAlpha\(0\.85\);\s*\}\s*\}\);/g,
  `hitArea.on('pointerover', () => {
      const matchPot = this.pots.find(p => p.state === CookingState.READY && p.dish.id === customer.dishId);
      if (matchPot) {
        bubbleGfx.setAlpha(0.85);
      }
    });`
);

// 5. Cleanup
code = code.replace(
  /if \(this\._cookingEvent\) this\._cookingEvent\.remove\(\);/g,
  `this.pots.forEach(p => { if (p._cookingEvent) p._cookingEvent.remove(); });`
);

// 6. Debug overlay
code = code.replace(
  /`Cooking: \$\{this\.cookingState\}.*/g,
  '`Pots: ` + this.pots.map(p => `[${p.id+1}:${p.state}]`).join(\' \')'
);

fs.writeFileSync('src/scenes/GameScene.js', code, 'utf8');

