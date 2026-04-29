<template>
  <div class="cabinet-layout min-h-dvh flex flex-col bg-[var(--ui-background)] bg-blend-multiply">
    <div
      class="cabinet-layout__city-bg"
      aria-hidden="true">
      <component
        :is="cityBackgroundComponent"
        class="cabinet-layout__city-illustration" />
    </div>

    <CabinetHeader
      class="cabinet-header shrink-0"
      :breadcrumbs="breadcrumbs"
      :show-breadcrumbs="showBreadcrumbs" />

    <div class="flex-1 min-h-0 flex">
      <CabinetSidebar class="shrink-0" />

      <Transition
        mode="out-in"
        enter-active-class="transition-opacity duration-100 ease-in-out"
        leave-active-class="transition-opacity duration-100 ease-in-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0">
        <main
          :key="route.fullPath"
          class="cabinet-main flex-1 min-h-0 overflow-y-auto no-scrollbar box-border w-full lg:pl-[250px] text-white">
          <slot />
        </main>
      </Transition>
    </div>
    <!--<TheFooter class="h-[60px] shrink-0 pb-safe-area" />-->
  </div>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useRoute } from "vue-router";
  import { useI18n } from "vue-i18n";
  import { useHead } from "#imports";
  import { useThemeStore } from "~/stores/themeStore";

  import CabinetSidebar from "~/components/block/CabinetSidebar.vue";
  import TheFooter from "~/components/block/TheFooter.vue";
  import CabinetHeader from "~/components/block/CabinetHeader.vue";
  import UiCabinetCityBackground from "~/components/ui/UiCabinetCityBackground.vue";
  import UiHomeBannerV2 from "~/components/ui/UiHomeBannerV2.vue";
  import UiIconHome from "~/components/ui/UiIconHome.vue";

  const route = useRoute();
  const { t, locale } = useI18n({ useScope: "global" });
  const themeStore = useThemeStore();

  useHead({
    htmlAttrs: {
      class: "cabinet-scroll-lock",
    },
    bodyAttrs: {
      class: "cabinet-scroll-lock",
    },
  });

  const resolveLabel = (key: string, fallback: string) => {
    const val = t(key);
    return val === key ? fallback : val;
  };

  const labels: Record<string, string> = {
    dashboard: resolveLabel("cabinet.dashboard.title", "Dashboard"),
    accounts: resolveLabel("cabinet.accounts.account.title", "Accounts"),
    payments: resolveLabel("cabinet.dashboard.transactions.title", "Payments"),
    support: resolveLabel("cabinet.support.title", "Support"),
    referrals: resolveLabel("cabinet.referrals.title", "Referrals"),
    profile: resolveLabel("cabinet.profile.title", "Profile"),
  };

  const breadcrumbs = computed(() => {
    const segments = route.path.split("/").filter(Boolean);
    const currentLocale = locale.value?.toLowerCase?.();
    const startIdx = currentLocale && segments[0]?.toLowerCase() === currentLocale ? 1 : 0;
    const basePrefix = startIdx ? "/" + segments.slice(0, startIdx).join("/") : "";
    const visibleSegments = segments.slice(startIdx);

    const filteredSegments = visibleSegments.filter(seg => seg.toLowerCase() !== "dashboard");

    const list = filteredSegments.map((seg, idx) => {
      const key = seg.toLowerCase();
      const name = labels[key] ?? decodeURIComponent(seg);
      const to = basePrefix + "/" + filteredSegments.slice(0, idx + 1).join("/");
      return { name, to };
    });
    const dashCrumb = {
      name: labels.dashboard ?? "Dashboard",
      to: basePrefix || "/",
      icon: UiIconHome,
    };
    if (!list.length) return [dashCrumb];
    if (list[0].name.toLowerCase() !== "dashboard") return [dashCrumb, ...list];
    return [dashCrumb, ...list.slice(1)];
  });

  const showBreadcrumbs = computed(() => {
    const segments = route.path.split("/").filter(Boolean);
    const currentLocale = locale.value?.toLowerCase?.();
    const startIdx = currentLocale && segments[0]?.toLowerCase() === currentLocale ? 1 : 0;
    const visibleSegments = segments.slice(startIdx);
    return visibleSegments.join("/") !== "";
  });

  const cityBackgroundComponent = computed(() =>
    themeStore.currentTheme === "light" ? UiHomeBannerV2 : UiCabinetCityBackground
  );
</script>

<style>
  html,
  body,
  #__nuxt {
    height: 100%;
  }

  html.cabinet-scroll-lock,
  body.cabinet-scroll-lock {
    height: 100dvh;
    min-height: 100dvh;
    overflow: hidden !important;
    overscroll-behavior: none !important;
  }

  body.cabinet-scroll-lock {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .cabinet-layout {
    position: relative;
    isolation: isolate;
    height: 100dvh;
    min-height: 100dvh;
    overflow: hidden;
    overscroll-behavior: none;
    background: var(--ui-background);
  }

  .cabinet-layout__city-bg {
    position: fixed;
    top: calc(60px + env(safe-area-inset-top, 0px));
    right: 0;
    bottom: 0;
    z-index: 0;
    width: min(42vw, 620px);
    min-width: 280px;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    opacity: 0.2;
    pointer-events: none;
    filter: drop-shadow(0 24px 60px color-mix(in srgb, var(--ui-primary-main) 16%, transparent));
  }

  .cabinet-layout__city-illustration {
    width: 100%;
    height: 100%;
    max-height: 100%;
    opacity: 0.96;
  }

  .cabinet-layout__city-bg :deep(.cabinet-city-svg),
  .cabinet-layout__city-bg :deep(svg) {
    width: 100%;
    height: 100%;
    max-height: 100%;
    color: inherit;
    object-fit: contain;
    object-position: right bottom;
  }

  .cabinet-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10;
    padding-top: env(safe-area-inset-top, 0px);
    background: color-mix(in srgb, var(--ui-background) 90%, transparent);
    backdrop-filter: blur(22px) saturate(1.08);
  }

  .cabinet-main {
    position: relative;
    z-index: 1;
    padding-top: calc(60px + env(safe-area-inset-top, 0px));
    overscroll-behavior-y: none;
    overflow-anchor: none;
  }

  @media (max-width: 1023px) {
    .cabinet-layout__city-bg {
      width: min(72vw, 420px);
      opacity: 0.14;
    }

    .cabinet-main {
      padding-bottom: calc(86px + env(safe-area-inset-bottom, 0px));
    }
  }

  @media (max-width: 767px) {
    html.support-chat-fullscreen .cabinet-header,
    body.support-chat-fullscreen .cabinet-header {
      display: none !important;
    }

    html.support-chat-fullscreen .cabinet-mobile-nav,
    body.support-chat-fullscreen .cabinet-mobile-nav {
      display: none !important;
    }

    html.support-chat-fullscreen .cabinet-main,
    body.support-chat-fullscreen .cabinet-main {
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }
  }

  /* Optional: smoother scrolling on iOS */
  .no-scrollbar {
    -webkit-overflow-scrolling: touch;
  }

  /* Hide scrollbar (Chrome, Safari, Edge) */
  .no-scrollbar::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;
  }

  /* Hide scrollbar (Firefox) */
  .no-scrollbar {
    scrollbar-width: none;
  }

  /* Hide scrollbar (IE/old Edge) */
  .no-scrollbar {
    -ms-overflow-style: none;
  }
</style>
