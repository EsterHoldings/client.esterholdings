<template>
  <UiButtonDefault class="btn--danger" :type="props.type" @click="handleClick">
    <UiIconSpinnerLoader v-if="isLoading" style="width: 1rem; height: 1rem" />
    <slot v-if="!isLoading" />
  </UiButtonDefault>
</template>

<script lang="ts" setup>
const props = defineProps({
  type: {
    type: String as PropType<"button" | "submit" | "reset" | undefined>,
    default: "button",
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["click"]);
const handleClick = (): void => emit("click");
</script>

<style lang="scss" scoped>
.btn {
  background-color: transparent;
  border: 1px solid gainsboro;
  border-radius: 10px;
  padding: 10px 20px;
  min-width: min-content;

  &--danger {
    background-color: #c71e1e;
    color: white;
  }
}
</style>
