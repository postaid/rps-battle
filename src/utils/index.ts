export function drawArrow(ctx: CanvasRenderingContext2D, fromx: number, fromy: number, tox: number, toy: number) {
  const headlen = 10; // length of head in pixels
  const dx = tox - fromx;
  const dy = toy - fromy;
  const angle = Math.atan2(dy, dx);
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
  ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(tox, toy);
  ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}

export function drawArrowBack(ctx: CanvasRenderingContext2D, fromx: number, fromy: number, tox: number, toy: number) {
  const headlen = 10; // length of head in pixels
  const dx = tox - fromx;
  const dy = toy - fromy;
  const angle = Math.atan2(dy, dx);
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(fromx - headlen * Math.cos(angle - Math.PI / 6), fromy - headlen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(fromx - headlen * Math.cos(angle + Math.PI / 6), fromy - headlen * Math.sin(angle + Math.PI / 6));
  ctx.moveTo(fromx, fromy);
  ctx.lineTo(tox, toy);
}