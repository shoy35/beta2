import Phaser from 'phaser';
import HomeButton from '../components/HomeButton';
import WelcomeScene from './WelcomeScene';
import { getResponsivePosition } from '../utils/responsiveUtils';
import * as Matter from 'matter-js';

interface PieceData {
  container: Phaser.GameObjects.Container;
  piece: Phaser.GameObjects.Image; // 型を Image に変更
  body: Phaser.Types.Physics.Matter.MatterBody;
  originalPosition: { x: number; y: number };
  number: number;
}

export default class GameScene extends Phaser.Scene {
  private homeButton!: HomeButton;
  private shape!: Phaser.GameObjects.Rectangle;
  private startButton!: Phaser.GameObjects.Text;
  private pieces: PieceData[] = [];

  constructor() {
    super({
      key: 'GameScene',
      physics: {
        default: 'matter',
        matter: {
          gravity: { x: 0, y: 0 },
          debug: true,
        },
      },
    });
  }

  preload() {
    this.load.svg('square1', 'assets/square1.svg'); // SVGファイルを読み込む
    this.load.svg('square2', 'assets/square2.svg'); // SVGファイルを読み込む
  }

  create() {
    this.cameras.main.setBackgroundColor('#F5F5F5');
    const { x, y } = getResponsivePosition(this, 0.5, 0.5);
    this.shape = this.add.rectangle(x, y, 500, 500, 0x666666).setAlpha(0);
    this.tweens.add({
      targets: this.shape,
      alpha: 1,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => this.showStartButton(),
    });
    this.homeButton = new HomeButton(this, () => this.returnToHome());

    this.matter.world.setBounds(0, 0, 1170, 2532, 50);
    this.matter.world.setGravity(0, 0);
  }

  private showStartButton() {
    const { x, y } = getResponsivePosition(this, 0.5, 0.5);
    this.startButton = this.add.text(x, y, 'Start', {
      fontSize: '32px',
      color: '#FFFFFF',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setInteractive();

    this.startButton.on('pointerdown', () => {
      this.startButton.destroy();
      this.splitShape();
    });
  }

  private splitShape() {
    this.shape.setAlpha(0);
    this.pieces = [];
  
    const screenWidth = this.cameras.main.width;
    const screenHeight = this.cameras.main.height;
    const pieceSize = 100;
  
    const getRandomPosition = (width: number, height: number) => {
      return {
        x: Phaser.Math.FloatBetween(width / 2, screenWidth - width / 2),
        y: Phaser.Math.FloatBetween(height / 2, screenHeight - height / 2),
      };
    };
  
    // 共通関数でピースを作成
    const createPiece = (
      key: string,
      number: number
    ): PieceData => {
      const scale = pieceSize / 100;
      const image = this.add.image(0, 0, key).setOrigin(0.5).setScale(scale);
      
      // 画像読み込み後に正確な表示サイズを取得
      const displayWidth = image.width * scale;
      const displayHeight = image.height * scale;
  
      const body = this.matter.bodies.rectangle(0, 0, displayWidth, displayHeight, {
        friction: 0.1,
        restitution: 0.3,
        isStatic: false,
      });
  
      const container = this.add.container(0, 0, [image]);
      container.setSize(displayWidth, displayHeight);
      this.matter.add.gameObject(container, body);
      container.setInteractive({ draggable: true, useHandCursor: true });
  
      container.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        container.setPosition(dragX, dragY);
        this.matter.body.setPosition(body, { x: dragX, y: dragY });
      });
  
      const pos = getRandomPosition(displayWidth, displayHeight);
      container.setPosition(pos.x, pos.y);
      this.matter.body.setPosition(body, pos);
  
      return {
        container,
        piece: image,
        body,
        originalPosition: pos,
        number,
      };
    };
  
    this.pieces.push(createPiece('square1', 1));
    this.pieces.push(createPiece('square2', 2));
  
    const debugGraphic = this.matter.world.createDebugGraphic();
    debugGraphic.setDepth(100);
  }
  

  returnToHome() {
    this.scene.start('WelcomeScene');
  }
}