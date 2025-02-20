<script setup lang="ts">
import { ref } from "vue";
import UiTextH4Vue from "./UiTextH4.vue";

interface Tab {
  id: string;
  label: string;
}

const props = defineProps<{
  tabs: Tab[];
}>();

const emit = defineEmits(["activeTab"]);

const activeTab = ref(props.tabs[0].id);

const setActiveTab = (tabId: string) => {
  activeTab.value = tabId;

  emit("activeTab", tabId);
};
</script>

<template>
  <div class="tabs">
    <div class="tabs__wrapper">
      <div
        v-for="tab in props.tabs"
        :key="tab.id"
        class="tabs__item"
        :class="{ 'tabs__item--active': activeTab === tab.id }"
        @click="setActiveTab(tab.id)"
      >
        <UiTextH4>
          {{ tab.label }}
        </UiTextH4>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tabs {
  padding: 10px 40px;
  background: rgba(255, 255, 255, 0.38);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.tabs__wrapper {
  display: flex;
  gap: 50px;
  align-items: center;
  justify-content: center;
}

.tabs__item {
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease-in-out, color 0.2s;
}

.tabs__item--active {
  background: rgba(210, 210, 210, 0.5);
  color: #de9e48;

  h4 {
    font-weight: 500;
  }
}
</style>
