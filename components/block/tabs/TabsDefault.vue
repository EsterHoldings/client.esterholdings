<template>
  <div class="tabs">
    <div
      class="tab"
      v-for="(tabItem, index) in tabsList"
      :key="tabItem.label"
      :class="{ active: activeTabIndex === index }"
      @click="handleClickTab(index)"
    >
      {{ tabItem.label }}
    </div>
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits(["selectTab"]);
defineProps({
  tabsList: {
    type: Array,
    default: [],
  },
  activeTabIndex: {
    type: Number,
    default: 0,
  },
});

const handleClickTab = (index) => {
  emit("selectTab", index);
};
</script>

<style lang="scss" scoped>
.tabs {
  display: flex;
  gap: 1.4rem;

  .tab {
    cursor: pointer;
    padding: 5px;
    color: var(--ui-text-main);
    border-bottom: 1px solid var(--ui-background-panel);

    &:hover {
      border-bottom: 1px solid var(--color-ui-primary);
    }

    &.active {
      border-bottom: 1px solid var(--color-ui-primary);
    }
  }
}
</style>
