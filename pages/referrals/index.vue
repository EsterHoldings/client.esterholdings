<template>
  <UiContainer class="referrals-page">
    <div class="referrals-placeholder">
      <PanelDefault class="referrals-placeholder__card">
        <p class="referrals-placeholder__label">{{ t("cabinet.referrals.placeholder.label") }}</p>
        <h1 class="referrals-placeholder__title">{{ t("cabinet.referrals.placeholder.title") }}</h1>
        <p class="referrals-placeholder__description">{{ t("cabinet.referrals.placeholder.description") }}</p>
      </PanelDefault>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
  import { useI18n } from "vue-i18n";
  import { definePageMeta } from "~/.nuxt/imports";

  import UiContainer from "~/components/ui/UiContainer.vue";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";

  definePageMeta({
    layout: "cabinet",
    middleware: ["auth-client", "client-check-auth"],
  });

  const { t } = useI18n({ useScope: "global" });
</script>

<style scoped>
  .referrals-placeholder {
    min-height: calc(100vh - 220px);
    display: grid;
    place-items: center;
  }

  .referrals-placeholder__card {
    width: min(760px, 100%);
    padding: clamp(20px, 3vw, 36px);
    text-align: center;
    border-color: var(--ui-primary-main);
  }

  .referrals-placeholder__label {
    font-size: 13px;
    line-height: 18px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ui-text-main);
  }

  .referrals-placeholder__title {
    margin-top: 10px;
    font-size: clamp(22px, 3vw, 32px);
    line-height: 1.2;
    font-weight: 700;
    color: var(--ui-text-main);
  }

  .referrals-placeholder__description {
    margin-top: 12px;
    font-size: clamp(14px, 2vw, 17px);
    line-height: 1.5;
    color: var(--ui-text-main);
  }
</style>
