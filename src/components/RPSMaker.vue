<script setup lang="ts">
import AspectRatio from '@/components/AspectRatio.vue';
import {defineProps, onBeforeMount, onBeforeUnmount, ref, watch} from 'vue';
import type {RPSCharacterType} from '@/modules/types';
import { drawCacheImage, getCachedData } from '@/modules/canvasCache';

const props = defineProps<{
  types: RPSCharacterType[],
  relations: { [index: string]: number }
}>();

const canvas = ref<HTMLCanvasElement | null>(null);

let ctx: CanvasRenderingContext2D | null = null;
let fieldWidth = 0;
let fieldHeight = 0;

function removeContext() {
  ctx = null;
}

function createContext() {
  if (!canvas.value) return;
  ctx = canvas.value.getContext('2d');
}

function updateCanvasSize() {
  if (!canvas.value) return;
  const w = canvas.value.offsetWidth;
  const h = canvas.value.offsetHeight;
  if (w !== fieldWidth || h !== fieldHeight) {
    canvas.value.width = fieldWidth = w;
    canvas.value.height = fieldHeight = h;
    return true;
  }
  return false;
}

function draw() {
  if (!ctx) return;
  ctx.clearRect(0, 0, fieldWidth, fieldHeight);
  if (props.types.length === 0) return;

  drawTypes(ctx);
  drawRelations(ctx);
}

function drawTypes(ctx: CanvasRenderingContext2D) {
  const r = Math.min(fieldWidth, fieldHeight) / 2 * 0.8;
  const cx = fieldWidth / 2;
  const cy = fieldHeight / 2;

  ctx.strokeStyle = 'blue';
  ctx.beginPath();
  ctx.moveTo(cx + r, cy);
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  const types = props.types;
  const ang = Math.PI * 2 / types.length;
  ctx.save();
  ctx.beginPath();
  ctx.translate(cx, cy);
  ctx.rotate(-Math.PI / 2);
  for (let i = 0; i < types.length; i++) {
    ctx.moveTo(0, 0);
    ctx.lineTo(r, 0);
    ctx.stroke();

    const typeAngle = Math.PI / 2 - ang * i;
    ctx.translate(r, 0);
    ctx.rotate(typeAngle);
    drawType(ctx, types[i]);
    ctx.rotate(-typeAngle);
    ctx.translate(-r, 0);
    ctx.rotate(ang);
  }
  ctx.restore();
}

function drawType (ctx: CanvasRenderingContext2D, type: RPSCharacterType) {
  if (type.cacheId) {
    const cached = getCachedData(type.cacheId);
    if (!cached) return;
    drawCacheImage(ctx, type.cacheId, -cached.size.w / 2, -cached.size.h / 2);
  }
}

function drawRelations(ctx: CanvasRenderingContext2D) {
  const relations = props.relations;
}

function OnResize () {
  if(updateCanvasSize()) {
    draw();
  }
}

watch(canvas, (element) => {
  if (ctx) {
    removeContext();
  }
  if (element) {
    createContext();
    updateCanvasSize();
    draw();
  }
});

watch([() => props.types, () => props.relations], () => {
  draw();
}, {immediate: true});

onBeforeMount(() => {
  window.addEventListener('resize', OnResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', OnResize);
})
</script>

<style scoped>

</style>

<template>
  <AspectRatio
    style="width: 100%; border: 1px solid black; overflow: hidden"
    :aspect="[1, 1]"
  >
    <canvas
      ref="canvas"
      class="full-size"
    />
  </AspectRatio>
</template>