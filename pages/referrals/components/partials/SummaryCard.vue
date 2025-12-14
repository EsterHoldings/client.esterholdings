<template>
  <div class="stat-card">
    <UiTextSmall class="text-[var(--ui-text-secondary)]">{{ label }}</UiTextSmall>
    <UiTextH5 class="text-[var(--ui-text-main)] truncate">{{ value }}</UiTextH5>
  </div>
</template>

<script setup lang="ts">
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";

defineProps<{ label: string; value: string | number }>();
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 12px 14px;
  min-height: 78px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
