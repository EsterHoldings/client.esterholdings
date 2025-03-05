<template>
  <div class="page--min-height forgot">
    <div class="forgot-form-wrapper">
      <ForgotForm :formData="formData" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formData } from "./composables";
import { IFormDataDto } from "~/pages/auth/forgot/composables";
import ForgotForm from "@/pages/auth/forgot/components/ForgotForm.vue";

definePageMeta({
  middleware: ["not-auth"],
  layout: "main"
});

onMounted(() =>
  Object.keys(formData).forEach(
    (key) => (formData[key as keyof IFormDataDto] = "")
  )
);
</script>

<style lang="scss" scoped>
.forgot {
  display: flex;
  justify-content: center;
  align-items: center;

  &-form-wrapper {
    max-width: 600px;
    width: 100%;
  }
}
</style>
