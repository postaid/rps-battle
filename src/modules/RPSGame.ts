export class RPSGame {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  setCanvas (canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }
}
