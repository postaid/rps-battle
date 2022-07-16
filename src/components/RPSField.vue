<script setup lang="ts">
import { onMounted, ref } from 'vue';

const emit = defineEmits<{
  (e: 'canvasready', {field, fog}: {field: HTMLCanvasElement, fog: HTMLCanvasElement}): void
}>()

const canvas = ref<HTMLCanvasElement | null>(null);
const canvasFog = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (canvas.value && canvasFog.value) {
    emit('canvasready', {field: canvas.value, fog: canvasFog.value});
  }
});
</script>

<style scoped>
.rpsb-field-container {
  position: relative;
}

.rpsb-field-layer {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>

<template>
  <div class="rpsb-field-container full-size">
    <canvas
        class="rpsb-field-layer"
        ref="canvas"
    />
    <canvas
        class="rpsb-field-layer"
        ref="canvasFog"
    />
  </div>
</template>