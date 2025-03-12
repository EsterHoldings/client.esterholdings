<template>
  <div class="tabs">
    <!-- Список вкладок -->
    <div class="tabs__list">
      <div
        v-for="(tab, index) in props.tabs"
        :key="tab.id || index"
        class="tabs__item"
        :class="{ 'tabs__item--active': activeTabIndex === index }"
        @click="handleSetActiveTab(index)"
      >
        <UiTextH5>
          {{ tab.label }}
        </UiTextH5>
      </div>
    </div>

    <!-- Контент активной вкладки -->
    <div class="tabs__content">
      <component v-if="activeTabComponent" :is="activeTabComponent" />
      <p v-else class="tabs__no-content">No content available</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import UiTextH5 from "./UiTextH5.vue";
import { computed, ref } from "vue";

// Интерфейс для вкладки
interface ITab {
  id?: string;
  label: string;
  component: any;
}

const props = defineProps<{ tabs: ITab[] }>();

// Активный индекс вкладки
const activeTabIndex = ref(0);

// Функция переключения вкладки
const handleSetActiveTab = (index: number) => {
  if (index >= 0 && index < props.tabs.length) {
    activeTabIndex.value = index;
  }
};

// Определение активного компонента вкладки
const activeTabComponent = computed(() => {
  return props.tabs.length > 0
    ? props.tabs[activeTabIndex.value]?.component
    : null;
});
</script>

<style scoped lang="scss">
.tabs {
  padding: 10px 40px;
}

.tabs__list {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
}

.tabs__item {
  position: relative;
  border: 1px solid rgb(27, 99, 255);
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 26px;
  cursor: pointer;
  transition: background 0.3s ease-in-out, transform 0.2s ease;

  h5 {
    color: var(--color-ui-primary-defalt);
  }

  &:hover {
    transform: scale(1.05);
  }
}

.tabs__item--active {
  background: var(--color-ui-warning);
  border: none;
}

.tabs__no-content {
  text-align: center;
  font-size: 16px;
  color: #888;
}
</style>
