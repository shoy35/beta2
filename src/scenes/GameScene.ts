import Phaser from 'phaser';
import HomeButton from '../components/HomeButton';
import { getResponsivePosition } from '../utils/responsiveUtils';

export default class GameScene extends Phaser.Scene {
  private homeButton!: HomeButton;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { stageId: number }) {
    console.log(`Starting GameScene with stageId: ${data.stageId}`);
  }

  create() {
    this.cameras.main.setBackgroundColor('#F5F5F5');

    const { x, y } = getResponsivePosition(this, 0.5, 0.5);
    this.add.text(x, y, 'Game Scene (Stage in progress)', {
      fontSize: '48px',
      color: '#333',
    }).setOrigin(0.5);

    this.homeButton = new HomeButton(this, () => this.returnToHome());

    console.log('GameScene created');
  }

  returnToHome() {
    this.scene.start('WelcomeScene');
  }
}