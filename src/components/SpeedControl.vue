<script setup lang="ts">
import { defineEmits } from 'vue';

interface SpeedControlEmits {
  (e: 'input', value: number): void
}

const emits = defineEmits<SpeedControlEmits>();

const onInput = (event: Event) => {
  const target = event.currentTarget as HTMLInputElement;
  if (!target) return;
  emits('input', +target.value);
}
</script>

<template>
  <input
      style="width: 360px;"
      type="range"
      min="-100"
      max="100"
      step="1"
      value="25"
      @input="onInput"
  />
</template>