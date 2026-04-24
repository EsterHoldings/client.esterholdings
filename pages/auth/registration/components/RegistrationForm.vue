<template>
  <div class="registration-form">
    <UiTextH3 class="registration-form__title">Registration</UiTextH3>

    <UiFormControl
        class="registration-form__field"
        label="Email"
        :errors="validatorRegistrationForm?.errorsFormData?.email?.errors"
    >
      <UiInput
          type="text"
          placeholder="example@test.com"
          :value="props.formData.email"
          @input="validatorRegistrationForm?.doValidateField('email',$event.target.value)"
          @blur="validatorRegistrationForm?.doValidateField('email',$event.target.value)"
          :isDirty="validatorRegistrationForm?.errorsFormData?.email?.isDirty"
          :isInvalid="validatorRegistrationForm?.errorsFormData?.email?.errors?.length > 0"
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
          @input="validatorRegistrationForm?.doValidateField('password',$event.target.value)"
          @blur="validatorRegistrationForm?.doValidateField('password',$event.target.value)"
          :value="props.formData.password"
          :isDirty="validatorRegistrationForm?.errorsFormData?.password?.isDirty"
          :isInvalid="validatorRegistrationForm?.errorsFormData?.password?.errors?.length >0"
      />
    </UiFormControl>

    <UiFormControl
        class="registration-form__field"
        label="Confirm password"
        :errors="validatorRegistrationForm?.errorsFormData?.confirmPassword.errors"
    >
      <UiInput
          type="password"
          placeholder="********"
          @input="validatorRegistrationForm?.doValidateField('confirmPassword',$event.target.value)"
          @blur="validatorRegistrationForm?.doValidateField('confirmPassword',$event.target.value)"
          :value="props.formData.confirmPassword"
          :isDirty="validatorRegistrationForm?.errorsFormData?.confirmPassword?.isDirty"
          :isInvalid="validatorRegistrationForm?.errorsFormData?.confirmPassword?.errors?.length > 0"
      />
    </UiFormControl>

    <label class="registration-form__checkbox">
      <UiInput
          class="input"
          type="checkbox"
          :checked="isAgreeTerms"
          @checked="(e) => {isAgreeTerms = e.target.checked; console.log('INPUT CHECKBOX IS AGREE TERMS')}"
      />
      <UiTextH6>
        I agree with the terms of the
        <NuxtLink to="/quoting-contract" target="_blank">offer</NuxtLink>
        and the
        <NuxtLink to="/quoting-regulations" target="_blank">quotation rules</NuxtLink>
      </UiTextH6>
    </label>

    <label class="registration-form__checkbox">
      <UiInput
          class="input"
          type="checkbox"
          :checked="isAgreePrivacy"
          @checked="(e) => { isAgreePrivacy = e.target.checked;  console.log('INPUT CHECKBOX IS AGREE PRIVACY') }"
      />
      <UiTextH6>
        I agree to the
        <NuxtLink to="/data-protection-guidelines" target="_blank">processing of my personal data</NuxtLink>
        and warned about the
        <NuxtLink to="/risks-statement" target="_blank">risks</NuxtLink>
      </UiTextH6>
    </label>

    <UiButtonPrimary
        class="registration-form__btn"
        :class="{'is-disabled': isDisabledSubmit}"
        type="submit"
        @click="validateRegistrationForm(doSendForm)"
        :isLoading="isLoading"
    >REGISTRATION</UiButtonPrimary>

    <div class="registration-form__links">
      <br/>
      <NuxtLink to="/auth/login">Login</NuxtLink>
    </div>

    <div class="registration-form__social-links">
      <GoogleLogin/>
    </div>

  </div>
</template>

<script lang="ts" setup>
import { navigateTo, useNuxtApp } from "nuxt/app";
import { useLocalePath } from "#imports";
import { ref, onUnmounted, computed } from "vue";
import {useAppCore} from "~/composables/useAppCore";
import {useToast} from "vue-toastification";
import { useAuthStore } from "~/stores/authStore";
import {
  validateRegistrationForm,
  validatorRegistrationForm,
  resetValidationRegistrationForm
} from "../composables/validation";

import GoogleLogin from "../../login/components/GoogleLogin.vue";
import UiButtonPrimary from "~/components/ui/UiButtonPrimary.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiTextH6 from "~/components/ui/UiTextH6.vue";

const props = defineProps({formData: {type: Object, required: true}});

const {$recaptcha} = useNuxtApp()
const isRecaptchaValid = ref(false)

let isLoading = ref(false);
let isAgreeTerms = ref(false);
const isAgreePrivacy = ref(false);
const appCore = useAppCore();
const toast = useToast();
const localePath = useLocalePath();

const isDisabledSubmit = computed(() => {
  return !isAgreeTerms.value || !isAgreePrivacy.value;
})

const resolveAccessToken = (response: any): string =>
  String(response?.data?.access_token ?? response?.data?.data?.access_token ?? "").trim();

const doSendForm = async (): Promise<void> => {
  isLoading.value = true;
  let shouldResetFormData = false;
  let registrationCompleted = false;

  try {
    await appCore.auth.doRegistration({
      email: props.formData.email,
      password: props.formData.password,
      password_confirmation: props.formData.confirmPassword,
    });

    registrationCompleted = true;

    const authStore = useAuthStore();
    const response = await appCore.auth.doLogin({
      email: props.formData.email,
      password: props.formData.password,
    });
    const accessToken = resolveAccessToken(response);

    if (!accessToken) {
      throw new Error("Missing access token.");
    }

    authStore.setAccessToken(accessToken);
    await authStore.initAuth(true);
    shouldResetFormData = true;
    toast.success("Successfully registration!");
    await navigateTo(localePath("/"));
  } catch (e: any) {
    if (e.status === 422) {
      const validationErrors = e.response?.data?.errors ?? {};

      for (const [field, messages] of Object.entries(validationErrors)) {
        const fieldErr = validatorRegistrationForm?.errorsFormData[field];
        if (fieldErr) {
          fieldErr.errors = messages;
        }
      }

      toast.error("Invalid credentials");
    } else if (registrationCompleted) {
      toast.success("Successfully registration!");
      await navigateTo(localePath("/auth/login"));
    } else {
      toast.error("Oops! Something went wrong =(");
    }
  } finally {
    if (shouldResetFormData) {
      resetValidationRegistrationForm();
    }

    isLoading.value = false;
  }
};

// onMounted(async () => {
//   isRecaptchaValid.value = await $recaptcha('registration')
// })

onUnmounted(() => resetValidationRegistrationForm());
</script>

<style lang="scss" scoped>
.registration-form {
  color:var(--ui-text-main);
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

    a {
      color: var(--ui-text-main);

      &:hover {
        color: var(--ui-text-secondary);
      }
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

  &__checkbox {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;

    .input {
      width: 15px;
    }

    h6 {
      color: var(--ui-text-main);

      a {
        color: var(--color-ui-accent);
      }
    }
  }

  &__btn {
    margin-top: 20px;
    margin-bottom: 10px;
  }

  .is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}
</style>
