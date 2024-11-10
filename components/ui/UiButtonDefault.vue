<template>
  <button
    class="btn"
    :class="{
      'btn--info': props.state === 'info',
      'btn--link': props.state === 'link',
      'btn--dark': props.state === 'dark',
      'btn--danger': props.state === 'danger',
      'btn--primary': props.state === 'primary',
      'btn--warning': props.state === 'warning',
      'btn--success': props.state === 'success',
      'btn--secondary': props.state === 'secondary',
    }"
    :type="props.type"
    @click="handleClick"
  >
    <UiIconSpinnerLoader v-if="isLoading" style="width: 1rem; height: 1rem" />
    <slot v-if="!isLoading" />
  </button>
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
  state: {
    type: String,
    default: "",
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

  &--info {
    background-color: #719edf;
  }

  &--link {
    background-color: transparent;
    border: none;
  }

  &--danger {
    background-color: #c71e1e;
    color: white;
  }

  &--dark {
    background-color: #07212d;
    color: white;
  }

  &--primary {
    background-color: #0d6efd;
    color: white;
  }

  &--warning {
    background-color: orange;
    color: white;
  }

  &--success {
    background-color: green;
    color: white;
  }

  &--secondary {
    background-color: darkslategray;
    color: white;
  }
}
</style>
