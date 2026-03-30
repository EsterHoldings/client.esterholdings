<template>
  <section class="platform-v2">
    <UiContainer class="platform">
      <div ref="leftRef" class="platform__left" :class="{ 'platform__left--visible': isVisible }">
        <h2 class="platform__title">
          {{ t("landing.sections.platform__title") }}
        </h2>
        <div class="platform__cards">
          <div
            v-for="(card, i) in cards"
            :key="i"
            :style="{ '--i': i }"
            class="platform__card">
            <div class="platform__card-icon">
              <component :is="card.icon" />
            </div>
            <div>
              <div class="platform__card-name">{{ t(card.titleKey) }}</div>
              <p class="platform__card-desc">{{ t(card.textKey) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div
        class="platform__visual"
        aria-hidden="true">
        <div class="platform__ellipse">
          <UiIconEclipce />
        </div>
        <img
          class="platform__device"
          src="assets/landing/static-v2/banner-trade.png"
          alt="" />

        <div class="platform__label platform__label--mobile">
          <strong>{{ t("landing.sections.platform__features[1].title") }}</strong>
          <span>{{ t("landing.sections.platform__features[1].text") }}</span>
        </div>
        <div class="platform__label platform__label--desktop">
          <strong>{{ t("landing.sections.platform__features[2].title") }}</strong>
          <span>{{ t("landing.sections.platform__features[2].text") }}</span>
        </div>
      </div>
    </UiContainer>
  </section>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from "vue";
  import { useI18n } from "vue-i18n";
  import UiContainer from "~/components/ui/UiContainer.vue";
  import UiIconTradingChart from "~/components/ui/UiIconTradingChart.vue";
  import UiIllustrationSpeed from "~/components/ui/UiIllustrationSpeed.vue";
  import UiIconEclipce from "~/components/ui/UiIconEclipce.vue";

  const { t } = useI18n();

  const leftRef = ref<HTMLElement | null>(null);
  const isVisible = ref(false);
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisible.value = true;
          observer?.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (leftRef.value) observer.observe(leftRef.value);
  });

  onUnmounted(() => observer?.disconnect());

  const cards = [
    {
      icon: UiIconTradingChart,
      titleKey: "landing.sections.platform__features[0].title",
      textKey: "landing.sections.platform__features[0].text",
    },
    {
      icon: UiIllustrationSpeed,
      titleKey: "landing.sections.platform__features[3].title",
      textKey: "landing.sections.platform__features[3].text",
    },
  ];
</script>

<style lang="scss" scoped>
  .platform-v2 {
    padding: 0 0 60px;
  }

  .platform {
    display: grid;
    grid-template-columns: 360px 1fr;
    min-height: 760px;
    overflow: hidden;

    &__left {
      display: flex;
      flex-direction: column;
      padding: 80px 0 80px;
    }

    &__title {
      margin: 0;
      color: #000;
      font-size: 42px;
      font-weight: 500;
      line-height: 1.2;
      max-width: 420px;
      opacity: 0;
      transform: translateX(-80px);
    }

    &__left--visible &__title {
      animation: platform-card-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    &__cards {
      margin-top: auto;
      display: flex;
      gap: 0;
    }

    &__card {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 198px;
      opacity: 0;
      transform: translateX(-80px);
    }

    &__left--visible &__card {
      animation: platform-card-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      animation-delay: calc(0.15s + var(--i) * 0.12s);
    }

    &__card-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #0051ff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    &__card-name {
      color: #0051ff;
      font-size: 18px;
      font-weight: 600;
      line-height: 1.3;
      text-transform: uppercase;
      white-space: pre-line;
    }

    &__card-desc {
      margin: 0;
      color: #7b7b7b;
      font-size: 16px;
      line-height: 1.4;
    }

    &__visual {
      position: relative;
    }

    &__ellipse {
      position: absolute;
      top: 70%;
      left: 35%;
      width: 980px;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 0;
    }

    &__device {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: left center;
      z-index: 1;
    }

    &__label {
      position: absolute;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 20px;
      padding: 20px;
      backdrop-filter: blur(8px);
      display: flex;
      flex-direction: column;
      gap: 6px;
      z-index: 2;

      strong {
        color: #0051ff;
        font-size: 20px;
        font-weight: 700;
        line-height: 1.2;
        white-space: nowrap;
      }

      span {
        color: #4d4d4d;
        font-size: 16px;
        font-weight: 500;
        line-height: 1.4;
      }

      &--mobile {
        top: 37.2%;
        left: 9.8%;
        width: 261px;
      }

      &--desktop {
        top: 59.4%;
        left: 54.3%;
        width: 320px;
      }
    }
  }

  @media (max-width: 1199px) {
    .platform {
      grid-template-columns: 300px 1fr;
      min-height: 640px;

      &__left {
        padding: 60px 0;
      }

      &__title {
        font-size: 34px;
      }

      &__card {
        width: 160px;
      }

      &__card-name {
        font-size: 15px;
      }

      &__card-desc {
        font-size: 14px;
      }
    }
  }

  @media (max-width: 991px) {
    .platform {
      grid-template-columns: 1fr;
      min-height: unset;

      &__left {
        padding: 48px 0 40px;
      }

      &__title {
        font-size: 28px;
        max-width: 100%;
      }

      &__cards {
        margin-top: 32px;
        gap: 32px;
      }

      &__card {
        width: auto;
      }

      &__visual {
        min-height: 430px;
      }

      &__device {
        object-fit: contain;
        object-position: center bottom;
      }

      &__label {
        padding: 14px 16px;

        strong {
          font-size: 16px;
        }

        span {
          font-size: 13px;
        }
      }
    }
  }

  @keyframes platform-card-in {
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @media (max-width: 575px) {
    .platform {
      &__left {
        padding: 36px 0 24px;
      }

      &__title {
        font-size: 28px;
        line-height: 1.2;
      }

      &__cards {
        margin-top: 36px;
        gap: 16px;
      }

      &__card {
        width: calc(50% - 8px);
        gap: 12px;
      }

      &__ellipse {
        display: none;
      }

      &__visual {
        min-height: 500px;
      }

      &__label {
        padding: 14px 18px;
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.42);

        strong {
          font-size: 16px;
        }

        span {
          font-size: 13px;
        }

        &--mobile {
          top: 6%;
          left: 50%;
          width: 220px;
          max-width: 300px;
          transform: translateX(-50%);
        }

        &--desktop {
          top: auto;
          left: 50%;
          bottom: 4%;
          width: auto;
          max-width: 280px;
          transform: translateX(-50%);
        }
      }
    }
  }
</style>
