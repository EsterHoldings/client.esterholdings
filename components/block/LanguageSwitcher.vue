<template>
  <div
    class="language-wrapper"
    ref="wrapperRef">
    <button
      type="button"
      class="language-trigger"
      :aria-expanded="isOpen"
      :aria-label="localeLabel"
      @click="toggleDropdown">
      <UiIconGlobe
        class="icon"
        :class="{
          'svg-invert': props.isInvert,
        }" />
    </button>

    <transition name="fade">
      <ul
        v-if="isOpen"
        class="dropdown"
        :class="{ top: props.isSidebar }">
        <li
          v-for="(label, code) in languages"
          :key="code"
          @click="switchLanguage(code)"
          :class="{ active: locale === code }">
          <span
            class="flag"
            :class="{ 'flag--monochrome': code === 'ru' }"
            >{{ getFlag(code) }}</span
          >
          <span class="label">{{ label.toUpperCase() }}</span>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
  import { computed, ref, onMounted, onBeforeUnmount } from "vue";
  import { useI18n } from "vue-i18n";
  import UiIconGlobe from "~/components/ui/UiIconGlobe.vue";
  import useAppCore from "~/composables/useAppCore";
  import { useAuthStore } from "~/stores/authStore";

  const props = defineProps({
    isInvert: Boolean,
    isSidebar: Boolean,
  });

  const { locale, setLocale } = useI18n();
  const appCore = useAppCore();
  const authStore = useAuthStore();
  const localeLabel = computed(() => `Language: ${languages[locale.value] ?? locale.value}`);

  const isOpen = ref(false);
  const wrapperRef = ref(null);

  const languages = {
    en: "English",
    uk: "Українська",
    de: "Deutsch",
    es: "Español",
    fr: "Français",
    it: "Italiano",
    pt: "Português",
    ru: "Русский",
    tr: "Türkçe",
    he: "עברית",
    hi: "हिन्दी",
    ja: "日本語",
    ko: "한국어",
    zh: "中文",
  };

  const getFlag = code => {
    switch (code) {
      case "en":
        return "🇬🇧";
      case "ru":
        return "🇷🇺";
      case "de":
        return "🇩🇪";
      case "es":
        return "🇪🇸";
      case "fr":
        return "🇫🇷";
      case "it":
        return "🇮🇹";
      case "pt":
        return "🇵🇹";
      case "tr":
        return "🇹🇷";
      case "uk":
        return "🇺🇦";
      case "he":
        return "🇮🇱";
      case "hi":
        return "🇮🇳";
      case "ja":
        return "🇯🇵";
      case "ko":
        return "🇰🇷";
      case "zh":
        return "🇨🇳";
      default:
        return "🌐";
    }
  };

  const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
  };

  const switchLanguage = async code => {
    await setLocale(code);
    isOpen.value = false;

    if (!authStore.accessToken) {
      return;
    }

    try {
      const response = await appCore.auth.getAuthUser();
      authStore.setUser(response.data);
    } catch {
      // Language switching must never block the UI.
    }
  };

  const handleClickOutside = event => {
    if (!wrapperRef.value?.contains(event.target)) {
      isOpen.value = false;
    }
  };

  onMounted(() => {
    document.addEventListener("click", handleClickOutside);
  });
  onBeforeUnmount(() => {
    document.removeEventListener("click", handleClickOutside);
  });
</script>

<style scoped lang="scss">
  .language-wrapper {
    position: relative;

    .language-trigger {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      background: transparent;
      padding: 0;
      color: var(--ui-text-main);
      cursor: pointer;
    }

    .icon {
      cursor: pointer;
      font-size: 20px;
    }

    .dropdown {
      scrollbar-width: none;
      position: absolute;
      top: 40px;
      right: 0;
      width: min(720px, calc(100vw - 24px));
      background: color-mix(in srgb, var(--ui-background-panel) 88%, transparent);
      border: 1px solid color-mix(in srgb, var(--color-stroke-ui-light) 78%, transparent);
      border-radius: 16px;
      box-shadow: 0 18px 48px -24px rgba(0, 0, 0, 0.32);
      backdrop-filter: blur(16px) saturate(1.04);
      padding: 12px;
      z-index: 11;
      max-height: min(72vh, 520px);
      overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 8px;
      list-style: none;
      margin: 0;

      &.top {
        height: max-content;
        top: 30px;
        bottom: 0;
        right: 0;
      }

      .flag {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        font-size: 16px;
        padding: 0 10px 0 0;
        color: var(--ui-text-main);
      }

      .flag--monochrome {
        filter: grayscale(1) saturate(0) brightness(1.05);
      }

      .label {
        font-weight: 500;
        color: var(--ui-text-main);
        padding: 0 4px;
        white-space: nowrap;
      }

      li {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        cursor: pointer;
        background: color-mix(in srgb, var(--ui-background-card) 84%, transparent);
        border: 1px solid transparent;
        border-radius: 12px;
        padding: 10px 12px;
        min-height: 52px;

        &:hover {
          border-color: color-mix(in srgb, var(--ui-primary-main) 34%, transparent);
          background: color-mix(in srgb, var(--ui-primary-main) 12%, var(--ui-background-card));
        }

        &.active {
          background: color-mix(in srgb, var(--ui-primary-main) 14%, var(--ui-background-card));
          border-color: color-mix(in srgb, var(--ui-primary-main) 40%, transparent);
          font-weight: 700;

          .label {
            color: var(--ui-primary-accent) !important;
          }

          &:hover {
            border-color: color-mix(in srgb, var(--ui-primary-main) 48%, transparent);
          }
        }
      }
    }
  }

  .svg-invert {
    filter: invert(1);
  }

  @media (max-width: 1023px) {
    .language-wrapper {
      .dropdown {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  }

  @media (max-width: 639px) {
    .language-wrapper {
      .dropdown {
        width: min(380px, calc(100vw - 20px));
        grid-template-columns: minmax(0, 1fr);
        padding: 10px;
      }
    }
  }
</style>
