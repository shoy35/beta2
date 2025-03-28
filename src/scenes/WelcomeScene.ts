// /workspaces/beta2/src/scenes/WelcomeScene.ts
import Phaser from 'phaser';
import HomeButton from '../components/HomeButton';
import { getResponsivePosition } from '../utils/responsiveUtils';

export default class WelcomeScene extends Phaser.Scene {
  private homeButton!: HomeButton;

  constructor() {
    super({ key: 'WelcomeScene' });
  }

  preload() {
    // this.load.image('logo', 'assets/logo.png');
    // this.load.audio('bgm', 'assets/audio/welcome_bgm.mp3');
  }

  create() {
    // 背景を白色系に設定
    this.cameras.main.setBackgroundColor('#F5F5F5');

    // ロゴの代わりにテキストを表示（アセット不要で確認）
    const { x, y } = getResponsivePosition(this, 0.5, 0.4);
    const welcomeText = this.add.text(x, y, 'Welcome!', {
      fontSize: '64px',
      color: '#333',
    }).setOrigin(0.5);

    // BGMはコメントアウト
    // this.sound.play('bgm', { loop: true, volume: 0.5 });

    // ホームボタン
    this.homeButton = new HomeButton(this, () => this.returnToHome());

    // スタートボタン
    const startButtonPos = getResponsivePosition(this, 0.5, 0.6);
    const startButton = this.add.text(startButtonPos.x, startButtonPos.y, 'Start', {
      fontSize: '48px',
      color: '#333',
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerdown', () => {
      this.scene.start('StageSelectScene');
    });
    startButton.on('pointerover', () => startButton.setStyle({ color: '#666' }));
    startButton.on('pointerout', () => startButton.setStyle({ color: '#333' }));

    // デバッグ用ログ
    console.log('WelcomeScene created');
  }

  returnToHome() {
    console.log('Returning to home...');
  }
}