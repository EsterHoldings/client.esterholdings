<template>
  <section class="range-v2">
    <UiContainer>
      <div class="range-v2__inner">
        <h2 class="range-v2__title">{{ t("landing.sections.wide_range__title") }}</h2>
        <div ref="listRef" class="range-v2__list" :class="{ 'range-v2__list--visible': isVisible }">
          <NuxtLink
            v-for="(item, index) in items"
            :key="index"
            :to="`/market-instruments?index=${index}`"
            :style="{ '--i': index }"
            class="range-v2__card">
            <div class="range-v2__thumb">
              <img
                :src="item.image"
                :alt="item.title"
                class="range-v2__thumb-img" />
            </div>
            <div class="range-v2__body">
              <p class="range-v2__name">{{ item.title }}</p>
              <p class="range-v2__desc">{{ item.description }}</p>
            </div>
            <div class="range-v2__arrow">
              <UiIconArrowV2 />
            </div>
          </NuxtLink>
        </div>
      </div>
    </UiContainer>
  </section>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted } from "vue";
  import { useI18n } from "vue-i18n";
  import UiContainer from "~/components/ui/UiContainer.vue";
  import UiIconArrowV2 from "~/components/ui/UiArrowV2.vue";
  import imgForex from "~/assets/landing/static-v2/forex-money.png";
  import imgMetals from "~/assets/landing/static-v2/metals-image.png";
  import imgCrypto from "~/assets/landing/static-v2/crypto.png";
  import imgShares from "~/assets/landing/static-v2/shares.png";
  import imgEnergy from "~/assets/landing/static-v2/energy.png";
  import imgMoon from "~/assets/landing/static-v2/moon.png";
  import imgEtfs from "~/assets/landing/static-v2/etfs.png";

  const { t } = useI18n();

  const listRef = ref<HTMLElement | null>(null);
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
      { threshold: 0.1 }
    );
    if (listRef.value) observer.observe(listRef.value);
  });

  onUnmounted(() => observer?.disconnect());

  const IMAGES: Record<string, { img: string; img2?: string }> = {
    Forex: { img: imgForex },
    Metals: { img: imgMetals },
    CryptocurrencyCDs: { img: imgCrypto },
    Indices: { img: imgMoon },
    Shares: { img: imgShares },
    Energy: { img: imgEnergy },
    ETFS: { img: imgEtfs },
  };

  const keys = ["Forex", "Metals", "CryptocurrencyCDs", "Indices", "Shares", "Energy", "ETFS"];

  const items = computed(() =>
    keys.map(key => ({
      title: t(`landing.sections.wide_range_tabs.${key}.title`),
      description: t(`landing.sections.wide_range_tabs.${key}.description`),
      image: IMAGES[key].img,
    }))
  );
</script>

<style lang="scss" scoped>
  .range-v2 {
    margin-top: 160px;

    &__inner {
      display: grid;
      grid-template-columns: 270px 1fr;
      gap: 0 40px;
      align-items: start;
    }

    &__title {
      margin: 0;
      color: #000;
      font-size: 42px;
      font-weight: 500;
      line-height: 1.302;
      position: sticky;
      top: 100px;
    }

    &__list {
      display: flex;
      flex-direction: column;
      gap: 40px;
    }

    &__card {
      display: flex;
      align-items: center;
      gap: 30px;
      padding-right: 30px;
      height: 140px;
      border: 6px solid #fff;
      border-radius: 20px;
      background: linear-gradient(-9.47deg, #f1f1f1 0%, #fff 42.48%);
      text-decoration: none;
      transition: box-shadow 0.25s ease;
      opacity: 0;
      transform: translateX(80px);

      &:hover {
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
      }
    }

    &__list--visible &__card {
      animation: card-slide-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      animation-delay: calc(var(--i) * 0.1s);
    }

    &__thumb {
      width: 180px;
      height: 140px;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      flex-shrink: 0;
      position: relative;
    }

    &__thumb-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      pointer-events: none;

      &--overlay {
        mix-blend-mode: multiply;
      }
    }

    &__body {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    &__name {
      margin: 0;
      color: #7b7b7b;
      font-size: 42px;
      font-weight: 400;
      line-height: normal;
      letter-spacing: -0.03em;
      white-space: nowrap;
    }

    &__desc {
      margin: 0;
      color: #0051ff;
      font-size: 18px;
      font-weight: 700;
      line-height: 1.302;
    }

    &__arrow {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
    }
  }

  @keyframes card-slide-in {
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @media (max-width: 991px) {
    .range-v2 {
      margin-top: 56px;

      &__inner {
        grid-template-columns: 1fr;
        gap: 24px 0;
      }

      &__title {
        position: static;
        font-size: 34px;
      }

      &__list {
        gap: 16px;
      }

      &__card {
        height: 118px;
        min-height: 90px;
        padding: 12px 16px 12px 0;
        gap: 2px;
      }

      &__thumb {
        width: 90px;
        height: 90px;
        border-radius: 10px;
      }

      &__name {
        font-size: 26px;
      }

      &__desc {
        font-size: 13px;
      }

      &__arrow {
        width: 28px;
        height: 28px;
      }
    }
  }
</style>
