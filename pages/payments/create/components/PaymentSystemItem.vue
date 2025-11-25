<template>
<div class="payment-system-item" :class="{'active': props.isActive}" @click="handleSelect">
  <div class="flex items-center justify-center gap-5">
    <span class="payment-system-item__logo">
      <component :is="props.icon" />
    </span>
    <span class="payment-system-item__name">
      {{ props.name }}
    </span>
  </div>
  <div class="flex items-center justify-center">
    <div
        class="h-[16px] w-[16px] rounded-full flex items-center justify-center border border-[var(--color-stroke-ui-light)]"
        :class="{'border-[var(--color-ui-accent)]': props.isActive}"
    >
      <div
          class="h-[10px] w-[10px] rounded-full"
          :class="{'bg-[var(--color-ui-accent)]': props.isActive}"
      ></div>
    </div>
  </div>
</div>
</template>

<script lang="ts" setup>
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  icon: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    required: false
  }
})

const emit = defineEmits(['select'])

const handleSelect = () => emit('select');
</script>

<style lang="scss" scoped>
.payment-system-item {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 20px;
  border-radius: 10px;
  height: 60px;
  width: 100%;
  background-color: var(--color-stroke-ui-dark);
  border: 1px solid var(--color-stroke-ui-dark);
  font-size: 12px;

  &.active {
    background-color: var(--color-stroke-ui-dark);
    border: 1px solid var(--color-ui-accent);
  }

  &:hover {
    background-color: var(--ui-background-panel);
    opacity: .7;
  }

  &:active {
    opacity: .5;
  }

  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    width: 20px;

    svg {
      height: 20px;
      width: 20px;

      stroke-width: 1px;

      path,
      polygon,
      g {
        stroke-width: 1px;
      }

    }
  }

  &__name {
    user-select: none;
    display: block;
    text-align: center;
  }
}
</style>