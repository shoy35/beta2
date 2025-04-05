import Phaser from 'phaser';
import HomeButton from '../components/HomeButton';
import WelcomeScene from './WelcomeScene';
import { getResponsivePosition } from '../utils/responsiveUtils';
import * as Matter from 'matter-js';

interface PieceData {
  container: Phaser.GameObjects.Container;
  piece: Phaser.GameObjects.Image;
  body: Phaser.Types.Physics.Matter.MatterBody;
  originalPosition: { x: number; y: number };
  number: number;
  isSnapped: boolean; // スナップ状態を管理
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
    this.load.svg('square1', 'assets/square1.svg');
    this.load.svg('square2', 'assets/square2.svg');
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

    const debugGraphic = this.matter.world.createDebugGraphic();
    debugGraphic.setDepth(100);
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

    const createPiece = (key: string, number: number, initialPos?: { x: number; y: number }): PieceData => {
      const scale = pieceSize / 100;
      const image = this.add.image(0, 0, key).setOrigin(0.5).setScale(scale);

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

      const pos = initialPos || getRandomPosition(displayWidth, displayHeight);
      container.setPosition(pos.x, pos.y);
      this.matter.body.setPosition(body, pos);

      return {
        container,
        piece: image,
        body,
        originalPosition: pos,
        number,
        isSnapped: false,
      };
    };

    // 初期位置を固定してスナップしやすく
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    this.pieces.push(createPiece('square1', 1, { x: centerX - 150, y: centerY })); // 左側に配置
    this.pieces.push(createPiece('square2', 2, { x: centerX + 150, y: centerY })); // 右側に配置
  }

  update() {
    if (this.pieces.length < 2) return;

    const pieceA = this.pieces[0]; // square1
    const pieceB = this.pieces[1]; // square2

    // すでにスナップ済みならスキップ
    if (pieceB.isSnapped) return;

    // コンテナの位置から境界を計算
    const pieceSize = 100;
    const boundsA = {
      min: { x: pieceA.container.x - pieceSize / 2, y: pieceA.container.y - pieceSize / 2 },
      max: { x: pieceA.container.x + pieceSize / 2, y: pieceA.container.y + pieceSize / 2 },
    };
    const boundsB = {
      min: { x: pieceB.container.x - pieceSize / 2, y: pieceB.container.y - pieceSize / 2 },
      max: { x: pieceB.container.x + pieceSize / 2, y: pieceB.container.y + pieceSize / 2 },
    };

    // スナップする距離の閾値
    const snapDistance = 50; // 閾値をさらに増やす

    // Aの右側とBの左側が近づいたか判定
    const distanceX = boundsB.min.x - boundsA.max.x;
    const distanceY = Math.abs(boundsB.min.y - boundsA.min.y);
    if (Math.abs(distanceX) <= snapDistance && distanceY <= 100) {
      console.log(`Snapping: A right to B left, Distance X: ${distanceX}, Distance Y: ${distanceY}`);
      const snapX = boundsA.max.x + pieceSize / 2;
      const snapY = pieceA.container.y;
      pieceB.container.setPosition(snapX, snapY);
      this.matter.body.setPosition(pieceB.body as any, { x: snapX, y: snapY });
      pieceB.isSnapped = true;
      pieceB.container.removeInteractive();
      return;
    }

    // Aの左側とBの右側が近づいたか判定
    const distanceXLeft = boundsA.min.x - boundsB.max.x;
    if (Math.abs(distanceXLeft) <= snapDistance && distanceY <= 100) {
      console.log(`Snapping: A left to B right, Distance X: ${distanceXLeft}, Distance Y: ${distanceY}`);
      const snapX = boundsA.min.x - pieceSize / 2;
      const snapY = pieceA.container.y;
      pieceB.container.setPosition(snapX, snapY);
      this.matter.body.setPosition(pieceB.body as any, { x: snapX, y: snapY });
      pieceB.isSnapped = true;
      pieceB.container.removeInteractive();
      return;
    }

    // Aの上側とBの下側が近づいたか判定
    const distanceYTop = boundsA.min.y - boundsB.max.y;
    const distanceXTop = Math.abs(boundsB.min.x - boundsA.min.x);
    if (Math.abs(distanceYTop) <= snapDistance && distanceXTop <= 100) {
      console.log(`Snapping: A top to B bottom, Distance Y: ${distanceYTop}, Distance X: ${distanceXTop}`);
      const snapX = pieceA.container.x;
      const snapY = boundsA.min.y - pieceSize / 2;
      pieceB.container.setPosition(snapX, snapY);
      this.matter.body.setPosition(pieceB.body as any, { x: snapX, y: snapY });
      pieceB.isSnapped = true;
      pieceB.container.removeInteractive();
      return;
    }

    // Aの下側とBの上側が近づいたか判定
    const distanceYBottom = boundsB.min.y - boundsA.max.y;
    if (Math.abs(distanceYBottom) <= snapDistance && distanceXTop <= 100) {
      console.log(`Snapping: A bottom to B top, Distance Y: ${distanceYBottom}, Distance X: ${distanceXTop}`);
      const snapX = pieceA.container.x;
      const snapY = boundsA.max.y + pieceSize / 2;
      pieceB.container.setPosition(snapX, snapY);
      this.matter.body.setPosition(pieceB.body as any, { x: snapX, y: snapY });
      pieceB.isSnapped = true;
      pieceB.container.removeInteractive();
      return;
    }
  }

  returnToHome() {
    this.scene.start('WelcomeScene');
  }
}