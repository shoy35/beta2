export function getResponsivePosition(scene: Phaser.Scene, xPercent: number, yPercent: number) {
    const width = scene.cameras.main.width;
    const height = scene.cameras.main.height;
    return {
      x: width * xPercent,
      y: height * yPercent,
    };
  }