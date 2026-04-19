<template>
  <div class="forgot-form">
    <UiTextH3 class="forgot-form__title">{{ t("authFlow.forgot.title") }}</UiTextH3>
    <p class="forgot-form__subtitle">{{ t("authFlow.forgot.subtitle") }}</p>

    <UiFormControl
      class="forgot-form__field"
      :label="t('authFlow.fields.email')"
      :errors="validatorForgotForm?.errorsFormData?.email?.errors">
      <UiInput
        type="text"
        placeholder="example@test.com"
        @input="handleEmailInput"
        @blur="validatorForgotForm?.doValidateField('email', props.formData.email)"
        :value="props.formData.email"
        :isDirty="validatorForgotForm?.errorsFormData?.email?.isDirty"
        :isInvalid="validatorForgotForm?.errorsFormData?.email?.errors?.length > 0" />
    </UiFormControl>

    <UiButtonPrimary
      class="forgot-form__btn"
      type="submit"
      @click="validateForgotForm(doSendForm)"
      :isLoading="isLoading"
      >{{ t("authFlow.forgot.submit") }}
    </UiButtonPrimary>

    <div class="forgot-form__links">
      <div class="forgot-form__link">
        <NuxtLink :to="localePath('/auth/login')">{{ t("authFlow.actions.signIn") }}</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import UiButtonPrimary from "~/components/ui/UiButtonPrimary.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiTextH3 from "~/components/ui/UiTextH3.vue";

  import { useLocalePath, useI18n } from "#imports";
  import { ref } from "vue";
  import { useAppCore } from "~/composables/useAppCore";
  import { useToast } from "vue-toastification";

  import { validatorForgotForm, validateForgotForm, resetValidationForgotForm } from "../composables/validation";

  const props = defineProps({
    formData: {
      type: Object,
      required: true,
    },
  });

  const isLoading = ref(false);
  const appCore = useAppCore();
  const toast = useToast();
  const localePath = useLocalePath();
  const { t } = useI18n();

  const handleEmailInput = (value: string) => {
    props.formData.email = value;
    validatorForgotForm?.doValidateField("email", value);
  };

  const doSendForm = async () => {
    try {
      isLoading.value = true;
      await appCore.auth.requestPasswordReset({
        email: String(props.formData.email ?? "").trim(),
      });
      toast.success(t("authFlow.forgot.sent"));
      resetValidationForgotForm();
    } catch (e: any) {
      toast.error(t("authFlow.forgot.error"));
    } finally {
      isLoading.value = false;
    }
  };

  // @ts-ignore
  onUnmounted(() => resetValidationForgotForm());
</script>

<style lang="scss" scoped>
  .forgot-form {
    color: var(--ui-text-main);
    display: flex;
    justify-content: center;
    flex-direction: column;

    &__link {
      margin-bottom: 10px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    &__links {
      width: 100%;
      display: flex;
      align-items: center;
      flex-direction: column;
    }

    &__title {
      text-align: center;
      margin-bottom: 10px;
    }

    &__subtitle {
      margin: 0 0 26px;
      color: var(--ui-text-secondary);
      text-align: center;
      line-height: 1.45;
    }

    &__field {
      margin-bottom: 20px;
    }

    &__btn {
      margin-top: 30px;
      margin-bottom: 40px;
    }
  }
</style>
