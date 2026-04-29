<template>
  <div class="relative">
    <div
      v-if="isLoadingSubmitBtn"
      class="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-black/20 backdrop-blur-[2px]"
      aria-live="polite"
      aria-busy="true">
      <div class="flex flex-col items-center gap-3 px-6 py-5 text-center">
        <UiIconSpinnerDefault />
        <div class="text-[15px] font-semibold text-white/90">{{ processingLabel }}</div>
      </div>
    </div>

    <template v-if="createdRedirectUrl">
      <UiTextH5 class="mb-5 text-[var(--ui-text-main)]">
        {{ invoiceReadyTitle }}
      </UiTextH5>

      <div
        class="flex flex-col gap-4 rounded-2xl border border-[var(--ui-card-border)] bg-[var(--ui-bg-elevated)]/70 p-4 backdrop-blur-[8px]">
        <p class="text-sm leading-6 text-[var(--ui-text-muted)]">
          {{ invoiceReadyDescription }}
        </p>

        <UiFormControl
          :label="invoiceLinkLabel"
          :errors="[]">
          <UiInput
            type="text"
            :value="createdRedirectUrl"
            readonly
            :isDirty="false"
            :isInvalid="false" />
        </UiFormControl>

        <div class="flex flex-col gap-3 sm:flex-row">
          <a
            :href="createdRedirectUrl"
            target="_self"
            class="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-[999px] border border-[#57d36a] bg-[#57d36a] px-5 text-[15px] font-semibold text-[#06210c] transition hover:brightness-105">
            {{ openInvoiceLabel }}
          </a>

          <UiButtonDefault
            state="info--outline"
            class="inline-flex min-h-[48px] items-center justify-center"
            @click="copyInvoiceLink">
            {{ copyInvoiceLabel }}
          </UiButtonDefault>
        </div>
      </div>
    </template>

    <template v-else>
      <UiTextH5 class="mb-5 text-[var(--ui-text-main)]">
        {{ paymentSystemTitle }}
      </UiTextH5>

      <div class="flex flex-col gap-3">
      <UiFormControl
        :label="accountLabel"
        :errors="accountErrors">
        <UiSelect
          :without-no-select="true"
          :data="accounts"
          :value="formData.accountId"
          :isDirty="validatorDepositForm.errorsFormData?.accountId?.isDirty"
          :isInvalid="validatorDepositForm.errorsFormData?.accountId?.errors?.length > 0"
          @change="handleChangeAccount"
          @loadMore="handleLoadMoreAccounts" />
      </UiFormControl>

      <UiFormControl
        :label="amountLabel"
        :errors="amountErrors">
        <UiInput
          type="number"
          :placeholder="amountPlaceholder"
          @input="validatorDepositForm.doValidateField('amount', $event.target.value)"
          @blur="validatorDepositForm.doValidateField('amount', $event.target.value)"
          :value="formData.amount"
          :isDirty="validatorDepositForm.errorsFormData?.amount?.isDirty"
          :isInvalid="validatorDepositForm.errorsFormData?.amount?.errors?.length > 0" />
      </UiFormControl>

      <UiFormControl
        :label="commentLabel"
        :errors="commentErrors">
        <UiTextarea
          type="text"
          :placeholder="commentPlaceholder"
          @input="validatorDepositForm.doValidateField('comment', $event.target.value)"
          @blur="validatorDepositForm.doValidateField('comment', $event.target.value)"
          :value="formData.comment"
          :isDirty="validatorDepositForm.errorsFormData?.comment?.isDirty"
          :isInvalid="validatorDepositForm.errorsFormData?.comment?.errors?.length > 0" />
      </UiFormControl>

      <UiButtonDefault
        state="info--outline"
        class="mt-3 inline-flex items-center justify-center gap-2"
        :disabled="isLoadingSubmitBtn"
        @click="validateDepositForm">
        <span>{{ submitLabel }}</span>
        <UiIconSpinnerDefault v-if="isLoadingSubmitBtn" />
      </UiButtonDefault>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import useAppCore from "~/composables/useAppCore";
  import { extractApiErrorMessage, resolveApiMessage } from "~/composables/useApiMessages";
  import { computed, inject, onMounted, ref } from "vue";
  import { PAYMENT_SYSTEM_CONFIG_KEY_USDC } from "~/constants/paymentSystemsCfgKeys";
  import { formData } from "~/pages/payments/create/composables/TabDepositFormCoinsbuy";
  import {
    resetFormData,
    resetValidationCoinsbuyDepositForm,
    validatorCoinsbuyDepositForm,
  } from "~/pages/payments/create/composables/TabDepositFormCoinsbuy/validation";

  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import UiTextarea from "~/components/ui/UiTextarea.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";

  import { useToast } from "vue-toastification";
  import { navigateTo, useLocalePath } from "~/.nuxt/imports";
  import useEventBus from "~/composables/useEventBus";
  import { useI18n } from "vue-i18n";

  const props = defineProps({
    paymentSystem: { type: Object, required: true },
    initialAccountId: { type: String, default: "" },
  });

  const modalControl = inject<any>("modalControl", null);
  const closeModal = () => modalControl?.closeModal?.();

  const toast = useToast();
  const localePath = useLocalePath();
  const { t } = useI18n({ useScope: "global" });
  const appCore = useAppCore();
  const validatorDepositForm = validatorCoinsbuyDepositForm;
  const DEFAULT_DEPOSIT_MINIMUM_AMOUNT = 10;
  const DEPOSIT_MINIMUM_AMOUNTS_BY_CONFIG_KEY: Record<string, number> = {
    [PAYMENT_SYSTEM_CONFIG_KEY_USDC]: 3,
  };

  const accounts = ref<any[]>([]);
  const loadAccountsPage = ref(1);
  const loadAccountsPerPage = ref(10);

  const isLoadingSubmitBtn = ref(false);
  const isLoadingAccounts = ref(false);
  const hasMoreAccounts = ref(true);
  const createdRedirectUrl = ref("");

  const resolveText = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const processingLabel = computed(() => resolveText("cabinet.billing.depositForm.processing", "Processing..."));
  const paymentSystemTitle = computed(() => {
    const paymentSystemName = String(props.paymentSystem?.name ?? "").trim();
    return paymentSystemName !== "" ? paymentSystemName : resolveText("cabinet.billing.types.deposit", "Deposit");
  });
  const accountLabel = computed(() => resolveText("cabinet.billing.depositForm.account", "Trading account"));
  const amountLabel = computed(() => resolveText("cabinet.billing.depositForm.amount", "Amount"));
  const amountPlaceholder = computed(() =>
    resolveText("cabinet.billing.depositForm.amountPlaceholder", "Amount in USD")
  );
  const minimumAmount = computed(() => {
    const configKey = String(props.paymentSystem?.config_key ?? "").trim();

    return DEPOSIT_MINIMUM_AMOUNTS_BY_CONFIG_KEY[configKey] ?? DEFAULT_DEPOSIT_MINIMUM_AMOUNT;
  });
  const parsedAmount = computed(() => {
    const value = String(formData.amount ?? "").trim();
    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
      return null;
    }

    const amount = Number(value);

    return Number.isFinite(amount) ? amount : null;
  });
  const isAmountBelowMinimum = computed(
    () => parsedAmount.value !== null && parsedAmount.value < minimumAmount.value
  );
  const formatMinimumAmount = (amount: number): string =>
    Number.isInteger(amount) ? String(amount) : String(amount).replace(/\.?0+$/, "");
  const minimumAmountErrorLabel = computed(() => {
    const amount = formatMinimumAmount(minimumAmount.value);
    const translated = t("cabinet.billing.depositForm.minimumAmount", { amount });

    return translated === "cabinet.billing.depositForm.minimumAmount"
      ? `Minimum deposit amount is ${amount} USD.`
      : translated;
  });
  const commentLabel = computed(() => resolveText("cabinet.billing.depositForm.comment", "Comment"));
  const commentPlaceholder = computed(() =>
    resolveText("cabinet.billing.depositForm.commentPlaceholder", "Add a comment for the finance team")
  );
  const submitLabel = computed(() => resolveText("cabinet.billing.depositForm.submit", "Create deposit"));
  const invoiceReadyTitle = computed(() =>
    resolveText("cabinet.billing.depositForm.invoiceReadyTitle", "Invoice created")
  );
  const invoiceReadyDescription = computed(() =>
    resolveText(
      "cabinet.billing.depositForm.invoiceReadyDescription",
      "Continue to the payment page in this tab. This avoids browser popup blocking and keeps the deposit flow stable."
    )
  );
  const invoiceLinkLabel = computed(() =>
    resolveText("cabinet.billing.depositForm.invoiceLink", "Invoice link")
  );
  const openInvoiceLabel = computed(() =>
    resolveText("cabinet.billing.depositForm.openInvoice", "Open payment page")
  );
  const copyInvoiceLabel = computed(() =>
    resolveText("cabinet.common.copy", "Copy")
  );
  const createdLabel = computed(() =>
    resolveText("cabinet.billing.depositForm.created", "Deposit created successfully.")
  );
  const submitErrorLabel = computed(() =>
    resolveText("cabinet.billing.depositForm.error", "Failed to create deposit.")
  );
  const loadAccountsErrorLabel = computed(() =>
    resolveText("cabinet.billing.depositForm.loadAccountsError", "Failed to load trading accounts.")
  );
  const accountErrors = computed(() =>
    (validatorDepositForm?.errorsFormData?.accountId?.errors ?? []).map(
      (message: string) => resolveApiMessage(message, message) ?? message
    )
  );
  const amountErrors = computed(() => {
    const errors = (validatorDepositForm?.errorsFormData?.amount?.errors ?? []).map((message: string) => {
      const normalizedMessage = String(message ?? "").trim();

      if (/required/i.test(normalizedMessage)) {
        return resolveText("cabinet.billing.depositForm.amountRequired", "Enter the deposit amount.");
      }

      if (/incorrect/i.test(normalizedMessage)) {
        return resolveText(
          "cabinet.billing.depositForm.amountInvalid",
          "Enter a valid amount in USD, for example 15.25."
        );
      }

      return resolveApiMessage(message, message) ?? message;
    });

    if (
      errors.length === 0 &&
      validatorDepositForm?.errorsFormData?.amount?.isDirty &&
      isAmountBelowMinimum.value
    ) {
      errors.push(minimumAmountErrorLabel.value);
    }

    return errors;
  });
  const commentErrors = computed(() =>
    (validatorDepositForm?.errorsFormData?.comment?.errors ?? []).map(
      (message: string) => resolveApiMessage(message, message) ?? message
    )
  );

  const handleSubmit = async () => {
    try {
      isLoadingSubmitBtn.value = true;

      formData.paymentSystemId = props.paymentSystem.id;

      const response: any = await appCore.deposit.post(formData);
      const redirectUrl = String(response?.data?.data?.redirectUrl ?? "").trim();

      if (redirectUrl !== "") {
        createdRedirectUrl.value = redirectUrl;
        toast.success(resolveApiMessage(response?.data?.message, createdLabel.value) ?? createdLabel.value);
        useEventBus.emit("loadDataForPayments");
        return;
      }

      toast.success(resolveApiMessage(response?.data?.message, createdLabel.value) ?? createdLabel.value);
      closeModal();
      useEventBus.emit("loadDataForPayments");
      await navigateTo(localePath("/payments"));
    } catch (error: any) {
      toast.error(extractApiErrorMessage(error, submitErrorLabel.value) ?? submitErrorLabel.value);
    } finally {
      isLoadingSubmitBtn.value = false;
    }
  };

  const copyInvoiceLink = async () => {
    const value = createdRedirectUrl.value.trim();
    if (value === "") return;

    try {
      await navigator.clipboard.writeText(value);
      toast.success(resolveText("cabinet.common.copied", "Copied."));
    } catch {
      toast.error(resolveText("cabinet.common.copyFailed", "Failed to copy."));
    }
  };

  const validateDepositForm = () => {
    const isValid = validatorDepositForm.doValidate();

    if (isAmountBelowMinimum.value) {
      validatorDepositForm.errorsFormData.amount.isDirty = true;
    }

    if (!isValid || isAmountBelowMinimum.value) {
      return;
    }

    handleSubmit();
  };

  const handleChangeAccount = (value: any) => {
    formData.accountId = value;
    validatorDepositForm.errorsFormData.accountId.isDirty = true;
    validatorDepositForm.doValidateField("accountId", value);
  };

  const normalizeAccounts = (list: any[]) =>
    list.map(account => ({
      id: account.id,
      value: account.id,
      text: `
      <div style="display:flex; justify-content: space-between; width: 100%;">
        <strong class="w-[33%] flex items-center justify-start text-[15px]">${account.number}</strong>
        <span class="w-[33%] flex items-center justify-center">${account.account_type.name}</span>
        <span class="w-[33%] flex items-center justify-end">$ ${account.balance}</span>
      </div>
    `,
    }));

  const extractList = (response: any): any[] => {
    const root = response?.data;
    const d1 = root?.data;

    if (Array.isArray(d1?.data)) return d1.data;
    if (Array.isArray(d1?.data?.data)) return d1.data.data;
    if (Array.isArray(d1?.data?.data?.data)) return d1.data.data.data;

    if (Array.isArray(d1)) return d1;
    if (Array.isArray(root)) return root;

    return [];
  };

  const appendUnique = (items: any[]) => {
    const existing = new Set(accounts.value.map(x => x.value));
    for (const item of items) {
      if (!existing.has(item.value)) accounts.value.push(item);
    }
  };

  const applyInitialAccount = () => {
    const initialAccountId = String(props.initialAccountId ?? "").trim();
    if (initialAccountId === "" || !accounts.value.some(account => account.value === initialAccountId)) {
      return;
    }

    formData.accountId = initialAccountId;
    validatorDepositForm.errorsFormData.accountId.isDirty = true;
    validatorDepositForm.doValidateField("accountId", initialAccountId);
  };

  const loadAccounts = async (page: number) => {
    if (isLoadingAccounts.value || !hasMoreAccounts.value) return;

    isLoadingAccounts.value = true;

    try {
      const response: any = await appCore.accounts.get({
        perPage: loadAccountsPerPage.value,
        page,
      });

      const list = extractList(response);

      if (!list.length) {
        hasMoreAccounts.value = false;
        loadAccountsPage.value = Math.max(1, page - 1);
        return;
      }

      appendUnique(normalizeAccounts(list));
      applyInitialAccount();
      hasMoreAccounts.value = true;
    } catch (error: any) {
      loadAccountsPage.value = Math.max(1, page - 1);
      toast.error(extractApiErrorMessage(error, loadAccountsErrorLabel.value) ?? loadAccountsErrorLabel.value);
    } finally {
      isLoadingAccounts.value = false;
    }
  };

  const handleLoadMoreAccounts = async () => {
    if (isLoadingAccounts.value || !hasMoreAccounts.value) return;
    const nextPage = loadAccountsPage.value + 1;
    loadAccountsPage.value = nextPage;
    await loadAccounts(nextPage);
  };

  onMounted(async () => {
    resetFormData();
    resetValidationCoinsbuyDepositForm();

    accounts.value = [];
    loadAccountsPage.value = 1;
    loadAccountsPerPage.value = props.initialAccountId ? 100 : 10;
    hasMoreAccounts.value = true;
    createdRedirectUrl.value = "";

    await loadAccounts(1);
    applyInitialAccount();
  });
</script>
