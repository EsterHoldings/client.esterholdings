<template>
  <div class="withdrawal-form-shell">
    <div
      v-if="isSubmitting"
      class="withdrawal-form__overlay"
      aria-live="polite"
      aria-busy="true">
      <div class="withdrawal-form__overlay-content">
        <UiIconSpinnerDefault />
        <div class="withdrawal-form__overlay-text">{{ processingLabel }}</div>
      </div>
    </div>

    <div class="withdrawal-form">
      <UiTextH5 class="withdrawal-form__title">{{ paymentSystemTitle }}</UiTextH5>

      <div
        v-if="isLoadingAccounts || isLoadingPaymentDetails"
        class="withdrawal-form__loading">
        <UiIconSpinnerDefault />
      </div>

      <div
        v-else
        class="withdrawal-form__body">
        <UiFormControl
          class="withdrawal-form__field"
          :label="accountLabel"
          :errors="errors.accountId ? [errors.accountId] : []">
          <div
            v-if="isAccountLocked && lockedAccount"
            class="withdrawal-form__account-preview">
            <div class="withdrawal-form__account-preview-value">{{ lockedAccount.text }}</div>
          </div>
          <UiSelect
            v-else
            :data="accountOptions"
            :without-no-select="true"
            :value="form.accountId"
            @change="handleAccountChange" />
        </UiFormControl>

        <div
          v-if="currentAccount"
          class="withdrawal-form__hint">
          {{ accountBalanceLabel }}: {{ formatBalance(currentAccount.balance, currentAccount.currency) }}
        </div>

        <UiFormControl
          class="withdrawal-form__field"
          :label="paymentDetailLabel"
          :errors="errors.paymentDetailId ? [errors.paymentDetailId] : []">
          <UiSelect
            :data="paymentDetailOptions"
            :without-no-select="true"
            :value="form.paymentDetailId"
            :disabled="paymentDetailOptions.length === 0"
            @change="handlePaymentDetailChange" />
        </UiFormControl>

        <div
          v-if="paymentDetailOptions.length === 0"
          class="withdrawal-form__empty-state">
          <div class="withdrawal-form__empty-title">{{ noPaymentDetailsTitle }}</div>
          <div class="withdrawal-form__empty-text">{{ noPaymentDetailsText }}</div>
          <UiButtonDefault
            state="info--outline"
            @click="handleGoToPaymentDetails">
            {{ openPaymentDetailsLabel }}
          </UiButtonDefault>
        </div>

        <template v-else>
          <UiFormControl
            class="withdrawal-form__field"
            :label="amountLabel"
            :errors="errors.amount ? [errors.amount] : []">
            <UiInput
              type="number"
              :value="form.amount"
              :placeholder="amountPlaceholder"
              @input="handleAmountInput" />
          </UiFormControl>

          <UiFormControl
            class="withdrawal-form__field"
            :label="commentLabel"
            :errors="errors.comment ? [errors.comment] : []">
            <UiTextarea
              class="withdrawal-form__textarea"
              :value="form.comment"
              :placeholder="commentPlaceholder"
              @input="handleCommentInput" />
          </UiFormControl>

          <div class="withdrawal-form__actions">
            <UiButtonDefault
              class="withdrawal-form__submit inline-flex items-center justify-center gap-2"
              state="info--outline"
              :disabled="isSubmitting"
              @click="handleSubmit">
              <span>{{ submitLabel }}</span>
              <UiIconSpinnerDefault v-if="isSubmitting" />
            </UiButtonDefault>
          </div>
        </template>
      </div>
    </div>
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
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import UiTextarea from "~/components/ui/UiTextarea.vue";
  import { extractApiErrorMessage, resolveApiMessage } from "~/composables/useApiMessages";
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
    paymentSystemName: string;
    data: Record<string, unknown>;
  };

  const props = defineProps<{
    paymentSystem?: PaymentSystem | null;
    initialAccountId?: string | null;
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
  const paymentSystemTitle = computed(() => {
    const selectedValue = String(selectedPaymentDetail.value?.paymentSystemName ?? "").trim();
    if (selectedValue !== "") {
      return selectedValue;
    }

    const propValue = String(props.paymentSystem?.name ?? "").trim();
    return propValue !== "" ? propValue : resolveText("cabinet.billing.withdrawalForm.title", "Withdrawal request");
  });
  const processingLabel = computed(() => resolveText("cabinet.billing.withdrawalForm.processing", "Processing..."));

  const accountOptions = computed(() => accounts.value.map(({ id, value, text }) => ({ id, value, text })));
  const paymentDetailOptions = computed(() => paymentDetails.value.map(({ id, value, text }) => ({ id, value, text })));

  const lockedAccount = computed(() => {
    const initialAccountId = String(props.initialAccountId ?? "").trim();
    if (initialAccountId === "") {
      return null;
    }

    return accounts.value.find(item => item.id === initialAccountId) ?? null;
  });
  const isAccountLocked = computed(() => lockedAccount.value !== null);
  const selectedAccount = computed(() => accounts.value.find(item => item.id === form.accountId) ?? null);
  const currentAccount = computed(() => lockedAccount.value ?? selectedAccount.value);
  const selectedPaymentDetail = computed(
    () => paymentDetails.value.find(item => item.id === form.paymentDetailId) ?? null
  );

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

  const resolveInitialAccountId = (): string => {
    const preferredAccountId = String(props.initialAccountId ?? "").trim();
    if (preferredAccountId !== "" && accounts.value.some(item => item.id === preferredAccountId)) {
      return preferredAccountId;
    }

    return accounts.value[0]?.id ?? "";
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
        form.accountId = resolveInitialAccountId();
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

      const rows = extractRows(response);

      paymentDetails.value = rows
        .filter((row: any) => String(row?.status ?? "").toLowerCase() === "approved")
        .map((row: any) => {
          const data = row?.data && typeof row.data === "object" ? row.data : {};
          const paymentSystemName = String(
            row?.payment_system_name ?? row?.payment_system?.name ?? row?.paymentSystem?.name ?? ""
          ).trim();
          const detailName = String(row?.name ?? "").trim();
          const textParts = [detailName || paymentSystemName || "Payment detail"];
          if (paymentSystemName !== "" && paymentSystemName !== detailName) {
            textParts.push(paymentSystemName);
          }

          return {
            id: String(row?.id ?? ""),
            value: String(row?.id ?? ""),
            text: textParts.join(" • "),
            name: detailName,
            payment_system_id: String(row?.payment_system_id ?? ""),
            paymentSystemName,
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

    if (currentAccount.value && Number.isFinite(amount) && amount > currentAccount.value.balance) {
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

      toast.success(resolveApiMessage(response?.data?.message, createdLabel.value) ?? createdLabel.value);
      closeModal();
      useEventBus.emit("loadDataForPayments");
    } catch (error: any) {
      toast.error(
        extractApiErrorMessage(
          error,
          resolveText("cabinet.billing.withdrawalForm.error", "Failed to create withdrawal request.")
        ) ?? resolveText("cabinet.billing.withdrawalForm.error", "Failed to create withdrawal request.")
      );
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(async () => {
    await Promise.all([loadAccounts(), loadPaymentDetails()]);
  });
</script>

<style scoped>
  .withdrawal-form-shell {
    position: relative;
  }

  .withdrawal-form__overlay {
    position: absolute;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
    background: rgb(0 0 0 / 0.2);
    backdrop-filter: blur(2px);
  }

  .withdrawal-form__overlay-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 20px 24px;
    text-align: center;
  }

  .withdrawal-form__overlay-text {
    color: rgb(255 255 255 / 0.9);
    font-size: 15px;
    font-weight: 600;
  }

  .withdrawal-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .withdrawal-form__title {
    color: var(--ui-text-main);
  }

  .withdrawal-form__body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .withdrawal-form__field {
    display: block;
  }

  .withdrawal-form__account-preview {
    min-height: 46px;
    display: flex;
    align-items: center;
    border-radius: var(--ui-border--raduis);
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-panel);
    padding: 0 16px;
    color: var(--ui-text-main);
  }

  .withdrawal-form__account-preview-value {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
  }

  .withdrawal-form__loading {
    min-height: 260px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    border: 1px solid var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--ui-background-panel) 88%, transparent);
  }

  .withdrawal-form__hint {
    margin-top: -4px;
    color: var(--ui-text-secondary);
    font-size: 13px;
    line-height: 1.45;
  }

  .withdrawal-form__textarea {
    min-height: 140px;
  }

  .withdrawal-form__actions {
    display: flex;
    justify-content: flex-start;
  }

  .withdrawal-form__submit {
    min-width: 240px;
  }

  .withdrawal-form__empty-state {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    border-radius: 16px;
    border: 1px solid var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--ui-background-panel) 90%, transparent);
  }

  .withdrawal-form__empty-title {
    color: var(--ui-text-main);
    font-size: 16px;
    font-weight: 700;
  }

  .withdrawal-form__empty-text {
    color: var(--ui-text-secondary);
    font-size: 13px;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    .withdrawal-form__submit {
      width: 100%;
    }
  }
</style>
