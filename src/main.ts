import Phaser from 'phaser';
import WelcomeScene from './scenes/WelcomeScene';
import StageSelectScene from './scenes/StageSelectScene';
import GameScene from './scenes/GameScene';

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
      gravity: { x: 0, y: 1 }, // GameSceneと統一
      debug: false,
    },
  },
  scene: [WelcomeScene, StageSelectScene, GameScene],
  parent: 'game-container',
};

const game = new Phaser.Game(config);

// WelcomeSceneから開始
game.scene.start('WelcomeScene');