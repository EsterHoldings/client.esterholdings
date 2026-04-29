<template>
  <div class="login-form">
    <UiTextH3 class="login-form__title">Login</UiTextH3>

    <UiFormControl
      class="login-form__field"
      label="Email"
      :errors="validatorLoginForm.errorsFormData.email.errors">
      <UiInput
        type="text"
        placeholder="example@test.com"
        :value="props.formData.email"
        :isDirty="validatorLoginForm.errorsFormData.email.isDirty"
        :isInvalid="validatorLoginForm.errorsFormData.email.errors.length > 0"
        @input="validatorLoginForm.doValidateField('email', $event.target.value)"
        @blur="validatorLoginForm.doValidateField('email', $event.target.value)" />
    </UiFormControl>

    <UiFormControl
      class="login-form__field"
      label="Password"
      :errors="validatorLoginForm.errorsFormData.password.errors">
      <UiInput
        type="password"
        placeholder="********"
        :value="props.formData.password"
        :isDirty="validatorLoginForm.errorsFormData.password.isDirty"
        :isInvalid="validatorLoginForm.errorsFormData.password.errors.length > 0"
        @input="validatorLoginForm.doValidateField('password', $event.target.value)"
        @blur="validatorLoginForm.doValidateField('password', $event.target.value)" />
    </UiFormControl>

    <UiFormControl
      class="login-form__field"
      label="2Fa code"
      :errors="twoFaErrors"
      v-if="twoFaEnabled">
      <UiOtpInput
        ref="twoFaOtpRef"
        :value="props.formData.twoFaCode"
        :isInvalid="twoFaErrors.length > 0"
        :autofocus="twoFaEnabled"
        @input="handleTwoFaCodeInput" />
    </UiFormControl>

    <UiButtonDefault
      type="submit"
      state="primary"
      class="login-form__btn"
      :isLoading="isLoading"
      @click="validateLoginForm(doSendForm)">
      Login
    </UiButtonDefault>

    <div class="login-form__links">
      <div class="login-form__link">
        <NuxtLink to="/auth/registration">Sign Up</NuxtLink>
      </div>
      <div class="login-form__link">
        <NuxtLink to="/auth/forgot">Forgot password</NuxtLink>
      </div>
    </div>

    <div class="login-form__social-links">
      <GoogleLogin />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import GoogleLogin from "./GoogleLogin.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiOtpInput from "~/components/ui/UiOtpInput.vue";
  import UiTextH3 from "~/components/ui/UiTextH3.vue";

  import { navigateTo, useRoute } from "nuxt/app";
  import { useLocalePath } from "#imports";
  import { nextTick, reactive, ref, watch } from "vue";
  import { useAppCore } from "~/composables/useAppCore";
  import { useAuthStore } from "~/stores/authStore";
  import { useToast } from "vue-toastification";

  import {
    validatorLoginForm,
    validateLoginForm,
    resetValidationLoginForm,
  } from "@/pages/auth/login/composables/validation";
  import { useErrorStack } from "~/stores/errors";

  const props = defineProps({
    formData: {
      type: Object,
      required: true,
    },
  });

  const isRecaptchaValid = ref(false);
  const isLoading = ref(false);
  const twoFaEnabled = ref(false);
  const appCore = useAppCore();
  const toast = useToast();
  const route = useRoute();
  const localePath = useLocalePath();
  const emit = defineEmits(["input2Fa"]);

  const twoFaErrors = ref<string[]>([]);
  const twoFaOtpRef = ref<InstanceType<typeof UiOtpInput> | null>(null);

  const handleTwoFaCodeInput = (value: string) => {
    twoFaErrors.value = [];
    emit("input2Fa", value);
  };

  const errors = useErrorStack();

  const resolvePostLoginTarget = (): string => {
    const raw = Array.isArray(route.query?.return_to) ? route.query.return_to[0] : route.query?.return_to;
    if (typeof raw === "string" && raw.startsWith("/")) {
      return raw;
    }

    return localePath("/");
  };

  const resolveAccessToken = (response: any): string =>
    String(response?.data?.access_token ?? response?.data?.data?.access_token ?? "").trim();

  const isTwoFaRequiredResponse = (responseData: any): boolean => {
    const message = String(responseData?.message ?? "").toLowerCase();

    return Boolean(
      responseData?.data?.two_fa_is_required ||
        responseData?.errors?.twoFaCode?.length > 0 ||
        message.includes("two fa") ||
        message.includes("two-factor") ||
        message.includes("2fa")
    );
  };

  const resolveTwoFaErrors = (responseData: any): string[] => {
    const rawFieldErrors = Array.isArray(responseData?.errors?.twoFaCode)
      ? responseData.errors.twoFaCode
      : [];
    const messages = [
      errors.get("twoFaCode"),
      ...rawFieldErrors,
      errors.currentMessage(null),
      responseData?.message,
    ]
      .map((message) => String(message ?? "").trim())
      .filter(Boolean);

    const uniqueMessages = Array.from(new Set(messages));

    return uniqueMessages.length > 0 ? uniqueMessages : ["Invalid 2Fa code"];
  };

  const doSendForm = async () => {
    let shouldResetFormData = false;

    try {
      isLoading.value = true;
      twoFaErrors.value = [];

      const authStore = useAuthStore();
      const response = await appCore.auth.doLogin(props.formData);
      const accessToken = resolveAccessToken(response);

      if (!accessToken) {
        throw new Error("Missing access token.");
      }

      authStore.setAccessToken(accessToken);
      await authStore.initAuth(true);
      shouldResetFormData = true;
      twoFaEnabled.value = false;
      toast.success("Welcome!");
      navigateTo(resolvePostLoginTarget());
    } catch (e: any) {
      const responseData = e.response?.data;
      const submittedTwoFaCode = String(props.formData.twoFaCode ?? "").trim();
      const wasTwoFaEnabled = twoFaEnabled.value;
      const twoFaRequired = isTwoFaRequiredResponse(responseData);

      if (twoFaRequired) {
        twoFaEnabled.value = true;

        if (!wasTwoFaEnabled && submittedTwoFaCode === "") {
          twoFaErrors.value = [];
          return;
        }

        twoFaErrors.value = resolveTwoFaErrors(responseData);
      } else if (e.status === 401) {
        toast.error(errors.currentMessage("Invalid credentials"));
      } else {
        toast.error("Invalid credentials");
      }
    } finally {
      if (shouldResetFormData) {
        resetValidationLoginForm();
      } else {
        validatorLoginForm.clearFieldsErrors();
      }

      setTimeout(() => {
        isLoading.value = false;
      }, 1500);
    }
  };

  // @ts-ignore
  onUnmounted(() => resetValidationLoginForm());

  watch(twoFaEnabled, async value => {
    if (!value) {
      return;
    }

    await nextTick();
    twoFaOtpRef.value?.focus?.();
  });
</script>

<style lang="scss" scoped>
  .login-form {
    color: var(--ui-text-main);
    display: flex;
    justify-content: center;
    flex-direction: column;

    &__link {
      margin-bottom: 10px;

      a {
        color: var(--ui-text-main);

        &:hover {
          color: var(--ui-text-secondary);
        }
      }

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

    &__social-links {
      margin-top: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
    }

    &__social-link {
      display: flex;
      place-content: center;
      padding: 3px;
      background: white;

      border-radius: 100%;
    }

    &__title {
      text-align: center;
      margin-bottom: 30px;
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
