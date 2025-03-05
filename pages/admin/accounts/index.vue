<template>
  <div class="clients-page">
    <div class="clients-page__title">
      <UiTextH1>Accounts</UiTextH1>
      <UiTextParagraph>( List of accounts )</UiTextParagraph>
    </div>
    <div class="accounts-page__content">
      <AccountsPanel />
    </div>
  </div>
</template>

<script lang="ts" setup>
import UiTextH1 from "~/components/ui/UiTextH1.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";

import AccountsPanel from "~/pages/admin/accounts/components/AccountsPanel.vue";
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