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
  import { computed, onMounted, onUnmounted, ref } from 'vue';

  const baseItems = [
    {
      title: 'Bitcoin crashes 12% after SEC announces ban on stablecoins',
      image:
        'https://render.fineartamerica.com/images/rendered/default/flat/beach-towel/images/artworkimages/medium/1/pixel-bitcoin-concept-allan-swart.jpg?&targetx=0&targety=-76&imagewidth=952&imageheight=628&modelwidth=952&modelheight=476&backgroundcolor=52514D&orientation=1&producttype=beachtowel-32-64',
    },
    {
      title: 'Tesla announced a 1:10 stock split - quotes rose by 12%',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4L9_huULFPV-ewqaz3Hpf9iGK0njUL-HvHQ&s',
    },
    {
      title: 'Dow Jones plummets 1,200 points after unexpected rise in US inflation',
      image: 'https://d1-invdn-com.investing.com/content/07858a634c1563800bd81d442dfd96cf.png',
    },
    {
      title: 'NVIDIA shares soared 15% after the report',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9ecfGnvuktF2LkwRKXrzXlJfAKQ_Os9Vqrw&s',
    },
  ];

  const items = computed(() => [...baseItems, ...baseItems]);
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
      margin-top: 48px;

      &__track {
        gap: 14px;
      }

      &__card {
        width: 340px;
      }
    }
  }
</style>
