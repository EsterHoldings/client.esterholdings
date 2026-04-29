<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useLocalePath } from "~/.nuxt/imports";

  import UiInfoHint from "~/components/ui/UiInfoHint.vue";
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";

  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import { extractApiErrorMessage } from "~/composables/useApiMessages";
  import { useRecentPaymentUpdatesStore } from "~/stores/recentPaymentUpdatesStore";

  const { t } = useI18n({ useScope: "global" });
  const localePath = useLocalePath();
  const appCore = useAppCore();
  const recentPaymentUpdatesStore = useRecentPaymentUpdatesStore();
  const DASHBOARD_TRANSACTIONS_HIGHLIGHT_SCOPE = "dashboard-transactions";
  const PAYMENT_HIGHLIGHT_DURATION_MS = 4500;
  const TRANSACTIONS_CHUNK_SIZE = 3;

  const payments = reactive<any[]>([]);
  const isLoading = ref(false);
  const errorMsg = ref<string | null>(null);
  const visiblePaymentsCount = ref(TRANSACTIONS_CHUNK_SIZE);
  const highlightedPaymentIds = ref<string[]>([]);
  const paymentHighlightTimers = new Map<string, ReturnType<typeof setTimeout>>();

  const statusKey = (status: unknown): string =>
    String(status ?? "")
      .trim()
      .toLowerCase();

  const isPendingStatus = (status: string): boolean => {
    return ["pending", "processing", "in_progress", "in-progress"].includes(status);
  };

  const isSuccessStatus = (status: string): boolean => {
    return ["success", "successful", "approved", "completed", "done"].includes(status);
  };

  const isFailedStatus = (status: string): boolean => {
    return ["failed", "rejected", "cancelled", "canceled", "error", "refunded", "chargeback", "expired"].includes(
      status
    );
  };

  const getTimestamp = (value: unknown): number => {
    const timestamp = new Date(String(value ?? "")).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
  };

  const orderedPayments = computed(() => {
    const rows = [...payments];

    rows.sort((a, b) => {
      return getTimestamp(b?.created_at) - getTimestamp(a?.created_at);
    });

    return rows;
  });

  const displayedPayments = computed(() => orderedPayments.value.slice(0, visiblePaymentsCount.value));
  const hasMorePayments = computed(() => displayedPayments.value.length < orderedPayments.value.length);
  const loadMorePayments = () => {
    visiblePaymentsCount.value += TRANSACTIONS_CHUNK_SIZE;
  };

  const clearPaymentHighlightTimer = (paymentId: string) => {
    const activeTimer = paymentHighlightTimers.get(paymentId);
    if (!activeTimer) {
      return;
    }

    clearTimeout(activeTimer);
    paymentHighlightTimers.delete(paymentId);
  };

  const isPaymentHighlighted = (paymentId: string | number): boolean =>
    highlightedPaymentIds.value.includes(String(paymentId));

  const schedulePaymentHighlights = (paymentIds: Array<string | number | null | undefined>) => {
    Array.from(new Set(paymentIds.map(item => String(item ?? "").trim()).filter(Boolean))).forEach(paymentId => {
      if (!highlightedPaymentIds.value.includes(paymentId)) {
        highlightedPaymentIds.value = [...highlightedPaymentIds.value, paymentId];
      }

      clearPaymentHighlightTimer(paymentId);
      const timer = setTimeout(() => {
        highlightedPaymentIds.value = highlightedPaymentIds.value.filter(item => item !== paymentId);
        paymentHighlightTimers.delete(paymentId);
      }, PAYMENT_HIGHLIGHT_DURATION_MS);

      paymentHighlightTimers.set(paymentId, timer);
    });
  };

  const applyRecentPaymentHighlights = () => {
    const matchedIds = recentPaymentUpdatesStore.takeMatchesForScope(
      DASHBOARD_TRANSACTIONS_HIGHLIGHT_SCOPE,
      displayedPayments.value.map(payment => payment?.id)
    );

    if (matchedIds.length > 0) {
      schedulePaymentHighlights(matchedIds);
    }
  };

  const paymentDetailLink = (payment: any) => localePath(`/payments/${String(payment?.id ?? "").trim()}`);

  const paymentTypeKey = (payment: any): "deposit" | "withdrawal" | "transfer" | "other" => {
    if (payment?.is_internal_transfer || payment?.meta?.is_internal_transfer) {
      return "transfer";
    }

    const type = String(payment?.type ?? "").toLowerCase();

    if (["withdraw", "withdrawal", "виплата", "вывод", "payout"].includes(type)) {
      return "withdrawal";
    }

    if (["deposit", "поповнення", "пополнение", "topup"].includes(type)) {
      return "deposit";
    }

    return "other";
  };

  const paymentTypeLabel = (payment: any): string => {
    const type = paymentTypeKey(payment);

    if (type === "deposit") {
      return t("cabinet.billing.types.deposit");
    }

    if (type === "withdrawal") {
      return t("cabinet.billing.types.withdrawal");
    }

    if (type === "transfer") {
      return t("cabinet.accounts.actions.transfer");
    }

    return String(payment?.type ?? "").trim() || t("cabinet.dashboard.transactions.type");
  };

  const paymentTypeClass = (payment: any): string => `transaction-type--${paymentTypeKey(payment)}`;

  const amountClass = (payment: any) => {
    const type = paymentTypeKey(payment);

    if (type === "withdrawal" || type === "transfer") {
      return "text-[var(--ui-sticker-danger)]";
    }

    if (type === "deposit") {
      return "text-[var(--ui-sticker-success)]";
    }

    return "text-[var(--ui-text-main)]";
  };

  const formatPaymentAmount = (payment: any): string => {
    const type = paymentTypeKey(payment);
    const sign = type === "withdrawal" || type === "transfer" ? "-" : type === "deposit" ? "+" : "";
    const amount = String(payment?.amount ?? "0").trim();

    return `${sign}${amount}`;
  };

  const statusText = (status: unknown): string => {
    const value = String(status ?? "").trim();
    const normalizedValue = value.toLowerCase();
    const key = `cabinet.header.notificationTemplates.statuses.${normalizedValue}`;
    const translated = t(key);

    return value === "" ? "-" : translated === key ? value : translated;
  };

  const statusClass = (status: unknown) => {
    const normalized = statusKey(status);

    return {
      "transaction-status--pending": isPendingStatus(normalized),
      "transaction-status--success": isSuccessStatus(normalized),
      "transaction-status--failed": isFailedStatus(normalized),
      "transaction-status--default":
        !isPendingStatus(normalized) && !isSuccessStatus(normalized) && !isFailedStatus(normalized),
    };
  };

  const loadPaymentsData = async (options: { showLoading?: boolean } = {}) => {
    if (isLoading.value) return;

    if (options.showLoading) {
      isLoading.value = true;
    }
    errorMsg.value = null;

    try {
      const response = await appCore.payments.get({
        perPage: 100,
        page: 1,
        orderBy: "created_at",
        orderDirection: "desc",
      });

      const payload = response?.data?.data;
      const rows = Array.isArray(payload?.data) ? payload.data : [];

      visiblePaymentsCount.value = TRANSACTIONS_CHUNK_SIZE;
      payments.splice(0, payments.length, ...rows);
      applyRecentPaymentHighlights();
    } catch (error: any) {
      if (options.showLoading || payments.length === 0) {
        errorMsg.value =
          extractApiErrorMessage(error, t("cabinet.dashboard.transactions.errorLoad")) ??
          t("cabinet.dashboard.transactions.errorLoad");
      }
    } finally {
      if (options.showLoading) {
        isLoading.value = false;
      }
    }
  };

  const handleDashboardRefresh = (payload?: { silent?: boolean }) => {
    void loadPaymentsData({ showLoading: payload?.silent !== true });
  };

  onMounted(() => {
    void loadPaymentsData({ showLoading: true });
    useEventBus.on("dashboardRefresh", handleDashboardRefresh);
  });

  onBeforeUnmount(() => {
    useEventBus.off("dashboardRefresh", handleDashboardRefresh);
    paymentHighlightTimers.forEach(timer => clearTimeout(timer));
    paymentHighlightTimers.clear();
  });
</script>

<template>
  <div class="transactions-widget-panel">
    <div class="transactions-widget">
      <div class="transactions-widget__header">
        <div class="transactions-widget__title-wrap">
          <UiTextH5 class="!text-[var(--ui-text-main)]">{{ t("cabinet.dashboard.transactions.title") }}</UiTextH5>
          <UiInfoHint
            :label="t('cabinet.dashboard.transactions.tooltipLabel')"
            :content="t('cabinet.dashboard.transactions.tooltip')" />
        </div>
      </div>

      <div class="transactions-widget__body">
        <div
          v-if="isLoading"
          class="transactions-widget__loading">
          <div class="transactions-widget__skeleton-list">
            <div
              v-for="idx in TRANSACTIONS_CHUNK_SIZE"
              :key="`payment-skeleton-${idx}`"
              class="transaction-row transaction-row--skeleton">
              <div class="hidden md:grid transaction-row__desktop">
                <div class="space-y-2">
                  <div class="transactions-skeleton transactions-skeleton--label animate-pulse"></div>
                  <div class="transactions-skeleton transactions-skeleton--value animate-pulse"></div>
                </div>
                <div class="space-y-2">
                  <div class="transactions-skeleton transactions-skeleton--label animate-pulse"></div>
                  <div class="transactions-skeleton transactions-skeleton--value transactions-skeleton--value-sm animate-pulse"></div>
                </div>
                <div class="space-y-2">
                  <div class="transactions-skeleton transactions-skeleton--label animate-pulse"></div>
                  <div class="transactions-skeleton transactions-skeleton--value transactions-skeleton--value-xs animate-pulse"></div>
                </div>
                <div class="space-y-2">
                  <div class="transactions-skeleton transactions-skeleton--label animate-pulse"></div>
                  <div class="transactions-skeleton transactions-skeleton--pill animate-pulse"></div>
                </div>
                <div class="space-y-2 justify-self-end text-right">
                  <div class="transactions-skeleton transactions-skeleton--label animate-pulse ml-auto"></div>
                  <div class="transactions-skeleton transactions-skeleton--value transactions-skeleton--date animate-pulse ml-auto"></div>
                </div>
                <div class="justify-self-end">
                  <div class="transactions-skeleton transactions-skeleton--pill animate-pulse"></div>
                </div>
              </div>

              <div class="md:hidden flex flex-col gap-[10px]">
                <div class="flex items-start justify-between gap-2">
                  <div class="space-y-2">
                    <div class="transactions-skeleton transactions-skeleton--label animate-pulse"></div>
                    <div class="transactions-skeleton transactions-skeleton--value animate-pulse"></div>
                  </div>
                  <div class="transactions-skeleton transactions-skeleton--pill animate-pulse"></div>
                </div>
                <div class="transaction-row__mobile-grid">
                  <div class="space-y-2">
                    <div class="transactions-skeleton transactions-skeleton--label animate-pulse"></div>
                    <div class="transactions-skeleton transactions-skeleton--value transactions-skeleton--value-sm animate-pulse"></div>
                  </div>
                  <div class="space-y-2 text-right">
                    <div class="transactions-skeleton transactions-skeleton--label animate-pulse ml-auto"></div>
                    <div class="transactions-skeleton transactions-skeleton--value transactions-skeleton--value-xs animate-pulse ml-auto"></div>
                  </div>
                </div>
                <div class="transaction-row__mobile-grid transaction-row__mobile-grid--bordered">
                  <div class="space-y-2">
                    <div class="transactions-skeleton transactions-skeleton--label animate-pulse"></div>
                    <div class="transactions-skeleton transactions-skeleton--pill animate-pulse"></div>
                  </div>
                  <div class="space-y-2 text-right">
                    <div class="transactions-skeleton transactions-skeleton--label animate-pulse ml-auto"></div>
                    <div class="transactions-skeleton transactions-skeleton--value transactions-skeleton--date animate-pulse ml-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else-if="errorMsg"
          class="transactions-widget__error">
          {{ errorMsg }}
        </div>

        <div
          v-else-if="displayedPayments.length === 0"
          class="transactions-widget__empty">
          <UiTextH5>{{ t("cabinet.dashboard.transactions.empty") }}</UiTextH5>
        </div>

        <div
          v-else
          class="transactions-list">
          <NuxtLink
            v-for="(payment, index) in displayedPayments"
            :key="payment.id || index"
            :to="paymentDetailLink(payment)"
            :class="['transaction-row', isPaymentHighlighted(payment.id) ? 'transaction-row--highlight' : '']">
            <div class="hidden md:grid transaction-row__desktop">
              <div class="min-w-0">
                <div class="transaction-label">{{ t("cabinet.dashboard.transactions.accountNumber") }}</div>
                <div
                  class="transaction-value truncate"
                  :title="payment.account_number">
                  {{ payment.account_number }}
                </div>
              </div>

              <div class="min-w-0">
                <div class="transaction-label">{{ t("cabinet.dashboard.transactions.amount") }}</div>
                <div
                  class="transaction-value font-semibold tabular-nums"
                  :class="amountClass(payment)">
                  {{ formatPaymentAmount(payment) }}
                </div>
              </div>

              <div class="min-w-0">
                <div class="transaction-label">{{ t("cabinet.dashboard.transactions.currency") }}</div>
                <div class="transaction-value uppercase tracking-wide">{{ payment.currency }}</div>
              </div>

              <div class="min-w-0">
                <div class="transaction-label">{{ t("cabinet.dashboard.transactions.type") }}</div>
                <span
                  class="transaction-type"
                  :class="paymentTypeClass(payment)">
                  {{ paymentTypeLabel(payment) }}
                </span>
              </div>

              <div class="min-w-0 text-right">
                <div class="transaction-label">{{ t("cabinet.dashboard.transactions.createdAt") }}</div>
                <UiTextSmall
                  class="transaction-value tabular-nums truncate"
                  :title="payment.created_at">
                  {{ payment.created_at }}
                </UiTextSmall>
              </div>

              <div class="justify-self-end">
                <span
                  class="transaction-status"
                  :class="statusClass(payment.status)">
                  {{ statusText(payment.status) }}
                </span>
              </div>
            </div>

            <div class="md:hidden flex flex-col gap-[10px]">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="transaction-label">{{ t("cabinet.dashboard.transactions.accountNumber") }}</div>
                  <div
                    class="transaction-value truncate"
                    :title="payment.account_number">
                    {{ payment.account_number }}
                  </div>
                </div>
                <span
                  class="transaction-status"
                  :class="statusClass(payment.status)">
                  {{ statusText(payment.status) }}
                </span>
              </div>

              <div class="transaction-row__mobile-grid">
                <div>
                  <div class="transaction-label">{{ t("cabinet.dashboard.transactions.amount") }}</div>
                  <div
                    class="transaction-value font-semibold tabular-nums"
                    :class="amountClass(payment)">
                    {{ formatPaymentAmount(payment) }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="transaction-label">{{ t("cabinet.dashboard.transactions.currency") }}</div>
                  <div class="transaction-value uppercase tracking-wide">{{ payment.currency }}</div>
                </div>
              </div>

              <div class="transaction-row__mobile-grid transaction-row__mobile-grid--bordered">
                <div>
                  <div class="transaction-label">{{ t("cabinet.dashboard.transactions.type") }}</div>
                  <span
                    class="transaction-type"
                    :class="paymentTypeClass(payment)">
                    {{ paymentTypeLabel(payment) }}
                  </span>
                </div>
                <div class="text-right">
                  <div class="transaction-label">{{ t("cabinet.dashboard.transactions.createdAt") }}</div>
                  <div
                    class="transaction-value tabular-nums truncate"
                    :title="payment.created_at">
                    {{ payment.created_at }}
                  </div>
                </div>
              </div>
            </div>
          </NuxtLink>

          <button
            v-if="hasMorePayments"
            type="button"
            class="transactions-widget__load-more"
            @click="loadMorePayments">
            {{ t("cabinet.dashboard.transactions.loadMore") }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .transactions-widget {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .transactions-widget-panel {
    background: transparent !important;
    border: 0 !important;
    box-shadow: none !important;
    padding: 0 !important;
  }

  .transactions-widget__header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    flex-wrap: wrap;
  }

  .transactions-widget__title-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .transactions-widget__body {
    position: relative;
    min-height: 160px;
  }

  .transactions-widget__loading,
  .transactions-widget__error,
  .transactions-widget__empty {
    min-height: 160px;
    border-radius: 12px;
    border: 0;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    text-align: center;
  }

  .transactions-widget__loading {
    padding: 0;
    border: 0;
    background: transparent;
    min-height: 0;
  }

  .transactions-widget__skeleton-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .transactions-widget__error {
    color: var(--ui-sticker-danger);
  }

  .transactions-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .transactions-widget__load-more {
    align-self: center;
    margin-top: 2px;
    border: 0;
    background: transparent;
    color: var(--ui-text-secondary);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition:
      color 0.2s ease,
      opacity 0.2s ease;
  }

  .transactions-widget__load-more:hover {
    color: var(--ui-text-main);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .transaction-row {
    display: block;
    border-radius: 12px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-panel);
    padding: 12px 14px;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      opacity 0.2s ease;
  }

  .transaction-row--skeleton {
    pointer-events: none;
  }

  .transactions-skeleton {
    display: block;
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-stroke-ui-light) 82%, transparent);
  }

  .transactions-skeleton--label {
    width: 64px;
    height: 10px;
  }

  .transactions-skeleton--value {
    width: 132px;
    height: 14px;
  }

  .transactions-skeleton--value-sm {
    width: 72px;
  }

  .transactions-skeleton--value-xs {
    width: 54px;
  }

  .transactions-skeleton--pill {
    width: 84px;
    height: 24px;
    border-radius: 999px;
  }

  .transactions-skeleton--date {
    width: 108px;
  }

  .transaction-row:hover {
    background: var(--ui-background-card);
    border-color: var(--color-stroke-ui-light);
    opacity: 0.95;
  }

  .transaction-row--highlight {
    animation: transaction-highlight-flash 4.5s ease;
    border-color: color-mix(in srgb, var(--ui-primary-main) 58%, transparent);
    background:
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--ui-primary-main) 16%, transparent) 0%,
        color-mix(in srgb, var(--ui-sticker-success) 12%, transparent) 100%
      ),
      var(--ui-background-panel);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--ui-primary-main) 18%, transparent);
  }

  .transaction-row__desktop {
    grid-template-columns:
      minmax(128px, 1.25fr) minmax(82px, 0.58fr) minmax(74px, 0.52fr) minmax(110px, 0.82fr) minmax(168px, 0.95fr)
      auto;
    gap: 14px;
    align-items: center;
  }

  .transaction-row__desktop > div {
    min-height: 42px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .transaction-row__mobile-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .transaction-row__mobile-grid--bordered {
    border-top: 1px solid var(--color-stroke-ui-light);
    padding-top: 10px;
  }

  .transaction-label {
    font-size: 11px;
    color: var(--ui-text-secondary);
    margin-bottom: 2px;
  }

  .transaction-value {
    color: var(--ui-text-main);
    line-height: 1.28;
  }

  .transaction-type {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
  }

  .transaction-type--deposit {
    color: var(--ui-sticker-success);
    background: color-mix(in srgb, var(--ui-sticker-success) 14%, transparent);
  }

  .transaction-type--withdrawal,
  .transaction-type--transfer {
    color: var(--ui-sticker-danger);
    background: color-mix(in srgb, var(--ui-sticker-danger) 14%, transparent);
  }

  .transaction-type--other {
    color: var(--ui-text-secondary);
    background: color-mix(in srgb, var(--ui-text-secondary) 10%, transparent);
  }

  .transaction-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 600;
    text-transform: capitalize;
    border: 1px solid transparent;
    white-space: nowrap;
  }

  .transaction-status--pending {
    color: var(--ui-sticker-warning);
    border-color: rgba(245, 158, 11, 0.45);
    background: rgba(245, 158, 11, 0.14);
  }

  .transaction-status--success {
    color: var(--ui-sticker-success);
    border-color: rgba(16, 185, 129, 0.45);
    background: rgba(16, 185, 129, 0.14);
  }

  .transaction-status--failed {
    color: var(--ui-sticker-danger);
    border-color: rgba(239, 68, 68, 0.45);
    background: rgba(239, 68, 68, 0.14);
  }

  .transaction-status--default {
    color: var(--ui-text-secondary);
    border-color: var(--color-stroke-ui-light);
    background: transparent;
  }

  @keyframes transaction-highlight-flash {
    0% {
      transform: translateY(0);
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--ui-primary-main) 0%, transparent);
    }
    12% {
      transform: translateY(-1px);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-primary-main) 20%, transparent);
    }
    65% {
      transform: translateY(0);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ui-primary-main) 14%, transparent);
    }
    100% {
      transform: translateY(0);
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--ui-primary-main) 0%, transparent);
    }
  }
</style>
