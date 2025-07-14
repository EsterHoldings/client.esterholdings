<template>
  <div class="page__wrapper">
    <TheCabinetSideBar/>
    <UiImage class="bg-image" src="/space.gif"/>
<!--    <UiCanvasRain/>-->
<!--    <UiCanvasFly />-->
    <Transition name="fade" mode="out-in">
      <div class="page__wrapper_scroll">
        <div class="page" :key="route.fullPath">
          <slot/>
        </div>
        <TheFooter class="footer"/>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {useRoute} from "vue-router";

import TheCabinetSideBar from "~/components/block/TheCabinetSideBar.vue";
import TheFooter from "~/components/block/TheFooter.vue";
import UiImage from "~/components/ui/UiImage.vue";
import UiCanvasRain from "~/components/ui/UiCanvasRain.vue";
import UiCanvasFly from "~/components/ui/UiCanvasFly.vue";

const route = useRoute();
</script>

<style lang="scss" scoped>
.footer {
  height: 120px;
}

.bg-image {
  position: fixed;
  left: 0;
  top: 0;
  opacity: 1;
  z-index: -1;
}

.page__wrapper {
  background-color: var(--color-ui-background-opacity-95);
  height: 100vh;
  overflow: hidden;

  &_scroll {
    height: 100%;
    overflow: scroll;
  }
}

.page {
  box-sizing: border-box;
  width: 100%;
  height: min-content;
  min-height: calc(100vh - 120px);
  padding: 40px 40px 40px 142px;
  color: white;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 100ms ease;
}
</style>
