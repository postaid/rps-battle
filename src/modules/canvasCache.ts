import { getId } from '@/modules/IdGenerator';
import type { BBox, Size } from '@/modules/types';

let offscreenCtx: CanvasRenderingContext2D | null = null;
const cache: { [index: string]: CanvasCahceData } = {};

export interface CanvasCahceData {
  bbox: BBox,
  size: Size,
}

export function getOffscreenCtx (): CanvasRenderingContext2D {
  if (offscreenCtx) return offscreenCtx;

  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = 500;
  offscreenCanvas.height = 500;
  offscreenCtx = offscreenCanvas.getContext('2d');
  return offscreenCtx as CanvasRenderingContext2D;
}

export function cacheImage (callback: (ctx: CanvasRenderingContext2D) => BBox) {
  const ctx = getOffscreenCtx();
  const bbox = callback(ctx);
  const size = { w: bbox.x1 - bbox.x0, h: bbox.y1 - bbox.y0 };
  const id = getId() + '';
  cache[id] = { bbox, size };
  return id;
}

export function drawCacheImage (ctx: CanvasRenderingContext2D, cacheId: string, x: number, y: number, w?: number, h?: number) {
  const offscreenCtx = getOffscreenCtx();
  const cacheData = cache[cacheId];
  if (!cacheData) return;
  const bbox = cacheData.bbox;
  const size = cacheData.size;
  ctx.drawImage(offscreenCtx.canvas, bbox.x0, bbox.y0, size.w, size.h, x, y, w || size.w, h || size.h);
}

export function getCachedData (id: string): CanvasCahceData | null {
  return cache[id] || null;
}
