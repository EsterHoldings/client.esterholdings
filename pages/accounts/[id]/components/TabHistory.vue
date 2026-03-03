<script setup lang="ts">
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";

  defineProps<{
    id: string;
    type: string;
    number: string;
    balance: string | number;
    isLoading?: boolean;
  }>();

  type HistoryRow = {
    id: number;
    title: string;
    amount: number;
    date: string;
  };

  const historyRows: HistoryRow[] = [
    { id: 1, title: "Deposit", amount: 5000, date: "12.08.2025 16:19" },
    { id: 2, title: "Deposit", amount: 15540, date: "12.08.2025 16:20" },
    { id: 3, title: "Transfer to account 954573936", amount: -5000, date: "12.08.2025 16:21" },
    { id: 4, title: "Withdrawal", amount: -200, date: "12.08.2025 16:23" },
    { id: 5, title: "Withdrawal", amount: -500, date: "12.08.2025 16:31" },
  ];

  const formatAmount = (value: number): string => {
    const sign = value >= 0 ? "+" : "-";
    const abs = Math.abs(value);

    return `${sign}$ ${abs.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
</script>

<template>
  <div class="account-history">
    <div
      v-if="isLoading"
      class="account-history__loading">
      <UiIconSpinnerDefault class="!h-6 !w-6" />
    </div>

    <div
      v-else
      class="account-history__list">
      <article
        v-for="row in historyRows"
        :key="row.id"
        class="account-history__row">
        <div class="account-history__left">
          <div class="account-history__title">{{ row.title }}</div>
          <UiTextSmall class="account-history__date">{{ row.date }}</UiTextSmall>
        </div>

        <div
          class="account-history__amount"
          :class="row.amount >= 0 ? 'is-positive' : 'is-negative'">
          {{ formatAmount(row.amount) }}
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .account-history {
    width: 100%;
  }

  .account-history__loading {
    min-height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ui-text-main);
  }

  .account-history__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .account-history__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border-radius: 12px;
    border: 1px solid var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--ui-background-card) 62%, transparent);
    padding: 10px 12px;
  }

  .account-history__left {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .account-history__title {
    color: var(--ui-text-main);
    font-weight: 600;
    line-height: 1.3;
    word-break: break-word;
  }

  .account-history__date {
    color: var(--ui-text-secondary);
  }

  .account-history__amount {
    white-space: nowrap;
    font-weight: 700;
    font-size: 16px;
    line-height: 1.1;
  }

  .account-history__amount.is-positive {
    color: var(--ui-sticker-success);
  }

  .account-history__amount.is-negative {
    color: var(--ui-sticker-danger);
  }

  @media (max-width: 640px) {
    .account-history__row {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      padding: 10px;
    }

    .account-history__amount {
      font-size: 15px;
    }
  }
</style>
