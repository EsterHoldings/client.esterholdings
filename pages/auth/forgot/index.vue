<template>
  <div class="page--min-height forgot">
    <div class="forgot-form__wrapper">
      <PanelDefault class="forgot-form__panel-default">
        <ForgotForm :formData="formData" />
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { formData } from "./composables";
  import { IFormDataDto } from "~/pages/auth/forgot/composables";
  import ForgotForm from "@/pages/auth/forgot/components/ForgotForm.vue";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";

  // @ts-ignore
  definePageMeta({
    middleware: ["not-auth-client"],
    layout: "guest",
  });

  // @ts-ignore
  onMounted(() => Object.keys(formData).forEach(key => (formData[key as keyof IFormDataDto] = "")));
</script>

<style lang="scss" scoped>
  .forgot {
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
    .forgot-form__wrapper {
      align-items: flex-start;
      padding-top: 16px;
      padding-bottom: 24px;
    }
  }
</style>
