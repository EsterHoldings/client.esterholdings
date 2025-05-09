<template>
  <div class="settings">
    <UiTextH3>{{ t("admin.settings.title") }}</UiTextH3>

    <div class="settings__tabs">
      <UiTabs :tabs="tabs" @active-tab="setActiveTab" />
    </div>

    <component :is="activeComponent" :key="activeComponent" />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { useTabs } from "./composables";
import { activeComponent, setActiveTab } from "./composables/setup";
import UiTabs from "~/components/ui/UiTabs.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";

const { t } = useI18n();
const { tabs } = useTabs();
</script>

<style lang="scss" scoped>
.settings {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 50px;

  &__tabs {
    width: 1192px;
    margin: 0 auto;
  }
}
</style>
