<template>
  <UiButtonDefault class="btn--success" :type="props.type" @click="handleClick">
    <slot />
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
.btn--success {
  background-color: green;
}
</style>
