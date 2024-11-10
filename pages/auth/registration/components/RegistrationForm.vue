<template>
  <div class="registration-form">
    <UiTextH2 class="registration-form__title">REGISTRATION</UiTextH2>

    <UiFormControl
      class="registration-form__field"
      label="Email"
      :errors="validatorRegistrationForm?.errorsFormData?.email?.errors"
    >
      <UiInput
        type="text"
        placeholder="example@test.com"
        :value="props.formData.email"
        @input="
          validatorRegistrationForm?.doValidateField(
            'email',
            $event.target.value
          )
        "
        @blur="
          validatorRegistrationForm?.doValidateField(
            'email',
            $event.target.value
          )
        "
        :isDirty="validatorRegistrationForm?.errorsFormData?.email?.isDirty"
        :isInvalid="
          validatorRegistrationForm?.errorsFormData?.email?.errors?.length > 0
        "
      />
    </UiFormControl>

    <UiFormControl
      class="registration-form__field"
      label="Password"
      :errors="validatorRegistrationForm?.errorsFormData?.password.errors"
    >
      <UiInput
        type="password"
        placeholder="********"
        @input="
          validatorRegistrationForm?.doValidateField(
            'password',
            $event.target.value
          )
        "
        @blur="
          validatorRegistrationForm?.doValidateField(
            'password',
            $event.target.value
          )
        "
        :value="props.formData.password"
        :isDirty="validatorRegistrationForm?.errorsFormData?.password?.isDirty"
        :isInvalid="
          validatorRegistrationForm?.errorsFormData?.password?.errors?.length >
          0
        "
      />
    </UiFormControl>

    <UiFormControl
      class="registration-form__field"
      label="Confirm password"
      :errors="
        validatorRegistrationForm?.errorsFormData?.confirmPassword.errors
      "
    >
      <UiInput
        type="password"
        placeholder="********"
        @input="
          validatorRegistrationForm?.doValidateField(
            'confirmPassword',
            $event.target.value
          )
        "
        @blur="
          validatorRegistrationForm?.doValidateField(
            'confirmPassword',
            $event.target.value
          )
        "
        :value="props.formData.confirmPassword"
        :isDirty="
          validatorRegistrationForm?.errorsFormData?.confirmPassword?.isDirty
        "
        :isInvalid="
          validatorRegistrationForm?.errorsFormData?.confirmPassword?.errors
            ?.length > 0
        "
      />
    </UiFormControl>

    <UiButtonPrimary
      type="submit"
      @click="validateRegistrationForm(doSendForm)"
      :isLoading="isLoading"
    >
      REGISTRATION
    </UiButtonPrimary>
  </div>
</template>

<script lang="ts" setup>
import {
  validateRegistrationForm,
  validatorRegistrationForm,
  resetValidationRegistrationForm,
} from "../composables/validation";
import { validatorLoginForm } from "~/pages/auth/login/composables/validation";
import { useAppCore } from "~/composables/services/validation/useAppCore";
// import { serverSideErrorsHandler } from "@/utils/validation/server-side-errors-handler.helper";

const props = defineProps({ formData: { type: Object, required: true } });

const isLoading = ref(false);
const appCore = useAppCore();

const doSendForm = async (): Promise<void> => {
  isLoading.value = true;

  try {
    await appCore.auth.doRegistration(props.formData);
    useRouter().push({ path: "/auth/login" });
  } catch (e: any) {
    const serverValidationErrors = e?.response?.data?.description;
    console.log("CATCH: ", serverValidationErrors);
  } finally {
    resetValidationRegistrationForm();
    isLoading.value = false;
  }
};

onUnmounted(() => resetValidationRegistrationForm());
</script>

<style lang="scss" scoped>
.registration-form {
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
}
</style>
