<template>
  <img :id="props.id" :src="props.src" :alt="props.alt" />
</template>

<script lang="ts" setup>
const props = defineProps({
  id: {
    type: String,
    default: "",
  },
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: "",
  },
});
</script>

<style lang="scss" scoped>
img {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
