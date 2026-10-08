// src/utils/DrawingUtils.js
// Utility functions for drawing 2D game objects procedurally using Phaser Graphics

export class DrawingUtils {

  /**
   * Draw a rounded rectangle
   */
  static roundRect(graphics, x, y, w, h, r, fillColor, strokeColor, strokeWidth = 2) {
    graphics.fillStyle(fillColor, 1);
    graphics.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
    if (strokeColor !== undefined) {
      graphics.lineStyle(strokeWidth, strokeColor, 1);
      graphics.strokeRoundedRect(x - w / 2, y - h / 2, w, h, r);
    }
  }

  /**
   * Draw a bowl of noodles
   */
  static drawNoodleBowl(graphics, x, y, scale = 1, primaryColor = 0xFF4500, steaming = false) {
    const s = scale;

    // Bowl shadow
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillEllipse(x, y + 38 * s, 90 * s, 20 * s);

    // Bowl body
    graphics.fillStyle(0xFFF8F0, 1);
    graphics.fillEllipse(x, y + 10 * s, 85 * s, 30 * s); // rim

    graphics.fillStyle(0xF0E0D0, 1);
    graphics.fillEllipse(x, y + 15 * s, 80 * s, 28 * s); // inner rim

    // Soup surface
    graphics.fillStyle(primaryColor, 1);
    graphics.fillEllipse(x, y + 12 * s, 72 * s, 24 * s);

    // Bowl lower half
    graphics.fillStyle(0xFFF8F0, 1);
    graphics.fillRect(x - 40 * s, y + 10 * s, 80 * s, 25 * s);
    graphics.fillEllipse(x, y + 35 * s, 60 * s, 20 * s);

    // Decorative stripe on bowl
    graphics.fillStyle(0xFF6B35, 0.6);
    graphics.fillRect(x - 38 * s, y + 18 * s, 76 * s, 4 * s);

    // Noodles visible on top
    graphics.lineStyle(2 * s, 0xF5DEB3, 0.9);
    for (let i = 0; i < 5; i++) {
      const nx = x - 25 * s + i * 10 * s;
      graphics.strokeCircle(nx, y + 10 * s, 5 * s);
    }

    // Toppings (protein blob)
    graphics.fillStyle(primaryColor, 1);
    graphics.fillEllipse(x - 12 * s, y + 8 * s, 18 * s, 12 * s);
    graphics.fillStyle(primaryColor + 0x111111, 1);
    graphics.fillEllipse(x + 10 * s, y + 9 * s, 14 * s, 10 * s);

    // Green garnish
    graphics.fillStyle(0x32CD32, 1);
    graphics.fillEllipse(x + 5 * s, y + 6 * s, 10 * s, 7 * s);
    graphics.fillEllipse(x - 8 * s, y + 6 * s, 8 * s, 5 * s);

    // Steam if cooking
    if (steaming) {
      graphics.lineStyle(2 * s, 0xFFFFFF, 0.4);
      graphics.strokeCircle(x - 10 * s, y - 15 * s, 5 * s);
      graphics.strokeCircle(x, y - 20 * s, 6 * s);
      graphics.strokeCircle(x + 10 * s, y - 14 * s, 4 * s);
    }
  }

  /**
   * Draw an ingredient box / container
   */
  static drawIngredientBox(graphics, x, y, w, h, ingredientId, label) {
    // Box body
    graphics.fillStyle(0x3D2010, 1);
    graphics.fillRoundedRect(x, y, w, h, 10);

    // Box inner highlight
    graphics.fillStyle(0x4D3020, 1);
    graphics.fillRoundedRect(x + 4, y + 4, w - 8, h - 8, 8);

    // Top opening
    graphics.fillStyle(0x2D1505, 1);
    graphics.fillRoundedRect(x + 8, y + 8, w - 16, h * 0.4, 6);

    // Ingredient-specific illustration
    DrawingUtils.drawIngredientIcon(graphics, x + w / 2, y + h / 2, ingredientId, 0.7);

    // Label background
    graphics.fillStyle(0xFF6B35, 0.9);
    graphics.fillRoundedRect(x + 6, y + h - 22, w - 12, 18, 5);
  }

  /**
   * Draw a specific ingredient icon
   */
  static drawIngredientIcon(graphics, x, y, ingredientId, scale = 1) {
    const s = scale;
    switch (ingredientId) {
      case 'noodle':
        DrawingUtils._drawNoodle(graphics, x, y, s);
        break;
      case 'shrimp':
        DrawingUtils._drawShrimp(graphics, x, y, s);
        break;
      case 'squid':
        DrawingUtils._drawSquid(graphics, x, y, s);
        break;
      case 'fish':
        DrawingUtils._drawFish(graphics, x, y, s);
        break;
      case 'chicken':
        DrawingUtils._drawChicken(graphics, x, y, s);
        break;
      case 'beef':
        DrawingUtils._drawBeef(graphics, x, y, s);
        break;
      case 'vegetable':
        DrawingUtils._drawVegetable(graphics, x, y, s);
        break;
      case 'mushroom':
        DrawingUtils._drawMushroom(graphics, x, y, s);
        break;
      case 'sausage':
        DrawingUtils._drawSausage(graphics, x, y, s);
        break;
      case 'egg':
        DrawingUtils._drawEgg(graphics, x, y, s);
        break;
      case 'spice':
        DrawingUtils._drawSpice(graphics, x, y, s);
        break;
      case 'broth':
        DrawingUtils._drawBroth(graphics, x, y, s);
        break;
    }
  }

  static _drawNoodle(g, x, y, s) {
    g.lineStyle(3 * s, 0xF5DEB3, 1);
    g.strokeCircle(x - 6 * s, y, 8 * s);
    g.strokeCircle(x + 4 * s, y - 3 * s, 7 * s);
    g.strokeCircle(x + 2 * s, y + 5 * s, 6 * s);
    g.lineStyle(2 * s, 0xDEB887, 0.8);
    g.strokeCircle(x - 2 * s, y - 4 * s, 5 * s);
  }

  static _drawShrimp(g, x, y, s) {
    // Body curve
    g.fillStyle(0xFF8C69, 1);
    g.fillEllipse(x, y, 18 * s, 10 * s);
    g.fillStyle(0xFF6B6B, 1);
    g.fillEllipse(x - 2 * s, y - 3 * s, 12 * s, 7 * s);
    // Tail
    g.fillStyle(0xFF4444, 1);
    g.fillTriangle(x - 9 * s, y, x - 16 * s, y - 6 * s, x - 16 * s, y + 6 * s);
    // Antenna
    g.lineStyle(1 * s, 0xFF8C69, 1);
    g.strokeCircle(x + 7 * s, y - 5 * s, 3 * s);
  }

  static _drawSquid(g, x, y, s) {
    // Body
    g.fillStyle(0xE8E8E8, 1);
    g.fillEllipse(x, y - 2 * s, 14 * s, 20 * s);
    // Head
    g.fillStyle(0xD0D0D0, 1);
    g.fillEllipse(x, y - 8 * s, 16 * s, 12 * s);
    // Tentacles
    g.lineStyle(2 * s, 0xC0C0C0, 1);
    for (let i = -2; i <= 2; i++) {
      g.strokeRect(x + i * 3 * s, y + 5 * s, 2 * s, 8 * s);
    }
    // Eyes
    g.fillStyle(0x333333, 1);
    g.fillCircle(x - 3 * s, y - 9 * s, 2 * s);
    g.fillCircle(x + 3 * s, y - 9 * s, 2 * s);
  }

  static _drawFish(g, x, y, s) {
    // Body
    g.fillStyle(0xFFD700, 1);
    g.fillEllipse(x, y, 20 * s, 12 * s);
    // Tail
    g.fillStyle(0xFFA500, 1);
    g.fillTriangle(x + 10 * s, y, x + 18 * s, y - 7 * s, x + 18 * s, y + 7 * s);
    // Scales
    g.lineStyle(1 * s, 0xFFA500, 0.6);
    g.strokeCircle(x - 2 * s, y, 5 * s);
    g.strokeCircle(x + 3 * s, y - 2 * s, 4 * s);
    // Eye
    g.fillStyle(0x333333, 1);
    g.fillCircle(x - 7 * s, y - 1 * s, 2 * s);
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(x - 7.5 * s, y - 1.5 * s, 1 * s);
  }

  static _drawChicken(g, x, y, s) {
    // Drumstick bone
    g.fillStyle(0xF5F5DC, 1);
    g.fillRect(x + 4 * s, y - 4 * s, 4 * s, 14 * s);
    // Meat
    g.fillStyle(0xDEB887, 1);
    g.fillEllipse(x - 2 * s, y, 18 * s, 14 * s);
    g.fillStyle(0xCD853F, 1);
    g.fillEllipse(x - 4 * s, y - 2 * s, 12 * s, 9 * s);
    // Crispy top
    g.fillStyle(0xA0522D, 0.7);
    g.fillEllipse(x - 3 * s, y - 4 * s, 10 * s, 6 * s);
  }

  static _drawBeef(g, x, y, s) {
    // Meat slab
    g.fillStyle(0x8B0000, 1);
    g.fillRoundedRect(x - 10 * s, y - 6 * s, 20 * s, 12 * s, 4);
    // Marbling
    g.lineStyle(1 * s, 0xFF6B6B, 0.5);
    g.strokeRect(x - 6 * s, y - 2 * s, 4 * s, 4 * s);
    g.strokeRect(x + 2 * s, y - 4 * s, 3 * s, 3 * s);
    // Char marks
    g.lineStyle(2 * s, 0x330000, 0.8);
    g.strokeRect(x - 8 * s, y - 1 * s, 16 * s, 2 * s);
    g.strokeRect(x - 8 * s, y + 3 * s, 16 * s, 1 * s);
  }

  static _drawVegetable(g, x, y, s) {
    // Bok choy / leafy veggie
    g.fillStyle(0x32CD32, 1);
    g.fillEllipse(x - 5 * s, y - 5 * s, 10 * s, 14 * s);
    g.fillEllipse(x + 5 * s, y - 4 * s, 10 * s, 12 * s);
    g.fillStyle(0x228B22, 1);
    g.fillEllipse(x - 5 * s, y - 6 * s, 7 * s, 11 * s);
    g.fillEllipse(x + 5 * s, y - 5 * s, 7 * s, 9 * s);
    // Stem
    g.fillStyle(0x90EE90, 1);
    g.fillRect(x - 2 * s, y + 2 * s, 4 * s, 8 * s);
  }

  static _drawMushroom(g, x, y, s) {
    // Cap
    g.fillStyle(0x8B4513, 1);
    g.fillEllipse(x, y - 4 * s, 22 * s, 14 * s);
    g.fillStyle(0xA0522D, 1);
    g.fillEllipse(x, y - 6 * s, 18 * s, 10 * s);
    // Spots
    g.fillStyle(0xD2691E, 0.6);
    g.fillCircle(x - 5 * s, y - 7 * s, 3 * s);
    g.fillCircle(x + 5 * s, y - 6 * s, 2 * s);
    // Stem
    g.fillStyle(0xF5DEB3, 1);
    g.fillRect(x - 4 * s, y + 2 * s, 8 * s, 8 * s);
    g.fillStyle(0xDEB887, 1);
    g.fillRect(x - 3 * s, y + 3 * s, 6 * s, 6 * s);
  }

  static _drawSausage(g, x, y, s) {
    // Body
    g.fillStyle(0xCC4400, 1);
    g.fillRoundedRect(x - 12 * s, y - 5 * s, 24 * s, 10 * s, 5);
    g.fillStyle(0xFF5500, 1);
    g.fillRoundedRect(x - 10 * s, y - 4 * s, 20 * s, 5 * s, 3);
    // Char marks
    g.lineStyle(2 * s, 0x660000, 1);
    for (let i = -2; i <= 2; i++) {
      g.strokeRect(x + i * 5 * s, y - 4 * s, 2 * s, 8 * s);
    }
    // Ends
    g.fillStyle(0xAA3300, 1);
    g.fillCircle(x - 11 * s, y, 5 * s);
    g.fillCircle(x + 11 * s, y, 5 * s);
  }

  static _drawEgg(g, x, y, s) {
    // White
    g.fillStyle(0xFFFAF0, 1);
    g.fillEllipse(x, y + 2 * s, 16 * s, 18 * s);
    // Yolk
    g.fillStyle(0xFFD700, 1);
    g.fillCircle(x, y, 7 * s);
    g.fillStyle(0xFFA500, 0.5);
    g.fillCircle(x - 2 * s, y - 2 * s, 3 * s);
    // Shine
    g.fillStyle(0xFFFFFF, 0.7);
    g.fillCircle(x - 2 * s, y - 3 * s, 2 * s);
  }

  static _drawSpice(g, x, y, s) {
    // Chili pepper
    g.fillStyle(0xFF2200, 1);
    g.fillEllipse(x - 2 * s, y + 2 * s, 8 * s, 18 * s);
    g.fillEllipse(x + 2 * s, y + 2 * s, 8 * s, 18 * s);
    // Stem
    g.fillStyle(0x228B22, 1);
    g.fillRect(x - 1 * s, y - 10 * s, 2 * s, 6 * s);
    // Spice bottle
    g.fillStyle(0xFF4422, 1);
    g.fillRoundedRect(x + 6 * s, y - 6 * s, 10 * s, 14 * s, 3);
    g.fillStyle(0xCC2200, 1);
    g.fillRect(x + 7 * s, y - 5 * s, 8 * s, 10 * s);
    // Cap
    g.fillStyle(0x888888, 1);
    g.fillRect(x + 7 * s, y - 8 * s, 8 * s, 4 * s);
    g.fillStyle(0xFFFFFF, 0.4);
    g.fillRect(x + 8 * s, y - 5 * s, 3 * s, 5 * s);
  }

  static _drawBroth(g, x, y, s) {
    // Pot / ladle
    g.fillStyle(0xDAA520, 1);
    g.fillEllipse(x, y + 4 * s, 20 * s, 14 * s);
    g.fillStyle(0xB8860B, 1);
    g.fillEllipse(x, y + 5 * s, 16 * s, 10 * s);
    // Steam from broth
    g.lineStyle(2 * s, 0xFFFFFF, 0.4);
    g.strokeCircle(x - 4 * s, y - 4 * s, 3 * s);
    g.strokeCircle(x + 2 * s, y - 7 * s, 3 * s);
    // Ladle handle
    g.fillStyle(0x8B6914, 1);
    g.fillRect(x + 7 * s, y - 6 * s, 4 * s, 18 * s);
  }

  /**
   * Draw a cooking pot
   */
  static drawCookingPot(graphics, x, y, scale = 1, progress = 0) {
    const s = scale;

    // Pot shadow
    graphics.fillStyle(0x000000, 0.25);
    graphics.fillEllipse(x, y + 50 * s, 100 * s, 20 * s);

    // Pot body
    graphics.fillStyle(0x555555, 1);
    graphics.fillRect(x - 42 * s, y - 10 * s, 84 * s, 55 * s);
    graphics.fillEllipse(x, y + 45 * s, 84 * s, 24 * s);

    // Pot bottom highlight
    graphics.fillStyle(0x444444, 1);
    graphics.fillEllipse(x, y + 45 * s, 80 * s, 22 * s);

    // Pot interior (broth)
    const brothColor = progress > 0 ? 0xFF6B35 : 0xDAA520;
    graphics.fillStyle(brothColor, 1);
    graphics.fillEllipse(x, y - 10 * s, 80 * s, 22 * s);

    // Boiling bubbles
    if (progress > 0) {
      graphics.fillStyle(0xFF8C42, 0.7);
      for (let i = 0; i < 5; i++) {
        const bx = x - 25 * s + i * 12 * s;
        const by = y - 10 * s + Math.sin(Date.now() * 0.003 + i) * 4 * s;
        graphics.fillCircle(bx, by, (2 + Math.random() * 2) * s);
      }
    }

    // Pot handles
    graphics.fillStyle(0x333333, 1);
    graphics.fillRoundedRect(x - 52 * s, y - 5 * s, 14 * s, 10 * s, 4);
    graphics.fillRoundedRect(x + 38 * s, y - 5 * s, 14 * s, 10 * s, 4);

    // Pot rim
    graphics.fillStyle(0x777777, 1);
    graphics.fillEllipse(x, y - 10 * s, 88 * s, 24 * s);
    graphics.fillStyle(brothColor, 0.8);
    graphics.fillEllipse(x, y - 10 * s, 80 * s, 20 * s);

    // Lid knob
    graphics.fillStyle(0x444444, 1);
    graphics.fillEllipse(x, y - 22 * s, 16 * s, 8 * s);
    graphics.fillCircle(x, y - 24 * s, 5 * s);
  }

  /**
   * Draw a stove / burner
   */
  static drawStove(graphics, x, y, scale = 1, flameOn = false) {
    const s = scale;

    // Stove body
    graphics.fillStyle(0x2A2A2A, 1);
    graphics.fillRoundedRect(x - 60 * s, y - 15 * s, 120 * s, 55 * s, 8);

    // Stove top
    graphics.fillStyle(0x1A1A1A, 1);
    graphics.fillRoundedRect(x - 55 * s, y - 12 * s, 110 * s, 20 * s, 6);

    // Burner rings
    graphics.lineStyle(4 * s, 0x555555, 1);
    graphics.strokeCircle(x - 20 * s, y - 2 * s, 18 * s);
    graphics.strokeCircle(x + 20 * s, y - 2 * s, 18 * s);
    graphics.lineStyle(2 * s, 0x333333, 1);
    graphics.strokeCircle(x - 20 * s, y - 2 * s, 10 * s);
    graphics.strokeCircle(x + 20 * s, y - 2 * s, 10 * s);

    // Flames
    if (flameOn) {
      DrawingUtils.drawFlame(graphics, x - 20 * s, y - 2 * s, s * 0.6);
      DrawingUtils.drawFlame(graphics, x + 20 * s, y - 2 * s, s * 0.6);
    }

    // Control knobs
    for (let i = -1; i <= 1; i += 2) {
      graphics.fillStyle(0x888888, 1);
      graphics.fillCircle(x + i * 25 * s, y + 25 * s, 8 * s);
      graphics.fillStyle(0x444444, 1);
      graphics.fillRect(x + i * 25 * s - 1 * s, y + 18 * s, 2 * s, 7 * s);
    }
  }

  /**
   * Draw animated flame
   */
  static drawFlame(graphics, x, y, scale = 1) {
    const s = scale;
    const t = Date.now() * 0.003;

    // Outer flame (orange)
    graphics.fillStyle(0xFF6B00, 0.9);
    graphics.fillTriangle(
      x, y - 22 * s,
      x - 14 * s + Math.sin(t) * 3 * s, y + 2 * s,
      x + 14 * s + Math.sin(t + 1) * 3 * s, y + 2 * s
    );

    // Middle flame (yellow-orange)
    graphics.fillStyle(0xFF9500, 0.9);
    graphics.fillTriangle(
      x + Math.sin(t * 1.3) * 2 * s, y - 16 * s,
      x - 9 * s, y + 2 * s,
      x + 9 * s, y + 2 * s
    );

    // Inner flame (yellow)
    graphics.fillStyle(0xFFD700, 1);
    graphics.fillTriangle(
      x + Math.sin(t * 1.7) * 1 * s, y - 10 * s,
      x - 5 * s, y + 2 * s,
      x + 5 * s, y + 2 * s
    );

    // Core (white)
    graphics.fillStyle(0xFFFFFF, 0.8);
    graphics.fillCircle(x, y, 3 * s);
  }

  /**
   * Draw kitchen counter
   */
  static drawCounter(graphics, x, y, w, h) {
    // Counter body
    graphics.fillStyle(0x5C3D1A, 1);
    graphics.fillRect(x, y, w, h);

    // Counter top (lighter wood)
    graphics.fillStyle(0x7A5230, 1);
    graphics.fillRect(x, y, w, 20);

    // Wood grain lines
    graphics.lineStyle(1, 0x6B4422, 0.4);
    for (let i = 0; i < w; i += 40) {
      graphics.strokeRect(x + i, y, 38, h);
    }

    // Counter front edge
    graphics.fillStyle(0x4A2D0F, 1);
    graphics.fillRect(x, y + h - 8, w, 8);

    // Highlight on top
    graphics.fillStyle(0xFFFFFF, 0.08);
    graphics.fillRect(x + 2, y + 2, w - 4, 6);
  }

  /**
   * Draw a customer character
   */
  static drawCustomer(graphics, x, y, type = 0, mood = 'happy', scale = 1) {
    const s = scale;
    const colors = DrawingUtils.getCustomerColors(type);

    // Shadow
    graphics.fillStyle(0x000000, 0.2);
    graphics.fillEllipse(x, y + 58 * s, 40 * s, 10 * s);

    // Body
    graphics.fillStyle(colors.shirt, 1);
    graphics.fillRoundedRect(x - 16 * s, y + 18 * s, 32 * s, 36 * s, 6);

    // Neck
    graphics.fillStyle(colors.skin, 1);
    graphics.fillRect(x - 5 * s, y + 10 * s, 10 * s, 12 * s);

    // Head
    graphics.fillStyle(colors.skin, 1);
    graphics.fillEllipse(x, y, 28 * s, 28 * s);

    // Hair
    graphics.fillStyle(colors.hair, 1);
    if (type % 2 === 0) {
      // Short hair
      graphics.fillEllipse(x, y - 8 * s, 30 * s, 16 * s);
      graphics.fillRect(x - 15 * s, y - 14 * s, 30 * s, 10 * s);
    } else {
      // Longer hair
      graphics.fillEllipse(x, y - 8 * s, 30 * s, 18 * s);
      graphics.fillEllipse(x - 14 * s, y + 2 * s, 8 * s, 18 * s);
      graphics.fillEllipse(x + 14 * s, y + 2 * s, 8 * s, 18 * s);
    }

    // Eyes
    DrawingUtils.drawEyes(graphics, x, y, mood, s);

    // Mouth
    DrawingUtils.drawMouth(graphics, x, y, mood, s);

    // Arms
    graphics.fillStyle(colors.shirt, 1);
    graphics.fillRoundedRect(x - 26 * s, y + 22 * s, 10 * s, 24 * s, 4);
    graphics.fillRoundedRect(x + 16 * s, y + 22 * s, 10 * s, 24 * s, 4);

    // Hands
    graphics.fillStyle(colors.skin, 1);
    graphics.fillCircle(x - 21 * s, y + 46 * s, 6 * s);
    graphics.fillCircle(x + 21 * s, y + 46 * s, 6 * s);

    // Legs / pants
    graphics.fillStyle(colors.pants, 1);
    graphics.fillRoundedRect(x - 14 * s, y + 50 * s, 12 * s, 16 * s, 4);
    graphics.fillRoundedRect(x + 2 * s, y + 50 * s, 12 * s, 16 * s, 4);

    // Shoes
    graphics.fillStyle(colors.shoes, 1);
    graphics.fillEllipse(x - 9 * s, y + 65 * s, 16 * s, 8 * s);
    graphics.fillEllipse(x + 9 * s, y + 65 * s, 16 * s, 8 * s);
  }

  static getCustomerColors(type) {
    const colorSets = [
      { skin: 0xFFD5A8, hair: 0x3D2B1F, shirt: 0x4169E1, pants: 0x2F4F4F, shoes: 0x1A1A1A },
      { skin: 0xFFD5A8, hair: 0x8B4513, shirt: 0xFF6B6B, pants: 0x4B0082, shoes: 0x2F4F4F },
      { skin: 0xDEB887, hair: 0x1A1A1A, shirt: 0x32CD32, pants: 0x1A1A1A, shoes: 0x8B4513 },
      { skin: 0xDEB887, hair: 0x2F2F2F, shirt: 0x9370DB, pants: 0x1A1A1A, shoes: 0x2F2F2F },
      { skin: 0xF0C8A0, hair: 0x8B4513, shirt: 0xFF8C00, pants: 0x000080, shoes: 0x1A1A1A },
      { skin: 0xF0C8A0, hair: 0xFFD700, shirt: 0xFFB6C1, pants: 0x800080, shoes: 0x8B4513 },
      { skin: 0xC8A882, hair: 0x1A0A00, shirt: 0x008080, pants: 0x1A1A1A, shoes: 0x1A1A1A },
    ];
    return colorSets[type % colorSets.length];
  }

  static drawEyes(graphics, x, y, mood, s) {
    // Eye whites
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillEllipse(x - 6 * s, y - 2 * s, 10 * s, 8 * s);
    graphics.fillEllipse(x + 6 * s, y - 2 * s, 10 * s, 8 * s);

    if (mood === 'happy') {
      // Happy eyes (curved)
      graphics.lineStyle(2 * s, 0x333333, 1);
      graphics.strokeCircle(x - 6 * s, y, 3 * s);
      graphics.strokeCircle(x + 6 * s, y, 3 * s);
      graphics.fillStyle(0x333333, 1);
      graphics.fillCircle(x - 6 * s, y, 3 * s);
      graphics.fillCircle(x + 6 * s, y, 3 * s);
      // Shine
      graphics.fillStyle(0xFFFFFF, 1);
      graphics.fillCircle(x - 5 * s, y - 1 * s, 1.5 * s);
      graphics.fillCircle(x + 7 * s, y - 1 * s, 1.5 * s);
    } else if (mood === 'neutral') {
      graphics.fillStyle(0x333333, 1);
      graphics.fillCircle(x - 6 * s, y - 1 * s, 3 * s);
      graphics.fillCircle(x + 6 * s, y - 1 * s, 3 * s);
      graphics.fillStyle(0xFFFFFF, 1);
      graphics.fillCircle(x - 5 * s, y - 2 * s, 1 * s);
      graphics.fillCircle(x + 7 * s, y - 2 * s, 1 * s);
    } else if (mood === 'impatient') {
      // Furrowed brows
      graphics.fillStyle(0x333333, 1);
      graphics.fillCircle(x - 6 * s, y, 3 * s);
      graphics.fillCircle(x + 6 * s, y, 3 * s);
      graphics.lineStyle(2 * s, 0x333333, 1);
      graphics.strokeRect(x - 10 * s, y - 7 * s, 8 * s, 2 * s);
      graphics.strokeRect(x + 2 * s, y - 7 * s, 8 * s, 2 * s);
    } else if (mood === 'angry') {
      graphics.fillStyle(0x333333, 1);
      graphics.fillCircle(x - 6 * s, y + 1 * s, 3 * s);
      graphics.fillCircle(x + 6 * s, y + 1 * s, 3 * s);
      // Angry brows
      graphics.lineStyle(3 * s, 0x333333, 1);
      graphics.strokeRect(x - 11 * s, y - 8 * s, 9 * s, 3 * s);
      graphics.strokeRect(x + 2 * s, y - 8 * s, 9 * s, 3 * s);
    }
  }

  static drawMouth(graphics, x, y, mood, s) {
    graphics.lineStyle(2 * s, 0x8B4513, 1);
    if (mood === 'happy') {
      // Smile
      graphics.fillStyle(0xFF6B6B, 1);
      graphics.fillEllipse(x, y + 9 * s, 14 * s, 8 * s);
      graphics.fillStyle(0xFFFFFF, 1);
      graphics.fillRect(x - 5 * s, y + 6 * s, 10 * s, 5 * s);
      graphics.fillStyle(0xFF6B6B, 0.7);
      graphics.fillEllipse(x - 9 * s, y + 4 * s, 6 * s, 5 * s);
      graphics.fillEllipse(x + 9 * s, y + 4 * s, 6 * s, 5 * s);
    } else if (mood === 'neutral') {
      graphics.fillStyle(0x8B4513, 0.7);
      graphics.fillRect(x - 7 * s, y + 9 * s, 14 * s, 3 * s);
    } else if (mood === 'impatient') {
      // Frown
      graphics.fillStyle(0x8B4513, 0.7);
      graphics.fillEllipse(x, y + 11 * s, 12 * s, 6 * s);
      graphics.fillStyle(0xFFD5A8, 1);
      graphics.fillRect(x - 5 * s, y + 8 * s, 10 * s, 5 * s);
    } else if (mood === 'angry') {
      // Deep frown
      graphics.fillStyle(0xAA2222, 1);
      graphics.fillEllipse(x, y + 11 * s, 10 * s, 6 * s);
      graphics.fillStyle(0xFFD5A8, 1);
      graphics.fillRect(x - 4 * s, y + 8 * s, 8 * s, 5 * s);
    }
  }

  /**
   * Draw a money coin/bill popup
   */
  static drawMoneyCoin(graphics, x, y, scale = 1) {
    const s = scale;
    graphics.fillStyle(0xFFD700, 1);
    graphics.fillCircle(x, y, 14 * s);
    graphics.fillStyle(0xFFA500, 1);
    graphics.fillCircle(x, y, 11 * s);
    graphics.fillStyle(0xFFD700, 1);
    graphics.fillCircle(x, y, 8 * s);
    // Dollar sign
    graphics.fillStyle(0xCC8800, 1);
    graphics.fillRect(x - 1 * s, y - 6 * s, 2 * s, 12 * s);
    graphics.fillRect(x - 4 * s, y - 3 * s, 8 * s, 2 * s);
    graphics.fillRect(x - 4 * s, y + 1 * s, 8 * s, 2 * s);
  }

  /**
   * Draw a star rating
   */
  static drawStar(graphics, x, y, size, filled = true) {
    const color = filled ? 0xFFD700 : 0x888888;
    const borderColor = filled ? 0xFFA500 : 0x666666;
    const points = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? size : size * 0.4;
      const angle = (i * Math.PI / 5) - Math.PI / 2;
      points.push({ x: x + r * Math.cos(angle), y: y + r * Math.sin(angle) });
    }
    graphics.fillStyle(color, 1);
    graphics.fillPoints(points, true);
    graphics.lineStyle(2, borderColor, 1);
    graphics.strokePoints(points, true);
  }

  /**
   * Draw steam/vapor particles
   */
  static drawSteam(graphics, x, y, intensity = 1) {
    const t = Date.now() * 0.001;
    for (let i = 0; i < 3; i++) {
      const ox = Math.sin(t * 2 + i * 2) * 8;
      const oy = -20 - i * 15;
      const alpha = 0.3 - i * 0.08;
      const r = (4 + i * 2) * intensity;
      graphics.fillStyle(0xFFFFFF, alpha);
      graphics.fillCircle(x + ox, y + oy, r);
    }
  }
}

export default DrawingUtils;

