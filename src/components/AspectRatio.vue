<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  aspect: [number, number]
}>();

const dummyHeight = computed<string>(() => {
  return (props.aspect[1] / props.aspect[0]) * 100 + '%';
});

</script>

<style scoped>
.aspect-container {
  position: relative;
  display: inline-block;
}

.aspect-container > .aspect-content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>

<template>
  <div class="aspect-container">
    <div class="aspect-dummy"
      :style="{
        marginTop: dummyHeight
      }"
    ></div>
    <div class="aspect-content">
      <slot/>
    </div>
  </div></template>