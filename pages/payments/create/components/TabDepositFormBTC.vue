<template>
  <div class="tab-deposit__wrapper">
    <UiTextH5 class="tab-deposit__title">BTC</UiTextH5>
    <div class="tab-deposit__form">
      <UiFormControl
        class="tab-deposit__form_field"
        :label="amountLabel"
        :errors="amountErrors">
        <UiInput
          type="text"
          :placeholder="amountPlaceholder"
          @input="validatorBTCDataForm?.doValidateField('amount', $event.target.value)"
          @blur="validatorBTCDataForm?.doValidateField('amount', $event.target.value)"
          :value="formData.amount"
          :isDirty="validatorBTCDataForm?.errorsFormData?.amount?.isDirty"
          :isInvalid="validatorBTCDataForm?.errorsFormData?.amount?.errors?.length > 0" />
      </UiFormControl>

      <UiFormControl
        class="tab-deposit__form_field"
        :label="commentLabel"
        :errors="commentErrors">
        <UiTextarea
          type="text"
          :placeholder="commentPlaceholder"
          @input="validatorBTCDataForm?.doValidateField('comment', $event.target.value)"
          @blur="validatorBTCDataForm?.doValidateField('comment', $event.target.value)"
          :value="formData.comment"
          :isDirty="validatorBTCDataForm?.errorsFormData?.comment?.isDirty"
          :isInvalid="validatorBTCDataForm?.errorsFormData?.comment?.errors?.length > 0" />
      </UiFormControl>

      <UiButtonDefault
        class="mt-3"
        state="info--outline"
        @click="validateBTCDataForm(handleSubmit)">
        {{ submitLabel }}
      </UiButtonDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted } from "vue";
  import { useI18n } from "vue-i18n";
  import { resolveApiMessage } from "~/composables/useApiMessages";
  import { formData } from "~/pages/payments/create/composables/TabDepositFormBTC";
  import {
    resetFormData,
    resetValidationBTCDataForm,
    validateBTCDataForm,
    validatorBTCDataForm,
  } from "~/pages/payments/create/composables/TabDepositFormBTC/validation";

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
    (validatorBTCDataForm?.errorsFormData?.amount?.errors ?? []).map(
      (message: string) => resolveApiMessage(message, message) ?? message
    )
  );
  const commentErrors = computed(() =>
    (validatorBTCDataForm?.errorsFormData?.comment?.errors ?? []).map(
      (message: string) => resolveApiMessage(message, message) ?? message
    )
  );

  const handleSubmit = () => undefined;

  onMounted(() => {
    resetFormData();
    resetValidationBTCDataForm();
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
