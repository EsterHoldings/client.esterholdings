<template>
  <UiContainer>
    <div class="dashboard-page pt-5 text-[var(--ui-text-main)]">
      <div class="mb-6 flex w-full min-w-0 items-center justify-between gap-2">
        <UiTextH4 class="min-w-0 flex-1 truncate text-[var(--ui-text-main)]">
          {{ t("cabinet.dashboard.title") }}
        </UiTextH4>
        <div class="ml-2 flex shrink-0 items-center">
          <UiButtonDefault
            state="info--small"
            class="!w-[36px] shrink-0"
            @click="handleManualRefresh">
            <UiIconUpdate :spinning="isRefreshIndicatorActive" />
          </UiButtonDefault>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-5">
        <div class="dashboard-top-grid">
          <div class="dashboard-top-grid__summary">
            <div class="dashboard-summary-grid items-stretch">
              <NuxtLink
                :to="localePath('/accounts')"
                class="dashboard-widget-link">
                <TotalAmountWidget
                  class="dashboard-widget-card"
                  :amount="dashboardSummary.totalAmount"
                  :currency="dashboardSummary.currency"
                  :is-loading="isSummaryVisibleLoading" />
              </NuxtLink>
              <NuxtLink
                :to="localePath('/referrals')"
                class="dashboard-widget-link">
                <ReferralTotalAmount
                  class="dashboard-widget-card"
                  :amount="dashboardSummary.referralTotal"
                  :currency="dashboardSummary.currency"
                  :is-loading="isSummaryVisibleLoading" />
              </NuxtLink>
            </div>
          </div>

          <div class="dashboard-top-grid__mt4 flex min-w-0 flex-col text-[var(--ui-text-main)]">
            <Mt4AccountsWidget
              class="h-full"
              :accounts="mt4Accounts"
              :is-loading="isMt4VisibleLoading"
              :account-creation-blocked-reason="mt4VerificationNotice"
              @toggle-favorite="toggleFavorite"
              @refresh-requested="handleRefreshDashboard" />
          </div>

          <div class="dashboard-top-grid__verification flex min-w-0 flex-col text-[var(--ui-text-main)]">
            <AccountVerificationWidget class="h-full" />
          </div>
        </div>

        <div class="col-span-1">
          <TransactionsWidget />
        </div>
      </div>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
  import { useI18n } from "vue-i18n";
  import { computed, onBeforeUnmount, onMounted, ref } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { useToast } from "vue-toastification";
  import { useLocalePath } from "~/.nuxt/imports";

  import UiContainer from "~/components/ui/UiContainer.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";

  import TransactionsWidget from "~/components/block/widgets/TransactionsWidget.vue";
  import TotalAmountWidget from "~/components/block/widgets/TotalAmountWidget.vue";
  import ReferralTotalAmount from "~/components/block/widgets/ReferralTotalAmount.vue";
  import AccountVerificationWidget from "~/components/block/widgets/AccountVerificationWidget.vue";
  import Mt4AccountsWidget from "~/components/block/widgets/Mt4AccountsWidget.vue";
  import { useAuthStore } from "~/stores/authStore";
  import { useRecentPaymentUpdatesStore } from "~/stores/recentPaymentUpdatesStore";
  import { extractApiErrorMessage, resolveApiMessage } from "~/composables/useApiMessages";
  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import useAccountCreationEligibility from "~/composables/useAccountCreationEligibility";
  import useUserPaymentRealtime from "~/composables/useUserPaymentRealtime";

  const { t } = useI18n({ useScope: "global" });
  const localePath = useLocalePath();
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const authStore = useAuthStore();
  const recentPaymentUpdatesStore = useRecentPaymentUpdatesStore();
  const appCore = useAppCore();
  const { canCreateAccount: canManagePayoutDetails, isEligibilityLoaded, refreshAccountCreationEligibility } = useAccountCreationEligibility();
  const DASHBOARD_AUTO_REFRESH_MS = 10000;
  const DASHBOARD_REFRESH_ICON_MIN_DURATION_MS = 350;

  type DashboardSummary = {
    totalAmount: number;
    pendingTransactions: number;
    missedNotifications: number;
    referralTotal: number;
    currency: string;
  };

  const dashboardSummary = ref<DashboardSummary>({
    totalAmount: 0,
    pendingTransactions: 0,
    missedNotifications: 0,
    referralTotal: 0,
    currency: "USD",
  });
  const isSummaryVisibleLoading = ref(false);
  const isMt4VisibleLoading = ref(false);
  const isRefreshIndicatorActive = ref(false);
  const isDashboardRefreshing = ref(false);
  let dashboardAutoRefreshTimer: ReturnType<typeof setInterval> | null = null;
  const EMAIL_VERIFY_QUERY_FLAG = "verify_email";
  const EMAIL_VERIFY_QUERY_ID = "verify_id";
  const EMAIL_VERIFY_QUERY_HASH = "verify_hash";
  const EMAIL_VERIFY_QUERY_EXPIRES = "verify_expires";
  const EMAIL_VERIFY_QUERY_SIGNATURE = "verify_signature";
  const CLIENT_NOTIFICATION_RECEIVED_EVENT = "client-notification-received";
  const BILLING_NOTIFICATION_TYPES = ["payments.withdrawal.status-updated", "payments.deposit.status-updated"];

  const normalizeQueryValue = (value: unknown): string => {
    if (Array.isArray(value)) return typeof value[0] === "string" ? value[0] : "";
    return typeof value === "string" ? value : "";
  };

  const getEmailVerificationPayloadFromQuery = (): {
    id: string;
    hash: string;
    expires: string;
    signature: string;
  } | null => {
    const shouldVerify = normalizeQueryValue(route.query?.[EMAIL_VERIFY_QUERY_FLAG]);
    if (shouldVerify !== "1") return null;

    const id = normalizeQueryValue(route.query?.[EMAIL_VERIFY_QUERY_ID]).trim();
    const hash = normalizeQueryValue(route.query?.[EMAIL_VERIFY_QUERY_HASH]).trim();
    const expires = normalizeQueryValue(route.query?.[EMAIL_VERIFY_QUERY_EXPIRES]).trim();
    const signature = normalizeQueryValue(route.query?.[EMAIL_VERIFY_QUERY_SIGNATURE]).trim();

    if (!id || !hash || !expires || !signature) return null;

    return {
      id,
      hash,
      expires,
      signature,
    };
  };

  const PAYMENT_REALTIME_EVENT_NAMES = [
    ".user.payment.updated",
    "user.payment.updated",
    ".Modules\\Billing\\Events\\UserPaymentUpdated",
    "Modules\\Billing\\Events\\UserPaymentUpdated",
    ".UserPaymentUpdated",
    "UserPaymentUpdated",
  ];

  const clearEmailVerificationQuery = async () => {
    const nextQuery = { ...route.query };
    delete nextQuery[EMAIL_VERIFY_QUERY_FLAG];
    delete nextQuery[EMAIL_VERIFY_QUERY_ID];
    delete nextQuery[EMAIL_VERIFY_QUERY_HASH];
    delete nextQuery[EMAIL_VERIFY_QUERY_EXPIRES];
    delete nextQuery[EMAIL_VERIFY_QUERY_SIGNATURE];
    await router.replace({ query: nextQuery });
  };

  const refreshAuthUser = async () => {
    const response = await appCore.auth.getAuthUser();
    authStore.setUser(response.data);
  };

  const handleEmailVerificationFromQuery = async () => {
    const shouldVerify = normalizeQueryValue(route.query?.[EMAIL_VERIFY_QUERY_FLAG]) === "1";
    if (!shouldVerify) return;

    const payload = getEmailVerificationPayloadFromQuery();
    if (!payload) {
      toast.error(resolveText("cabinet.dashboard.emailVerification.error", "Failed to verify email."));
      await clearEmailVerificationQuery();
      return;
    }

    try {
      const response = await appCore.auth.verifyEmail(payload);
      const message =
        resolveApiMessage(
          response?.data?.message,
          resolveText("cabinet.dashboard.emailVerification.success", "Email verified.")
        ) ?? resolveText("cabinet.dashboard.emailVerification.success", "Email verified.");
      toast.success(message);
      await refreshAuthUser();
    } catch (error: any) {
      const message =
        extractApiErrorMessage(
          error,
          resolveText("cabinet.dashboard.emailVerification.error", "Failed to verify email.")
        ) ?? resolveText("cabinet.dashboard.emailVerification.error", "Failed to verify email.");
      toast.error(message);
    } finally {
      await clearEmailVerificationQuery();
    }
  };

  const registerRecentPaymentUpdate = (payload: any, fallbackUpdatedAt?: string) => {
    const paymentId = String(payload?.payment_id ?? payload?.id ?? "").trim();
    if (paymentId === "") {
      return;
    }

    recentPaymentUpdatesStore.registerUpdate({
      paymentId,
      status: payload?.status,
      amount: payload?.amount,
      updatedAt: String(payload?.updated_at ?? payload?.created_at ?? fallbackUpdatedAt ?? "").trim(),
    });
  };

  const handlePaymentRealtimeUpdated = async (payload: any) => {
    registerRecentPaymentUpdate(payload);

    try {
      await handleRefreshDashboard({
        silent: true,
        suppressBalanceErrorToast: true,
      });
    } catch {
      // no-op
    }
  };

  const handleClientNotificationReceived = async (payload: any) => {
    const notification = payload?.notification;
    const type = String(notification?.type ?? "").trim();
    if (!BILLING_NOTIFICATION_TYPES.includes(type)) {
      return;
    }

    registerRecentPaymentUpdate(notification?.payload, notification?.createdAt ?? notification?.created_at);

    try {
      await handleRefreshDashboard({
        silent: true,
        suppressBalanceErrorToast: true,
      });
    } catch {
      // no-op
    }
  };

  useUserPaymentRealtime({
    eventNames: PAYMENT_REALTIME_EVENT_NAMES,
    onPaymentUpdated: handlePaymentRealtimeUpdated,
    onReconnectSync: async () => {
      await handleRefreshDashboard({
        silent: true,
        suppressBalanceErrorToast: true,
      });
    },
    retryMs: DASHBOARD_AUTO_REFRESH_MS,
    fallbackPollMs: DASHBOARD_AUTO_REFRESH_MS,
    resumeSyncMinIntervalMs: DASHBOARD_AUTO_REFRESH_MS,
  });

  const sleep = (ms: number) =>
    new Promise(resolve => {
      setTimeout(resolve, ms);
    });

  const startDashboardAutoRefresh = () => {
    if (dashboardAutoRefreshTimer) {
      return;
    }

    dashboardAutoRefreshTimer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }

      void handleRefreshDashboard({
        silent: true,
        suppressBalanceErrorToast: true,
      });
    }, DASHBOARD_AUTO_REFRESH_MS);
  };

  const stopDashboardAutoRefresh = () => {
    if (!dashboardAutoRefreshTimer) {
      return;
    }

    clearInterval(dashboardAutoRefreshTimer);
    dashboardAutoRefreshTimer = null;
  };

  onMounted(async () => {
    await handleEmailVerificationFromQuery();
    useEventBus.on(CLIENT_NOTIFICATION_RECEIVED_EVENT, handleClientNotificationReceived);
    await handleRefreshDashboard({
      silent: false,
      suppressBalanceErrorToast: true,
    });
    startDashboardAutoRefresh();
  });

  type Mt4Status = "active" | "inactive";

  type Mt4Account = {
    id: string;
    number: string;
    type: string;
    leverage: string;
    currency: string;
    balance: number;
    status: Mt4Status;
    is_favorite: boolean;
    favorite_at?: string | null;
  };

  const mt4Accounts = ref<Mt4Account[]>([]);

  const MAX_FAVORITES = 3;

  const sortAccounts = (items: Mt4Account[]) =>
    [...items].sort((a, b) => {
      if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
      return (b.balance ?? 0) - (a.balance ?? 0);
    });

  const normalizeBalance = (value: unknown): number => {
    const normalized = Number.parseFloat(String(value ?? "0").replace(",", "."));
    return Number.isFinite(normalized) ? normalized : 0;
  };

  const resolveText = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const mt4VerificationNotice = computed(() =>
    isEligibilityLoaded.value && !canManagePayoutDetails.value
      ? resolveText(
          "cabinet.dashboard.mt4.payoutVerificationNotice",
          "Верификация нужна только для создания реквизитов на выплату. Открывать MT4-счета и пользоваться остальными разделами кабинета можно уже сейчас."
        )
      : ""
  );

  const applyFavoriteLimit = (items: Mt4Account[], selectedId: string) => {
    const favorites = items
      .filter(account => account.is_favorite)
      .sort((a, b) => {
        const aTime = a.favorite_at ? new Date(a.favorite_at).getTime() : 0;
        const bTime = b.favorite_at ? new Date(b.favorite_at).getTime() : 0;
        return aTime - bTime;
      });
    if (favorites.length <= MAX_FAVORITES) return items;
    const toRemove = favorites.find(fav => fav.id !== selectedId) ?? favorites[0];
    return items.map(account =>
      account.id === toRemove.id ? { ...account, is_favorite: false, favorite_at: null } : account
    );
  };

  const toggleFavorite = async (id: string) => {
    const current = mt4Accounts.value.find(account => account.id === id);
    if (!current) return;
    const isAdding = !current.is_favorite;
    const now = new Date().toISOString();
    let optimistic = mt4Accounts.value.map(account =>
      account.id === id ? { ...account, is_favorite: isAdding, favorite_at: isAdding ? now : null } : account
    );
    if (isAdding) {
      optimistic = applyFavoriteLimit(optimistic, id);
    }
    mt4Accounts.value = sortAccounts(optimistic);

    try {
      const response = await appCore.accounts.toggleFavorite(id);
      const payload = response?.data?.data ?? {};
      const updated = payload.account;
      const removedId = payload.removed_favorite_id;
      if (updated?.id) {
        mt4Accounts.value = mt4Accounts.value.map(account =>
          account.id === updated.id
            ? { ...account, is_favorite: !!updated.is_favorite, favorite_at: updated.favorite_at ?? null }
            : account
        );
      }
      if (removedId) {
        mt4Accounts.value = mt4Accounts.value.map(account =>
          account.id === removedId ? { ...account, is_favorite: false, favorite_at: null } : account
        );
      }
      mt4Accounts.value = sortAccounts(mt4Accounts.value);
    } catch {
      handleRefreshMt4();
    }
  };
  const refreshAllAccountBalances = async (options: { suppressErrorToast?: boolean } = {}) => {
    try {
      await appCore.accounts.refreshAllBalances();
    } catch (error: any) {
      if (!options.suppressErrorToast) {
        toast.error(
          extractApiErrorMessage(
            error,
            resolveText("cabinet.accounts.refreshBalancesError", "Failed to refresh account balances.")
          ) ?? resolveText("cabinet.accounts.refreshBalancesError", "Failed to refresh account balances.")
        );
      }
    }
  };

  const loadMt4Accounts = async () => {
    const response = await appCore.accounts.get({
      page: 1,
      perPage: 100,
      orderBy: "balance",
      orderDirection: "desc",
    });
    const items = response?.data?.data?.data ?? [];
    const mapped = items.map((account: any) => ({
      id: account.id,
      number: account.number ?? String(account.id ?? ""),
      type: account.account_type?.name ?? account.accountType?.name ?? "-",
      leverage: String(account?.leverage_display ?? account?.leverage ?? "1:100"),
      currency: account.currency ?? "USD",
      balance: normalizeBalance(account.balance),
      status: account.status ?? "active",
      is_favorite: !!account.is_favorite,
      favorite_at: account.favorite_at ?? null,
    }));
    mt4Accounts.value = sortAccounts(mapped);
  };

  const handleRefreshSummary = async (options: { showLoading?: boolean } = {}) => {
    if (options.showLoading) {
      isSummaryVisibleLoading.value = true;
    }
    try {
      const response = await appCore.dashboard.getSummary();
      const payload = response?.data?.data ?? {};
      dashboardSummary.value = {
        totalAmount: Number(payload.total_amount ?? 0),
        pendingTransactions: Number(payload.pending_transactions ?? 0),
        missedNotifications: Number(payload.missed_notifications ?? 0),
        referralTotal: Number(payload.referral_total ?? 0),
        currency: String(payload.currency ?? "USD"),
      };
    } catch {
    } finally {
      if (options.showLoading) {
        isSummaryVisibleLoading.value = false;
      }
    }
  };

  const handleRefreshMt4 = async (options: { showLoading?: boolean } = {}) => {
    if (options.showLoading) {
      isMt4VisibleLoading.value = true;
    }
    try {
      await loadMt4Accounts();
    } finally {
      if (options.showLoading) {
        await sleep(250);
        isMt4VisibleLoading.value = false;
      }
    }
  };

  const handleRefreshDashboard = async (options: { suppressBalanceErrorToast?: boolean; silent?: boolean } = {}) => {
    if (isDashboardRefreshing.value) {
      return;
    }

    const showLoading = options.silent !== true;
    const startedAt = Date.now();
    isDashboardRefreshing.value = true;
    isRefreshIndicatorActive.value = true;
    useEventBus.emit("dashboardRefresh", { silent: options.silent === true });

    try {
      await refreshAllAccountBalances({
        suppressErrorToast: options.suppressBalanceErrorToast,
      });

      await Promise.all([
        handleRefreshMt4({ showLoading }),
        handleRefreshSummary({ showLoading }),
        refreshAccountCreationEligibility(),
      ]);
    } finally {
      const elapsed = Date.now() - startedAt;
      if (elapsed < DASHBOARD_REFRESH_ICON_MIN_DURATION_MS) {
        await sleep(DASHBOARD_REFRESH_ICON_MIN_DURATION_MS - elapsed);
      }
      isRefreshIndicatorActive.value = false;
      isDashboardRefreshing.value = false;
    }
  };

  const handleManualRefresh = () => {
    void handleRefreshDashboard({ silent: false });
  };

  onBeforeUnmount(() => {
    useEventBus.off(CLIENT_NOTIFICATION_RECEIVED_EVENT, handleClientNotificationReceived);
    stopDashboardAutoRefresh();
  });
</script>

<style scoped>
  .dashboard-page {
    padding-top: 20px;
  }

  .row-item {
    background: var(--color-stroke-ui-dark);
    border-bottom: 1px solid var(--color-stroke-ui-light);
    border-radius: 6px;
    padding: 12px;
    transition: opacity 0.2s ease;
  }

  .row-item:hover {
    opacity: 0.85;
  }

  .dashboard-widget-link {
    display: block;
    background: transparent;
    border: 0;
    padding: 0;
    text-align: left;
    width: 100%;
  }

  .dashboard-summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .dashboard-top-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1.25rem;
    align-items: stretch;
  }

  .dashboard-top-grid__summary {
    min-width: 0;
  }

  .dashboard-top-grid__mt4,
  .dashboard-top-grid__verification {
    min-width: 0;
  }

  @media (max-width: 639px) {
    .dashboard-summary-grid {
      gap: 0.5rem;
    }
  }

  @media (min-width: 1024px) {
    .dashboard-top-grid {
      grid-template-columns: minmax(0, 1.28fr) minmax(320px, 0.92fr);
      align-items: stretch;
    }

    .dashboard-top-grid__summary {
      grid-column: 2;
      grid-row: 1;
    }

    .dashboard-top-grid__mt4 {
      grid-column: 1;
      grid-row: 1 / span 2;
    }

    .dashboard-top-grid__verification {
      grid-column: 2;
      grid-row: 2;
    }
  }

  .dashboard-widget-link :deep(.dashboard-widget-card) {
    height: 100%;
    cursor: pointer;
    background:
      linear-gradient(136deg, color-mix(in srgb, var(--ui-primary-main) 12%, transparent) 0%, transparent 72%),
      color-mix(in srgb, var(--ui-background-card) 72%, transparent) !important;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      opacity 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.2s ease;
    backdrop-filter: blur(20px) saturate(1.08);
    box-shadow:
      inset 0 1px 0 color-mix(in srgb, white 44%, transparent),
      0 16px 42px -30px color-mix(in srgb, var(--ui-primary-main) 44%, transparent);
  }

  .dashboard-widget-link:hover :deep(.dashboard-widget-card) {
    opacity: 0.98;
    transform: translateY(-1px);
  }

  .dashboard-page :deep(.dashboard-widget-card) {
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 14%, var(--color-stroke-ui-light)) !important;
  }

  .dashboard-page :deep(.transactions-widget__loading),
  .dashboard-page :deep(.transactions-widget__error),
  .dashboard-page :deep(.transactions-widget__empty) {
    border: 0 !important;
  }

  .dashboard-page :deep(.transactions-widget__empty) {
    min-height: 92px !important;
    padding: 10px !important;
    background: transparent !important;
    box-shadow: none !important;
  }

  .dashboard-page :deep(.transaction-row) {
    border: 0 !important;
  }

  .dashboard-page :deep(.verification-header-card),
  .dashboard-page :deep(.verification-progress-card),
  .dashboard-page :deep(.verification-step) {
    border-color: transparent !important;
  }

  .dashboard-page :deep(.mt4-widget),
  .dashboard-page :deep(.verification-widget),
  .dashboard-page :deep(.transactions-widget),
  .dashboard-page :deep(.transaction-row),
  .dashboard-page :deep(.verification-step),
  .dashboard-page :deep(.mt4-card) {
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--ui-primary-main) 10%, transparent) 0%, transparent 74%),
      color-mix(in srgb, var(--ui-background-panel) 74%, transparent) !important;
    backdrop-filter: blur(20px) saturate(1.06);
    box-shadow:
      inset 0 1px 0 color-mix(in srgb, white 34%, transparent),
      0 18px 40px -34px color-mix(in srgb, var(--ui-primary-main) 48%, transparent);
  }

  .dashboard-page :deep(.verification-step:hover),
  .dashboard-page :deep(.mt4-card:hover),
  .dashboard-page :deep(.transaction-row:hover) {
    transform: translateY(-1px);
  }

  .dashboard-page :deep(.mt4-card),
  .dashboard-page :deep(.mt4-card:hover),
  .dashboard-page :deep(.mt4-empty-state),
  .dashboard-page :deep(.mt4-empty-state__icon-wrap),
  .dashboard-page :deep(.mt4-menu-trigger),
  .dashboard-page :deep(.mt4-menu-trigger:hover),
  .dashboard-page :deep(.verification-item),
  .dashboard-page :deep(.verification-item:hover),
  .dashboard-page :deep(.transaction-row:hover),
  .dashboard-page :deep(.transaction-row--highlight) {
    border-color: transparent !important;
  }

  /* MT4 and verification styles moved into widgets */
</style>
