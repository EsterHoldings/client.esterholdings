<template>
  <header class="header">
    <div class="header__stack">
      <NuxtLink
        :to="localePath('/')"
        class="header__logo-link">
        <UiIconLogo
          :class="{
            'svg-invert': isThemeLight,
          }" />
      </NuxtLink>

      <div class="header__controls">
        <LanguageSwitcher :isInvert="isThemeLight" />

        <button
          type="button"
          class="header__theme-toggle"
          :aria-label="toggleThemeText"
          @click="handleToggleTheme">
          <UiIconSun
            v-if="themeStore.currentTheme === 'dark'"
            class="h-5 w-5" />
          <UiIconMoon
            v-else
            class="h-5 w-5" />
        </button>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useLocalePath } from "#imports";
import { useI18n } from "vue-i18n";
import { useThemeStore } from "~/stores/themeStore.js";
import LanguageSwitcher from "~/components/block/LanguageSwitcher.vue";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
import UiIconMoon from "~/components/ui/UiIconMoon.vue";
import UiIconSun from "~/components/ui/UiIconSun.vue";

const themeStore = useThemeStore();
const localePath = useLocalePath();
const { t } = useI18n({ useScope: "global" });

const isThemeLight = computed(() => {
  return themeStore.currentTheme !== "dark";
});

const toggleThemeText = computed(() =>
  themeStore.currentTheme === "dark" ? t("cabinet.header.switchToLight") : t("cabinet.header.switchToDark")
);

const handleToggleTheme = () => {
  themeStore.toggleTheme();
};
</script>

<style scoped lang="scss">
:global(:root) {
  --guest-header-height: 132px;
}

.router-link-exact-active {
  color: red;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  height: var(--guest-header-height, 132px);
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: env(safe-area-inset-top, 0px);
  background: color-mix(in srgb, var(--ui-background) 76%, transparent);
  backdrop-filter: blur(16px) saturate(1.02);
}

.header__stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  padding: 12px 16px 14px;
}

.header__logo-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.header__controls {
  margin-top: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
}

.header__theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--ui-text-main);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
}

.header__theme-toggle:hover {
  transform: translateY(-1px);
  background: color-mix(in srgb, var(--ui-primary-main) 12%, transparent);
}

.svg-invert {
  filter: invert(1);
}

@media (max-width: 767px) {
  :global(:root) {
    --guest-header-height: 118px;
  }

  .header__stack {
    padding-top: 10px;
    padding-bottom: 12px;
  }

  .header__controls {
    margin-top: 20px;
    gap: 12px;
  }

  :deep(svg) {
    max-width: clamp(124px, 34vw, 164px);
    height: auto;
  }
}
</style>
