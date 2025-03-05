<template>
  <div :class="{'container': !props.fluid, 'container-fluid': props.fluid}">
    <slot />
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  fluid: {
    type: Boolean,
    default: false
  }
})
</script>

<style lang="scss" scoped>
.container {
  margin: auto;
  max-width: 1197px;
  height: 100%;
  width: 100%;
  z-index: 1;
}
</style>