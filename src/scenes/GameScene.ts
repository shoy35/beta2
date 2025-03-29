// /workspaces/beta2/src/scenes/GameScene.ts
import Phaser from 'phaser';
import Matter from 'matter-js';
import HomeButton from '../components/HomeButton';
import WelcomeScene from './WelcomeScene';
import { getResponsivePosition } from '../utils/responsiveUtils';

interface PieceData {
  container: Phaser.GameObjects.Container;
  piece: Phaser.GameObjects.Rectangle;
  originalPosition: { x: number; y: number };
  vertices: { x: number; y: number }[];
  number: number;
  numberText: Phaser.GameObjects.Text;
}

export default class GameScene extends Phaser.Scene {
  private homeButton!: HomeButton;
  private shape!: Phaser.GameObjects.Rectangle;
  private tapButton!: Phaser.GameObjects.Text;
  private pieces: PieceData[] = [];
  private guideNumbers: Phaser.GameObjects.Text[] = [];

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
    const pieceCount = 12;
    this.pieces = [];

    const shapeWidth = 200;
    const shapeHeight = 200;
    const rows = 3;
    const cols = 4;
    const pieceWidth = shapeWidth / cols;
    const pieceHeight = shapeHeight / rows;

    let pieceIndex = 0;
    for (let row = 0; row < rows && pieceIndex < pieceCount; row++) {
      for (let col = 0; col < cols && pieceIndex < pieceCount; col++) {
        const pieceX = x - shapeWidth / 2 + col * pieceWidth + pieceWidth / 2;
        const pieceY = y - shapeHeight / 2 + row * pieceHeight + pieceHeight / 2;

        const vertices = [
          { x: pieceX - pieceWidth / 2, y: pieceY - pieceHeight / 2 },
          { x: pieceX + pieceWidth / 2, y: pieceY - pieceHeight / 2 },
          { x: pieceX + pieceWidth / 2, y: pieceY + pieceHeight / 2 },
          { x: pieceX - pieceWidth / 2, y: pieceY + pieceHeight / 2 },
        ];

        const offsetX = Phaser.Math.Between(-50, 50);
        const offsetY = Phaser.Math.Between(-50, 50);
        const piece = this.add.rectangle(0, 0, pieceWidth, pieceHeight, 0x888888);
        piece.setAlpha(1); // 可視性を確認
        piece.setVisible(true);
        const numberText = this.add.text(0, 0, `${pieceIndex + 1}`, {
          fontSize: '16px',
          color: '#000000',
        }).setOrigin(0.5);

        const container = this.add.container(pieceX + offsetX, pieceY + offsetY, [piece, numberText]);
        container.setSize(pieceWidth, pieceHeight); // コンテナのサイズを設定
        console.log(`Piece ${pieceIndex + 1} created at (${container.x}, ${container.y})`);

        this.pieces.push({
          container,
          piece,
          originalPosition: { x: pieceX, y: pieceY },
          vertices,
          number: pieceIndex + 1,
          numberText,
        });

        const physicsObject = this.matter.add.gameObject(container, {
          shape: 'rectangle',
          mass: 1,
          friction: 0.5,
        }) as Phaser.Physics.Matter.Sprite;

        if (physicsObject.body) {
          const body = physicsObject.body as Matter.Body;
          Matter.Body.setVelocity(body, { x: 0, y: 3 });
          console.log(`Piece ${pieceIndex + 1} body position: (${body.position.x}, ${body.position.y})`);
        }

        pieceIndex++;
      }
    }
    console.log(`Shape split into ${this.pieces.length} pieces`);
  }

  private createEasyModeButton() {
    const { x, y } = getResponsivePosition(this, 0.1, 0.1);
    const easyButton = this.add.text(x, y, 'Easy Mode', {
      fontSize: '32px',
      color: '#333',
    }).setOrigin(0.5).setInteractive();

    easyButton.on('pointerdown', () => this.toggleEasyMode());
  }

  private toggleEasyMode() {
    this.guideNumbers.forEach((text) => text.destroy());
    this.guideNumbers = [];

    this.pieces.forEach((pieceData) => {
      const graphics = this.add.graphics();
      graphics.lineStyle(1, 0xFF0000, 0.5);
      graphics.beginPath();
      graphics.moveTo(pieceData.vertices[0].x, pieceData.vertices[0].y);
      for (let i = 1; i < pieceData.vertices.length; i++) {
        graphics.lineTo(pieceData.vertices[i].x, pieceData.vertices[i].y);
      }
      graphics.closePath();
      graphics.strokePath();

      const centerX = pieceData.originalPosition.x;
      const centerY = pieceData.originalPosition.y;
      const numberText = this.add.text(centerX, centerY, `${pieceData.number}`, {
        fontSize: '16px',
        color: '#FF0000',
      }).setOrigin(0.5);
      this.guideNumbers.push(numberText);
    });
  }

  returnToHome() {
    this.scene.start('WelcomeScene');
  }
}