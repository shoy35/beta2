import Phaser from 'phaser';
import HomeButton from '../components/HomeButton';
import { getResponsivePosition } from '../utils/responsiveUtils';

export default class StageSelectScene extends Phaser.Scene {
  private homeButton!: HomeButton;

  constructor() {
    super({ key: 'StageSelectScene' });
  }

  create() {
    // 背景を白色系に設定
    this.cameras.main.setBackgroundColor('#F5F5F5');

    // タイトル
    const titlePos = getResponsivePosition(this, 0.5, 0.2);
    this.add.text(titlePos.x, titlePos.y, 'Select Stage', {
      fontSize: '64px',
      color: '#333',
    }).setOrigin(0.5);

    // ステージボタン（仮に3つ）
    const stages = [
      { id: 1, name: 'Stage 1' },
      { id: 2, name: 'Stage 2' },
      { id: 3, name: 'Stage 3' },
    ];

    stages.forEach((stage, index) => {
      const buttonPos = getResponsivePosition(this, 0.5, 0.4 + index * 0.1);
      const stageButton = this.add.text(buttonPos.x, buttonPos.y, stage.name, {
        fontSize: '48px',
        color: '#333',
      }).setOrigin(0.5).setInteractive();

      stageButton.on('pointerdown', () => {
        this.scene.start('GameScene', { stageId: stage.id }); // GameSceneへデータ渡し
      });
      stageButton.on('pointerover', () => stageButton.setStyle({ color: '#666' }));
      stageButton.on('pointerout', () => stageButton.setStyle({ color: '#333' }));
    });

    // ホームボタン
    this.homeButton = new HomeButton(this, () => this.returnToHome());

    console.log('StageSelectScene created');
  }

  returnToHome() {
    this.scene.start('WelcomeScene');
  }
}