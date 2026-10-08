// src/data/config.js
// Global game configuration constants

export const GAME_CONFIG = {
  // Canvas
  WIDTH: 1280,
  HEIGHT: 720,

  // Customer system
  customerWaitTimeBase: 65,       // seconds
  customerPatience: {
    happy: 0.7,        // > 70% time left
    neutral: 0.4,      // 40-70%
    impatient: 0.15,   // 15-40%
    angry: 0.0         // 0-15%
  },

  // Money multipliers based on wait percentage used
  moneyMultipliers: [
    { maxWait: 0.20, multiplier: 1.0 },
    { maxWait: 0.40, multiplier: 0.90 },
    { maxWait: 0.60, multiplier: 0.75 },
    { maxWait: 0.80, multiplier: 0.60 },
    { maxWait: 0.95, multiplier: 0.40 },
    { maxWait: 1.00, multiplier: 0.20 }
  ],

  // Cooking
  cookingSpeedMultiplier: 1.0,

  // UI Layout
  HUD_HEIGHT: 70,
  KITCHEN_AREA: {
    x: 0, y: 70,
    width: 1280, height: 390
  },
  INGREDIENT_AREA: {
    x: 0, y: 460,
    width: 1280, height: 260
  },
  CUSTOMER_AREA: {
    x: 0, y: 70,
    width: 1280, height: 145
  },

  // Cooking station position
  COOKING_STATION: { x: 400, y: 250 },
  POT_POSITION: { x: 640, y: 280 },
  SERVE_AREA: { x: 900, y: 280 },

  // Customer seating positions — y=180 keeps seats below HUD (70px) with bubble room above
  CUSTOMER_SEATS: [
    { x: 140, y: 180 },
    { x: 310, y: 180 },
    { x: 480, y: 180 },
    { x: 650, y: 180 },
    { x: 820, y: 180 },
    { x: 990, y: 180 },
    { x: 1160, y: 180 }
  ],

  // Colors
  COLORS: {
    background: 0x2D1B0E,
    kitchenBg: 0x3D2614,
    counter: 0x5C3D1A,
    counterTop: 0x8B6914,
    ingredientBg: 0x1A0D05,
    hudBg: 0x1A0D05,
    primary: 0xFF6B35,
    secondary: 0xFFB347,
    success: 0x4CAF50,
    danger: 0xF44336,
    warning: 0xFF9800,
    gold: 0xFFD700,
    text: 0xFFE4B5,
    textDark: 0x2D1B0E
  },

  // Debug
  DEBUG_MODE: false,
  SHOW_FPS: false
};

export default GAME_CONFIG;

