<template>
  <div
    class="running-line-v2"
    @mouseenter="stopAnimation"
    @mouseleave="startAnimation">
    <div
      ref="track"
      class="running-line-v2__track">
      <article
        v-for="(item, index) in duplicatedItems"
        :key="`${item.symbol}-${item.price}-${index}`"
        class="running-line-v2__card">
        <div class="running-line-v2__head">
          <UiIconTradeArrowUp
            v-if="item.isUp"
            class="running-line-v2__icon" />
          <UiIconTradeArrowDown
            v-else
            class="running-line-v2__icon" />
          <div class="running-line-v2__info">
            <p class="running-line-v2__symbol">{{ item.symbol }}</p>
            <p class="running-line-v2__price">{{ item.price }}</p>
          </div>
        </div>
        <button
          type="button"
          class="running-line-v2__btn">
          Trade
        </button>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from "vue";
  import UiIconTradeArrowDown from "~/components/ui/UiIconTradeArrowDown.vue";
  import UiIconTradeArrowUp from "~/components/ui/UiIconTradeArrowUp.vue";

  type TickerItem = {
    symbol: string;
    price: string;
    isUp: boolean;
  };

  const props = withDefaults(
    defineProps<{
      items: TickerItem[];
      speed?: number;
    }>(),
    { speed: 0.5 }
  );

  const duplicatedItems = computed(() => [...props.items, ...props.items]);
  const track = ref<HTMLElement | null>(null);
  const position = ref(0);
  let animationFrameId: number | null = null;

  const animate = () => {
    if (!track.value) return;
    position.value -= props.speed;
    if (Math.abs(position.value) >= track.value.scrollWidth / 2) {
      position.value = 0;
    }
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

<style scoped lang="scss">
  .running-line-v2 {
    overflow: hidden;
    margin-top: 14px;

    &__track {
      display: flex;
      width: max-content;
      gap: 18px;
      transition: transform 0.1s linear;
      will-change: transform;
    }

    &__card {
      border-radius: 20px;
      border: 1px solid #fff;
      background: rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 40px;
      flex-shrink: 0;
    }

    &__head {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    &__icon {
      flex-shrink: 0;
    }

    &__info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    &__symbol {
      margin: 0;
      color: #000;
      font-family: "DM Sans", sans-serif;
      font-size: 18px;
      line-height: 1.302;
      font-weight: 700;
    }

    &__price {
      margin: 0;
      color: #000;
      font-family: "DM Sans", sans-serif;
      font-size: 14px;
      line-height: 1.302;
    }

    &__btn {
      height: 42px;
      padding: 10px 16px;
      border: 0;
      border-radius: 12px;
      background: #0051ff;
      color: #fff;
      font-family: "DM Sans", sans-serif;
      font-size: 16px;
      line-height: 1.302;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
    }
  }

  @media (max-width: 991px) {
    .running-line-v2 {
      margin-top: 20px;

      &__track {
        gap: 14px;
      }

      &__card {
        min-width: 320px;
        padding: 16px;
        flex-direction: column;
        align-items: stretch;
        gap: 18px;
      }

      &__head {
        gap: 16px;
      }

      &__icon {
        width: 64px;
        height: 64px;
      }

      &__btn {
        width: 100%;
        height: 64px;
        border-radius: 18px;
      }
    }
  }
</style>
