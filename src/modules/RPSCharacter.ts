import type { BBox, Position, Size } from '@/modules/types';
import { getId } from '@/modules/IdGenerator';

export class RPSCharacter {
  id: string = '' + getId();
  type = 0;
  position: Position = { x: 0, y: 0 };
  size: Size = { w: 20, h: 20 };
  speed: Position = { x: 0.05, y: 0.05 };
  bbox: BBox = { x0: 0, y0: 0, x1: 0, y1: 0 };
  customData: any = {};

  moveBy (dx: number, dy: number) {
    this.position.x += dx;
    this.position.y += dy;
    this.updateBBox();
  }

  setPosition (x: number, y: number) {
    this.position.x = x;
    this.position.y = y;
    this.updateBBox();
  }

  setSize (w: number, h: number) {
    this.size.w = w;
    this.size.h = h;
    this.updateBBox();
  }

  setSpeed (x: number, y: number) {
    this.speed.x = x;
    this.speed.y = y;
  }

  private updateBBox () {
    const bbox = this.bbox;
    const pos = this.position;
    bbox.x0 = pos.x;
    bbox.y0 = pos.y;
    bbox.x1 = pos.x + this.size.w;
    bbox.y1 = pos.y + this.size.h;
  }
}