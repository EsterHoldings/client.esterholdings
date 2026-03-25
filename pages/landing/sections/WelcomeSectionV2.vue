<template>
  <section class="welcome-v2">
    <div class="hero">
      <span class="hero__glow hero__glow--blue-1" />
      <span class="hero__glow hero__glow--blue-2" />
      <span class="hero__glow hero__glow--orange-1" />
      <span class="hero__glow hero__glow--orange-2" />
      <div class="hero__content">
        <h1 class="hero__title">Trade <span>10 asset classes</span> from one margin account</h1>
        <p class="hero__subtitle">
          One platform for FX, Crypto, Metals, Commodities, Indices, Stocks and more
          &mdash; with institutional-grade execution.
        </p>
        <ul class="hero__benefits">
          <li
            v-for="item in benefits"
            :key="item.text">
            <img
              :src="item.icon"
              :alt="item.text"
              loading="lazy" />
            <span>{{ item.text }}</span>
          </li>
        </ul>
        <NuxtLink
          to="/auth/registration"
          class="hero__cta">
          <span>Let's Try</span>
          <img
            :src="ctaArrow"
            alt=""
            aria-hidden="true" />
        </NuxtLink>
      </div>
      <div
        class="hero__visual"
        aria-hidden="true">
        <img
          :src="visualMain"
          alt=""
          class="hero__asset hero__asset--main" />
        <img
          :src="visualCard1"
          alt=""
          class="hero__asset hero__asset--card-1" />
        <img
          :src="visualCard2"
          alt=""
          class="hero__asset hero__asset--card-2" />
        <img
          :src="visualCard3"
          alt=""
          class="hero__asset hero__asset--card-3" />
        <img
          :src="visualCard4"
          alt=""
          class="hero__asset hero__asset--card-4" />
        <img
          :src="visualCard5"
          alt=""
          class="hero__asset hero__asset--card-5" />
        <img
          :src="visualCard6"
          alt=""
          class="hero__asset hero__asset--card-6" />
        <div class="hero__logo-wrap">
          <img
            :src="visualCenterFrame"
            alt=""
            class="hero__asset hero__asset--center" />
          <UiIconLogo class="hero__logo" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import UiIconLogo from "~/components/ui/UiIconLogo.vue";
  import ctaArrow from "~/assets/landing/welcome-v2/cta-arrow.svg";
  import benefitCloud from "~/assets/landing/welcome-v2/benefit-cloud.svg";
  import benefitCurveArrow from "~/assets/landing/welcome-v2/benefit-curve-arrow.svg";
  import benefitGem from "~/assets/landing/welcome-v2/benefit-gem.svg";
  import visualCard1 from "~/assets/landing/welcome-v2/visual-card-1.svg";
  import visualCard2 from "~/assets/landing/welcome-v2/visual-card-2.svg";
  import visualCard3 from "~/assets/landing/welcome-v2/visual-card-3.svg";
  import visualCard4 from "~/assets/landing/welcome-v2/visual-card-4.svg";
  import visualCard5 from "~/assets/landing/welcome-v2/visual-card-5.svg";
  import visualCard6 from "~/assets/landing/welcome-v2/visual-card-6.svg";
  import visualCenterFrame from "~/assets/landing/welcome-v2/visual-center-frame.svg";
  import visualMain from "~/assets/landing/welcome-v2/visual-card-main.svg";

  const benefits = [
    { icon: benefitCloud, text: "Multi-asset access in a single workflow" },
    { icon: benefitCurveArrow, text: "Deep liquidity & stable fills for active trading" },
    { icon: benefitGem, text: "Built on 10 years of company experience" },
  ];
</script>

<style lang="scss" scoped>
  .welcome-v2 {
    position: relative;
    padding-top: 118px;
  }

  .hero {
    position: relative;
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    overflow: hidden;
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
      margin-top: 43px;
      width: 325px;
      height: 70px;
      border-radius: 18px;
      padding: 12px 22px;
      background: #0051ff;
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      color: #fff;
      font-size: 24px;
      font-weight: 700;
      line-height: 1.302;
      text-decoration: none;

      img {
        width: 62px;
        height: 15px;
      }
    }

    &__visual {
      position: relative;
      min-height: 615px;
    }

    &__asset {
      position: absolute;

      &--main {
        left: 108px;
        top: 0;
        width: 192px;
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
      &--center {
        width: 217px;
      }
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
        max-width: 325px;
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
