<template>
  <header class="header">
    <NuxtLink :to="localePath('/')"
      ><UiIconLogo
        :class="{
          'svg-invert': isThemeLight,
        }"
    /></NuxtLink>
  </header>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useLocalePath } from "#imports";
import { useThemeStore } from "~/stores/themeStore.js";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";

const themeStore = useThemeStore();
const localePath = useLocalePath();

const isThemeLight = computed(() => {
  return themeStore.currentTheme !== "dark";
});
</script>

<style scoped lang="scss">
.router-link-exact-active {
  color: red;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  height: var(--guest-header-height, 84px);
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: env(safe-area-inset-top, 0px);
  background: color-mix(in srgb, var(--ui-background) 74%, transparent);
  backdrop-filter: blur(22px) saturate(1.04);
}

.svg-invert {
  filter: invert(1);
}

@media (max-width: 767px) {
  .header {
    --guest-header-height: 72px;
  }

  :deep(svg) {
    max-width: clamp(124px, 34vw, 164px);
    height: auto;
  }
}
</style>
