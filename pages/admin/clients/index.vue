<template>
  <div class="clients-page">
    <div class="clients-page__title">
      <UiTextH4>{{ t("admin.clients.index.title") }}</UiTextH4>
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
import UiTextH4 from "~/components/ui/UiTextH4.vue";
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
    color: var(--ui-text-main);
  }

  &__content {
    height: calc(100vh - 120px);
  }
}
</style>
