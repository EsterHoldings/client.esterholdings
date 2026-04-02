<template>
  <div class="accounts-transfer-modal">
    <div
      v-if="props.title"
      class="accounts-transfer-modal__top">
      <UiTextH4>{{ props.title }}</UiTextH4>
      <button
        type="button"
        class="accounts-transfer-modal__close-btn"
        :aria-label="closeLabel"
        @click="closeModal">
        ×
      </button>
    </div>

    <div
      class="accounts-transfer-modal__content"
      :class="{ 'without-top': !props.title }">
      <div class="accounts-transfer-modal__fields">
        <UiFormControl :label="fromAccountLabel">
          <div class="accounts-transfer-modal__readonly">
            <span class="accounts-transfer-modal__readonly-main">{{ fromAccountText }}</span>
            <span class="accounts-transfer-modal__readonly-sub">{{ fromAccountBalanceText }}</span>
          </div>
        </UiFormControl>

        <UiFormControl :label="toAccountLabel">
          <UiSelect
            :without-no-select="true"
            :data="destinationOptions"
            :value="form.toAccountId"
            :disabled="isLoadingAccounts || destinationOptions.length === 0"
            @change="handleChangeDestination" />
        </UiFormControl>

        <UiFormControl :label="amountLabel">
          <UiInput
            type="number"
            :value="form.amount"
            :placeholder="amountPlaceholder"
            @input="handleAmountInput" />
        </UiFormControl>

        <UiTextSmall
          v-if="validationErrorText"
          class="accounts-transfer-modal__error">
          {{ validationErrorText }}
        </UiTextSmall>

        <div class="accounts-transfer-modal__actions">
          <UiButtonDefault
            state="info--outline"
            class="accounts-transfer-modal__cancel-btn"
            @click="closeModal">
            {{ cancelLabel }}
          </UiButtonDefault>

          <UiButtonDefault
            state="info"
            class="accounts-transfer-modal__submit-btn"
            :disabled="!canSubmit || isSubmitting || isLoadingAccounts"
            @click="handleSubmit">
            <span v-if="!isSubmitting">{{ submitLabel }}</span>
            <UiIconSpinnerDefault v-else />
          </UiButtonDefault>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, inject, onMounted, reactive, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import useEventBus from "~/composables/useEventBus";
  import useAppCore from "~/composables/useAppCore";

  type AccountDto = {
    id: string;
    number?: string;
    balance?: number | string;
    currency?: string;
    account_type?: { name?: string };
  };

  const props = withDefaults(
    defineProps<{
      title?: string;
      fromAccountId: string;
    }>(),
    {
      title: "",
    }
  );

  const appCore = useAppCore();
  const toast = useToast();
  const { t } = useI18n({ useScope: "global" });
  const modalControl = inject("modalControl") as { closeModal: () => void };
  const closeModal = () => modalControl?.closeModal?.();

  const accounts = ref<AccountDto[]>([]);
  const isLoadingAccounts = ref(false);
  const isSubmitting = ref(false);

  const form = reactive({
    toAccountId: "",
    amount: "",
  });

  const resolveText = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const closeLabel = computed(() => resolveText("cabinet.common.close", "Close"));
  const fromAccountLabel = computed(() => resolveText("cabinet.accounts.transfer.fromAccount", "From account"));
  const toAccountLabel = computed(() => resolveText("cabinet.accounts.transfer.toAccount", "To account"));
  const amountLabel = computed(() => resolveText("cabinet.accounts.transfer.amount", "Amount"));
  const amountPlaceholder = computed(() => resolveText("cabinet.accounts.transfer.amountPlaceholder", "Enter amount"));
  const cancelLabel = computed(() => resolveText("cabinet.common.cancel", "Cancel"));
  const submitLabel = computed(() => resolveText("cabinet.accounts.transfer.submit", "Create transfer"));
  const transferSuccessLabel = computed(() =>
    resolveText("cabinet.accounts.transfer.success", "Transfer request created successfully.")
  );
  const transferFailedLabel = computed(() =>
    resolveText("cabinet.accounts.transfer.failed", "Failed to create transfer request.")
  );
  const sourceAccountNotFoundLabel = computed(() =>
    resolveText("cabinet.accounts.transfer.sourceNotFound", "Source account not found.")
  );
  const noDestinationAccountsLabel = computed(() =>
    resolveText("cabinet.accounts.transfer.noDestinations", "You do not have another account available for transfer.")
  );
  const amountExceedsBalanceLabel = computed(() =>
    resolveText("cabinet.accounts.transfer.exceedsBalance", "Amount exceeds available balance.")
  );

  const normalizeId = (value: unknown): string => String(value ?? "");
  const normalizeNumber = (account: AccountDto): string => {
    const number = String(account.number ?? "").trim();
    return number !== "" ? number : normalizeId(account.id);
  };
  const normalizeBalance = (value: unknown): number | null => {
    const parsed = Number.parseFloat(String(value ?? "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  };
  const normalizeAmount = (value: string): string => value.replace(",", ".");

  const fromAccount = computed(
    () => accounts.value.find(account => normalizeId(account.id) === normalizeId(props.fromAccountId)) ?? null
  );

  const fromAccountNumber = computed(() => (fromAccount.value ? normalizeNumber(fromAccount.value) : ""));

  const fromAccountBalanceValue = computed(() => normalizeBalance(fromAccount.value?.balance ?? null));
  const fromAccountBalanceText = computed(() => {
    const balance = fromAccountBalanceValue.value;
    const currency = String(fromAccount.value?.currency ?? "").trim() || "USD";

    if (balance === null) {
      return "—";
    }

    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(balance);
    } catch {
      return `${balance.toFixed(2)} ${currency}`;
    }
  });

  const fromAccountText = computed(() => {
    if (!fromAccount.value) return "—";
    const typeName = String(fromAccount.value.account_type?.name ?? "").trim();
    const number = fromAccountNumber.value;

    return typeName !== "" ? `${number} (${typeName})` : number;
  });

  const destinationAccounts = computed(() =>
    accounts.value.filter(account => normalizeId(account.id) !== normalizeId(props.fromAccountId))
  );

  const destinationOptions = computed(() =>
    destinationAccounts.value.map(account => ({
      id: normalizeId(account.id),
      value: normalizeId(account.id),
      text: normalizeNumber(account),
    }))
  );

  const selectedDestinationAccount = computed(
    () => destinationAccounts.value.find(account => normalizeId(account.id) === form.toAccountId) ?? null
  );

  const parsedAmount = computed(() => {
    const value = Number.parseFloat(normalizeAmount(form.amount));
    return Number.isFinite(value) ? value : null;
  });

  const validationErrorText = computed(() => {
    if (!fromAccount.value) {
      return sourceAccountNotFoundLabel.value;
    }

    if (destinationOptions.value.length === 0) {
      return noDestinationAccountsLabel.value;
    }

    const amount = parsedAmount.value;
    if (amount !== null && amount > 0) {
      const sourceBalance = fromAccountBalanceValue.value;
      if (sourceBalance !== null && amount > sourceBalance) {
        return amountExceedsBalanceLabel.value;
      }
    }

    return "";
  });

  const canSubmit = computed(() => {
    const amount = parsedAmount.value;
    return (
      !!fromAccount.value &&
      !!selectedDestinationAccount.value &&
      amount !== null &&
      amount > 0 &&
      !validationErrorText.value
    );
  });

  const handleChangeDestination = (value: string | null) => {
    form.toAccountId = String(value ?? "");
  };

  const handleAmountInput = (value: string) => {
    form.amount = value;
  };

  const loadAccounts = async () => {
    isLoadingAccounts.value = true;
    try {
      const loaded: AccountDto[] = [];
      let page = 1;
      let lastPage = 1;

      do {
        const response = await appCore.accounts.get({
          page,
          perPage: 100,
          orderBy: "number",
          orderDirection: "asc",
          order_by: "number",
          order_direction: "asc",
        });

        const payload = response?.data?.data ?? {};
        const items = Array.isArray(payload.data) ? payload.data : [];
        loaded.push(...items);

        const currentPage = Number(payload.current_page ?? page);
        lastPage = Number(payload.last_page ?? currentPage);
        page = currentPage + 1;
      } while (page <= lastPage && page <= 100);

      accounts.value = loaded;

      if (!fromAccount.value) {
        toast.error(sourceAccountNotFoundLabel.value);
        closeModal();
        return;
      }

      if (destinationOptions.value.length === 0) {
        form.toAccountId = "";
        return;
      }

      form.toAccountId = destinationOptions.value[0]?.value ?? "";
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? transferFailedLabel.value);
      closeModal();
    } finally {
      isLoadingAccounts.value = false;
    }
  };

  const extractApiErrorMessage = (error: any): string | null => {
    const mt4ErrorSource = error?.response?.data?.errors?.mt4;
    const mt4Error = Array.isArray(mt4ErrorSource)
      ? String(mt4ErrorSource[0] ?? "").trim()
      : String(mt4ErrorSource ?? "").trim();
    if (mt4Error !== "") {
      return mt4Error;
    }

    const firstValidationError = Object.values(error?.response?.data?.errors ?? {}).find(
      (value: any) => Array.isArray(value) && String(value[0] ?? "").trim() !== ""
    ) as any[] | undefined;
    if (firstValidationError) {
      return String(firstValidationError[0] ?? "").trim();
    }

    const apiMessage = String(error?.response?.data?.message ?? "").trim();
    if (apiMessage !== "") {
      return apiMessage;
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!canSubmit.value || !fromAccount.value || !selectedDestinationAccount.value || parsedAmount.value === null) {
      if (validationErrorText.value) {
        toast.error(validationErrorText.value);
      }
      return;
    }

    const fromNumber = normalizeNumber(fromAccount.value);
    const toNumber = normalizeNumber(selectedDestinationAccount.value);
    const amount = parsedAmount.value.toFixed(2);
    const comment = `${fromNumber} -> ${toNumber}`;

    isSubmitting.value = true;
    try {
      const response = await appCore.accounts.transfer({
        from: fromNumber,
        to: toNumber,
        amount,
        comment,
      });

      const payload = response?.data?.data ?? {};
      const status = String(payload.status ?? "")
        .trim()
        .toLowerCase();
      if (status !== "" && status !== "pending") {
        toast.error(response?.data?.message ?? transferFailedLabel.value);
        return;
      }

      useEventBus.emit("loadDataForAccounts");
      useEventBus.emit("dashboardRefresh");

      closeModal();
      toast.success(transferSuccessLabel.value);
    } catch (error: any) {
      toast.error(extractApiErrorMessage(error) ?? transferFailedLabel.value);
    } finally {
      isSubmitting.value = false;
    }
  };

  onMounted(async () => {
    await loadAccounts();
  });
</script>

<style scoped>
  .accounts-transfer-modal {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .accounts-transfer-modal__top {
    min-height: 50px;
    padding-left: 40px;
    padding-right: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--color-stroke-ui-dark);
    gap: 12px;
  }

  .accounts-transfer-modal__close-btn {
    border: none;
    background: transparent;
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    color: var(--ui-text-main);
    padding: 0;
    min-width: 28px;
    min-height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .accounts-transfer-modal__content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .accounts-transfer-modal__content.without-top {
    border-top: none;
  }

  .accounts-transfer-modal__fields {
    padding: 24px 40px;
  }

  .accounts-transfer-modal__readonly {
    min-height: var(--ui-input--height);
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-control-bg);
    border-radius: 10px;
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
  }

  .accounts-transfer-modal__readonly-main {
    color: var(--ui-text-main);
    font-weight: 600;
    font-size: 14px;
    line-height: 1.25;
  }

  .accounts-transfer-modal__readonly-sub {
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.2;
  }

  .accounts-transfer-modal__error {
    color: var(--ui-sticker-danger);
    margin-top: 4px;
  }

  .accounts-transfer-modal__actions {
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
  }

  .accounts-transfer-modal__cancel-btn,
  .accounts-transfer-modal__submit-btn {
    min-height: 40px;
  }

  @media (max-width: 768px) {
    .accounts-transfer-modal__top {
      padding-left: 20px;
      padding-right: 20px;
    }

    .accounts-transfer-modal__fields {
      padding: 20px;
    }

    .accounts-transfer-modal__actions {
      flex-direction: column;
      justify-content: stretch;
    }

    .accounts-transfer-modal__cancel-btn,
    .accounts-transfer-modal__submit-btn {
      width: 100%;
    }
  }
</style>
