<template>
  <main class="landing-v2">
    <div ref="welcomeRef">
      <WelcomeSectionV2 />
    </div>
    <TickerSectionV2 />
    <AdvantagesSectionV2 />
    <TradingPlatformSectionV2 />
    <NewsRowSectionV2 />
    <FeaturesSectionV2 />
    <WideRangeSectionV2 />
    <AccountTypesSectionV2 />
    <FourStepsSectionV2 />
    <BannerSectionV2 />
    <LatestUpdatesSectionV2 />
    <FAQsSectionV2 />
    <CookieModal />
  </main>
</template>

<script lang="ts" setup>
  import { definePageMeta } from "~/.nuxt/imports";
  import { ref, onMounted, onUnmounted } from "vue";
  import { useUiStore } from "~/stores/uiStore";
  import WelcomeSectionV2 from "~/pages/landing/sections/WelcomeSectionV2.vue";
  import TickerSectionV2 from "~/pages/landing/sections/TickerSectionV2.vue";
  import AdvantagesSectionV2 from "~/pages/landing/sections/AdvantagesSectionV2.vue";
  import TradingPlatformSectionV2 from "~/pages/landing/sections/TradingPlatformSectionV2.vue";
  import NewsRowSectionV2 from "~/pages/landing/sections/NewsRowSectionV2.vue";
  import FeaturesSectionV2 from "~/pages/landing/sections/FeaturesSectionV2.vue";
  import AccountTypesSectionV2 from "~/pages/landing/sections/AccountTypesSectionV2.vue";
  import WideRangeSectionV2 from "~/pages/landing/sections/WideRangeSectionV2.vue";
  import FourStepsSectionV2 from "~/pages/landing/sections/FourStepsSectionV2.vue";
  import BannerSectionV2 from "~/pages/landing/sections/BannerSectionV2.vue";
  import LatestUpdatesSectionV2 from "~/pages/landing/sections/LatestUpdatesSectionV2.vue";
  import FAQsSectionV2 from "~/pages/landing/sections/FAQsSectionV2.vue";
  import CookieModal from "~/components/block/modals/CookieModal.vue";

  definePageMeta({
    layout: "main-v2",
  });

  const uiStore = useUiStore();
  const welcomeRef = ref<HTMLElement | null>(null);

  const handleScroll = () => {
    if (!welcomeRef.value) return;
    const rect = welcomeRef.value.getBoundingClientRect();
    uiStore.headerScrolled = rect.bottom <= 210;
  };

  onMounted(() => {
    const body = document.body;
    const html = document.documentElement;
    body.classList.add("scroll-unlocked");
    html.classList.add("scroll-unlocked");
    body.style.setProperty("overflow", "auto", "important");
    body.style.setProperty("overflow-y", "auto", "important");
    body.style.position = "";
    body.style.width = "";
    body.classList.remove("overflow-hidden", "fixed");
    html.style.setProperty("overflow", "auto", "important");
    html.style.setProperty("overflow-y", "auto", "important");
    html.classList.remove("overflow-hidden", "fixed");
    window.addEventListener("scroll", handleScroll);
    handleScroll();
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
  });
</script>

<style lang="scss" scoped>
  .landing-v2 {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f6f6f6;
    overflow: hidden;
  }

  @media (max-width: 991px) {
    .landing-v2 {
      overflow: visible;
    }
  }
</style>
