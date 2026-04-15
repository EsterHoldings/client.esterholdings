<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import useAppCore from "~/composables/useAppCore";
  import { extractApiErrorMessage } from "~/composables/useApiMessages";
  import useEventBus from "~/composables/useEventBus";

  const props = defineProps<{
    id: string;
    type: string;
    number: string;
    balance: string | number;
    isLoading?: boolean;
    isBalanceRefreshing?: boolean;
  }>();
  const emit = defineEmits<{
    (event: "openDeposit"): void;
  }>();

  type TransactionRow = {
    id: string;
    title: string;
    type: "deposit" | "withdrawal" | "transfer" | "other";
    typeLabel: string;
    status: string;
    statusLabel: string;
    amount: number;
    currency: string;
    createdAt: string | null;
    isPositive: boolean;
  };

  const appCore = useAppCore();
  const { t, locale } = useI18n({ useScope: "global" });
  const rows = ref<TransactionRow[]>([]);
  const isTransactionsLoading = ref(false);
  const hasLoadedOnce = ref(false);
  const loadError = ref(false);
  const loadErrorText = ref("");

  const resolveText = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const emptyStateLabel = computed(() => resolveText("cabinet.accounts.transactions.empty", "No transactions yet"));
  const transactionsTitle = computed(() => resolveText("cabinet.accounts.tabs.history", "Transactions"));
  const errorStateLabel = computed(() =>
    resolveText("cabinet.accounts.transactions.error", "Failed to load transactions.")
  );
  const depositLabel = computed(() => resolveText("cabinet.accounts.actions.deposit", "Deposit"));
  const withdrawLabel = computed(() => resolveText("cabinet.accounts.actions.withdraw", "Withdraw"));
  const transferLabel = computed(() => resolveText("cabinet.accounts.actions.transfer", "Transfer"));
  const transferToAccountLabel = computed(() =>
    resolveText("cabinet.accounts.transactions.transferToAccount", "Transfer to account")
  );
  const isBusy = computed(() => {
    if (isTransactionsLoading.value) return true;
    return !hasLoadedOnce.value && !!props.isLoading;
  });

  const statusKey = (status: unknown): string =>
    String(status ?? "")
      .trim()
      .toLowerCase();

  const isProcessedStatus = (status: unknown): boolean => {
    return [
      "successful",
      "success",
      "approved",
      "completed",
      "done",
      "failed",
      "rejected",
      "cancelled",
      "canceled",
      "refunded",
      "chargeback",
      "expired",
    ].includes(statusKey(status));
  };

  const statusText = (status: unknown): string => {
    const value = String(status ?? "").trim();
    const normalizedValue = value.toLowerCase();

    return value === ""
      ? "-"
      : resolveText(`cabinet.header.notificationTemplates.statuses.${normalizedValue}`, value);
  };

  const statusClass = (status: unknown): string => {
    const normalized = statusKey(status);

    if (["successful", "success", "approved", "completed", "done"].includes(normalized)) {
      return "is-success";
    }

    if (["failed", "rejected", "cancelled", "canceled", "refunded", "chargeback", "expired"].includes(normalized)) {
      return "is-failed";
    }

    return "is-default";
  };

  const resolveTransactionType = (row: Record<string, any>): TransactionRow["type"] => {
    const isInternalTransfer = Boolean(row?.is_internal_transfer || row?.meta?.is_internal_transfer);
    const type = String(row?.type ?? "")
      .trim()
      .toLowerCase();

    if (isInternalTransfer) {
      return "transfer";
    }

    if (type === "withdraw" || type === "withdrawal") {
      return "withdrawal";
    }

    if (type === "deposit") {
      return "deposit";
    }

    return "other";
  };

  const transactionTypeLabel = (type: TransactionRow["type"]): string => {
    if (type === "deposit") {
      return resolveText("cabinet.billing.types.deposit", "Deposit");
    }

    if (type === "withdrawal") {
      return resolveText("cabinet.billing.types.withdrawal", "Withdrawal");
    }

    if (type === "transfer") {
      return transferLabel.value;
    }

    return resolveText("cabinet.dashboard.transactions.type", "Type");
  };

  const resolveTransactionTitle = (row: Record<string, any>): string => {
    const isInternalTransfer = Boolean(row?.is_internal_transfer || row?.meta?.is_internal_transfer);
    const transferToAccountNumber = String(
      row?.transfer_to_account_number ?? row?.meta?.to_account_number ?? ""
    ).trim();
    const type = String(row?.type ?? "")
      .trim()
      .toLowerCase();

    if (isInternalTransfer && transferToAccountNumber !== "") {
      return `${transferToAccountLabel.value} ${transferToAccountNumber}`;
    }

    if (type === "withdraw" || type === "withdrawal") {
      return withdrawLabel.value;
    }

    if (type === "deposit") {
      return depositLabel.value;
    }

    if (isInternalTransfer) {
      return transferLabel.value;
    }

    const paymentSystemName = String(row?.payment_system_name ?? "").trim();
    if (paymentSystemName !== "") {
      return paymentSystemName;
    }

    return type !== "" ? `${type.charAt(0).toUpperCase()}${type.slice(1)}` : transferLabel.value;
  };

  const loadTransactions = async (): Promise<void> => {
    if (isTransactionsLoading.value) return;

    isTransactionsLoading.value = true;
    loadError.value = false;

    try {
      const response = await appCore.payments.get({
        accountId: props.id,
        perPage: 100,
        page: 1,
        orderBy: "created_at",
        orderDirection: "desc",
      });

      const payload = response?.data?.data;
      const list = Array.isArray(payload?.data) ? payload.data : [];

      rows.value = list.filter((row: Record<string, any>) => isProcessedStatus(row?.status)).map((row: Record<string, any>) => {
        const amount = Number(row?.amount ?? 0);
        const type = String(row?.type ?? "")
          .trim()
          .toLowerCase();
        const isInternalTransfer = Boolean(row?.is_internal_transfer || row?.meta?.is_internal_transfer);
        const isPositive = !isInternalTransfer && type !== "withdraw" && type !== "withdrawal";
        const resolvedType = resolveTransactionType(row);
        const status = String(row?.status ?? "");

        return {
          id: String(row?.id ?? ""),
          title: resolveTransactionTitle(row),
          type: resolvedType,
          typeLabel: transactionTypeLabel(resolvedType),
          status,
          statusLabel: statusText(status),
          amount,
          currency: String(row?.currency ?? "USD"),
          createdAt: row?.created_at ? String(row.created_at) : null,
          isPositive,
        };
      });
      loadErrorText.value = "";
    } catch (error: any) {
      rows.value = [];
      loadError.value = true;
      loadErrorText.value = extractApiErrorMessage(error, errorStateLabel.value) ?? errorStateLabel.value;
    } finally {
      hasLoadedOnce.value = true;
      isTransactionsLoading.value = false;
    }
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

  const formatAmount = (value: number, currency: string, isPositive: boolean): string => {
    const sign = isPositive ? "+" : "-";
    const abs = Math.abs(value);

    try {
      return `${sign}${new Intl.NumberFormat(String(locale.value || "en"), {
        style: "currency",
        currency: currency || "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(abs)}`;
    } catch {
      return `${sign}${currency || "USD"} ${abs.toFixed(2)}`;
    }
  };

  onMounted(async () => {
    await loadTransactions();
    useEventBus.on("loadDataForPayments", loadTransactions);
  });

  onBeforeUnmount(() => {
    useEventBus.off("loadDataForPayments", loadTransactions);
  });

  watch(
    () => props.id,
    async () => {
      hasLoadedOnce.value = false;
      await loadTransactions();
    }
  );
</script>

<template>
  <div class="account-history">
    <div class="account-history__header">
      <UiTextH5 class="account-history__heading">{{ transactionsTitle }}</UiTextH5>
      <UiButtonDefault
        class="account-history__deposit-btn"
        state="primary"
        @click="emit('openDeposit')">
        {{ depositLabel }}
      </UiButtonDefault>
    </div>

    <div
      v-if="isBusy"
      class="account-history__loading">
      <UiIconSpinnerDefault class="!h-6 !w-6" />
    </div>

    <div
      v-else-if="rows.length > 0"
      class="account-history__list">
      <article
        v-for="row in rows"
        :key="row.id"
        class="account-history__row">
        <div class="account-history__left">
          <div class="account-history__title-row">
            <div class="account-history__title">{{ row.title }}</div>
            <span
              class="account-history__type"
              :class="`is-${row.type}`">
              {{ row.typeLabel }}
            </span>
          </div>
          <div class="account-history__meta">
            <UiTextSmall class="account-history__date">{{ formatDate(row.createdAt) }}</UiTextSmall>
            <span
              class="account-history__status"
              :class="statusClass(row.status)">
              {{ row.statusLabel }}
            </span>
          </div>
        </div>

        <div
          class="account-history__amount"
          :class="row.isPositive ? 'is-positive' : 'is-negative'">
          {{ formatAmount(row.amount, row.currency, row.isPositive) }}
        </div>
      </article>
    </div>

    <div
      v-else
      class="account-history__empty">
      {{ loadError ? loadErrorText || errorStateLabel : emptyStateLabel }}
    </div>
  </div>
</template>

<style scoped lang="scss">
  .account-history {
    width: 100%;
  }

  .account-history__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }

  .account-history__heading {
    color: var(--ui-text-main);
  }

  .account-history__deposit-btn {
    min-width: 120px;
  }

  .account-history__loading {
    min-height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ui-text-main);
  }

  .account-history__empty {
    min-height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ui-text-secondary);
    text-align: center;
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

  .account-history__title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .account-history__meta {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .account-history__date {
    color: var(--ui-text-secondary);
  }

  .account-history__type,
  .account-history__status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
  }

  .account-history__type.is-deposit {
    color: var(--ui-sticker-success);
    background: color-mix(in srgb, var(--ui-sticker-success) 14%, transparent);
  }

  .account-history__type.is-withdrawal {
    color: var(--ui-sticker-danger);
    background: color-mix(in srgb, var(--ui-sticker-danger) 14%, transparent);
  }

  .account-history__type.is-transfer,
  .account-history__type.is-other {
    color: var(--ui-text-secondary);
    background: color-mix(in srgb, var(--ui-text-secondary) 10%, transparent);
  }

  .account-history__status.is-success {
    color: var(--ui-sticker-success);
    border: 1px solid color-mix(in srgb, var(--ui-sticker-success) 38%, transparent);
  }

  .account-history__status.is-failed {
    color: var(--ui-sticker-danger);
    border: 1px solid color-mix(in srgb, var(--ui-sticker-danger) 38%, transparent);
  }

  .account-history__status.is-default {
    color: var(--ui-text-secondary);
    border: 1px solid var(--color-stroke-ui-light);
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
