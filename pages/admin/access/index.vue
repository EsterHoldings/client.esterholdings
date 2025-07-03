<template>
  <div class="access-page">
    <div class="access-page__title">
      <UiTextH4>{{ t("admin.access.index.title") }}</UiTextH4>
      <UiTextParagraph>
        {{ t("admin.access.index.subtitle") }}
      </UiTextParagraph>
    </div>
    <div class="access-page__content">
      <div class="access-page__content__top">
        <div class="access-page__content__top__left">
          <RolesPanel />
        </div>
        <div class="access-page__content__top__right">
          <PermissionsPanel />
        </div>
      </div>
      <br />
      <div class="access-page__content__bottom">
        <AdminsPanel />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { definePageMeta } from "~/.nuxt/imports";

import AdminsPanel from "~/pages/admin/access/components/AdminsPanel.vue";
import RolesPanel from "~/pages/admin/access/components/RolesPanel.vue";
import PermissionsPanel from "~/pages/admin/access/components/PermissionsPanel.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";

definePageMeta({
  middleware: ["admin-middleware"],
});

const { t } = useI18n({ useScope: "global" });
</script>

<style lang="scss" scoped>
.access {
  &-page {
    height: calc(100vh - 40px);
    width: 100%;
    padding: 20px;

    &__title {
      margin-bottom: 20px;
      color: var(--ui-text-main);
    }

    &__content {
      &__top {
        display: flex;
        justify-content: space-between;
        gap: 20px;

        @media (max-width: 1130px) {
          flex-direction: column;
        }

        &__left {
          width: 100%;
        }

        &__right {
          width: 100%;
        }
      }

      &__bottom {
        padding-bottom: 20px;
      }
    }
  }
}
</style>
