<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from "vue";
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
    }
  );

  const { t, locale } = useI18n({ useScope: "global" });
  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };
  const title = computed(() => resolveText("cabinet.dashboard.summary.referralTotalAmount", "Referral total amount"));
  const isCompactMobile = ref(false);
  let compactMediaQuery: MediaQueryList | null = null;

  const updateCompactMobile = () => {
    isCompactMobile.value = compactMediaQuery?.matches ?? false;
  };

  const formatCompactAmount = (amount: number) => {
    const absolute = Math.abs(amount);
    const suffixes = [
      { value: 1_000_000_000, suffix: "B" },
      { value: 1_000_000, suffix: "M" },
      { value: 1_000, suffix: "K" },
    ];

    const matched = suffixes.find(item => absolute >= item.value);
    if (!matched) {
      return new Intl.NumberFormat(locale.value || undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    }

    const compactValue = amount / matched.value;
    const fractionDigits = Math.abs(compactValue) >= 10 ? 0 : 1;
    return `${new Intl.NumberFormat(locale.value || undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: fractionDigits,
    }).format(compactValue)}${matched.suffix}`;
  };

  const formattedAmount = computed(() => {
    if (props.isLoading) return " ";

    const normalizedAmount = Number(props.amount ?? 0);

    if (isCompactMobile.value) {
      return `${formatCompactAmount(normalizedAmount)} $`;
    }

    try {
      return new Intl.NumberFormat(locale.value || undefined, {
        style: "currency",
        currency: props.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(normalizedAmount);
    } catch {
      return `${props.currency} ${normalizedAmount.toFixed(2)}`;
    }
  });

  onMounted(() => {
    if (typeof window === "undefined") return;

    compactMediaQuery = window.matchMedia("(max-width: 639px)");
    updateCompactMobile();
    compactMediaQuery.addEventListener("change", updateCompactMobile);
  });

  onBeforeUnmount(() => {
    compactMediaQuery?.removeEventListener("change", updateCompactMobile);
  });
</script>

<template>
  <PanelDefault class="relative h-full min-h-[72px] p-2.5 sm:min-h-[88px] sm:p-3.5">
    <div class="summary-widget">
      <template v-if="props.isLoading">
        <span class="summary-skeleton summary-skeleton--title animate-pulse" />
        <span class="summary-skeleton summary-skeleton--value animate-pulse" />
      </template>
      <template v-else>
        <UiTextSmall class="summary-title text-left">
          {{ title }}
        </UiTextSmall>
        <UiTextH3 class="summary-value amount-text">
          {{ formattedAmount }}
        </UiTextH3>
      </template>
    </div>
  </PanelDefault>
</template>

<style scoped lang="scss">
  .summary-widget {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    height: 100%;
    min-height: 42px;
  }

  .summary-title {
    flex: 0 0 auto;
    width: 100%;
    min-width: 0;
    font-size: clamp(12px, 2.8vw, 15px);
    line-height: 1.2;
    font-weight: 600;
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
  }

  .summary-value {
    flex: 0 0 auto;
    width: 100%;
    min-width: 0;
    text-align: left;
    white-space: nowrap;
  }

  .summary-skeleton {
    display: inline-block;
    border-radius: 999px;
    background: var(--color-stroke-ui-light);
  }

  .summary-skeleton--title {
    width: 42%;
    min-width: 76px;
    height: 12px;
  }

  .summary-skeleton--value {
    width: 36%;
    min-width: 68px;
    height: 20px;
  }

  .amount-text {
    font-size: clamp(16px, 4.5vw, 22px);
    line-height: 1.1;
  }

  @media (min-width: 640px) {
    .summary-skeleton--title {
      min-width: 120px;
      height: 14px;
    }

    .summary-skeleton--value {
      width: 32%;
      min-width: 84px;
      height: 26px;
    }

    .amount-text {
      font-size: clamp(20px, 4vw, 28px);
    }
  }
</style>
