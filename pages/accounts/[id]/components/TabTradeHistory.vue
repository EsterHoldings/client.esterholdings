<script setup lang="ts">
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";

  import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import useAppCore from "~/composables/useAppCore";
  import { extractApiErrorMessage } from "~/composables/useApiMessages";
  import { useToast } from "vue-toastification";

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

  type PagePayload = {
    mapped: TradeHistoryRow[];
    currentPage: number;
    lastPage: number;
    total: number;
  };

  const appCore = useAppCore();
  const { t, locale } = useI18n({ useScope: "global" });
  const toast = useToast();

  const rows = ref<TradeHistoryRow[]>([]);
  const page = ref(1);
  const lastPage = ref(1);
  const searchQuery = ref("");
  const debouncedSearchQuery = ref("");

  const isListLoading = ref(false);
  const isLoadingMore = ref(false);
  const isSyncingHistory = ref(false);
  const hasLoadedOnce = ref(false);
  const syncedAfterEmpty = ref(false);
  const loadErrorText = ref("");
  let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  const PER_PAGE = 20;

  const resolveText = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const emptyStateLabel = computed(() => resolveText("cabinet.accounts.tradeHistory.empty", "No trades yet"));
  const errorStateLabel = computed(() =>
    resolveText("cabinet.accounts.tradeHistory.error", "Failed to load trade history.")
  );
  const loadMoreLabel = computed(() => resolveText("cabinet.accounts.tradeHistory.loadMore", "Load more"));
  const loadingMoreLabel = computed(() => resolveText("cabinet.accounts.tradeHistory.loadingMore", "Loading..."));
  const searchPlaceholder = computed(() =>
    resolveText("cabinet.accounts.tradeHistory.searchPlaceholder", "Search by all trade fields")
  );
  const syncLabel = computed(() => resolveText("cabinet.accounts.tradeHistory.sync", "Sync history"));
  const syncingLabel = computed(() => resolveText("cabinet.accounts.tradeHistory.syncing", "Syncing..."));
  const syncErrorLabel = computed(() =>
    resolveText("cabinet.accounts.tradeHistory.syncError", "Failed to synchronize trade history.")
  );

  const isBusy = computed(() => {
    if (isListLoading.value) return true;
    return !hasLoadedOnce.value && !!props.isLoading;
  });

  const hasMore = computed(() => page.value < lastPage.value);

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

  const fetchPage = async (targetPage: number): Promise<PagePayload> => {
    const params: Record<string, string | number> = {
      page: targetPage,
      per_page: PER_PAGE,
      sort: "open_time",
      direction: "desc",
    };

    if (debouncedSearchQuery.value !== "") {
      params.search = debouncedSearchQuery.value;
    }

    const response = await appCore.accounts.getTradeHistory(props.id, params);

    const payload = response?.data?.data ?? {};
    const list = Array.isArray(payload?.data) ? payload.data : [];

    return {
      mapped: list.map((item: Record<string, any>) => normalizeRow(item)),
      currentPage: Number(payload?.current_page ?? targetPage) || targetPage,
      lastPage: Number(payload?.last_page ?? 1) || 1,
      total: Number(payload?.total ?? list.length) || 0,
    };
  };

  const syncHistory = async (options: { suppressError?: boolean } = {}) => {
    try {
      await appCore.accounts.syncTradeHistory(props.id, {});
    } catch (error) {
      if (!options.suppressError) {
        throw error;
      }
    }
  };

  const loadHistory = async (targetPage = 1, mode: "replace" | "append" = "replace", syncIfEmpty = false) => {
    if (mode === "append") {
      isLoadingMore.value = true;
    } else {
      isListLoading.value = true;
    }

    try {
      const payload = await fetchPage(targetPage);

      rows.value = mode === "append" ? [...rows.value, ...payload.mapped] : payload.mapped;
      page.value = payload.currentPage;
      lastPage.value = payload.lastPage;
      hasLoadedOnce.value = true;
      loadErrorText.value = "";

      if (syncIfEmpty && targetPage === 1 && payload.total === 0 && !syncedAfterEmpty.value) {
        syncedAfterEmpty.value = true;
        await syncHistory({ suppressError: true });
        await loadHistory(1, "replace", false);
      }
    } catch (error: any) {
      if (mode === "replace") {
        rows.value = [];
        page.value = 1;
        lastPage.value = 1;
        hasLoadedOnce.value = true;
        loadErrorText.value = extractApiErrorMessage(error, errorStateLabel.value) ?? errorStateLabel.value;
      }
    } finally {
      if (mode === "append") {
        isLoadingMore.value = false;
      } else {
        isListLoading.value = false;
      }
    }
  };

  const loadMore = async () => {
    if (!hasMore.value || isListLoading.value || isLoadingMore.value) return;

    await loadHistory(page.value + 1, "append", false);
  };

  const applyFilters = async () => {
    await loadHistory(1, "replace", false);
  };

  const syncAndReload = async () => {
    if (isSyncingHistory.value || isListLoading.value || isLoadingMore.value) return;

    isSyncingHistory.value = true;
    try {
      await syncHistory();
    } catch (error: any) {
      toast.error(extractApiErrorMessage(error, syncErrorLabel.value) ?? syncErrorLabel.value);
    } finally {
      isSyncingHistory.value = false;
    }

    await loadHistory(1, "replace", false);
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

  watch(
    () => props.id,
    async () => {
      hasLoadedOnce.value = false;
      syncedAfterEmpty.value = false;
      await loadHistory(1, "replace", true);
    }
  );

  watch(searchQuery, value => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    searchDebounceTimer = setTimeout(() => {
      debouncedSearchQuery.value = value.trim();
    }, 300);
  });

  watch(debouncedSearchQuery, async () => {
    if (!hasLoadedOnce.value) return;
    await applyFilters();
  });

  onBeforeUnmount(() => {
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = null;
    }
  });

  onMounted(async () => {
    await loadHistory(1, "replace", true);
  });
</script>

<template>
  <div class="account-history">
    <div class="account-history__controls">
      <div class="account-history__search-wrap">
        <input
          v-model="searchQuery"
          type="text"
          class="account-history__search-input"
          :placeholder="searchPlaceholder" />
      </div>
      <button
        type="button"
        class="account-history__sync-btn"
        :disabled="isSyncingHistory || isListLoading || isLoadingMore"
        :title="isSyncingHistory ? syncingLabel : syncLabel"
        @click="syncAndReload">
        <UiIconUpdate
          class="h-[14px] w-[14px]"
          :spinning="isSyncingHistory" />
      </button>
    </div>

    <div
      v-if="isBusy"
      class="account-history__loading">
      <UiIconSpinnerDefault class="!h-6 !w-6" />
    </div>

    <div
      v-else-if="rows.length === 0"
      class="account-history__empty">
      {{ loadErrorText || emptyStateLabel }}
    </div>

    <div
      v-else
      class="account-history__list">
      <article
        v-for="row in rows"
        :key="row.id"
        class="account-history__row">
        <div class="account-history__left">
          <div class="account-history__title">{{ resolveTitle(row) }}</div>
          <UiTextSmall class="account-history__date">#{{ row.mt4_ticket_id }}</UiTextSmall>
          <UiTextSmall class="account-history__date">{{ resolveDateLabel(row) }}</UiTextSmall>
        </div>

        <div
          class="account-history__amount"
          :class="row.profit > 0 ? 'is-positive' : row.profit < 0 ? 'is-negative' : 'is-neutral'">
          {{ formatAmount(row.profit) }}
        </div>
      </article>
    </div>

    <button
      v-if="!isBusy && hasMore"
      type="button"
      class="account-history__load-more"
      :disabled="isLoadingMore"
      @click="loadMore">
      {{ isLoadingMore ? loadingMoreLabel : loadMoreLabel }}
    </button>
  </div>
</template>

<style scoped lang="scss">
  .account-history {
    width: 100%;
  }

  .account-history__controls {
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .account-history__search-wrap {
    min-width: 220px;
    flex: 1 1 260px;
  }

  .account-history__search-input {
    width: 100%;
    height: 34px;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--ui-background-card) 68%, transparent);
    color: var(--ui-text-main);
    padding: 0 10px;
    font-size: 13px;
    line-height: 1.2;
    outline: none;
  }

  .account-history__search-input::placeholder {
    color: var(--ui-text-secondary);
  }

  .account-history__search-input:focus {
    border-color: color-mix(in srgb, var(--ui-primary-main) 55%, var(--color-stroke-ui-light));
  }

  .account-history__sync-btn {
    width: 34px;
    height: 34px;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 10px;
    background: color-mix(in srgb, var(--ui-background-card) 70%, transparent);
    color: var(--ui-text-main);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
  }

  .account-history__sync-btn:disabled {
    opacity: 0.65;
    cursor: default;
  }

  .account-history__loading,
  .account-history__empty {
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

  .account-history__amount.is-neutral {
    color: var(--ui-text-main);
  }

  .account-history__load-more {
    display: block;
    margin: 12px auto 0;
    border: none;
    background: transparent;
    color: var(--ui-text-secondary);
    font-size: 14px;
    font-weight: 600;
    line-height: 1.2;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
    padding: 4px 8px;
  }

  .account-history__load-more:disabled {
    opacity: 0.65;
    cursor: default;
  }

  @media (max-width: 640px) {
    .account-history__controls {
      align-items: flex-start;
      gap: 6px;
      margin-bottom: 8px;
    }

    .account-history__search-wrap {
      min-width: 0;
      width: 100%;
      flex: 1 1 100%;
    }

    .account-history__sync-btn {
      margin-left: auto;
    }

    .account-history__row {
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
      padding: 10px;
    }

    .account-history__amount {
      font-size: 15px;
    }

    .account-history__load-more {
      margin-top: 10px;
      font-size: 13px;
    }
  }
</style>
