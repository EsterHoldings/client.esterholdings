<template>
  <PageStructureDefault>
    <template #header>
      <UiTextH4 class="text-[var(--ui-text-main)] mr-5">
        {{ pageTitle }}
      </UiTextH4>

      <UiButtonDefault
        v-if="payment && canSyncPayment(payment)"
        state="primary"
        class="w-full md:w-auto"
        :disabled="isSyncing"
        @click="handleSyncPayment">
        {{ isSyncing ? syncPaymentLoadingLabel : syncPaymentLabel }}
      </UiButtonDefault>

      <NuxtLink
        :to="paymentsListLink"
        class="w-full md:w-auto">
        <UiButtonDefault
          state="info--outline"
          class="w-full md:w-auto">
          {{ backLabel }}
        </UiButtonDefault>
      </NuxtLink>
    </template>

    <template #content>
      <div
        v-if="isLoading"
        class="flex min-h-[40vh] items-center justify-center">
        <UiIconSpinnerDefault />
      </div>

      <div
        v-else-if="errorMessage"
        class="rounded-xl border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] p-4 text-[var(--ui-sticker-danger)]">
        {{ errorMessage }}
      </div>

      <div
        v-else-if="payment"
        :class="[
          'rounded-xl border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] p-4 md:p-5',
          isPaymentHighlighted ? 'payment-detail-highlight' : '',
        ]">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div class="payment-field">
            <UiTextSmall class="payment-field__label">{{ idLabel }}</UiTextSmall>
            <div class="payment-field__value break-all">{{ payment.id }}</div>
          </div>

          <div class="payment-field">
            <UiTextSmall class="payment-field__label">{{ accountLabel }}</UiTextSmall>
            <div class="payment-field__value">{{ displayAccountRoute(payment) }}</div>
          </div>

          <div class="payment-field">
            <UiTextSmall class="payment-field__label">{{ amountLabel }}</UiTextSmall>
            <div class="payment-field__value">${{ valueOrDash(payment.amount) }}</div>
          </div>

          <div class="payment-field">
            <UiTextSmall class="payment-field__label">{{ currencyLabel }}</UiTextSmall>
            <div class="payment-field__value">{{ valueOrDash(payment.currency) }}</div>
          </div>

          <div class="payment-field">
            <UiTextSmall class="payment-field__label">{{ statusLabel }}</UiTextSmall>
            <div class="payment-field__value capitalize">{{ displayStatus(payment.status) }}</div>
          </div>

          <div class="payment-field">
            <UiTextSmall class="payment-field__label">{{ typeLabel }}</UiTextSmall>
            <div class="payment-field__value capitalize">{{ displayType(payment) }}</div>
          </div>

          <div class="payment-field">
            <UiTextSmall class="payment-field__label">{{ paymentSystemLabel }}</UiTextSmall>
            <div class="payment-field__value">{{ displayPaymentSystem(payment) }}</div>
          </div>

          <div class="payment-field">
            <UiTextSmall class="payment-field__label">{{ gatewayLabel }}</UiTextSmall>
            <div class="payment-field__value">{{ valueOrDash(payment.payment_gateway) }}</div>
          </div>

          <div class="payment-field">
            <UiTextSmall class="payment-field__label">{{ createdAtLabel }}</UiTextSmall>
            <div class="payment-field__value">{{ valueOrDash(payment.created_at) }}</div>
          </div>

          <div class="payment-field">
            <UiTextSmall class="payment-field__label">{{ updatedAtLabel }}</UiTextSmall>
            <div class="payment-field__value">{{ valueOrDash(payment.updated_at) }}</div>
          </div>

          <div class="payment-field md:col-span-2">
            <UiTextSmall class="payment-field__label">{{ commentLabel }}</UiTextSmall>
            <div class="payment-field__value">{{ valueOrDash(payment.comment) }}</div>
          </div>

          <div
            v-if="payment.payment_detail_name"
            class="payment-field md:col-span-2">
            <UiTextSmall class="payment-field__label">{{ paymentDetailLabel }}</UiTextSmall>
            <div class="payment-field__value">{{ valueOrDash(payment.payment_detail_name) }}</div>
          </div>

          <div
            v-if="payment.admin_comment"
            class="payment-field md:col-span-2">
            <UiTextSmall class="payment-field__label">{{ adminCommentLabel }}</UiTextSmall>
            <div class="payment-field__value">{{ valueOrDash(payment.admin_comment) }}</div>
          </div>

          <div class="payment-field md:col-span-2">
            <UiTextSmall class="payment-field__label">{{ redirectLinkLabel }}</UiTextSmall>
            <div class="flex justify-start items-center gap-2">
              <UiIconCopy text="valueOrDash(payment.redirect_link)" />
              <a
                  class="payment-field__value break-all"
                  :href="valueOrDash(payment.redirect_link)"
              >{{ valueOrDash(payment.redirect_link) }}</a>
            </div>
          </div>

          <template v-if="isInternalTransfer(payment)">
            <div class="payment-field">
              <UiTextSmall class="payment-field__label">{{ transferFromLabel }}</UiTextSmall>
              <div class="payment-field__value">{{ valueOrDash(payment.transfer_from_account_number) }}</div>
            </div>
            <div class="payment-field">
              <UiTextSmall class="payment-field__label">{{ transferToLabel }}</UiTextSmall>
              <div class="payment-field__value">{{ valueOrDash(payment.transfer_to_account_number) }}</div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
  import type Echo from "laravel-echo";
  import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
  import { useRoute } from "vue-router";
  import { definePageMeta, useLocalePath, useNuxtApp } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";

  import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import { useToast } from "vue-toastification";
  import { extractApiErrorMessage, resolveApiMessage } from "~/composables/useApiMessages";
  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import { useAuthStore } from "~/stores/authStore";
  import { useRecentPaymentUpdatesStore } from "~/stores/recentPaymentUpdatesStore";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";

  definePageMeta({
    layout: "cabinet",
    middleware: ["auth-client", "client-check-auth"],
  });

  const appCore = useAppCore();
  const CLIENT_NOTIFICATION_RECEIVED_EVENT = "client-notification-received";
  const BILLING_NOTIFICATION_TYPES = ["payments.withdrawal.status-updated", "payments.deposit.status-updated"];
  const PAYMENT_DETAIL_HIGHLIGHT_SCOPE = "payments-detail";
  const PAYMENT_HIGHLIGHT_DURATION_MS = 4500;
  const PAYMENT_REALTIME_EVENT_NAMES = [
    ".user.payment.updated",
    "user.payment.updated",
    ".Modules\\Billing\\Events\\UserPaymentUpdated",
    "Modules\\Billing\\Events\\UserPaymentUpdated",
    ".UserPaymentUpdated",
    "UserPaymentUpdated",
  ];
  const route = useRoute();
  const localePath = useLocalePath();
  const { t } = useI18n({ useScope: "global" });
  const authStore = useAuthStore();
  const recentPaymentUpdatesStore = useRecentPaymentUpdatesStore();
  const { $echo } = useNuxtApp() as { $echo?: Echo<any> };
  const toast = useToast();

  const isLoading = ref(true);
  const isSyncing = ref(false);
  const errorMessage = ref<string | null>(null);
  const payment = ref<any | null>(null);
  const paymentRealtimeChannel = ref<any>(null);
  const currentPaymentRealtimeChannelName = ref("");
  const isPaymentHighlighted = ref(false);
  let paymentHighlightTimer: ReturnType<typeof setTimeout> | null = null;

  const paymentId = computed(() => String(route.params.id ?? "").trim());
  const paymentsListLink = computed(() => localePath("/payments"));

  const resolveI18nValue = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const pageTitle = computed(() => `${resolveI18nValue("cabinet.billing.title", "Платежи")} #${paymentId.value}`);
  const backLabel = computed(() => resolveI18nValue("cabinet.billing.backToList", "К списку платежей"));
  const idLabel = computed(() => resolveI18nValue("cabinet.common.id", "ID"));
  const syncPaymentLabel = computed(() => resolveI18nValue("cabinet.billing.syncPayment", "Синхронизировать"));
  const syncPaymentLoadingLabel = computed(() =>
    resolveI18nValue("cabinet.billing.syncPaymentLoading", "Синхронизация...")
  );
  const syncPaymentSuccessLabel = computed(() =>
    resolveI18nValue("cabinet.billing.syncPaymentSuccess", "Платеж успешно синхронизирован.")
  );
  const syncPaymentErrorLabel = computed(() =>
    resolveI18nValue("cabinet.billing.syncPaymentError", "Не удалось синхронизировать платеж.")
  );
  const accountLabel = computed(() => resolveI18nValue("cabinet.billing.columns.accountNumber", "Номер счета"));
  const amountLabel = computed(() => resolveI18nValue("cabinet.billing.columns.amount", "Сумма"));
  const currencyLabel = computed(() => resolveI18nValue("cabinet.billing.columns.currency", "Валюта"));
  const statusLabel = computed(() => resolveI18nValue("cabinet.billing.columns.status", "Статус"));
  const typeLabel = computed(() => resolveI18nValue("cabinet.dashboard.transactions.type", "Тип"));
  const paymentSystemLabel = computed(() =>
    resolveI18nValue("cabinet.billing.columns.paymentSystem", "Платежная система")
  );
  const gatewayLabel = computed(() => resolveI18nValue("cabinet.billing.gateway", "Payment gateway"));
  const createdAtLabel = computed(() => resolveI18nValue("cabinet.billing.columns.createdAt", "Создано"));
  const updatedAtLabel = computed(() => resolveI18nValue("cabinet.billing.updatedAt", "Обновлено"));
  const commentLabel = computed(() => resolveI18nValue("cabinet.billing.comment", "Комментарий"));
  const paymentDetailLabel = computed(() =>
    resolveI18nValue("cabinet.billing.withdrawalForm.paymentDetail", "Платёжные реквизиты")
  );
  const adminCommentLabel = computed(() =>
    resolveI18nValue("cabinet.billing.withdrawalForm.adminComment", "Комментарий администратора")
  );
  const redirectLinkLabel = computed(() => resolveI18nValue("cabinet.billing.redirectLink", "Ссылка оплаты"));
  const internalTransferLabel = computed(() =>
    resolveI18nValue("cabinet.billing.internalTransfer", "Transfer between accounts")
  );
  const transferFromLabel = computed(() => resolveI18nValue("cabinet.billing.transferFrom", "From account"));
  const transferToLabel = computed(() => resolveI18nValue("cabinet.billing.transferTo", "To account"));

  const valueOrDash = (value: unknown): string => {
    const stringValue = String(value ?? "").trim();
    return stringValue === "" ? "-" : stringValue;
  };

  const isInternalTransfer = (paymentItem: any): boolean =>
    Boolean(paymentItem?.is_internal_transfer || paymentItem?.meta?.is_internal_transfer);

  const canSyncPayment = (paymentItem: any): boolean =>
    String(paymentItem?.type ?? "").trim() === "deposit" &&
    String(paymentItem?.payment_gateway ?? "").trim() === "coinsbuy";

  const displayAccountRoute = (paymentItem: any): string => {
    if (isInternalTransfer(paymentItem)) {
      const fromNumber = String(paymentItem?.transfer_from_account_number ?? paymentItem?.account_number ?? "").trim();
      const toNumber = String(paymentItem?.transfer_to_account_number ?? "").trim();
      if (fromNumber !== "" && toNumber !== "") {
        return `${fromNumber} -> ${toNumber}`;
      }
    }

    return valueOrDash(paymentItem?.account_number);
  };

  const displayPaymentSystem = (paymentItem: any): string => {
    if (isInternalTransfer(paymentItem)) {
      return internalTransferLabel.value;
    }

    return valueOrDash(paymentItem?.payment_system_name);
  };

  const displayType = (paymentItem: any): string => {
    if (isInternalTransfer(paymentItem)) {
      return internalTransferLabel.value;
    }

    const typeValue = String(paymentItem?.type ?? "").trim();
    if (typeValue === "") {
      return "-";
    }

    return resolveI18nValue(`cabinet.billing.types.${typeValue.toLowerCase()}`, typeValue);
  };

  const displayStatus = (status: unknown): string => {
    const statusValue = String(status ?? "").trim();
    if (statusValue === "") {
      return "-";
    }

    return resolveI18nValue(`cabinet.header.notificationTemplates.statuses.${statusValue.toLowerCase()}`, statusValue);
  };

  const registerRecentPaymentUpdate = (payload: any, fallbackUpdatedAt?: string) => {
    const updatedPaymentId = String(payload?.payment_id ?? payload?.id ?? "").trim();
    if (updatedPaymentId === "") {
      return;
    }

    recentPaymentUpdatesStore.registerUpdate({
      paymentId: updatedPaymentId,
      status: payload?.status,
      amount: payload?.amount,
      updatedAt: String(payload?.updated_at ?? payload?.created_at ?? fallbackUpdatedAt ?? "").trim(),
    });
  };

  const applyRecentPaymentHighlight = () => {
    const matchedIds = recentPaymentUpdatesStore.takeMatchesForScope(PAYMENT_DETAIL_HIGHLIGHT_SCOPE, [paymentId.value]);
    if (matchedIds.length === 0) {
      return;
    }

    isPaymentHighlighted.value = true;

    if (paymentHighlightTimer) {
      clearTimeout(paymentHighlightTimer);
    }

    paymentHighlightTimer = setTimeout(() => {
      isPaymentHighlighted.value = false;
      paymentHighlightTimer = null;
    }, PAYMENT_HIGHLIGHT_DURATION_MS);
  };

  const fetchPayment = async () => {
    if (!paymentId.value) {
      errorMessage.value = resolveI18nValue("cabinet.billing.paymentNotFound", "Платеж не найден.");
      isLoading.value = false;
      return;
    }

    isLoading.value = true;
    errorMessage.value = null;

    try {
      const response = await appCore.payments.getById(paymentId.value);
      payment.value = response?.data?.data ?? null;

      if (!payment.value) {
        errorMessage.value = resolveI18nValue("cabinet.billing.paymentNotFound", "Платеж не найден.");
      } else {
        applyRecentPaymentHighlight();
      }
    } catch (error: any) {
      errorMessage.value =
        extractApiErrorMessage(
          error,
          resolveI18nValue("cabinet.billing.paymentLoadError", "Не удалось загрузить платеж.")
        ) ?? resolveI18nValue("cabinet.billing.paymentLoadError", "Не удалось загрузить платеж.");
    } finally {
      isLoading.value = false;
    }
  };

  const handleSyncPayment = async () => {
    if (!payment.value || isSyncing.value || !canSyncPayment(payment.value)) {
      return;
    }

    isSyncing.value = true;
    try {
      const response = await appCore.payments.sync(paymentId.value);
      registerRecentPaymentUpdate(response?.data?.data, new Date().toISOString());
      await fetchPayment();
      toast.success(
        resolveApiMessage(response?.data?.message, syncPaymentSuccessLabel.value) ?? syncPaymentSuccessLabel.value
      );
    } catch (error: any) {
      toast.error(extractApiErrorMessage(error, syncPaymentErrorLabel.value) ?? syncPaymentErrorLabel.value);
    } finally {
      isSyncing.value = false;
    }
  };

  const handleClientNotificationReceived = async (payload: any) => {
    const notification = payload?.notification;
    const type = String(notification?.type ?? "").trim();
    const notifiedPaymentId = String(notification?.payload?.payment_id ?? "").trim();

    if (!BILLING_NOTIFICATION_TYPES.includes(type)) {
      return;
    }

    if (notifiedPaymentId !== "" && notifiedPaymentId !== paymentId.value) {
      return;
    }

    registerRecentPaymentUpdate(notification?.payload, notification?.createdAt ?? notification?.created_at);
    await fetchPayment();
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

  const handlePaymentRealtimeUpdated = async (payload: any) => {
    const paymentIdFromEvent = String(payload?.payment_id ?? "").trim();
    if (paymentIdFromEvent !== "" && paymentIdFromEvent !== paymentId.value) {
      return;
    }

    registerRecentPaymentUpdate(payload);
    await fetchPayment();
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

  watch(
    () => authStore.user?.id,
    () => {
      subscribeToPaymentRealtime();
    }
  );

  onMounted(async () => {
    useEventBus.on(CLIENT_NOTIFICATION_RECEIVED_EVENT, handleClientNotificationReceived);
    subscribeToPaymentRealtime();
    await fetchPayment();
  });

  onBeforeUnmount(() => {
    useEventBus.off(CLIENT_NOTIFICATION_RECEIVED_EVENT, handleClientNotificationReceived);
    unsubscribeFromPaymentRealtime();
    if (paymentHighlightTimer) {
      clearTimeout(paymentHighlightTimer);
      paymentHighlightTimer = null;
    }
  });
</script>

<style scoped>
  .payment-field {
    min-width: 0;
  }

  .payment-field__label {
    color: var(--ui-text-secondary);
  }

  .payment-field__value {
    color: var(--ui-text-main);
    font-weight: 600;
  }

  .payment-detail-highlight {
    animation: payment-detail-highlight-flash 4.5s ease;
    border-color: color-mix(in srgb, var(--ui-primary-main) 58%, transparent) !important;
    background:
      linear-gradient(
        135deg,
        color-mix(in srgb, var(--ui-primary-main) 16%, transparent) 0%,
        color-mix(in srgb, var(--ui-sticker-success) 12%, transparent) 100%
      ),
      var(--ui-background-panel) !important;
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--ui-primary-main) 18%, transparent);
  }

  @keyframes payment-detail-highlight-flash {
    0% {
      transform: translateY(0);
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--ui-primary-main) 0%, transparent);
    }
    12% {
      transform: translateY(-1px);
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--ui-primary-main) 18%, transparent);
    }
    65% {
      transform: translateY(0);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ui-primary-main) 12%, transparent);
    }
    100% {
      transform: translateY(0);
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--ui-primary-main) 0%, transparent);
    }
  }
</style>
