import Phaser from 'phaser';
import { getResponsivePosition } from '../utils/responsiveUtils';

export default class HomeButton {
  private scene: Phaser.Scene;
  private button: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, onClick: () => void) {
    this.scene = scene;
    const { x, y } = getResponsivePosition(scene, 0.9, 0.1); // 右上
    this.button = scene.add.text(x, y, 'Home', {
      fontSize: '32px',
      color: '#333',
    }).setOrigin(0.5).setInteractive();

    this.button.on('pointerdown', onClick);
    this.button.on('pointerover', () => this.button.setStyle({ color: '#666' }));
    this.button.on('pointerout', () => this.button.setStyle({ color: '#333' }));
  }
}