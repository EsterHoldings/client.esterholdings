<template>
  <header class="header">
    <div class="header__stack">
      <NuxtLink
        :to="localePath('/')"
        class="header__logo-link">
        <UiIconLogoLight
          v-if="isThemeLight"
          class="header__logo header__logo--light" />
        <UiIconLogo
          v-else
          class="header__logo" />
      </NuxtLink>

      <div class="header__controls">
        <LanguageSwitcher
          class="header__control header__control--language" />

        <button
          type="button"
          class="header__theme-toggle header__control"
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
import UiIconLogoLight from "~/components/ui/UiIconLogoLight.vue";
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

.header__logo {
  display: block;
}

.header__controls {
  margin-top: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.header__control {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: var(--ui-text-main);
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

.header__theme-toggle {
  border: 0;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.header__theme-toggle:hover {
  transform: translateY(-1px);
  color: var(--ui-primary-main);
}

.header__controls :deep(.language-trigger) {
  appearance: none;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.header__controls :deep(.language-trigger:hover) {
  color: var(--ui-primary-main);
}

.header__controls :deep(.icon),
.header__theme-toggle :deep(svg) {
  width: 22px;
  height: 22px;
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
    gap: 8px;
  }

  :deep(svg) {
    max-width: clamp(124px, 34vw, 164px);
    height: auto;
  }
}
</style>
