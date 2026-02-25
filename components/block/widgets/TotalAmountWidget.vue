<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";

const props = withDefaults(
  defineProps<{
    amount: number;
    currency?: string;
    isLoading?: boolean;
  }>(),
  {
    currency: "USD",
    isLoading: false,
  },
);

const { t } = useI18n({ useScope: "global" });
const resolveText = (key: string, fallback: string) => {
  const value = t(key);
  return value === key ? fallback : value;
};
const title = computed(() => resolveText("cabinet.dashboard.summary.totalAmount", "Total amount"));

const formattedAmount = computed(() => {
  if (props.isLoading) return " ";

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: props.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(props.amount ?? 0));
  } catch {
    return `${props.currency} ${Number(props.amount ?? 0).toFixed(2)}`;
  }
});
</script>

<template>
  <PanelDefault class="relative h-full p-3 sm:p-4 md:p-5">
    <div class="grid h-full w-full grid-cols-1 gap-3 sm:items-center">
      <div class="flex flex-col items-center space-y-1 sm:items-start">
        <UiTextSmall class="!text-[var(--color-success)] text-center sm:text-left">
          {{ title }}
        </UiTextSmall>
        <UiTextH3
          class="amount-text !text-[var(--color-success)] text-center sm:text-left whitespace-nowrap overflow-hidden text-ellipsis"
          :class="{ 'animate-pulse opacity-70': props.isLoading }"
        >
          {{ formattedAmount }}
        </UiTextH3>
      </div>
    </div>
  </PanelDefault>
</template>

<style scoped lang="scss">
.amount-text {
  font-size: clamp(20px, 4vw, 28px);
  line-height: 1.1;
}
</style>
