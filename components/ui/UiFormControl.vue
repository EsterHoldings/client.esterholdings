<template>
  <div class="ui-form-control">
    <div
      class="ui-form-control__label"
      :class="{
        hide: label.length === 0,
        // 'has-error': props.errors?.length > 0,
      }"
    >
      <span>{{ props.label }}</span>
      <span
        v-if="props.required"
        class="ui-form-control__required"
        aria-hidden="true"
      >*</span>
    </div>
    <div><slot /></div>
    <div class="text-error has-error" v-for="error in props.errors">
      {{ error }}
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  label: {
    type: String,
    default: "",
  },
  errors: {
    type: Array,
    default: [],
  },
  required: {
    type: Boolean,
    default: false,
  },
});
</script>

<style lang="scss" scoped>
@use "@/assets/styles/variables" as *;

.text-error {
  font-size: 13px;
  margin-top: 5px;
}

.has-error {
  color: red;
}

.ui-form-control {
  &__label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-bottom: calc($spacer / 2);
    color: var(--ui-text-main);
    .hide {
      display: none;
    }
  }

  &__required {
    color: var(--ui-primary-accent, var(--color-warning));
    font-weight: 700;
  }
}
</style>
