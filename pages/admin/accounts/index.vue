<template>
  <div class="clients-page">
    <div class="clients-page__title">
      <UiTextH1>{{ $t("admin.accounts.index.title") }}</UiTextH1>
      <UiTextParagraph>{{
        $t("admin.accounts.index.subtitle")
      }}</UiTextParagraph>
    </div>
    <div class="accounts-page__content">
      <AccountsPanel />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import UiTextH1 from "~/components/ui/UiTextH1.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";

import AccountsPanel from "~/pages/admin/accounts/components/AccountsPanel.vue";

const { t } = useI18n({ useScope: "global" });
</script>

<style lang="scss" scoped>
.accounts-page {
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
