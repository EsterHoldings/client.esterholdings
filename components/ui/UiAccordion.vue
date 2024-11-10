<template>
  <div v-for="(slide, index) in props.data" :key="index">
    <header
      class="header"
      :class="{ active: slide.isActive }"
      @click="handleClickToggle(index)"
    >
      {{ slide.title }}
    </header>

    <div class="panel" :class="{ active: slide.isActive }">
      {{ slide.description }}
    </div>
  </div>
</template>

<script setup lang="ts">
import IAccordionItem from "~/composables/interfaces/IAccordeonItem";

const emits = defineEmits(["change"]);

const props = defineProps({
  data: {
    type: Array as () => IAccordionItem[],
    default: [],
  },
});

const handleClickToggle = (index: number) => {
  emits(
    "change",
    [...props.data].map(
      (s: IAccordionItem, i: Number) =>
        (s.isActive = i === index ? !s.isActive : false)
    )
  );
};
</script>

<style lang="scss" scoped>
.header {
  height: 70px;
  display: flex;
  cursor: pointer;
  transition: 0.3s;
  flex-direction: column;
  justify-content: center;
  color: var(--color-dark);
  padding: calc(var(--spacer) * 2);
  background-color: var(--color-default);

  &:hover {
    opacity: 0.5;
    transition: 0.3s;
  }

  &.active {
    opacity: 0.5;
  }

  margin-bottom: calc(var(--spacer) * 2);
}

.panel {
  max-height: 0;
  overflow: hidden;
  margin-bottom: 10px;

  &.active {
    max-height: max-content;
  }
}

.text-content {
  padding: 0 15px;
}
</style>
