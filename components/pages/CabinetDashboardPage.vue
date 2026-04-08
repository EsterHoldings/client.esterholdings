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
            <UiIconUpdate :spinning="isMt4Refreshing" />
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
                  :is-loading="isSummaryLoading" />
              </NuxtLink>
              <NuxtLink
                :to="localePath('/referrals')"
                class="dashboard-widget-link">
                <ReferralTotalAmount
                  class="dashboard-widget-card"
                  :amount="dashboardSummary.referralTotal"
                  :currency="dashboardSummary.currency"
                  :is-loading="isSummaryLoading" />
              </NuxtLink>
            </div>
          </div>

          <div class="dashboard-top-grid__mt4 flex min-w-0 flex-col text-[var(--ui-text-main)]">
            <Mt4AccountsWidget
              class="h-full"
              :accounts="mt4Accounts"
              :is-loading="isMt4Refreshing"
              :can-create-account="canCreateAccount"
              :account-creation-blocked-reason="accountCreationBlockedReason"
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
  import type Echo from "laravel-echo";
  import { useNuxtApp } from "nuxt/app";
  import { useI18n } from "vue-i18n";
  import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
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

  const { t } = useI18n({ useScope: "global" });
  const localePath = useLocalePath();
  const route = useRoute();
  const router = useRouter();
  const toast = useToast();
  const authStore = useAuthStore();
  const recentPaymentUpdatesStore = useRecentPaymentUpdatesStore();
  const appCore = useAppCore();
  const { canCreateAccount, refreshAccountCreationEligibility } = useAccountCreationEligibility();
  const { $echo } = useNuxtApp() as { $echo?: Echo<any> };

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
  const isSummaryLoading = ref(false);
  const paymentRealtimeChannel = ref<any>(null);
  const currentPaymentRealtimeChannelName = ref("");

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

  const resolveEchoClient = () => {
    if ($echo && typeof ($echo as any).private === "function") {
      return $echo as any;
    }

    if (typeof window !== "undefined") {
      const fallbackEcho = (window as any).Echo;
      if (fallbackEcho && typeof fallbackEcho.private === "function") {
        return fallbackEcho;
      }
    }

    return null;
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
      await handleRefreshDashboard({ suppressBalanceErrorToast: true });
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
      await handleRefreshDashboard({ suppressBalanceErrorToast: true });
    } catch {
      // no-op
    }
  };

  const subscribeToPaymentRealtime = () => {
    const userId = String(authStore.user?.id ?? "").trim();
    if (userId === "") {
      return;
    }

    const echoClient = resolveEchoClient();
    if (!echoClient) {
      return;
    }

    const channelName = `payments.user.${userId}`;
    if (currentPaymentRealtimeChannelName.value === channelName && paymentRealtimeChannel.value) {
      return;
    }

    unsubscribeFromPaymentRealtime();
    currentPaymentRealtimeChannelName.value = channelName;
    paymentRealtimeChannel.value = echoClient.private(channelName);

    PAYMENT_REALTIME_EVENT_NAMES.forEach(eventName => {
      paymentRealtimeChannel.value.stopListening(eventName, handlePaymentRealtimeUpdated);
      paymentRealtimeChannel.value.listen(eventName, handlePaymentRealtimeUpdated);
    });
  };

  const unsubscribeFromPaymentRealtime = () => {
    const channelName = currentPaymentRealtimeChannelName.value;
    currentPaymentRealtimeChannelName.value = "";
    paymentRealtimeChannel.value = null;

    if (channelName === "") {
      return;
    }

    const echoClient = resolveEchoClient();
    if (!echoClient) {
      return;
    }

    try {
      echoClient.leave(channelName);
    } catch {
      // no-op
    }
  };

  onMounted(async () => {
    await handleEmailVerificationFromQuery();
    useEventBus.on(CLIENT_NOTIFICATION_RECEIVED_EVENT, handleClientNotificationReceived);
    subscribeToPaymentRealtime();
    await handleRefreshDashboard({ suppressBalanceErrorToast: true });
  });

  watch(
    () => authStore.user?.id,
    () => {
      subscribeToPaymentRealtime();
    }
  );

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

  const accountCreationBlockedReason = computed(() =>
    canCreateAccount.value
      ? ""
      : resolveText(
          "cabinet.accounts.openBlocked",
          "Открытие счета будет доступно после верификации данных профиля и документов."
        )
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
  const isMt4Refreshing = ref(false);
  const refreshAllAccountBalances = async (options: { suppressErrorToast?: boolean } = {}) => {
    try {
      await appCore.accounts.refreshAllBalances();
    } catch {
      if (!options.suppressErrorToast) {
        toast.error(resolveText("cabinet.accounts.refreshBalancesError", "Failed to refresh account balances."));
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

  const handleRefreshSummary = async () => {
    if (isSummaryLoading.value) return;

    isSummaryLoading.value = true;
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
      isSummaryLoading.value = false;
    }
  };

  const handleRefreshMt4 = async () => {
    if (isMt4Refreshing.value) return;
    isMt4Refreshing.value = true;
    try {
      await loadMt4Accounts();
    } finally {
      setTimeout(() => {
        isMt4Refreshing.value = false;
      }, 400);
    }
  };

  const handleRefreshDashboard = async (options: { suppressBalanceErrorToast?: boolean } = {}) => {
    await refreshAllAccountBalances({
      suppressErrorToast: options.suppressBalanceErrorToast,
    });

    try {
      await Promise.all([handleRefreshMt4(), handleRefreshSummary(), refreshAccountCreationEligibility()]);
    } finally {
      useEventBus.emit("dashboardRefresh");
    }
  };

  const handleManualRefresh = () => {
    handleRefreshDashboard();
  };

  onBeforeUnmount(() => {
    useEventBus.off(CLIENT_NOTIFICATION_RECEIVED_EVENT, handleClientNotificationReceived);
    unsubscribeFromPaymentRealtime();
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
    grid-template-columns: minmax(0, 1fr);
    gap: 0.5rem;
  }

  .dashboard-top-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1.25rem;
  }

  .dashboard-top-grid__summary {
    min-width: 0;
  }

  .dashboard-top-grid__mt4,
  .dashboard-top-grid__verification {
    min-width: 0;
  }

  @media (min-width: 640px) {
    .dashboard-summary-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .dashboard-top-grid {
      grid-template-columns: minmax(0, 1.28fr) minmax(320px, 0.92fr);
      align-items: start;
    }

    .dashboard-top-grid__summary {
      grid-column: 1;
      grid-row: 1;
    }

    .dashboard-top-grid__mt4 {
      grid-column: 1;
      grid-row: 2;
    }

    .dashboard-top-grid__verification {
      grid-column: 2;
      grid-row: 1 / span 2;
    }
  }

  .dashboard-widget-link :deep(.dashboard-widget-card) {
    height: 100%;
    cursor: pointer;
    background:
      linear-gradient(136deg, color-mix(in srgb, var(--ui-primary-main) 10%, transparent) 0%, transparent 70.44%),
      var(--ui-background-card) !important;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      opacity 0.2s ease;
  }

  .dashboard-widget-link:hover :deep(.dashboard-widget-card) {
    border-color: var(--color-stroke-ui-light);
    opacity: 0.95;
  }

  .dashboard-page :deep(.dashboard-widget-card) {
    border: 1px solid var(--color-stroke-ui-light) !important;
  }

  .dashboard-page :deep(.transactions-widget__loading),
  .dashboard-page :deep(.transactions-widget__error),
  .dashboard-page :deep(.transactions-widget__empty) {
    border: 1px solid var(--color-stroke-ui-light) !important;
  }

  .dashboard-page :deep(.transactions-widget__empty) {
    min-height: 92px !important;
    padding: 10px !important;
  }

  .dashboard-page :deep(.transaction-row) {
    border: 1px solid var(--color-stroke-ui-light) !important;
  }

  .dashboard-page :deep(.verification-header-card),
  .dashboard-page :deep(.verification-progress-card),
  .dashboard-page :deep(.verification-step),
  .dashboard-page :deep(.verification-item) {
    border-color: var(--color-stroke-ui-light) !important;
  }

  /* MT4 and verification styles moved into widgets */
</style>
