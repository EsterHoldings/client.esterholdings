<template>
  <div class="tab-deposit__wrapper">
    <UiTextH5 class="tab-deposit__title">USDT ERC-20</UiTextH5>
    <div class="tab-deposit__form">
      <UiFormControl
        class="tab-deposit__form_field"
        :label="amountLabel"
        :errors="amountErrors">
        <UiInput
          type="text"
          :placeholder="amountPlaceholder"
          @input="validatorUsdtErcDataForm?.doValidateField('amount', $event.target.value)"
          @blur="validatorUsdtErcDataForm?.doValidateField('amount', $event.target.value)"
          :value="formData.amount"
          :isDirty="validatorUsdtErcDataForm?.errorsFormData?.amount?.isDirty"
          :isInvalid="validatorUsdtErcDataForm?.errorsFormData?.amount?.errors?.length > 0" />
      </UiFormControl>

      <UiFormControl
        class="tab-deposit__form_field"
        :label="commentLabel"
        :errors="commentErrors">
        <UiTextarea
          type="text"
          :placeholder="commentPlaceholder"
          @input="validatorUsdtErcDataForm?.doValidateField('comment', $event.target.value)"
          @blur="validatorUsdtErcDataForm?.doValidateField('comment', $event.target.value)"
          :value="formData.comment"
          :isDirty="validatorUsdtErcDataForm?.errorsFormData?.comment?.isDirty"
          :isInvalid="validatorUsdtErcDataForm?.errorsFormData?.comment?.errors?.length > 0" />
      </UiFormControl>

      <UiButtonDefault
        class="mt-3"
        state="info--outline"
        @click="validateUsdtErcDataForm(handleSubmit)">
        {{ submitLabel }}
      </UiButtonDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted } from "vue";
  import { useI18n } from "vue-i18n";
  import { resolveApiMessage } from "~/composables/useApiMessages";
  import { formData } from "~/pages/payments/create/composables/TabDepositFormUsdtErc20";
  import {
    resetFormData,
    resetValidationUsdtErcDataForm,
    validateUsdtErcDataForm,
    validatorUsdtErcDataForm,
  } from "~/pages/payments/create/composables/TabDepositFormUsdtErc20/validation";

  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiTextarea from "~/components/ui/UiTextarea.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";

  const { t } = useI18n({ useScope: "global" });
  const resolveText = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };
  const amountLabel = computed(() => resolveText("cabinet.billing.depositForm.amount", "Amount"));
  const amountPlaceholder = computed(() =>
    resolveText("cabinet.billing.depositForm.amountPlaceholder", "Amount in USD")
  );
  const commentLabel = computed(() => resolveText("cabinet.billing.depositForm.comment", "Comment"));
  const commentPlaceholder = computed(() =>
    resolveText("cabinet.billing.depositForm.commentPlaceholder", "Add a comment for the finance team")
  );
  const submitLabel = computed(() => resolveText("cabinet.billing.depositForm.submit", "Create deposit"));
  const amountErrors = computed(() =>
    (validatorUsdtErcDataForm?.errorsFormData?.amount?.errors ?? []).map(
      (message: string) => resolveApiMessage(message, message) ?? message
    )
  );
  const commentErrors = computed(() =>
    (validatorUsdtErcDataForm?.errorsFormData?.comment?.errors ?? []).map(
      (message: string) => resolveApiMessage(message, message) ?? message
    )
  );

  const handleSubmit = () => undefined;

  onMounted(() => {
    resetFormData();
    resetValidationUsdtErcDataForm();
  });
</script>

<style lang="scss" scoped>
  .tab-deposit {
    &__wrapper {
    }

    &__title {
      margin-bottom: 20px;
    }

    &__form {
      &_field {
        margin-bottom: 10px;
      }
    }
  }
</style>
