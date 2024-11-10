<template>
  <div class="progress">
    <div
      class="progress-bar progress-bar-striped bg-success progress-bar-animated"
      role="progressbar"
      :style="`width: ${progressProcent}%`"
      :aria-valuenow="`${progressProcent}`"
      aria-valuemin="0"
      aria-valuemax="100"
    ></div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  progressProcent: {
    type: Number,
    default: 0,
  },
});
</script>

<style lang="scss" scoped></style>
