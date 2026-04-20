<template>
  <div class="relative">
    <!-- Overlay while submitting -->
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
          :isDirty="validatorUsdtTrcDataForm.errorsFormData?.accountId?.isDirty"
          :isInvalid="validatorUsdtTrcDataForm.errorsFormData?.accountId?.errors?.length > 0"
          @change="handleChangeAccount"
          @loadMore="handleLoadMoreAccounts" />
      </UiFormControl>

      <UiFormControl
        :label="amountLabel"
        :errors="amountErrors">
        <UiInput
          type="number"
          :placeholder="amountPlaceholder"
          @input="validatorUsdtTrcDataForm.doValidateField('amount', $event.target.value)"
          @blur="validatorUsdtTrcDataForm.doValidateField('amount', $event.target.value)"
          :value="formData.amount"
          :isDirty="validatorUsdtTrcDataForm.errorsFormData?.amount?.isDirty"
          :isInvalid="validatorUsdtTrcDataForm.errorsFormData?.amount?.errors?.length > 0" />
      </UiFormControl>

      <UiFormControl
        :label="commentLabel"
        :errors="commentErrors">
        <UiTextarea
          type="text"
          :placeholder="commentPlaceholder"
          @input="validatorUsdtTrcDataForm.doValidateField('comment', $event.target.value)"
          @blur="validatorUsdtTrcDataForm.doValidateField('comment', $event.target.value)"
          :value="formData.comment"
          :isDirty="validatorUsdtTrcDataForm.errorsFormData?.comment?.isDirty"
          :isInvalid="validatorUsdtTrcDataForm.errorsFormData?.comment?.errors?.length > 0" />
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
  </div>
</template>

<script lang="ts" setup>
  import useAppCore from "~/composables/useAppCore";
  import { extractApiErrorMessage, resolveApiMessage } from "~/composables/useApiMessages";
  import { formData } from "~/pages/payments/create/composables/TabDepositFormUsdtTrc20";
  import { computed, inject, onMounted, ref } from "vue";
  import {
    resetFormData,
    resetValidationUsdtTrcDataForm,
    validatorUsdtTrcDataForm,
  } from "~/pages/payments/create/composables/TabDepositFormUsdtTrc20/validation";
  import { PAYMENT_SYSTEM_CONFIG_KEY_USDC } from "~/constants/paymentSystemsCfgKeys";

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
  const minimumAmountErrorLabel = computed(() =>
    resolveText(
      "cabinet.billing.depositForm.minimumAmount",
      "Minimum deposit amount is {amount} USD."
    ).replace("{amount}", formatMinimumAmount(minimumAmount.value))
  );
  const commentLabel = computed(() => resolveText("cabinet.billing.depositForm.comment", "Comment"));
  const commentPlaceholder = computed(() =>
    resolveText("cabinet.billing.depositForm.commentPlaceholder", "Add a comment for the finance team")
  );
  const submitLabel = computed(() => resolveText("cabinet.billing.depositForm.submit", "Create deposit"));
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
    (validatorUsdtTrcDataForm?.errorsFormData?.accountId?.errors ?? []).map(
      (message: string) => resolveApiMessage(message, message) ?? message
    )
  );
  const amountErrors = computed(() => {
    const errors = (validatorUsdtTrcDataForm?.errorsFormData?.amount?.errors ?? []).map(
      (message: string) => resolveApiMessage(message, message) ?? message
    );

    if (
      errors.length === 0 &&
      validatorUsdtTrcDataForm?.errorsFormData?.amount?.isDirty &&
      isAmountBelowMinimum.value
    ) {
      errors.push(minimumAmountErrorLabel.value);
    }

    return errors;
  });
  const commentErrors = computed(() =>
    (validatorUsdtTrcDataForm?.errorsFormData?.comment?.errors ?? []).map(
      (message: string) => resolveApiMessage(message, message) ?? message
    )
  );

  const handleSubmit = async () => {
    try {
      isLoadingSubmitBtn.value = true;

      formData.paymentSystemId = props.paymentSystem.id;

      const response: any = await appCore.deposit.post(formData);
      const redirectUrl = response.data.data.redirectUrl;

      toast.success(resolveApiMessage(response?.data?.message, createdLabel.value) ?? createdLabel.value);
      closeModal();
      useEventBus.emit("loadDataForPayments");
      await navigateTo(localePath("/payments"));

      if (redirectUrl) {
        window.open(redirectUrl, "_blank", "noopener");
      }
    } catch (error: any) {
      toast.error(extractApiErrorMessage(error, submitErrorLabel.value) ?? submitErrorLabel.value);
    } finally {
      isLoadingSubmitBtn.value = false;
    }
  };

  const validateDepositForm = () => {
    const isValid = validatorUsdtTrcDataForm.doValidate();

    if (isAmountBelowMinimum.value) {
      validatorUsdtTrcDataForm.errorsFormData.amount.isDirty = true;
    }

    if (!isValid || isAmountBelowMinimum.value) {
      return;
    }

    handleSubmit();
  };

  const handleChangeAccount = (value: any) => {
    formData.accountId = value;
    validatorUsdtTrcDataForm.errorsFormData.accountId.isDirty = true;
    validatorUsdtTrcDataForm.doValidateField("accountId", value);
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
    validatorUsdtTrcDataForm.errorsFormData.accountId.isDirty = true;
    validatorUsdtTrcDataForm.doValidateField("accountId", initialAccountId);
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
    resetValidationUsdtTrcDataForm();

    accounts.value = [];
    loadAccountsPage.value = 1;
    loadAccountsPerPage.value = props.initialAccountId ? 100 : 10;
    hasMoreAccounts.value = true;

    await loadAccounts(1);
    applyInitialAccount();
  });
</script>
