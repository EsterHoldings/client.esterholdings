<template>
  <div class="page--min-height login">
    <div class="login-form-wrapper">
      <LoginForm :formData="formData" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formData } from "~/pages/auth/login/composables";
import LoginForm from "@/pages/auth/login/components/LoginForm.vue";

definePageMeta({
  middleware: ["not-auth"],
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
  }
}
</style>
