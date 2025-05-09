<template>
  <div class="clients-page">
    <div class="clients-page__title">
      <UiTextH1>{{ t("admin.clients.index.title") }}</UiTextH1>
      <UiTextParagraph
        >({{ t("admin.clients.index.subtitle") }})</UiTextParagraph
      >
    </div>
    <div class="clients-page__content">
      <ClientsPanel />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import UiTextH1 from "~/components/ui/UiTextH1.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import ClientsPanel from "~/pages/admin/clients/components/ClientsPanel.vue";

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.clients-page {
  height: 100vh;
  width: 100%;
  padding: 20px;

  &__title {
    margin-bottom: 20px;
  }

  &__content {
    height: calc(100vh - 120px);
  }
}
</style>
