// /workspaces/beta2/src/scenes/GameScene.ts
import Phaser from 'phaser';
import Matter from 'matter-js';
import HomeButton from '../components/HomeButton';
import WelcomeScene from './WelcomeScene';
import { getResponsivePosition } from '../utils/responsiveUtils';

export default class GameScene extends Phaser.Scene {
  private homeButton!: HomeButton;
  private shape!: Phaser.GameObjects.Rectangle;
  private tapButton!: Phaser.GameObjects.Text;
  private pieces: Phaser.GameObjects.Rectangle[] = [];
  private originalPositions: { x: number; y: number }[] = []; // ピースの元の位置を記録

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { stageId: number }) {
    console.log(`Starting GameScene with stageId: ${data.stageId}`);
    const welcomeScene = this.scene.get('WelcomeScene') as WelcomeScene;
    if (welcomeScene.bgm && welcomeScene.bgm.isPlaying) {
      welcomeScene.bgm.stop();
      console.log('BGM stopped in GameScene');
    }
  }

  create() {
    this.cameras.main.setBackgroundColor('#F5F5F5');
    const { x, y } = getResponsivePosition(this, 0.5, 0.5);
    this.shape = this.add.rectangle(x, y, 200, 200, 0x666666).setAlpha(0);
    this.tweens.add({
      targets: this.shape,
      alpha: 1,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => this.showTapButton(),
    });
    this.homeButton = new HomeButton(this, () => this.returnToHome());
    this.matter.world.setBounds(0, 0, 1170, 2532, 50);
    this.createEasyModeButton();
    console.log('GameScene created');
  }

  private showTapButton() {
    const { x, y } = getResponsivePosition(this, 0.5, 0.5);
    this.tapButton = this.add.text(x, y, 'Tap Me', {
      fontSize: '32px',
      color: '#FFFFFF',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setInteractive();

    this.tapButton.on('pointerdown', () => {
      console.log('Shape tapped!');
      this.tapButton.destroy();
      this.splitShape();
    });
    this.tapButton.on('pointerover', () => this.tapButton.setStyle({ color: '#CCCCCC' }));
    this.tapButton.on('pointerout', () => this.tapButton.setStyle({ color: '#FFFFFF' }));
  }

  private splitShape() {
    this.shape.setFillStyle(0x000000, 0).setStrokeStyle(2, 0x333333, 0.5);
    const { x, y } = getResponsivePosition(this, 0.5, 0.5);
    const pieceCount = 10;
    const pieceSize = 50;

    // ピースの元の位置を計算（仮にグリッド状に配置）
    this.originalPositions = [];
    const gridSize = Math.sqrt(pieceCount); // グリッドの1辺（例: 10ピースなら3x4）
    const offset = 200 / gridSize; // 200x200の正方形をグリッドに分割
    for (let i = 0; i < pieceCount; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const posX = x - 100 + col * offset + offset / 2; // 中心を調整
      const posY = y - 100 + row * offset + offset / 2;
      this.originalPositions.push({ x: posX, y: posY });

      const offsetX = Phaser.Math.Between(-50, 50);
      const offsetY = Phaser.Math.Between(-50, 50);
      const piece = this.add.rectangle(posX + offsetX, posY + offsetY, pieceSize, pieceSize, 0x888888);
      this.pieces.push(piece);
      const physicsObject = this.matter.add.gameObject(piece, {
        shape: 'rectangle',
        mass: 1,
        friction: 0.5,
      }) as Phaser.Physics.Matter.Sprite;

      if (physicsObject.body) {
        const body = physicsObject.body as Matter.Body;
        Matter.Body.setVelocity(body, { x: 0, y: 3 });
      }
    }
    console.log('Shape split into pieces');
  }

  private createEasyModeButton() {
    const { x, y } = getResponsivePosition(this, 0.1, 0.1); // 右上 → 左上に移動
    const easyButton = this.add.text(x, y, 'Easy Mode', {
      fontSize: '32px',
      color: '#333',
    }).setOrigin(0.5).setInteractive();

    easyButton.on('pointerdown', () => this.toggleEasyMode());
  }

  private toggleEasyMode() {
    this.originalPositions.forEach((pos, index) => {
      this.add.rectangle(pos.x, pos.y, 50, 50, 0x000000, 0)
        .setStrokeStyle(1, 0xFF0000, 0.5);
    });
  }

  returnToHome() {
    this.scene.start('WelcomeScene');
  }
}