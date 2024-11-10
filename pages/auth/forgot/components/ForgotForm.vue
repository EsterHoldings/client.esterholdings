<template>
  <div class="forgot-form">
    <UiTextH2 class="forgot-form__title">FORGOT PASSWORD</UiTextH2>

    <UiFormControl
      class="forgot-form__field"
      label="Email"
      :errors="validatorForgotForm?.errorsFormData?.email?.errors"
    >
      <UiInput
        type="text"
        label="Email"
        placeholder="example@test.com"
        @input="
          validatorForgotForm?.doValidateField('email', $event.target.value)
        "
        @blur="
          validatorForgotForm?.doValidateField('email', $event.target.value)
        "
        :value="props.formData.email"
        :isDirty="validatorForgotForm?.errorsFormData?.email?.isDirty"
        :isInvalid="
          validatorForgotForm?.errorsFormData?.email?.errors?.length > 0
        "
      />
    </UiFormControl>

    <UiButtonPrimary
      type="submit"
      @click="validateForgotForm(doSendForm)"
      :isLoading="isLoading"
      >SEND RESET LINK
    </UiButtonPrimary>
  </div>
</template>

<script lang="ts" setup>
import {
  validateForgotForm,
  validatorForgotForm,
  resetValidationForgotForm,
} from "../composables/validation";

const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
});

const isLoading = ref(false);

const doSendForm = () => {
  try {
    isLoading.value = true;
  } catch (e: any) {
    console.log("ForgotForm -> doSendForm -> catch");
  } finally {
    setTimeout(() => {
      resetValidationForgotForm();
      isLoading.value = false;
    }, 1000);
  }
};

onUnmounted(() => resetValidationForgotForm());
</script>

<style lang="scss" scoped>
.forgot-form {
  display: flex;
  justify-content: center;
  flex-direction: column;

  &__title {
    text-align: center;
  }

  &__field {
    margin-bottom: 20px;
  }

  &__submit {
    margin: auto;
  }

  &__forgot-link {
    margin-top: 10px;
    text-align: center;
  }
}
</style>
