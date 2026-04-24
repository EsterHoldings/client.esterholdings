<template>
  <UiContainer>
    <div class="cabinet-settings-page">
      <div class="cabinet-settings-page__title">
        <UiTextH4 class="text-[var(--ui-text-main)]">
          {{ t("cabinet.settings.title") }}
        </UiTextH4>
      </div>

      <PanelDefault>
        <div class="p-5">
          <TabChangePassword />
        </div>
      </PanelDefault>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
  import { definePageMeta } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";

  import UiContainer from "~/components/ui/UiContainer.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import TabChangePassword from "~/pages/profile/components/TabChangePassword.vue";

  definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });
  const { t } = useI18n({ useScope: "global" });
</script>

<style lang="scss" scoped>
  .cabinet-settings-page {
    padding-bottom: 40px;
  }

  .cabinet-settings-page__title {
    margin-bottom: 20px;
  }
</style>
