// /workspaces/beta2/src/main.ts
import Phaser from 'phaser';
import WelcomeScene from './scenes/WelcomeScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1170,
  height: 2532,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 0.5 },
      debug: false, // デバッグ表示をオフ（黒い四角を消す）
    },
  },
  scene: [WelcomeScene],
  parent: 'game-container',
};

new Phaser.Game(config);