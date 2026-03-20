<template>
  <div class="withdrawal-form">
    <div
      v-if="isLoadingAccounts || isLoadingPaymentDetails"
      class="withdrawal-form__loading">
      <UiIconSpinnerDefault />
    </div>

    <template v-else>
      <UiFormControl :label="accountLabel" :errors="errors.accountId ? [errors.accountId] : []">
        <UiSelect
          :data="accountOptions"
          :without-no-select="true"
          :value="form.accountId"
          @change="handleAccountChange"
        />
      </UiFormControl>

      <UiFormControl
        :label="paymentDetailLabel"
        :errors="errors.paymentDetailId ? [errors.paymentDetailId] : []"
      >
        <UiSelect
          :data="paymentDetailOptions"
          :without-no-select="true"
          :value="form.paymentDetailId"
          :disabled="paymentDetailOptions.length === 0"
          @change="handlePaymentDetailChange"
        />
      </UiFormControl>

      <div
        v-if="paymentDetailOptions.length === 0"
        class="withdrawal-form__empty-state"
      >
        <div class="withdrawal-form__empty-title">{{ noPaymentDetailsTitle }}</div>
        <div class="withdrawal-form__empty-text">{{ noPaymentDetailsText }}</div>
        <UiButtonDefault state="info--outline" @click="handleGoToPaymentDetails">
          {{ openPaymentDetailsLabel }}
        </UiButtonDefault>
      </div>

      <template v-else>
        <div
          v-if="selectedPaymentDetail"
          class="withdrawal-form__detail-preview"
        >
          <div class="withdrawal-form__detail-title">{{ selectedPaymentDetail.name || "-" }}</div>
          <div
            v-for="row in paymentDetailRows"
            :key="row.key"
            class="withdrawal-form__detail-row"
          >
            <span class="withdrawal-form__detail-key">{{ row.key }}</span>
            <span class="withdrawal-form__detail-value">{{ row.value }}</span>
          </div>
        </div>

        <UiFormControl :label="amountLabel" :errors="errors.amount ? [errors.amount] : []">
          <UiInput
            type="number"
            :value="form.amount"
            :placeholder="amountPlaceholder"
            @input="handleAmountInput"
          />
        </UiFormControl>

        <div
          v-if="selectedAccount"
          class="withdrawal-form__hint"
        >
          {{ accountBalanceLabel }}: {{ formatBalance(selectedAccount.balance, selectedAccount.currency) }}
        </div>

        <UiFormControl :label="commentLabel" :errors="errors.comment ? [errors.comment] : []">
          <textarea
            class="withdrawal-form__textarea"
            :value="form.comment"
            :placeholder="commentPlaceholder"
            @input="handleCommentInput"
          />
        </UiFormControl>

        <div class="withdrawal-form__actions">
          <UiButtonDefault state="info" :disabled="isSubmitting" @click="handleSubmit">
            <span v-if="!isSubmitting">{{ submitLabel }}</span>
            <UiIconSpinnerDefault v-else />
          </UiButtonDefault>
        </div>
      </template>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { computed, inject, onMounted, reactive, ref } from "vue";
  import { navigateTo, useLocalePath } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";

  type PaymentSystem = {
    id?: string;
    name?: string;
  };

  type AccountOption = {
    id: string;
    value: string;
    text: string;
    number: string;
    balance: number;
    currency: string;
  };

  type PaymentDetailOption = {
    id: string;
    value: string;
    text: string;
    name: string;
    payment_system_id: string;
    data: Record<string, unknown>;
  };

  const props = defineProps<{
    paymentSystem?: PaymentSystem | null;
  }>();

  const appCore = useAppCore();
  const toast = useToast();
  const localePath = useLocalePath();
  const { closeModal } = inject("modalControl") as { closeModal: () => void };
  const { t } = useI18n({ useScope: "global" });

  const isSubmitting = ref(false);
  const isLoadingAccounts = ref(false);
  const isLoadingPaymentDetails = ref(false);
  const accounts = ref<AccountOption[]>([]);
  const paymentDetails = ref<PaymentDetailOption[]>([]);
  const errors = reactive<Record<string, string>>({});
  const form = reactive({
    accountId: "",
    paymentDetailId: "",
    amount: "",
    comment: "",
  });

  const resolveText = (key: string, fallback: string): string => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const accountLabel = computed(() => resolveText("cabinet.billing.withdrawalForm.account", "Trading account"));
  const paymentDetailLabel = computed(() =>
    resolveText("cabinet.billing.withdrawalForm.paymentDetail", "Payment details")
  );
  const amountLabel = computed(() => resolveText("cabinet.billing.withdrawalForm.amount", "Amount"));
  const amountPlaceholder = computed(() =>
    resolveText("cabinet.billing.withdrawalForm.amountPlaceholder", "Enter withdrawal amount")
  );
  const commentLabel = computed(() => resolveText("cabinet.billing.withdrawalForm.comment", "Comment"));
  const commentPlaceholder = computed(() =>
    resolveText("cabinet.billing.withdrawalForm.commentPlaceholder", "Add a comment for the finance team")
  );
  const submitLabel = computed(() => resolveText("cabinet.billing.withdrawalForm.submit", "Create withdrawal request"));
  const noPaymentDetailsTitle = computed(() =>
    resolveText("cabinet.billing.withdrawalForm.noPaymentDetailsTitle", "No approved payment details")
  );
  const noPaymentDetailsText = computed(() =>
    resolveText(
      "cabinet.billing.withdrawalForm.noPaymentDetailsText",
      "Add and approve payment details for this payment method before creating a withdrawal request."
    )
  );
  const openPaymentDetailsLabel = computed(() =>
    resolveText("cabinet.billing.withdrawalForm.openPaymentDetails", "Open payment details")
  );
  const accountBalanceLabel = computed(() =>
    resolveText("cabinet.billing.withdrawalForm.accountBalance", "Available balance")
  );
  const createdLabel = computed(() =>
    resolveText("cabinet.billing.withdrawalForm.created", "Withdrawal request created successfully.")
  );

  const accountOptions = computed(() => accounts.value.map(({ id, value, text }) => ({ id, value, text })));
  const paymentDetailOptions = computed(() =>
    paymentDetails.value.map(({ id, value, text }) => ({ id, value, text }))
  );

  const selectedAccount = computed(() => accounts.value.find(item => item.id === form.accountId) ?? null);
  const selectedPaymentDetail = computed(
    () => paymentDetails.value.find(item => item.id === form.paymentDetailId) ?? null
  );

  const paymentDetailRows = computed(() => {
    const data = selectedPaymentDetail.value?.data;
    if (!data || typeof data !== "object") {
      return [];
    }

    return Object.entries(data)
      .map(([key, value]) => ({
        key: humanizeKey(key),
        value: String(value ?? "-"),
      }))
      .filter(row => row.value.trim() !== "");
  });

  const humanizeKey = (value: string): string => {
    const normalized = value
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .trim();

    return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : value;
  };

  const extractRows = (response: any): any[] => {
    const root = response?.data;
    const data = root?.data;

    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.data)) return data.data.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(root)) return root;

    return [];
  };

  const formatBalance = (value: number, currency: string): string => {
    const numericValue = Number(value ?? 0);
    const currencyCode = String(currency || "USD");

    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericValue);
    } catch {
      return `${currencyCode} ${numericValue.toFixed(2)}`;
    }
  };

  const clearError = (key: string): void => {
    if (errors[key]) {
      delete errors[key];
    }
  };

  const handleAccountChange = (value: string | null): void => {
    form.accountId = String(value ?? "");
    clearError("accountId");
  };

  const handlePaymentDetailChange = (value: string | null): void => {
    form.paymentDetailId = String(value ?? "");
    clearError("paymentDetailId");
  };

  const handleAmountInput = (value: string): void => {
    form.amount = value;
    clearError("amount");
  };

  const handleCommentInput = (event: Event): void => {
    form.comment = String((event.target as HTMLTextAreaElement)?.value ?? "");
    clearError("comment");
  };

  const loadAccounts = async (): Promise<void> => {
    isLoadingAccounts.value = true;

    try {
      const response = await appCore.accounts.get({
        perPage: 100,
        page: 1,
      });

      const rows = extractRows(response);
      accounts.value = rows.map((row: any) => {
        const balance = Number(row?.balance ?? 0);
        const currency = String(row?.currency ?? "USD");
        const number = String(row?.number ?? row?.account_number ?? "");

        return {
          id: String(row?.id ?? ""),
          value: String(row?.id ?? ""),
          text: number ? `${number} • ${formatBalance(balance, currency)}` : formatBalance(balance, currency),
          number,
          balance,
          currency,
        };
      });

      if (accounts.value.length > 0) {
        form.accountId = accounts.value[0]?.id ?? "";
      }
    } finally {
      isLoadingAccounts.value = false;
    }
  };

  const loadPaymentDetails = async (): Promise<void> => {
    isLoadingPaymentDetails.value = true;

    try {
      const response = await appCore.paymentDetails.get({
        perPage: 100,
        page: 1,
        orderBy: "updated_at",
        orderDirection: "desc",
      });

      const targetPaymentSystemId = String(props.paymentSystem?.id ?? "");
      const rows = extractRows(response);

      paymentDetails.value = rows
        .filter((row: any) => String(row?.status ?? "").toLowerCase() === "approved")
        .filter((row: any) => {
          if (!targetPaymentSystemId) return true;
          return String(row?.payment_system_id ?? row?.paymentSystem?.id ?? "") === targetPaymentSystemId;
        })
        .map((row: any) => {
          const data = row?.data && typeof row.data === "object" ? row.data : {};
          const firstValue = Object.values(data)[0];
          const suffix = firstValue ? ` • ${String(firstValue)}` : "";

          return {
            id: String(row?.id ?? ""),
            value: String(row?.id ?? ""),
            text: `${String(row?.name ?? "Payment detail")}${suffix}`,
            name: String(row?.name ?? ""),
            payment_system_id: String(row?.payment_system_id ?? ""),
            data,
          };
        });

      if (paymentDetails.value.length > 0) {
        form.paymentDetailId = paymentDetails.value[0]?.id ?? "";
      }
    } finally {
      isLoadingPaymentDetails.value = false;
    }
  };

  const validateForm = (): boolean => {
    Object.keys(errors).forEach(key => delete errors[key]);

    if (!form.accountId) {
      errors.accountId = resolveText("cabinet.billing.withdrawalForm.errors.account", "Choose an account.");
    }

    if (!form.paymentDetailId) {
      errors.paymentDetailId = resolveText(
        "cabinet.billing.withdrawalForm.errors.paymentDetail",
        "Choose approved payment details."
      );
    }

    const amount = Number(form.amount);
    if (!form.amount || !Number.isFinite(amount) || amount <= 0) {
      errors.amount = resolveText("cabinet.billing.withdrawalForm.errors.amount", "Enter a valid amount.");
    }

    if (selectedAccount.value && Number.isFinite(amount) && amount > selectedAccount.value.balance) {
      errors.amount = resolveText(
        "cabinet.billing.withdrawalForm.errors.balance",
        "Withdrawal amount exceeds the account balance."
      );
    }

    return Object.keys(errors).length === 0;
  };

  const handleGoToPaymentDetails = async (): Promise<void> => {
    closeModal();
    await navigateTo(localePath({ path: "/payments/details", query: { openCreate: "1" } }));
  };

  const handleSubmit = async (): Promise<void> => {
    if (isSubmitting.value || !validateForm()) {
      return;
    }

    isSubmitting.value = true;

    try {
      const response = await appCore.payments.post({
        accountId: form.accountId,
        paymentDetailId: form.paymentDetailId,
        amount: Number(form.amount),
        comment: form.comment.trim(),
      });

      toast.success(response?.data?.message || createdLabel.value);
      closeModal();
      useEventBus.emit("loadDataForPayments");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || resolveText("cabinet.billing.withdrawalForm.error", "Failed to create withdrawal request."));
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(async () => {
    await Promise.all([loadAccounts(), loadPaymentDetails()]);
  });
</script>

<style scoped>
  .withdrawal-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .withdrawal-form__loading {
    min-height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .withdrawal-form__detail-preview {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px;
    border-radius: 12px;
    border: 1px solid var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--ui-background-panel) 88%, transparent);
  }

  .withdrawal-form__detail-title {
    color: var(--ui-text-main);
    font-size: 14px;
    font-weight: 700;
  }

  .withdrawal-form__detail-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 13px;
  }

  .withdrawal-form__detail-key {
    color: var(--ui-text-secondary);
  }

  .withdrawal-form__detail-value {
    color: var(--ui-text-main);
    font-weight: 600;
    text-align: right;
    word-break: break-word;
  }

  .withdrawal-form__hint {
    margin-top: -8px;
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .withdrawal-form__textarea {
    width: 100%;
    min-height: 120px;
    resize: vertical;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-control-bg);
    color: var(--ui-text-main);
    padding: 12px;
    outline: none;
  }

  .withdrawal-form__actions {
    display: flex;
    justify-content: flex-start;
  }

  .withdrawal-form__empty-state {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    border-radius: 12px;
    border: 1px dashed var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--ui-background-panel) 82%, transparent);
  }

  .withdrawal-form__empty-title {
    color: var(--ui-text-main);
    font-weight: 700;
  }

  .withdrawal-form__empty-text {
    color: var(--ui-text-secondary);
    font-size: 13px;
    line-height: 1.45;
  }

  @media (max-width: 768px) {
    .withdrawal-form__detail-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .withdrawal-form__detail-value {
      text-align: left;
    }

    .withdrawal-form__actions :deep(.button-default) {
      width: 100%;
    }
  }
</style>
