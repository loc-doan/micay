// src/scenes/BootScene.js
// Preloads assets and transitions to the main menu

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Update loading bar
    this.load.on('progress', (value) => {
      const bar = document.getElementById('loading-bar');
      const text = document.getElementById('loading-text');
      if (bar) bar.style.width = `${Math.round(value * 100)}%`;
      if (text) text.textContent = `Đang tải... ${Math.round(value * 100)}%`;
    });

    this.load.on('complete', () => {
      const screen = document.getElementById('loading-screen');
      if (screen) {
        screen.style.transition = 'opacity 0.5s';
        screen.style.opacity = '0';
        setTimeout(() => { screen.style.display = 'none'; }, 500);
      }
    });

    // No external assets needed - all drawn procedurally
    // Simulate brief load for UX
    this.load.image('__pixel__', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
  }

  create() {
    // Generate procedural textures for all game objects
    this._generateTextures();

    // Wait for Google Fonts to load before starting the game
    // This prevents the ugly fallback-font flash
    this._waitForFont('Quicksand', () => {
      this.scene.start('MainMenuScene');
    });
  }

  _waitForFont(fontName, callback) {
    // Use document.fonts.load API if available
    if (document.fonts && document.fonts.load) {
      document.fonts.load(`bold 16px "${fontName}"`).then(() => {
        this.time.delayedCall(200, callback);
      }).catch(() => {
        // If font fails (e.g., offline), proceed anyway
        this.time.delayedCall(200, callback);
      });
    } else {
      // Fallback: just delay
      this.time.delayedCall(600, callback);
    }
  }

  _generateTextures() {
    // We rely on procedural drawing in each scene
    // Just ensure the graphics system is ready
    const g = this.add.graphics();
    g.destroy();
  }
}

export default BootScene;

