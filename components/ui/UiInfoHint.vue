<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref } from "vue";

  const props = withDefaults(
    defineProps<{
      label: string;
      content: string;
      width?: string;
    }>(),
    {
      width: "320px",
    }
  );

  const isOpen = ref(false);
  const tooltipRef = ref<HTMLElement | null>(null);
  const triggerRef = ref<HTMLElement | null>(null);

  const open = () => {
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
  };

  const toggle = () => {
    isOpen.value = !isOpen.value;
  };

  const handleOutside = (event: PointerEvent) => {
    const target = event.target;
    if (!(target instanceof Node)) return;

    if (tooltipRef.value?.contains(target) || triggerRef.value?.contains(target)) {
      return;
    }

    close();
  };

  onMounted(() => {
    window.addEventListener("pointerdown", handleOutside, true);
  });

  onBeforeUnmount(() => {
    window.removeEventListener("pointerdown", handleOutside, true);
  });
</script>

<template>
  <div
    class="info-hint"
    @mouseenter="open"
    @mouseleave="close">
    <button
      ref="triggerRef"
      type="button"
      class="info-hint__trigger"
      :aria-label="props.label"
      :aria-expanded="isOpen"
      @click.stop="toggle"
      @focus="open"
      @blur="close">
      <span aria-hidden="true">!</span>
    </button>

    <transition name="info-hint">
      <div
        v-if="isOpen"
        ref="tooltipRef"
        class="info-hint__tooltip"
        :style="{ width: `min(${props.width}, calc(100vw - 24px))` }"
        role="tooltip">
        {{ props.content }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
  .info-hint {
    position: relative;
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
  }

  .info-hint__trigger {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 45%, transparent);
    background: color-mix(in srgb, var(--ui-primary-main) 14%, transparent);
    color: var(--ui-primary-main);
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease;
  }

  .info-hint__trigger:hover,
  .info-hint__trigger:focus-visible,
  .info-hint__trigger[aria-expanded="true"] {
    border-color: color-mix(in srgb, var(--ui-primary-main) 68%, transparent);
    background: color-mix(in srgb, var(--ui-primary-main) 20%, transparent);
    color: var(--ui-primary-main);
    outline: none;
  }

  .info-hint__tooltip {
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    z-index: 20;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 24%, var(--color-stroke-ui-light) 76%);
    background: color-mix(in srgb, var(--ui-background-panel) 94%, var(--ui-background-card) 6%);
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.14);
    padding: 10px 12px;
    color: var(--ui-text-main);
    font-size: 12px;
    line-height: 1.45;
  }

  .info-hint-enter-active,
  .info-hint-leave-active {
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }

  .info-hint-enter-from,
  .info-hint-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
</style>
