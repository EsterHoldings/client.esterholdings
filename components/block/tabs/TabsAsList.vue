<template>
  <div class="tabs">
    <div
      class="tab"
      v-for="(tabItem, index) in tabsList"
      :key="tabItem.label"
      :class="{ active: activeTabIndex === index }"
      @click="handleClickTab(index)">
      <component v-if="tabItem.icon" :is="tabItem.icon" class="tab__icon" />
      <span>{{ tabItem.label }}</span>
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

  const handleClickTab = (index: number) => emit("selectTab", index);
</script>

<style lang="scss" scoped>
  .tabs {
    display: flex;
    flex-direction: column;
    gap: 5px;

    @media (max-width: 1023px) {
      flex-direction: row;
      justify-content: space-around;
    }

    .tab {
      gap: 10px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      cursor: pointer;
      padding: 10px 20px;
      color: var(--ui-text-main);
      border-radius: 10px;

      &:hover {
        background-color: var(--ui-background-panel);
      }

      &.active {
        background-color: var(--ui-primary-main);
      }

      @media (max-width: 1023px) {
        justify-content: center;
        padding: 10px 12px;

        span {
          display: inline;
          font-size: 12px;
          max-width: 110px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .tab__icon {
        width: 18px;
        height: 18px;
      }

      @media (max-width: 480px) {
        .tab__icon {
          width: 20px;
          height: 20px;
        }
        span {
          display: none;
        }
      }
    }
  }
</style>
