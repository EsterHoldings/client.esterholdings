<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useLocalePath } from "~/.nuxt/imports";

  import UiInfoHint from "~/components/ui/UiInfoHint.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
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

  const payments = reactive<any[]>([]);
  const isLoading = ref(false);
  const errorMsg = ref<string | null>(null);
  const highlightedPaymentIds = ref<string[]>([]);
  const highlightedPaymentPriorities = ref<Record<string, number>>({});
  const paymentHighlightTimers = new Map<string, ReturnType<typeof setTimeout>>();

  const statusKey = (status: unknown): string =>
    String(status ?? "")
      .trim()
      .toLowerCase();

  const isPendingStatus = (status: string): boolean => {
    return ["pending", "processing", "in_progress", "in-progress"].includes(status);
  };

  const isSuccessStatus = (status: string): boolean => {
    return ["success", "approved", "completed", "done"].includes(status);
  };

  const isFailedStatus = (status: string): boolean => {
    return ["failed", "rejected", "cancelled", "error"].includes(status);
  };

  const getTimestamp = (value: unknown): number => {
    const timestamp = new Date(String(value ?? "")).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
  };

  const getPendingUpdateTimestamp = (paymentId: unknown): number => {
    const normalizedPaymentId = String(paymentId ?? "").trim();
    if (normalizedPaymentId === "") {
      return 0;
    }

    return (
      highlightedPaymentPriorities.value[normalizedPaymentId] ??
      recentPaymentUpdatesStore.getPendingTimestampForScope(
        DASHBOARD_TRANSACTIONS_HIGHLIGHT_SCOPE,
        normalizedPaymentId
      ) ??
      0
    );
  };

  const displayedPayments = computed(() => {
    const rows = [...payments];

    rows.sort((a, b) => {
      const aUpdatedAt = getPendingUpdateTimestamp(a?.id);
      const bUpdatedAt = getPendingUpdateTimestamp(b?.id);
      const aHasFreshUpdate = aUpdatedAt > 0;
      const bHasFreshUpdate = bUpdatedAt > 0;

      if (aHasFreshUpdate !== bHasFreshUpdate) {
        return aHasFreshUpdate ? -1 : 1;
      }

      if (aUpdatedAt !== bUpdatedAt) {
        return bUpdatedAt - aUpdatedAt;
      }

      const aPending = isPendingStatus(statusKey(a?.status));
      const bPending = isPendingStatus(statusKey(b?.status));

      if (aPending !== bPending) {
        return aPending ? -1 : 1;
      }

      return getTimestamp(b?.created_at) - getTimestamp(a?.created_at);
    });

    return rows.slice(0, 5);
  });

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

      highlightedPaymentPriorities.value = {
        ...highlightedPaymentPriorities.value,
        [paymentId]: Date.now(),
      };

      clearPaymentHighlightTimer(paymentId);
      const timer = setTimeout(() => {
        highlightedPaymentIds.value = highlightedPaymentIds.value.filter(item => item !== paymentId);
        const nextPriorities = { ...highlightedPaymentPriorities.value };
        delete nextPriorities[paymentId];
        highlightedPaymentPriorities.value = nextPriorities;
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

  const amountClass = (payment: any) => {
    const type = String(payment?.type ?? "").toLowerCase();

    if (["withdraw", "withdrawal", "виплата", "вывод", "payout"].includes(type)) {
      return "text-[var(--ui-sticker-danger)]";
    }

    if (["deposit", "поповнення", "пополнение", "topup"].includes(type)) {
      return "text-[var(--ui-sticker-success)]";
    }

    return "text-[var(--ui-text-main)]";
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

  const loadPaymentsData = async () => {
    if (isLoading.value) return;

    isLoading.value = true;
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

      payments.splice(0, payments.length, ...rows);
      applyRecentPaymentHighlights();
    } catch (error: any) {
      errorMsg.value =
        extractApiErrorMessage(error, t("cabinet.dashboard.transactions.errorLoad")) ??
        t("cabinet.dashboard.transactions.errorLoad");
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    loadPaymentsData();
    useEventBus.on("dashboardRefresh", loadPaymentsData);
  });

  onBeforeUnmount(() => {
    useEventBus.off("dashboardRefresh", loadPaymentsData);
    paymentHighlightTimers.forEach(timer => clearTimeout(timer));
    paymentHighlightTimers.clear();
    highlightedPaymentPriorities.value = {};
  });
</script>

<template>
  <PanelDefault>
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
          <UiIconSpinnerDefault />
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
                  {{ payment.amount }}
                </div>
              </div>

              <div class="min-w-0">
                <div class="transaction-label">{{ t("cabinet.dashboard.transactions.currency") }}</div>
                <div class="transaction-value uppercase tracking-wide">{{ payment.currency }}</div>
              </div>

              <div class="min-w-0">
                <div class="transaction-label">{{ t("cabinet.dashboard.transactions.type") }}</div>
                <div
                  class="transaction-value capitalize truncate"
                  :title="payment.type">
                  {{ payment.type }}
                </div>
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
                  {{ payment.status }}
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
                  {{ payment.status }}
                </span>
              </div>

              <div class="transaction-row__mobile-grid">
                <div>
                  <div class="transaction-label">{{ t("cabinet.dashboard.transactions.amount") }}</div>
                  <div
                    class="transaction-value font-semibold tabular-nums"
                    :class="amountClass(payment)">
                    {{ payment.amount }}
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
                  <div
                    class="transaction-value capitalize truncate"
                    :title="payment.type">
                    {{ payment.type }}
                  </div>
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
        </div>
      </div>
    </div>
  </PanelDefault>
</template>

<style scoped>
  .transactions-widget {
    display: flex;
    flex-direction: column;
    gap: 10px;
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
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-panel);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    text-align: center;
  }

  .transactions-widget__error {
    color: var(--ui-sticker-danger);
  }

  .transactions-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
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
