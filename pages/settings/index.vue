<template>
  <div class="settings">
    <UiTextH1> Settings </UiTextH1>

    <div class="settings__tabs">
      <UiTabs :tabs="tabs" @active-tab="setActiveTab" />
    </div>

    <div class="settings__content">
      <component :is="activeComponent" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import UiTabs from "~/components/ui/UiTabs.vue";
import UiTextH1 from "~/components/ui/UiTextH1.vue";
import { tabs } from "./composables/index";
import { activeComponent, setActiveTab } from "./composables/setup";
</script>

<style lang="scss" scoped>
.settings {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 50px;

  &__tabs {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }
}
</style>
