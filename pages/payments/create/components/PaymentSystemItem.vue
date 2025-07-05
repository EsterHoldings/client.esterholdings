<template>
<div class="payment-system-item" :class="{'active': props.isActive}" @click="handleSelect">
  <span class="payment-system-item__logo">
    <component :is="props.icon" />
  </span>
  <span class="payment-system-item__name">
    {{ props.name }}
  </span>
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
  padding: 20px;
  border-radius: 10px;
  height: 160px;
  width: 100%;
  border: 1px solid var(--color-stroke-ui-dark);
  font-size: 12px;

  &.active {
    background-color: var(--color-stroke-ui-dark);
    border: 1px solid var(--color-ui-accent);
  }

  &:hover {
    background-color: var(--color-stroke-ui-dark);
    opacity: .7;
  }

  &:active {
    opacity: .5;
  }

  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    height: 80px;

    svg {
      height: 80px;
      width: 80px;

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