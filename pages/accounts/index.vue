<template>
  <UiContainer>
    <div class="accounts">
      <div class="accounts__title">
        <UiTextH4>{{ t("cabinet.accounts.title") }}</UiTextH4>
      </div>

      <div class="accounts__content">
        <AccountsPanel />
      </div>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import AccountsPanel from "~/pages/accounts/components/AccountsPanel.vue";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";

import { definePageMeta } from "~/.nuxt/imports";
import { useI18n } from "vue-i18n";

definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });

const { t } = useI18n({ useScope: "global" });
</script>

<style lang="scss" scoped>
.icon-update {
  height: 14px;
  width: 14px;
  margin-right: 10px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    animation: wiggle 0.2s ease;
  }
}

.icon-update.spinning {
  animation: spin 0.5s linear;
}

.balance-sum {
  cursor: pointer;
}

.wiggle:hover {
  animation: wiggle 0.3s ease;
}

/* ========== KEYFRAMES ========== */

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes wiggle {
  0% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-2px);
  }
  40% {
    transform: translateX(2px);
  }
  60% {
    transform: translateX(-2px);
  }
  80% {
    transform: translateX(2px);
  }
  100% {
    transform: translateX(0);
  }
}

.accounts {
  &__title {
    margin-bottom: 20px;

    h4 {
      color: var(--ui-text-main);
    }
  }

  &__content {

  }
}
</style>
