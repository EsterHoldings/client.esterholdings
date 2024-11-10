<template>
  <div class="rate-stars">
    <span
      v-for="(n, index) in starsCount"
      :class="{ active: index + 1 <= rate }"
      @click="handleClick(index + 1)"
      :key="index"
      >X</span
    >
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits(["change"]);
const props = defineProps({
  starsCount: {
    type: Number,
    default: 5,
  },
  rate: {
    type: Number,
    default: 0,
  },
});
const handleClick = (rate: number): void => emit("change", rate);
</script>

<style lang="scss" scoped>
.rate-stars {
  span {
    &.active {
      color: red;
    }
  }
}
</style>
