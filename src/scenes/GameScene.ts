// /workspaces/beta2/src/scenes/GameScene.ts
import Phaser from 'phaser';
import Matter from 'matter-js';
import HomeButton from '../components/HomeButton';
import WelcomeScene from './WelcomeScene';
import { getResponsivePosition } from '../utils/responsiveUtils';
import { voronoi } from 'd3-voronoi';

interface PieceData {
  container: Phaser.GameObjects.Container;
  piece: Phaser.GameObjects.Polygon | Phaser.GameObjects.Rectangle;
  originalPosition: { x: number; y: number };
  vertices: { x: number; y: number }[];
  number: number;
  numberText: Phaser.GameObjects.Text | null;
  offsetX: number; // 追加：ピースのローカルオフセット
  offsetY: number;
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

  preload() {
    this.load.audio('snap', 'assets/audio/snap.mp3');
    this.load.image('spark', 'assets/particles/spark.png');
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
    this.shape = this.add.rectangle(x, y, 500, 500, 0x666666).setAlpha(0);
    this.tweens.add({
      targets: this.shape,
      alpha: 1,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => this.showTapButton(),
    });
    this.homeButton = new HomeButton(this, () => this.returnToHome());
    this.matter.world.setBounds(0, 0, 1170, 2532, 50);
    this.matter.world.setGravity(0, 1, 0.001);
    this.createEasyModeButton();
    try {
      this.sound.add('snap', { volume: 0.5 });
    } catch (error) {
      console.error('Failed to load snap sound:', error);
    }
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

    const shapeWidth = 500;
    const shapeHeight = 500;

    const points: [number, number][] = [];
    for (let i = 0; i < pieceCount; i++) {
      points.push([
        x - shapeWidth / 2 + Phaser.Math.Between(0, shapeWidth),
        y - shapeHeight / 2 + Phaser.Math.Between(0, shapeHeight),
      ]);
    }

    const v = voronoi().extent([
      [x - shapeWidth / 2, y - shapeHeight / 2],
      [x + shapeWidth / 2, y + shapeHeight / 2],
    ]);
    const polygons = v(points).polygons();

    let pieceIndex = 0;
    polygons.forEach((polygon: [number, number][], index: number) => {
      if (!polygon || pieceIndex >= pieceCount) return;

      const verticesGlobal = polygon.map(([px, py]) => ({ x: px, y: py }));
      const centerX = verticesGlobal.reduce((sum, v) => sum + v.x, 0) / verticesGlobal.length;
      const centerY = verticesGlobal.reduce((sum, v) => sum + v.y, 0) / verticesGlobal.length;

      const verticesLocal = verticesGlobal.map(v => ({
        x: v.x - centerX,
        y: v.y - centerY,
      }));

      const offsetX = Phaser.Math.Between(-300, 300);
      const offsetY = Phaser.Math.Between(-300, 300);
      const initialX = x + offsetX;
      const initialY = y + offsetY;

      const clampedX = Phaser.Math.Clamp(initialX, 50, 1170 - 50);
      const clampedY = Phaser.Math.Clamp(initialY, 50, 2532 - 50);

      const piece = this.add.polygon(0, 0, verticesLocal, 0x888888);
      piece.setAlpha(1);
      piece.setVisible(true);

      const container = this.add.container(clampedX, clampedY, [piece]);

      const bounds = verticesLocal.reduce(
        (acc, v) => ({
          minX: Math.min(acc.minX, v.x),
          maxX: Math.max(acc.maxX, v.x),
          minY: Math.min(acc.minY, v.y),
          maxY: Math.max(acc.maxY, v.y),
        }),
        { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
      );
      const width = bounds.maxX - bounds.minX;
      const height = bounds.maxY - bounds.minY;
      container.setSize(width, height);

      const interactivePolygon = new Phaser.Geom.Polygon(verticesLocal);
      container.setInteractive(interactivePolygon, Phaser.Geom.Polygon.Contains);

      (container as any).pieceIndex = pieceIndex;

      container.on('pointerdown', () => {
        if (container.body) {
          Matter.Body.setStatic(container.body as Matter.Body, true);
        }
      });
      container.on('pointerup', () => {
        const idx = (container as any).pieceIndex;
        this.snapPiece(idx);
      });
      container.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        container.x = dragX;
        container.y = dragY;
      });

      if (this.input) {
        this.input.setDraggable(container);
      } else {
        console.error('Input plugin is not initialized');
      }

      this.pieces.push({
        container,
        piece,
        originalPosition: { x: centerX, y: centerY },
        vertices: verticesGlobal,
        number: pieceIndex + 1,
        numberText: null,
        offsetX: -verticesLocal[0].x, // オフセットを保存
        offsetY: -verticesLocal[0].y,
      });

      const physicsObject = this.matter.add.gameObject(container, {
        shape: { type: 'fromVertices', verts: verticesLocal },
        mass: 1,
        friction: 0.5,
        slop: 0,
      }) as Phaser.Physics.Matter.Sprite;

      if (physicsObject.body) {
        const body = physicsObject.body as Matter.Body;
        Matter.Body.setStatic(body, true);
        console.log(`Piece ${pieceIndex + 1} created at: (${container.x}, ${container.y})`);
        console.log(`Piece ${pieceIndex + 1} body position: (${body.position.x}, ${body.position.y})`);
      }

      pieceIndex++;
    });

    this.matter.world.setGravity(0, 0);
    console.log(`Shape split into ${this.pieces.length} pieces`);
  }

  private snapPiece(index: number) {
    const pieceData = this.pieces[index];
    if (!pieceData) {
      console.error(`Piece at index ${index} not found`);
      return;
    }
    const container = pieceData.container;
    const targetPos = pieceData.originalPosition;
    const distance = Phaser.Math.Distance.Between(container.x, container.y, targetPos.x, targetPos.y);
    console.log(`Snap distance for piece ${index + 1}: ${distance}`);
    if (distance < 150) { // 閾値を150に緩和
      // オフセットを考慮してコンテナの位置を調整
      container.x = targetPos.x + pieceData.offsetX;
      container.y = targetPos.y + pieceData.offsetY;
      this.sound.play('snap');
      pieceData.piece.setFillStyle(0x00FF00);
      if (container.body) {
        Matter.Body.setStatic(container.body as Matter.Body, true);
      }
      console.log(`Piece ${index + 1} snapped to (${container.x}, ${container.y})`);
    } else {
      if (container.body) {
        Matter.Body.setStatic(container.body as Matter.Body, true);
      }
      console.log(`Snap failed for piece ${index + 1}: distance ${distance} is too large`);
    }
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