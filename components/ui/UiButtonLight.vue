<template>
  <UiButtonDefault class="btn--light" :type="props.type" @click="handleClick">
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
.btn--light {
  background-color: whitesmoke;
}
</style>
