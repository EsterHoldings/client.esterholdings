<template>
  <div class="page--min-height login">
    <div class="login-form-wrapper">
      <div class="login-form-wrapper__logo">
        <UiIconLogo />
      </div>
      <LoginForm :formData="formData" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formData } from "./composables";
// @ts-ignore
import LoginForm from "@/pages/auth/login/components/LoginForm.vue";
// @ts-ignore
import UiIconLogo from "~/components/ui/UiIconLogo.vue";

// @ts-ignore
definePageMeta({
  middleware: ["not-auth"],
  layout: "main"
});
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;

  &-form-wrapper {
    max-width: 600px;
    width: 100%;

    &__logo {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 20vh;
    }
  }
}
</style>
