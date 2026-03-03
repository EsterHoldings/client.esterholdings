<script setup lang="ts">
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";

  import { computed, onMounted, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import useAppCore from "~/composables/useAppCore";

  const props = defineProps<{
    id: string;
    type: string;
    number: string;
    balance: string | number;
    isLoading?: boolean;
    isBalanceRefreshing?: boolean;
  }>();

  type TradeHistoryRow = {
    id: string;
    mt4_ticket_id: string;
    symbol: string | null;
    cmd: string | null;
    category: string;
    profit: number;
    open_time: string | null;
    close_time: string | null;
    comment: string | null;
  };

  type SyncResult = {
    inserted?: number;
    updated?: number;
    remote_count?: number;
    synced_at?: string;
  };

  const appCore = useAppCore();
  const { t, locale } = useI18n({ useScope: "global" });

  const rows = ref<TradeHistoryRow[]>([]);
  const page = ref(1);
  const lastPage = ref(1);
  const total = ref(0);

  const isListLoading = ref(false);
  const isSyncing = ref(false);
  const hasLoadedOnce = ref(false);
  const syncResult = ref<SyncResult | null>(null);

  const PER_PAGE = 20;

  const resolveText = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const syncButtonLabel = computed(() => resolveText("cabinet.accounts.tradeHistory.sync", "Sync history"));
  const emptyStateLabel = computed(() => resolveText("cabinet.accounts.tradeHistory.empty", "No trades yet"));
  const totalLabel = computed(() => resolveText("cabinet.accounts.tradeHistory.total", "Records"));

  const isBusy = computed(() => {
    if (isListLoading.value) return true;
    return !hasLoadedOnce.value && !!props.isLoading;
  });

  const normalizeRow = (raw: Record<string, any>): TradeHistoryRow => {
    const profitValue = Number(raw?.profit ?? 0);
    const fallbackId = `${raw?.open_time ?? ""}-${raw?.close_time ?? ""}-${raw?.symbol ?? ""}-${raw?.cmd ?? ""}`;

    return {
      id: String(raw?.id ?? raw?.mt4_ticket_id ?? fallbackId),
      mt4_ticket_id: String(raw?.mt4_ticket_id ?? ""),
      symbol: raw?.symbol ? String(raw.symbol) : null,
      cmd: raw?.cmd ? String(raw.cmd) : null,
      category: String(raw?.category ?? "order"),
      profit: Number.isFinite(profitValue) ? profitValue : 0,
      open_time: raw?.open_time ? String(raw.open_time) : null,
      close_time: raw?.close_time ? String(raw.close_time) : null,
      comment: raw?.comment ? String(raw.comment) : null,
    };
  };

  const loadHistory = async (targetPage = 1, syncIfEmpty = false) => {
    isListLoading.value = true;

    try {
      const response = await appCore.accounts.getTradeHistory(props.id, {
        page: targetPage,
        per_page: PER_PAGE,
      });

      const payload = response?.data?.data ?? {};
      const list = Array.isArray(payload?.data) ? payload.data : [];

      rows.value = list.map((item: Record<string, any>) => normalizeRow(item));
      page.value = Number(payload?.current_page ?? targetPage) || targetPage;
      lastPage.value = Number(payload?.last_page ?? 1) || 1;
      total.value = Number(payload?.total ?? rows.value.length) || 0;
      hasLoadedOnce.value = true;

      if (syncIfEmpty && targetPage === 1 && total.value === 0) {
        await syncHistory();
      }
    } catch {
      rows.value = [];
      page.value = targetPage;
      lastPage.value = 1;
      total.value = 0;
      hasLoadedOnce.value = true;
    } finally {
      isListLoading.value = false;
    }
  };

  const syncHistory = async () => {
    if (isSyncing.value) return;

    isSyncing.value = true;
    try {
      const response = await appCore.accounts.syncTradeHistory(props.id, {});
      syncResult.value = (response?.data?.data ?? null) as SyncResult | null;
      await loadHistory(1);
    } catch {
      syncResult.value = null;
    } finally {
      isSyncing.value = false;
    }
  };

  const goPrev = async () => {
    if (page.value <= 1 || isListLoading.value) return;
    await loadHistory(page.value - 1);
  };

  const goNext = async () => {
    if (page.value >= lastPage.value || isListLoading.value) return;
    await loadHistory(page.value + 1);
  };

  const formatAmount = (value: number): string => {
    const sign = value > 0 ? "+" : value < 0 ? "-" : "";
    const abs = Math.abs(value);

    return `${sign}$ ${abs.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (value: string | null): string => {
    if (!value) return "-";

    const normalized = value.includes("T") ? value : value.replace(" ", "T");
    const date = new Date(normalized);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(String(locale.value || "en"), {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const resolveTitle = (row: TradeHistoryRow): string => {
    if (row.category === "balance" || row.category === "credit") {
      return row.comment || row.cmd || row.category;
    }

    if (row.symbol && row.cmd) {
      return `${row.symbol} • ${row.cmd}`;
    }

    if (row.symbol) {
      return row.symbol;
    }

    return row.cmd || row.category;
  };

  const resolveDateLabel = (row: TradeHistoryRow): string => {
    if (row.open_time && row.close_time) {
      return `${formatDate(row.open_time)} - ${formatDate(row.close_time)}`;
    }

    return formatDate(row.open_time || row.close_time);
  };

  const syncSummary = computed(() => {
    if (!syncResult.value) return "";

    const inserted = Number(syncResult.value.inserted ?? 0);
    const updated = Number(syncResult.value.updated ?? 0);

    return `${resolveText("cabinet.accounts.tradeHistory.added", "Added")}: ${inserted} • ${resolveText("cabinet.accounts.tradeHistory.updated", "Updated")}: ${updated}`;
  });

  watch(
    () => props.id,
    async () => {
      hasLoadedOnce.value = false;
      syncResult.value = null;
      await loadHistory(1, true);
    }
  );

  onMounted(async () => {
    await loadHistory(1, true);
  });
</script>

<template>
  <div class="trade-history">
    <div class="trade-history__header">
      <UiTextSmall class="trade-history__meta"> {{ totalLabel }}: {{ total }} </UiTextSmall>

      <button
        type="button"
        class="trade-history__sync-btn"
        :disabled="isSyncing || isListLoading"
        @click="syncHistory">
        <UiIconUpdate
          class="trade-history__sync-icon"
          :spinning="isSyncing" />
        <span>{{ syncButtonLabel }}</span>
      </button>
    </div>

    <UiTextSmall
      v-if="syncSummary"
      class="trade-history__sync-summary">
      {{ syncSummary }}
    </UiTextSmall>

    <div
      v-if="isBusy"
      class="trade-history__loading">
      <UiIconSpinnerDefault class="!h-6 !w-6" />
    </div>

    <div
      v-else-if="rows.length === 0"
      class="trade-history__empty">
      {{ emptyStateLabel }}
    </div>

    <div
      v-else
      class="trade-history__list">
      <article
        v-for="row in rows"
        :key="row.id"
        class="trade-history__row">
        <div class="trade-history__left">
          <div class="trade-history__title">{{ resolveTitle(row) }}</div>
          <UiTextSmall class="trade-history__details"> #{{ row.mt4_ticket_id }} </UiTextSmall>
          <UiTextSmall class="trade-history__date">
            {{ resolveDateLabel(row) }}
          </UiTextSmall>
        </div>

        <div
          class="trade-history__amount"
          :class="row.profit > 0 ? 'is-positive' : row.profit < 0 ? 'is-negative' : 'is-neutral'">
          {{ formatAmount(row.profit) }}
        </div>
      </article>
    </div>

    <div
      v-if="!isBusy && lastPage > 1"
      class="trade-history__pagination">
      <button
        type="button"
        class="trade-history__page-btn"
        :disabled="page <= 1 || isListLoading"
        @click="goPrev">
        {{ resolveText("cabinet.accounts.pagination.prev", "Prev") }}
      </button>

      <UiTextSmall class="trade-history__page-info"> {{ page }} / {{ lastPage }} </UiTextSmall>

      <button
        type="button"
        class="trade-history__page-btn"
        :disabled="page >= lastPage || isListLoading"
        @click="goNext">
        {{ resolveText("cabinet.accounts.pagination.next", "Next") }}
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .trade-history {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .trade-history__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .trade-history__meta {
    color: var(--ui-text-secondary);
  }

  .trade-history__sync-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 8px;
    background: transparent;
    color: var(--ui-text-main);
    padding: 6px 10px;
    font-size: 13px;
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
  }

  .trade-history__sync-btn:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ui-background-card) 70%, transparent);
  }

  .trade-history__sync-btn:disabled {
    opacity: 0.65;
    cursor: default;
  }

  .trade-history__sync-icon {
    width: 14px;
    height: 14px;
  }

  .trade-history__sync-summary {
    color: var(--ui-text-secondary);
  }

  .trade-history__loading,
  .trade-history__empty {
    min-height: 160px;
    border-radius: 12px;
    border: 1px solid var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--ui-background-card) 62%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ui-text-main);
  }

  .trade-history__list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .trade-history__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border-radius: 12px;
    border: 1px solid var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--ui-background-card) 62%, transparent);
    padding: 10px 12px;
  }

  .trade-history__left {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .trade-history__title {
    color: var(--ui-text-main);
    font-weight: 600;
    line-height: 1.3;
    word-break: break-word;
  }

  .trade-history__details,
  .trade-history__date {
    color: var(--ui-text-secondary);
  }

  .trade-history__amount {
    white-space: nowrap;
    font-weight: 700;
    font-size: 16px;
    line-height: 1.1;
  }

  .trade-history__amount.is-positive {
    color: var(--ui-sticker-success);
  }

  .trade-history__amount.is-negative {
    color: var(--ui-sticker-danger);
  }

  .trade-history__amount.is-neutral {
    color: var(--ui-text-main);
  }

  .trade-history__pagination {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  .trade-history__page-btn {
    min-width: 72px;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 8px;
    background: transparent;
    color: var(--ui-text-main);
    padding: 6px 10px;
    font-size: 13px;
    line-height: 1;
    cursor: pointer;
  }

  .trade-history__page-btn:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ui-background-card) 70%, transparent);
  }

  .trade-history__page-btn:disabled {
    opacity: 0.65;
    cursor: default;
  }

  .trade-history__page-info {
    color: var(--ui-text-secondary);
  }

  @media (max-width: 640px) {
    .trade-history__header {
      flex-direction: column;
      align-items: flex-start;
    }

    .trade-history__row {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      padding: 10px;
    }

    .trade-history__amount {
      font-size: 15px;
    }

    .trade-history__pagination {
      justify-content: space-between;
    }
  }
</style>
