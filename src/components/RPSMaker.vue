<script setup lang="ts">
import AspectRatio from '@/components/AspectRatio.vue';
import {defineProps, onBeforeMount, onBeforeUnmount, ref, watch} from 'vue';
import type {RPSCharacterType} from '@/modules/types';

const props = defineProps<{
  types: RPSCharacterType[],
  relations: { [index: string]: number }
}>();

const canvas = ref<HTMLCanvasElement | null>(null);

let ctx: CanvasRenderingContext2D | null = null;
let fieldWidth = 0;
let fieldHeight = 0;
let animation = 0;

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
  ctx.strokeStyle = 'blue';
  ctx.translate(cx, cy);
  ctx.rotate(-Math.PI / 2);
  for (let i = 0; i < types.length; i++) {
    ctx.moveTo(0, 0);
    ctx.lineTo(r, 0);
    ctx.rotate(ang);
  }
  ctx.stroke();
  ctx.restore();
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
});

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