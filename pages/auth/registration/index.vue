<template>
  <div class="page--min-height registration">
    <div class="registration-form-wrapper">
      <RegistrationForm :formData="formData" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formData } from "./composables";

import RegistrationForm from "@/pages/auth/registration/components/RegistrationForm.vue";

definePageMeta({
  middleware: ["not-auth"],
});
</script>

<style lang="scss" scoped>
.registration {
  display: flex;
  justify-content: center;
  align-items: center;

  &-form-wrapper {
    max-width: 600px;
    width: 100%;
  }
}
</style>
