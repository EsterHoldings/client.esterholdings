<template>
  <div class="tab-deposit__wrapper">
    <UiTextH5 class="tab-deposit__title">USDT TRC-20</UiTextH5>

    <div class="tab-deposit__form">
      <UiFormControl
          class="tab-deposit__form_field"
          label="Сумма"
          :errors="validatorUsdtTrcDataForm?.errorsFormData?.amount?.errors"
      >
        <UiInput
            type="text"
            placeholder="Сумма USD"
            @input="validatorUsdtTrcDataForm.doValidateField('amount', $event.target.value)"
            @blur="validatorUsdtTrcDataForm.doValidateField('amount', $event.target.value)"
            :value="formData.amount"
            :isDirty="validatorUsdtTrcDataForm.errorsFormData?.amount?.isDirty"
            :isInvalid="validatorUsdtTrcDataForm.errorsFormData?.amount?.errors?.length > 0"
        />
      </UiFormControl>

      <UiFormControl
          class="tab-deposit__form_field"
          label="Комментарий"
          :errors="validatorUsdtTrcDataForm.errorsFormData?.comment?.errors"
      >
        <UiTextarea
            type="text"
            placeholder="Ваш коментарий"
            @input="validatorUsdtTrcDataForm.doValidateField('comment', $event.target.value)"
            @blur="validatorUsdtTrcDataForm.doValidateField('comment', $event.target.value)"
            :value="formData.comment"
            :isDirty="validatorUsdtTrcDataForm.errorsFormData?.comment?.isDirty"
            :isInvalid="validatorUsdtTrcDataForm.errorsFormData?.comment?.errors?.length > 0"
        />
      </UiFormControl>

      <UiButtonDefault
          state="info--outline"
          @click="validatorUsdtTrcDataForm(handleSubmit)"
      >
        Создать депозит
      </UiButtonDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {formData} from "~/pages/payments/create/composables/TabDepositFormUsdtTrc20";
import {
  resetFormData,
  resetValidationUsdtTrcDataForm,
  validatorUsdtTrcDataForm
} from "~/pages/payments/create/composables/TabDepositFormUsdtTrc20/validation";

import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiTextarea from "~/components/ui/UiTextarea.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import {onMounted} from "vue";

const handleSubmit = () => {
  console.log('USDT TRC-20');
}

onMounted(() => {
  resetFormData();
  resetValidationUsdtTrcDataForm();
})
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