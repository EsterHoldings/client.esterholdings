<template>
  <div
    class="flex h-10 flex-wrap items-center justify-start gap-1 bg-[var(--color-stroke-ui-dark)] px-1"
    :class="bordered ? 'rounded-lg border border-[var(--color-stroke-ui-light)] sm:flex-nowrap sm:justify-center' : ''"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="view-toggle"
      :class="modelValue === option.value ? 'active' : ''"
      :aria-label="option.label"
      :title="option.label"
      @click="$emit('update:modelValue', option.value)"
    >
      <component :is="option.icon" class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
type ViewOption = {
  value: string;
  label: string;
  icon: any;
};

defineProps<{
  modelValue: string;
  options: ViewOption[];
  bordered?: boolean;
}>();

defineEmits<{
  "update:modelValue": [string];
}>();
</script>

<style scoped>
.view-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  width: 32px;
  border-radius: 8px;
  color: var(--ui-text-main);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.view-toggle.active {
  background: var(--ui-primary-main);
  color: #fff;
}

.view-toggle:not(.active):hover {
  background: var(--color-stroke-ui-light);
}
</style>
