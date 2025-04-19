<template>
  <li class="side-bar-cabinet__menu__item"
      :class="{'active': isActive}"
      @click="handleClickMenuItem($event)"
  >
    <div class="side-bar-cabinet__menu__item__indicator"
         :class="{'active': isActive}"
    ></div>

    <div class="side-bar-cabinet__menu__item__icon">
      <component :is="icon"></component>
    </div>

    <div class="side-bar-cabinet__menu__item__title"
         :class="{'hide': !props.sideBarIsOpen}"
    >
      {{ title }}
    </div>
  </li>
</template>

<script lang="ts" setup>
import {useRoute} from "vue-router";
import {computed} from "vue";

const emit = defineEmits(['click'])

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
  icon: {
    type: Object,
    default: ""
  },
  sideBarIsOpen: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()

const isActive = computed(() => route.path === props.to)

const handleClickMenuItem = (event: Event) => emit('click', props.to)
</script>

<style lang="scss" scoped>
.side-bar-cabinet__menu__item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  margin-top: 1px;
  height: 65px;

  background-color: transparent;

  transition: .3s;


  &:hover {
    transition: .3s;
    background-color: var(--color-stroke-ui-dark);
  }

  &.active {
    border-right: 1px solid var(--color-ui-primary);
  }

  &__indicator {
    position: absolute;
    left: 0;
    top: 0;
    width: 8px;
    height: 100%;

    background-color: var(--color-stroke-ui-dark);

    &.active {
      background-color: var(--color-ui-primary);
    }
  }

  &__icon {
    padding-left: 20px;
    padding-top: 10px;
  }

  &__title {
    padding-bottom: 10px;
    padding-left: 20px;
    width: 100%;
    height: 100%;
    transition: 3s;
    opacity: 1;
    white-space: nowrap;
    cursor: pointer;

    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;

    color: #d8d8d8;
    font-size: 14px;
    font-weight: 500;

    &:hover {
      color: #a9a9a9;
    }

    &.hide {
      transition: .1s;
      opacity: 0;
      width: 0;
      overflow: hidden;
    }
  }
}

</style>
