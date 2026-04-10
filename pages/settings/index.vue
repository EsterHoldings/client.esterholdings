<template>
  <UiContainer>
    <div class="referrals">
      <div class="referrals__title">
        <UiTextH4>{{ t("cabinet.settings.title") }}</UiTextH4>
      </div>
      <div class="referrals__content">
        <UiTextH1>{{ t("cabinet.settings.comingSoonTitle") }}</UiTextH1>
        <UiTextParagraph>{{ t("cabinet.settings.comingSoonDescription") }}</UiTextParagraph>
      </div>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
  import { definePageMeta } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";
  import UiTextH1 from "~/components/ui/UiTextH1.vue";
  import UiContainer from "~/components/ui/UiContainer.vue";
  import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";

  definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });
  const { t } = useI18n({ useScope: "global" });
</script>

<style lang="scss" scoped>
  .referrals {
    padding-bottom: 40px;

    &__title {
      margin-bottom: 20px;

      h4 {
        color: var(--ui-text-main);
      }
    }

    &__content {
      height: 80vh;
      width: 100%;

      display: flex;
      align-items: center;
      justify-content: center;

      flex-direction: column;

      p {
        margin-top: 20px;
        width: 300px;
        text-align: center;
      }

      h1,
      p {
        color: var(--ui-text-main);
      }
    }
  }
</style>
