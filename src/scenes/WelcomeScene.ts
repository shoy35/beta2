// /workspaces/beta2/src/scenes/WelcomeScene.ts
import Phaser from 'phaser';
import HomeButton from '../components/HomeButton';
import { getResponsivePosition } from '../utils/responsiveUtils';

export default class WelcomeScene extends Phaser.Scene {
  private homeButton!: HomeButton;
  public bgm!: Phaser.Sound.BaseSound;

  constructor() {
    super({ key: 'WelcomeScene' });
  }

  preload() {
    this.load.image('logo', '/assets/logo.png');
    this.load.audio('bgm', '/assets/audio/welcome_bgm.mp3');
  }

  create() {
    this.cameras.main.setBackgroundColor('#F5F5F5');

    const { x, y } = getResponsivePosition(this, 0.5, 0.4);
    const logo = this.add.image(x, y, 'logo').setScale(0.5);
    logo.setAlpha(0);
    this.tweens.add({
      targets: logo,
      alpha: 1,
      duration: 1000,
      ease: 'Power2',
    });

    this.bgm = this.sound.add('bgm', { loop: true, volume: 1.0 });
    console.log('BGM initialized:', this.bgm);

    this.homeButton = new HomeButton(this, () => this.returnToHome());

    const startButtonPos = getResponsivePosition(this, 0.5, 0.6);
    const startButton = this.add.text(startButtonPos.x, startButtonPos.y, 'Start', {
      fontSize: '48px',
      color: '#333',
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerdown', () => {
      console.log('Start tapped, playing BGM...');
      this.bgm.play();
      const webAudioBgm = this.bgm as Phaser.Sound.WebAudioSound; // 型キャスト
      console.log('BGM playing:', this.bgm.isPlaying, 'Source:', webAudioBgm.source);
      this.time.delayedCall(100, () => {
        this.scene.start('StageSelectScene');
      });
    });
    startButton.on('pointerover', () => startButton.setStyle({ color: '#666' }));
    startButton.on('pointerout', () => startButton.setStyle({ color: '#333' }));

    console.log('WelcomeScene created');
  }

  returnToHome() {
    console.log('Returning to home...');
  }
}