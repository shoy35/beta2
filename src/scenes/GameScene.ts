// /workspaces/beta2/src/scenes/GameScene.ts
import Phaser from 'phaser';
import Matter from 'matter-js';
import HomeButton from '../components/HomeButton';
import WelcomeScene from './WelcomeScene';
import { getResponsivePosition } from '../utils/responsiveUtils';

interface PieceData {
  container: Phaser.GameObjects.Container;
  piece: Phaser.GameObjects.Image;
  originalPosition: { x: number; y: number };
  number: number;
}

export default class GameScene extends Phaser.Scene {
  private homeButton!: HomeButton;
  private shape!: Phaser.GameObjects.Rectangle;
  private startButton!: Phaser.GameObjects.Text;
  private pieces: PieceData[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.audio('snap', 'assets/audio/snap.mp3');
    this.load.image('spark', 'assets/particles/spark.png');
    // SVGファイルをロード
    this.load.svg('piece1', 'assets/tangram_piece1.svg');
    this.load.svg('piece2', 'assets/tangram_piece2.svg');
    this.load.svg('piece3', 'assets/tangram_piece3.svg');
    this.load.svg('piece4', 'assets/tangram_piece4.svg');
    this.load.svg('piece5', 'assets/tangram_piece5.svg');
    this.load.svg('piece6', 'assets/tangram_piece6.svg');
    this.load.svg('piece7', 'assets/tangram_piece7.svg');
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
      onComplete: () => this.showStartButton(),
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

  private showStartButton() {
    const { x, y } = getResponsivePosition(this, 0.5, 0.5);
    this.startButton = this.add.text(x, y, 'Start', {
      fontSize: '32px',
      color: '#FFFFFF',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 },
    }).setOrigin(0.5).setInteractive();

    this.startButton.on('pointerdown', () => {
      console.log('Start button pressed!');
      this.startButton.destroy();
      this.splitShape();
    });
    this.startButton.on('pointerover', () => this.startButton.setStyle({ color: '#CCCCCC' }));
    this.startButton.on('pointerout', () => this.startButton.setStyle({ color: '#FFFFFF' }));
  }

  private splitShape() {
    this.shape.setAlpha(0); // 初期の正方形を非表示
    const { x, y } = getResponsivePosition(this, 0.5, 0.5);
    this.pieces = [];
  
    // SVGベースのピース生成
    const pieceKeys = ['piece1', 'piece2', 'piece3', 'piece4', 'piece5', 'piece6', 'piece7'];
    pieceKeys.forEach((key, index) => {
      const offsetX = Phaser.Math.Between(-300, 300);
      const offsetY = Phaser.Math.Between(-300, 300);
      const initialX = x + offsetX;
      const initialY = y + offsetY;
      const clampedX = Phaser.Math.Clamp(initialX, 500, 1170 - 500); // ピースの半径を考慮
      const clampedY = Phaser.Math.Clamp(initialY, 500, 2532 - 500);
  
      const piece = this.add.image(0, 0, key).setScale(2); // スケールを2倍に
      piece.setOrigin(0.5, 0.5); // 中心を原点に
  
      const container = this.add.container(clampedX, clampedY, [piece]);
      container.setSize(1000, 1000); // コンテナのサイズも2倍に
  
      // ドラッグアンドドロップを有効化
      container.setInteractive();
      this.input.setDraggable(container);
      container.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        container.x = dragX;
        container.y = dragY;
      });
  
      this.pieces.push({
        container,
        piece,
        originalPosition: { x, y }, // 簡易的に中心を基準に
        number: index + 1,
      });
  
      console.log(`Piece ${index + 1} created at: (${container.x}, ${container.y})`);
    });
  
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
    // Easy Modeの実装は後で調整
    console.log('Easy Mode toggled');
  }

  returnToHome() {
    this.scene.start('WelcomeScene');
  }
}