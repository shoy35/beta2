import Phaser from 'phaser';
import WelcomeScene from './scenes/WelcomeScene';
import StageSelectScene from './scenes/StageSelectScene';
import GameScene from './scenes/GameScene'; // 未実装なら仮置き

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
      debug: false,
    },
  },
  scene: [WelcomeScene, StageSelectScene, GameScene], // GameSceneを追加
  parent: 'game-container',
};

new Phaser.Game(config);