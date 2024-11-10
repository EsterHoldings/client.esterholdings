<template>
  <UiButtonDefault class="btn--link" :type="props.type" @click="handleClick">
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
.btn--link {
  background-color: transparent;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  min-width: min-content;
}
</style>
