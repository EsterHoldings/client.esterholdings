<template>
  <section class="welcome-v2">
    <div class="hero">
      <span class="hero__glow hero__glow--blue-1" />
      <span class="hero__glow hero__glow--blue-2" />
      <span class="hero__glow hero__glow--orange-1" />
      <span class="hero__glow hero__glow--orange-2" />
      <div class="hero__content">
        <Transition name="hero-slide-shift">
          <div
            :key="activeSlide.id"
            class="hero__content-slide">
            <h1 class="hero__title">
              {{ activeSlide.line1Prefix }}<span>{{ activeSlide.line1Accent }}</span
              >{{ activeSlide.line1Suffix }}
              <template v-if="activeSlide.line2Prefix || activeSlide.line2Accent || activeSlide.line2Suffix">
                <br />
                {{ activeSlide.line2Prefix }}<span>{{ activeSlide.line2Accent }}</span
                >{{ activeSlide.line2Suffix }}
              </template>
            </h1>
            <p class="hero__subtitle">{{ activeSlide.subtitle }}</p>
            <ul
              v-if="activeSlide.benefits.length"
              class="hero__benefits">
              <li
                v-for="item in activeSlide.benefits"
                :key="item.text">
                <img
                  :src="item.icon"
                  :alt="item.text"
                  loading="lazy" />
                <span>{{ item.text }}</span>
              </li>
            </ul>
          </div>
        </Transition>
      </div>
      <div
        class="hero__visual"
        aria-hidden="true">
        <Transition name="hero-slide-shift">
          <div
            :key="activeSlide.id"
            class="hero__visual-slide">
            <template v-if="activeSlide.assets.length || activeSlide.showBanner">
              <UiHomeBannerV2
                v-if="activeSlide.showBanner"
                class="hero__asset hero__asset--slide2-city" />
              <img
                v-for="asset in activeSlide.assets"
                :key="asset.className"
                :src="asset.src"
                alt=""
                aria-hidden="true"
                :class="asset.className" />
              <div
                v-if="activeSlide.showLogo"
                class="hero__logo-wrap">
                <img
                  :src="FrameLogo"
                  alt=""
                  class="hero__asset hero__asset--center" />
                <UiIconLogo class="hero__logo" />
              </div>
            </template>
            <div
              v-else
              class="hero__visual-empty" />
          </div>
        </Transition>
      </div>
      <Transition name="hero-slide-shift">
        <UiButtonV2
          v-if="activeSlide.showCta"
          :key="activeSlide.id + '-cta'"
          to="/auth/registration"
          class="hero__cta">
          {{ t("landing.sections.welcomeV2.cta") }}
        </UiButtonV2>
      </Transition>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import UiIconLogo from "~/components/ui/UiIconLogo.vue";
  import UiButtonV2 from "~/components/ui/UiButtonV2.vue";
  import UiHomeBannerV2 from "~/components/ui/UiHomeBannerV2.vue";
  import benefitCloud from "~/assets/landing/welcome-v2/benefit-cloud.svg";
  import benefitCurveArrow from "~/assets/landing/welcome-v2/benefit-curve-arrow.svg";
  import benefitGem from "~/assets/landing/welcome-v2/benefit-gem.svg";
  import devicesIcon from "~/assets/landing/welcome-v2/devices.svg";
  import settingsIcon from "~/assets/landing/welcome-v2/settings.svg";
  import visualCard1 from "~/assets/landing/welcome-v2/visual-card-1.svg";
  import visualCard2 from "~/assets/landing/welcome-v2/visual-card-2.svg";
  import visualCard3 from "~/assets/landing/welcome-v2/visual-card-3.svg";
  import visualCard4 from "~/assets/landing/welcome-v2/visual-card-4.svg";
  import visualCard5 from "~/assets/landing/welcome-v2/visual-card-5.svg";
  import visualCard6 from "~/assets/landing/welcome-v2/visual-card-6.svg";
  import visualCenterFrame from "~/assets/landing/welcome-v2/visual-center-frame.svg";
  import visualMain from "~/assets/landing/welcome-v2/visual-card-main.svg";
  import grayShadow from "~/assets/landing/welcome-v2/gray-shadow.svg";
  import frame22 from "~/assets/landing/welcome-v2/Frame-22.svg";
  import frame24 from "~/assets/landing/welcome-v2/Frame-24.svg";
  import frame25 from "~/assets/landing/welcome-v2/Frame-25.svg";
  import tradingIcon from "~/assets/landing/welcome-v2/trading.svg";
  import databaseIcon from "~/assets/landing/welcome-v2/database.svg";
  import frame222 from "~/assets/landing/welcome-v2/Frame-222.svg";
  import frame16 from "~/assets/landing/welcome-v2/Frame-16.svg";
  import frame23 from "~/assets/landing/welcome-v2/Frame-23.svg";
  import monitor from "~/assets/landing/welcome-v2/monitor.svg";
  import FrameLogo from "~/assets/landing/welcome-v2/FramLogo.svg";

  const { t } = useI18n();

  const mkSlide = (
    i: number,
    icons: { icon: string; benefitIndex: number }[],
    extra: { showLogo: boolean; showBanner?: boolean; assets: { src: string; className: string }[] }
  ) => ({
    id: `slide-${i + 1}`,
    line1Prefix: t(`landing.sections.welcomeV2.slides[${i}].line1Prefix`),
    line1Accent: t(`landing.sections.welcomeV2.slides[${i}].line1Accent`),
    line1Suffix: t(`landing.sections.welcomeV2.slides[${i}].line1Suffix`),
    line2Prefix: t(`landing.sections.welcomeV2.slides[${i}].line2Prefix`),
    line2Accent: t(`landing.sections.welcomeV2.slides[${i}].line2Accent`),
    line2Suffix: t(`landing.sections.welcomeV2.slides[${i}].line2Suffix`),
    subtitle: t(`landing.sections.welcomeV2.slides[${i}].subtitle`),
    showCta: true,
    showBanner: extra.showBanner ?? false,
    benefits: icons.map(({ icon, benefitIndex }) => ({
      icon,
      text: t(`landing.sections.welcomeV2.slides[${i}].benefits[${benefitIndex}]`),
    })),
    ...extra,
  });

  const slides = computed(() => [
    mkSlide(
      0,
      [
        { icon: benefitCloud, benefitIndex: 0 },
        { icon: benefitCurveArrow, benefitIndex: 1 },
        { icon: benefitGem, benefitIndex: 2 },
      ],
      {
        showLogo: true,
        assets: [
          { src: grayShadow, className: "hero__asset hero__asset--gray-shadow" },
          { src: visualMain, className: "hero__asset hero__asset--main" },
          { src: visualCard1, className: "hero__asset hero__asset--card-1" },
          { src: visualCard2, className: "hero__asset hero__asset--card-2" },
          { src: visualCard3, className: "hero__asset hero__asset--card-3" },
          { src: visualCard4, className: "hero__asset hero__asset--card-4" },
          { src: visualCard5, className: "hero__asset hero__asset--card-5" },
          { src: visualCard6, className: "hero__asset hero__asset--card-6" },
        ],
      }
    ),
    mkSlide(
      1,
      [
        { icon: settingsIcon, benefitIndex: 0 },
        { icon: devicesIcon, benefitIndex: 1 },
      ],
      {
        showLogo: false,
        showBanner: true,
        assets: [
          { src: frame22, className: "hero__asset hero__asset--slide2-card-top" },
          { src: frame25, className: "hero__asset hero__asset--slide2-card-left" },
          { src: frame24, className: "hero__asset hero__asset--slide2-card-center" },
        ],
      }
    ),
    mkSlide(
      2,
      [
        { icon: databaseIcon, benefitIndex: 0 },
        { icon: tradingIcon, benefitIndex: 1 },
      ],
      {
        showLogo: false,
        assets: [
          { src: monitor, className: "hero__asset hero__asset--slide3-monitor" },
          { src: frame16, className: "hero__asset hero__asset--slide3-card-main" },
          { src: frame23, className: "hero__asset hero__asset--slide3-card-left" },
          { src: frame222, className: "hero__asset hero__asset--slide3-card-bottom" },
        ],
      }
    ),
  ]);

  const currentSlide = ref(0);
  const activeSlide = computed(() => slides.value[currentSlide.value]);
  let slideIntervalId: ReturnType<typeof setInterval> | null = null;

  const nextSlide = () => {
    currentSlide.value = (currentSlide.value + 1) % slides.value.length;
  };

  onMounted(() => {
    slideIntervalId = setInterval(nextSlide, 10000);
  });

  onUnmounted(() => {
    if (!slideIntervalId) return;
    clearInterval(slideIntervalId);
    slideIntervalId = null;
  });
</script>

<style lang="scss" scoped>
  @keyframes levitate {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  .welcome-v2 {
    position: relative;
    padding-top: 118px;
  }

  .hero-slide-shift-enter-active,
  .hero-slide-shift-leave-active {
    transition:
      opacity 0.45s ease,
      transform 0.45s ease;
  }

  .hero-slide-shift-enter-from,
  .hero-slide-shift-leave-to {
    opacity: 0;
  }

  .hero-slide-shift-enter-from {
    transform: translateX(56px);
  }

  .hero-slide-shift-leave-to {
    transform: translateX(-56px);
  }

  .hero {
    position: relative;
    width: 100%;
    // max-width: 1440px;
    margin: 0 auto;
    // overflow: hidden;
    padding: 174px 40px 146px;
    display: grid;
    grid-template-columns: 635px minmax(520px, 1fr);
    gap: 30px;
    min-height: 935px;
    background: #f6f6f6;

    &__title {
      margin: 0;
      color: #000;
      font-family: "DM Sans", sans-serif;
      font-size: 82px;
      font-weight: 400;
      line-height: 0.9756;
      letter-spacing: -0.03em;
      max-width: 640px;

      span {
        color: #0051ff;
      }
    }

    &__subtitle {
      margin: 40px 0 0;
      max-width: 493px;
      color: #7b7b7b;
      font-size: 16px;
      line-height: 1.302;
      font-weight: 400;
    }

    &__benefits {
      margin: 45px 0 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 27px;

      li {
        display: flex;
        align-items: center;
        gap: 16px;
        color: #000;
        font-weight: 500;
        font-size: 16px;
        line-height: 1.302;

        img {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
        }
      }
    }

    &__cta {
      grid-column: 1;
      grid-row: 2;
      align-self: start;
      margin-top: 43px;
      width: 325px;
    }

    &__content {
      position: relative;
      min-height: 458px;
    }

    &__content-slide {
      position: absolute;
      inset: 0;
    }

    &__visual {
      position: relative;
      min-height: 615px;
      grid-row: 1 / 3;
    }

    &__visual-slide {
      position: absolute;
      inset: 0;
    }

    &__visual-empty {
      width: 100%;
      height: 100%;
    }

    &__asset {
      position: absolute;
      z-index: 1;

      &--main {
        left: 108px;
        top: 0;
        width: 192px;
      }
      &--gray-shadow {
        top: -300px;
        right: -160px;
        width: 622px;
        pointer-events: none;
      }
      &--card-1 {
        left: 409px;
        top: 31px;
        width: 114px;
      }
      &--card-2 {
        left: 0;
        top: 223px;
        width: 148px;
      }
      &--card-3 {
        left: 575px;
        top: 211px;
        width: 86px;
      }
      &--card-4 {
        left: 361px;
        top: 514px;
        width: 86px;
      }
      &--card-5 {
        left: 148px;
        top: 425px;
        width: 114px;
      }
      &--card-6 {
        left: 535px;
        top: 405px;
        width: 114px;
      }
      &--slide2-city {
        top: -40px;
        right: -110px;
        width: 640px;
        z-index: 0;
        pointer-events: none;
      }
      &--slide2-card-top {
        left: 230px;
        top: 80px;
        width: 161px;
      }
      &--slide2-card-left {
        left: 130px;
        top: 360px;
        width: 161px;
      }
      &--slide2-card-center {
        left: 360px;
        top: 260px;
        width: 225px;
      }
      &--slide3-monitor {
        top: -86px;
        right: -136px;
        width: 690px;
        z-index: 0;
        pointer-events: none;
      }
      &--slide3-card-main {
        left: 120px;
        top: 90px;
        width: 237px;
      }
      &--slide3-card-left {
        left: 60px;
        top: 400px;
        width: 134px;
      }
      &--slide3-card-bottom {
        left: 340px;
        top: 375px;
        width: 188px;
      }
      &--center {
        width: 217px;
      }

      &--main {
        animation: levitate 4s ease-in-out infinite;
        animation-delay: 0s;
      }
      &--card-1 {
        animation: levitate 3.5s ease-in-out infinite;
        animation-delay: -0.5s;
      }
      &--card-2 {
        animation: levitate 4.5s ease-in-out infinite;
        animation-delay: -1s;
      }
      &--card-3 {
        animation: levitate 3.2s ease-in-out infinite;
        animation-delay: -1.5s;
      }
      &--card-4 {
        animation: levitate 4s ease-in-out infinite;
        animation-delay: -2s;
      }
      &--card-5 {
        animation: levitate 3.8s ease-in-out infinite;
        animation-delay: -0.8s;
      }
      &--card-6 {
        animation: levitate 4.2s ease-in-out infinite;
        animation-delay: -1.2s;
      }
      &--slide2-card-top {
        animation: levitate 3.8s ease-in-out infinite;
        animation-delay: 0s;
      }
      &--slide2-card-left {
        animation: levitate 4.2s ease-in-out infinite;
        animation-delay: -1s;
      }
      &--slide2-card-center {
        animation: levitate 3.5s ease-in-out infinite;
        animation-delay: -0.5s;
      }
      &--slide3-card-main {
        animation: levitate 4s ease-in-out infinite;
        animation-delay: 0s;
      }
      &--slide3-card-left {
        animation: levitate 3.6s ease-in-out infinite;
        animation-delay: -0.8s;
      }
      &--slide3-card-bottom {
        animation: levitate 4.4s ease-in-out infinite;
        animation-delay: -1.4s;
      }
    }

    &__logo-wrap {
      animation: levitate 4s ease-in-out infinite;
      animation-delay: -0.3s;
    }

    &__logo-wrap {
      position: absolute;
      left: 272px;
      top: 212px;
      width: 217px;
      height: 240px;
    }

    &__logo {
      position: absolute;
      width: 140px;
      height: auto;
      left: 39px;
      top: 89px;
    }

    &__glow {
      position: absolute;
      border-radius: 50%;
      z-index: 0;
      pointer-events: none;

      &--blue-1 {
        width: 183px;
        height: 183px;
        background: #0052fe;
        left: -105px;
        top: 752px;
        filter: blur(200px);
      }
      &--blue-2 {
        width: 105px;
        height: 105px;
        background: #0052fe;
        left: calc(100% - 355px);
        top: 451px;
        filter: blur(120px);
      }
      &--orange-1 {
        width: 58px;
        height: 58px;
        background: #f75709;
        left: calc(100% - 670px);
        top: 233px;
        filter: blur(75px);
      }
      &--orange-2 {
        width: 58px;
        height: 58px;
        background: #f75709;
        left: calc(100% - 380px);
        top: 845px;
        filter: blur(75px);
      }
    }
  }

  @media (max-width: 1279px) {
    .welcome-v2 {
      padding-top: 104px;
      padding-inline: 20px;
    }

    .hero {
      min-height: 820px;
      padding: 120px 24px 90px;
      grid-template-columns: minmax(420px, 560px) minmax(420px, 1fr);

      &__asset--gray-shadow {
        display: none;
      }

      &__title {
        font-size: 64px;
      }

      &__visual {
        transform: scale(0.82);
        transform-origin: top center;
      }
    }
  }

  @media (max-width: 991px) {
    .welcome-v2 {
      padding-inline: 20px;
    }

    .hero {
      min-height: auto;
      padding: 48px 20px 20px;
      grid-template-columns: 1fr;
      gap: 12px;

      &__visual {
        grid-row: auto;
      }

      &__cta {
        grid-column: 1;
        grid-row: auto;
        width: 100%;
        margin-top: 0;
      }

      &__title {
        font-size: 44px;
        line-height: 1.04;
        letter-spacing: -0.02em;
      }

      &__subtitle {
        margin-top: 24px;
        font-size: 16px;
      }

      &__benefits {
        margin-top: 32px;
        gap: 20px;
      }

      &__cta {
        margin-top: 32px;
      }

      &__visual {
        min-height: 500px;
        transform: scale(0.75);
        transform-origin: top left;
      }
    }
  }

  @media (max-width: 575px) {
    .welcome-v2 {
      padding-inline: 12px;
    }

    .hero {
      &__title {
        font-size: 38px;
      }

      &__cta {
        width: 100%;
      }

      &__visual {
        min-height: 340px;
        transform: scale(0.5);
      }

      &__glow {
        display: none;
      }
    }
  }
</style>
