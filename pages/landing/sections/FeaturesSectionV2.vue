<template>
  <section class="features-v2">
    <UiContainer>
      <h2>{{ t("landing.sections.feature__title") }}</h2>
      <div class="grid">
        <article class="item" v-for="(feature, index) in features" :key="index">
          <div class="icon-sm">
            <img :src="feature.iconSm" alt="" />
          </div>
          <div class="text-block">
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
          <div class="icon-bg" aria-hidden="true">
            <img :src="feature.iconBg" alt="" />
          </div>
        </article>
      </div>
    </UiContainer>
  </section>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useI18n } from "vue-i18n";
  import UiContainer from "~/components/ui/UiContainer.vue";

  const { t } = useI18n();

  const iconPairs = [
    { sm: "/static/features-instruments-sm.svg", bg: "/static/features-instruments-bg.svg" },
    { sm: "/static/features-liquidity-sm.svg", bg: "/static/features-liquidity-bg.svg" },
    { sm: "/static/features-spread-sm.svg", bg: "/static/features-spread-bg.svg" },
    { sm: "/static/features-limit-sm.svg", bg: "/static/features-limit-bg.svg" },
    { sm: "/static/features-speed-sm.svg", bg: "/static/features-speed-bg.svg" },
    { sm: "/static/features-security-sm.svg", bg: "/static/features-security-bg.svg" },
  ];

  const features = computed(() =>
    iconPairs.map((icons, i) => ({
      iconSm: icons.sm,
      iconBg: icons.bg,
      title: t(`landing.sections.features__items[${i}].title`),
      description: t(`landing.sections.features__items[${i}].text`),
    }))
  );
</script>

<style lang="scss" scoped>
  .features-v2 {
    margin-top: 72px;

    h2 {
      margin: 0;
      color: #000;
      font-size: 42px;
      line-height: 1.302;
      font-weight: 500;
    }

    .grid {
      margin-top: 34px;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 20px;
    }

    .item {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 281px;
      border: 6px solid #fff;
      border-radius: 20px;
      padding: 30px;
      overflow: hidden;
      background: linear-gradient(-17.68deg, #fff 16.6%, #f1f1f1 84.4%);
    }

    .icon-sm {
      position: relative;
      z-index: 1;
      width: 60px;
      height: 60px;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: contain;
      }
    }

    .text-block {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;

      h3 {
        margin: 0;
        color: #000;
        font-size: 28px;
        font-weight: 500;
        line-height: 1.302;
        white-space: pre-line;
      }

      p {
        margin: 0;
        color: #0051ff;
        font-size: 16px;
        line-height: 1.302;
      }
    }

    .icon-bg {
      position: absolute;
      right: -39px;
      top: 54px;
      width: 280px;
      height: 280px;
      pointer-events: none;
      z-index: 0;

      img {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: contain;
      }
    }
  }

  @media (max-width: 991px) {
    .features-v2 {
      margin-top: 48px;

      h2 {
        font-size: 34px;
      }

      .grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
  }

  @media (max-width: 575px) {
    .features-v2 {
      margin-top: 32px;

      h2 {
        font-size: 26px;
      }

      .grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin-top: 20px;
      }

      .item {
        min-height: 180px;
        padding: 16px;
        border-width: 4px;
        border-radius: 14px;
      }

      .icon-sm {
        width: 36px;
        height: 36px;
      }

      .text-block {
        gap: 4px;

        h3 {
          font-size: 16px;
        }

        p {
          font-size: 12px;
        }
      }

      .icon-bg {
        width: 160px;
        height: 160px;
        right: -20px;
        top: 30px;
      }
    }
  }
</style>
