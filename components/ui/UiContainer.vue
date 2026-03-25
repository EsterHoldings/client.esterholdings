<template>
  <div :class="{ container: !props.fluid, 'container-fluid': props.fluid }">
    <slot />
  </div>
</template>

<script lang="ts" setup>
  const props = defineProps({
    fluid: {
      type: Boolean,
      default: false,
    },
  });
</script>

<style lang="scss" scoped>
  .container {
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 40px;
    z-index: 1;
  }

  @media (max-width: 991px) {
    .container {
      padding: 0 20px;
    }
  }

  @media (max-width: 575px) {
    .container {
      padding: 0 12px;
    }
  }
</style>
