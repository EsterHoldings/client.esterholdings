<template>
  <section class="banner-v2">
    <UiContainer>
      <div class="banner">
        <div
          class="banner__bg"
          aria-hidden="true">
          <UiIllustrationChartBg class="banner__bg-img" />
        </div>

        <div class="banner__header">
          <p class="banner__subtitle">{{ t("landing.sections.banner_section.subtitle") }}</p>
          <div class="banner__logo">
            <img
              :src="imgLogoMark"
              alt="" />
            <img
              :src="imgLogoName"
              alt="ESTER" />
          </div>
        </div>

        <h2 class="banner__title">{{ t("landing.sections.banner_section.title") }}</h2>

        <p class="banner__tag">{{ t("landing.sections.banner_section.tag") }}</p>

        <div class="banner__actions">
          <NuxtLink
            to="/auth/registration"
            class="banner__btn banner__btn--primary">
            {{ t("landing.sections.banner_section.button_primary") }}
            <UiIconArrow />
          </NuxtLink>
          <NuxtLink
            to="/auth/registration"
            class="banner__btn banner__btn--secondary">
            {{ t("landing.sections.banner_section.button_secondary") }}
            <UiIconArrow />
          </NuxtLink>
        </div>
      </div>
    </UiContainer>
  </section>
</template>

<script setup lang="ts">
  import { useI18n } from "vue-i18n";
  import UiContainer from "~/components/ui/UiContainer.vue";
  import UiIconArrow from "~/components/ui/UiIconArrow.vue";
  import UiIllustrationChartBg from "~/components/ui/UiIllustrationChartBg.vue";
  import imgLogoMark from "~/assets/landing/banner-v2/logo-mark.png";
  import imgLogoName from "~/assets/landing/banner-v2/logo-name.png";

  const { t } = useI18n();
</script>

<style lang="scss" scoped>
  .banner {
    position: relative;
    margin-top: 160px;
    border-radius: 20px;
    border: 6px solid #fff;
    overflow: hidden;
    padding: 34px;
    background: linear-gradient(-20deg, #fff 55%, #f1f1f1 100%);
    display: flex;
    flex-direction: column;
    min-height: 550px;

    &__bg {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }

    &__bg-img {
      position: absolute;
      right: -5%;
      top: 10%;
      height: 95%;
      width: auto;
      max-width: none;
    }

    &__header {
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
    }

    &__subtitle {
      margin: 0;
      max-width: 529px;
      font-size: 28px;
      font-weight: 500;
      line-height: 1.3;
      color: #000;
    }

    &__logo {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;

      img:first-child {
        height: 84px;
        width: auto;
      }

      img:last-child {
        height: 38px;
        width: auto;
      }
    }

    &__title {
      position: relative;
      margin: auto 0 0;
      padding-top: 120px;
      max-width: 902px;
      font-size: 82px;
      font-weight: 400;
      line-height: 0.976;
      letter-spacing: -0.03em;
      color: #000;
      white-space: pre-line;
    }

    &__tag {
      position: relative;
      margin: 102px 0 0;
      font-size: 42px;
      font-weight: 500;
      line-height: 1;
      color: #0051ff;
    }

    &__actions {
      position: relative;
      margin-top: 28px;
      display: flex;
      gap: 10px;
      align-items: center;
    }

    &__btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      height: 70px;
      padding: 12px 22px;
      border-radius: 18px;
      font-size: 24px;
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
      cursor: pointer;

      :deep(svg) {
        transition: transform 0.25s ease;
      }

      &:hover :deep(svg) {
        transform: translateX(5px);
      }

      &--primary {
        width: 325px;
        background: #0051ff;
        color: #fff;
        border: none;
      }

      &--secondary {
        width: 352px;
        background: #fff;
        color: #f75709;
        border: 1px solid #f75709;
      }
    }
  }

  @media (max-width: 991px) {
    .banner {
      margin-top: 56px;
      padding: 20px;
      min-height: 800px;

      &__bg {
        bottom: 0;
        top: auto;
        height: 55%;
      }

      &__bg-img {
        position: absolute;
        right: -10%;
        top: 0;
        bottom: auto;
        height: 100%;
        opacity: 0.2;
      }

      &__header {
        flex-direction: column-reverse;
        gap: 12px;
      }

      &__logo {
        img:first-child {
          height: 48px;
        }

        img:last-child {
          height: 22px;
        }
      }

      &__subtitle {
        font-size: 16px;
      }

      &__title {
        margin: 0;
        font-size: 36px;
        line-height: 1.1;
        padding-top: 24px;
      }

      &__tag {
        margin-top: auto;
        font-size: 26px;
      }

      &__actions {
        margin-top: 16px;
        flex-direction: column;
        align-items: stretch;
      }

      &__btn {
        width: 100% !important;
        font-size: 18px;
        height: 56px;
        top: 0;
      }
    }
  }
</style>
