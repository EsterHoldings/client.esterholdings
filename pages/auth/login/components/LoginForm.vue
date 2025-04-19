<template>
  <div class="login-form">
    <UiTextH3 class="login-form__title">Login</UiTextH3>

    <UiFormControl
        class="login-form__field"
        label="Email"
        :errors="validatorLoginForm?.errorsFormData?.email?.errors"
    >
      <UiInput
          type="text"
          placeholder="example@test.com"
          @input="
          validatorLoginForm?.doValidateField('email', $event.target.value)
        "
          @blur="
          validatorLoginForm?.doValidateField('email', $event.target.value)
        "
          :value="props.formData?.email"
          :isDirty="validatorLoginForm?.errorsFormData?.email?.isDirty"
          :isInvalid="
          validatorLoginForm?.errorsFormData?.email?.errors?.length > 0
        "
      />
    </UiFormControl>

    <UiFormControl
        class="login-form__field"
        label="Password"
        :errors="validatorLoginForm?.errorsFormData?.password?.errors"
    >
      <UiInput
          type="password"
          placeholder="********"
          @input="
          validatorLoginForm?.doValidateField('password', $event.target.value)
        "
          @blur="
          validatorLoginForm?.doValidateField('password', $event.target.value)
        "
          :value="props.formData?.password"
          :isDirty="validatorLoginForm?.errorsFormData?.password?.isDirty"
          :isInvalid="
          validatorLoginForm?.errorsFormData?.password?.errors?.length > 0
        "
      />
    </UiFormControl>

    <UiButtonDefault
        class="login-form__btn"
        type="submit"
        @click="validateLoginForm(doSendForm)"
        :isLoading="isLoading"
        state="primary"
    >Login</UiButtonDefault>

    <div class="login-form__links">
      <div class="login-form__link">
        <NuxtLink to="/auth/registration">Sign Up</NuxtLink>
      </div>
      <div class="login-form__link">
        <NuxtLink to="/auth/forgot">Forgot password</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue";
import {useRouter} from "vue-router";

import UiTextH2 from "~/components/ui/UiTextH2.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconGoogle from "~/components/ui/UiIconGoogle.vue";
import UiIconApple from "~/components/ui/UiIconApple.vue";
import UiIconDeveloper from "~/components/ui/UiIconDeveloper.vue";

import {useAppCore} from "~/composables/useAppCore";
import {
  validatorLoginForm,
  validateLoginForm,
  resetValidationLoginForm,
} from "@/pages/auth/login/composables/validation";
import UiTextH3 from "~/components/ui/UiTextH3.vue";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
import {useAdminAuthStore} from "~/stores/adminAuthStore";
import {navigateTo} from "nuxt/app";
import {useAuthStore} from "~/stores/authStore";

const props = defineProps({formData: {type: Object, required: true}});

const isLoading = ref(false);
const appCore = useAppCore();

const doSendForm = async () => {

  try {
    isLoading.value = true;
    const authStore = useAuthStore();

    const response = await appCore.auth.doLogin(props.formData);

    const accessToken = response.data.data.access_token;
    const refreshToken = response.data.data.refresh_token;

    localStorage.setItem('user_access_token', accessToken);
    localStorage.setItem('user_refresh_token', refreshToken);

    authStore.setAccessToken(accessToken);
    authStore.setRefreshToken(refreshToken);

    navigateTo('/dashboard')

    console.log('DO REDIRECT TO DASHBOARD')
  } catch (e: any) {
    console.log("LoginForm -> doSendForm -> catch", e.message);
  } finally {
    resetValidationLoginForm();
    setTimeout(() => {
      isLoading.value = false;
    }, 1500);
  }
};

// @ts-ignore
onUnmounted(() => resetValidationLoginForm());
</script>

<style lang="scss" scoped>
.login-form {
  color: #c4c4c4;
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
