<template>
  <section class="news-row-v2">
    <div
      ref="track"
      class="news-row-v2__track">
      <article
        v-for="(item, idx) in items"
        :key="`${item.title}-${idx}`"
        class="news-row-v2__card">
        <img
          :src="item.image"
          :alt="item.title"
          class="news-row-v2__thumb" />
        <p>{{ item.title }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from "vue";
  import { useI18n } from "vue-i18n";

  const { t, tm } = useI18n();

  const images = [
    "https://render.fineartamerica.com/images/rendered/default/flat/beach-towel/images/artworkimages/medium/1/pixel-bitcoin-concept-allan-swart.jpg?&targetx=0&targety=-76&imagewidth=952&imageheight=628&modelwidth=952&modelheight=476&backgroundcolor=52514D&orientation=1&producttype=beachtowel-32-64",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4L9_huULFPV-ewqaz3Hpf9iGK0njUL-HvHQ&s",
    "https://d1-invdn-com.investing.com/content/07858a634c1563800bd81d442dfd96cf.png",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9ecfGnvuktF2LkwRKXrzXlJfAKQ_Os9Vqrw&s",
  ];

  const baseItems = computed(() => {
    const raw = tm("landing.sections.news_row__items") as any[];
    return Array.isArray(raw)
      ? raw.map((_, i) => ({
          title: t(`landing.sections.news_row__items[${i}].title`),
          image: images[i],
        }))
      : [];
  });

  const items = computed(() => [...baseItems.value, ...baseItems.value]);
  const track = ref<HTMLElement | null>(null);
  const position = ref(0);
  let animationFrameId: number | null = null;
  const speed = 0.4;

  const animate = () => {
    if (!track.value) return;
    position.value -= speed;
    if (Math.abs(position.value) >= track.value.scrollWidth / 2) position.value = 0;
    track.value.style.transform = `translateX(${position.value}px)`;
    animationFrameId = requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    if (!animationFrameId) animate();
  };

  const stopAnimation = () => {
    if (!animationFrameId) return;
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  };

  onMounted(startAnimation);

  onUnmounted(stopAnimation);
</script>

<style lang="scss" scoped>
  .news-row-v2 {
    margin-top: 160px;
    overflow: hidden;

    &__track {
      width: max-content;
      margin: 0;
      transform: translateX(0);
      display: flex;
      gap: 18px;
      will-change: transform;
    }

    &__card {
      width: 399px;
      border-radius: 20px;
      border: 1px solid #fff;
      background: rgba(255, 255, 255, 0.3);
      padding: 10px;
      display: flex;
      align-items: center;
      gap: 14px;
      flex-shrink: 0;
      backdrop-filter: blur(10px);

      p {
        margin: 0;
        color: #000;
        font-size: 14px;
        line-height: 1.302;
        font-weight: 700;
      }
    }

    &__thumb {
      width: 115px;
      height: 70px;
      border-radius: 12px;
      flex-shrink: 0;
      border: 1px solid #fff;
      object-fit: cover;
    }
  }

  @media (max-width: 991px) {
    .news-row-v2 {
      margin-top: 32px;

      &__track {
        gap: 10px;
      }

      &__card {
        width: 240px;
        padding: 8px;
        gap: 10px;
        border-radius: 14px;

        p {
          font-size: 11px;
        }
      }

      &__thumb {
        width: 72px;
        height: 48px;
        border-radius: 8px;
      }
    }
  }
</style>
