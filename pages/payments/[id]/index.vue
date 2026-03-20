<template>
  <PageStructureDefault>
    <template #header>
      <UiTextH4 class="text-[var(--ui-text-main)] mr-5">
        {{ pageTitle }}
      </UiTextH4>

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
        class="rounded-xl border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] p-4 md:p-5">
        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div class="payment-field">
            <UiTextSmall class="payment-field__label">ID</UiTextSmall>
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
            <div class="payment-field__value capitalize">{{ valueOrDash(payment.status) }}</div>
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
            class="payment-field md:col-span-2"
          >
            <UiTextSmall class="payment-field__label">{{ paymentDetailLabel }}</UiTextSmall>
            <div class="payment-field__value">{{ valueOrDash(payment.payment_detail_name) }}</div>
          </div>

          <div
            v-if="payment.admin_comment"
            class="payment-field md:col-span-2"
          >
            <UiTextSmall class="payment-field__label">{{ adminCommentLabel }}</UiTextSmall>
            <div class="payment-field__value">{{ valueOrDash(payment.admin_comment) }}</div>
          </div>

          <div class="payment-field md:col-span-2">
            <UiTextSmall class="payment-field__label">{{ redirectLinkLabel }}</UiTextSmall>
            <div class="payment-field__value break-all">{{ valueOrDash(payment.redirect_link) }}</div>
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
  import { computed, onMounted, ref } from "vue";
  import { useRoute } from "vue-router";
  import { definePageMeta, useLocalePath } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";

  import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import useAppCore from "~/composables/useAppCore";

  definePageMeta({
    layout: "cabinet",
    middleware: ["auth-client", "client-check-auth"],
  });

  const appCore = useAppCore();
  const route = useRoute();
  const localePath = useLocalePath();
  const { t } = useI18n({ useScope: "global" });

  const isLoading = ref(true);
  const errorMessage = ref<string | null>(null);
  const payment = ref<any | null>(null);

  const paymentId = computed(() => String(route.params.id ?? "").trim());
  const paymentsListLink = computed(() => localePath("/payments"));

  const resolveI18nValue = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const pageTitle = computed(() => `${resolveI18nValue("cabinet.billing.title", "Платежи")} #${paymentId.value}`);
  const backLabel = computed(() => resolveI18nValue("cabinet.billing.backToList", "К списку платежей"));
  const accountLabel = computed(() => resolveI18nValue("cabinet.billing.columns.accountNumber", "Номер счета"));
  const amountLabel = computed(() => resolveI18nValue("cabinet.billing.columns.amount", "Сумма"));
  const currencyLabel = computed(() => resolveI18nValue("cabinet.billing.columns.currency", "Валюта"));
  const statusLabel = computed(() => resolveI18nValue("cabinet.billing.columns.status", "Статус"));
  const typeLabel = computed(() => resolveI18nValue("cabinet.dashboard.transactions.type", "Тип"));
  const paymentSystemLabel = computed(() =>
    resolveI18nValue("cabinet.billing.columns.paymentSystem", "Платежная система")
  );
  const gatewayLabel = computed(() => "Gateway");
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

    return valueOrDash(paymentItem?.type);
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
      }
    } catch (error: any) {
      errorMessage.value =
        error?.response?.data?.message ??
        resolveI18nValue("cabinet.billing.paymentLoadError", "Не удалось загрузить платеж.");
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(fetchPayment);
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
</style>
