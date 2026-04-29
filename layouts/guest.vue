<template>
  <div class="guest-layout">
    <div
      class="guest-layout__city-bg"
      aria-hidden="true">
      <component
        :is="backgroundComponent"
        class="guest-layout__city-illustration" />
    </div>

    <TheGuestHeader class="guest-layout__header" />

    <div class="guest-layout__page">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import TheGuestHeader from "~/components/block/TheGuestHeader.vue";
  import UiCabinetCityBackground from "~/components/ui/UiCabinetCityBackground.vue";
  import UiHomeBannerV2 from "~/components/ui/UiHomeBannerV2.vue";
  import { useThemeStore } from "~/stores/themeStore";

  const themeStore = useThemeStore();
  const backgroundComponent = computed(() =>
    themeStore.currentTheme === "light" ? UiHomeBannerV2 : UiCabinetCityBackground
  );
</script>

<style lang="scss" scoped>
  .guest-layout {
    position: relative;
    min-height: 100dvh;
    background: var(--ui-background);
    isolation: isolate;
  }

  .guest-layout__page {
    position: relative;
    z-index: 1;
    min-height: 100dvh;
    padding-top: calc(var(--guest-header-height, 84px) + env(safe-area-inset-top, 0px));
  }

  .guest-layout__city-bg {
    position: fixed;
    top: calc(var(--guest-header-height, 84px) + env(safe-area-inset-top, 0px));
    right: 0;
    bottom: 0;
    z-index: 0;
    width: min(44vw, 620px);
    min-width: 280px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    opacity: 0.22;
    pointer-events: none;
    filter: drop-shadow(0 24px 60px color-mix(in srgb, var(--ui-primary-main) 16%, transparent));
  }

  .guest-layout__city-illustration {
    width: 100%;
    height: 100%;
    max-height: 100%;
    opacity: 0.96;
  }

  .guest-layout__city-bg :deep(.cabinet-city-svg),
  .guest-layout__city-bg :deep(svg) {
    width: 100%;
    height: 100%;
    max-height: 100%;
    object-fit: contain;
    object-position: right bottom;
  }

  @media (max-width: 1023px) {
    .guest-layout__city-bg {
      width: min(74vw, 420px);
      opacity: 0.16;
    }
  }
</style>
