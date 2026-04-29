<template>
  <div class="page--min-height login">
    <div class="login-form__wrapper">
      <PanelDefault class="login-form__panel-default">
        <LoginForm :formData="formData" @input2-fa="handle2faInput" />
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formData } from "./composables";
import LoginForm from "@/pages/auth/login/components/LoginForm.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import {onMounted} from "vue";

// @ts-ignore
definePageMeta({
  middleware: ["not-auth-client"],
  layout: "guest"
});

const handle2faInput = (value: string) => {
  formData.twoFaCode = value;
}

onMounted(() => {
  formData.twoFaCode = '';
})
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  min-height: calc(100dvh - var(--guest-header-height, 84px) - env(safe-area-inset-top, 0px));

  &-form {
    &__wrapper {
      padding: clamp(12px, 3vw, 24px);
      min-height: calc(100dvh - var(--guest-header-height, 84px) - env(safe-area-inset-top, 0px));
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    &__panel-default {
      padding: clamp(24px, 3vw, 40px);
      max-width: 600px;
      width: min(100%, 600px);
      background: transparent !important;
      border: 0 !important;
      box-shadow: none !important;
      backdrop-filter: none !important;
    }
  }
}

@media (max-height: 760px) {
  .login-form__wrapper {
    align-items: flex-start;
    padding-top: 16px;
    padding-bottom: 24px;
  }
}
</style>
