<template>
  <div class="panel--default">
    <div v-if="title.length > 0" class="panel--default__title">
      <div class="panel--default__title-content">
        {{ props.title }}
        <div>
          <slot name="title-extra"></slot>
        </div>
      </div>
    </div>
    <div class="panel--default__content">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  title: {
    type: String,
    default: ""
  }
});
</script>

<style lang="scss" scoped>
.panel {
  &--default {
    border: 1px solid var(--color-stroke-ui-dark);
    border-radius: 5px;

    &__title {
      font-weight: 600;
      padding: 0 10px;
      height: 40px;
      display: flex;
      align-items: center;

      &-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }
    }

    &__content {}
  }
}
</style>