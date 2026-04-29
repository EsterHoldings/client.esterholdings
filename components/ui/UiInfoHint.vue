<script setup lang="ts">
  import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

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
  const anchorRef = ref<HTMLElement | null>(null);
  const tooltipStyle = ref<Record<string, string>>({});

  const resolveTooltipWidth = () => {
    const parsed = Number.parseInt(String(props.width).replace(/[^\d]/g, ""), 10);
    const fallback = Number.isFinite(parsed) ? parsed : 320;
    return Math.min(fallback, Math.max(220, window.innerWidth - 24));
  };

  const positionTooltip = () => {
    const trigger = anchorRef.value ?? triggerRef.value;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 12;
    const tooltip = tooltipRef.value;
    const maxTooltipWidth = resolveTooltipWidth();
    const naturalTooltipWidth = tooltip?.getBoundingClientRect().width || 0;
    const tooltipWidth = Math.min(maxTooltipWidth, Math.max(180, naturalTooltipWidth || maxTooltipWidth));
    const tooltipHeight = tooltip?.offsetHeight || 0;
    const maxLeft = Math.max(viewportPadding, window.innerWidth - tooltipWidth - viewportPadding);
    const centeredLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
    const left = Math.min(Math.max(centeredLeft, viewportPadding), maxLeft);
    let top = rect.bottom + 10;

    if (tooltipHeight > 0 && top + tooltipHeight + viewportPadding > window.innerHeight) {
      top = Math.max(viewportPadding, rect.top - tooltipHeight - 10);
    }

    tooltipStyle.value = {
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
      minWidth: `${Math.min(180, tooltipWidth)}px`,
      maxWidth: `calc(100vw - ${viewportPadding * 2}px)`,
    };
  };

  const open = async () => {
    isOpen.value = true;
    await nextTick();
    positionTooltip();
  };

  const close = () => {
    isOpen.value = false;
  };

  const toggle = () => {
    if (isOpen.value) {
      close();
      return;
    }

    void open();
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
    window.removeEventListener("resize", positionTooltip);
    window.removeEventListener("scroll", positionTooltip, true);
  });

  watch(isOpen, value => {
    if (!value) {
      window.removeEventListener("resize", positionTooltip);
      window.removeEventListener("scroll", positionTooltip, true);
      return;
    }

    window.addEventListener("resize", positionTooltip);
    window.addEventListener("scroll", positionTooltip, true);
  });
</script>

<template>
  <div
    ref="triggerRef"
    class="info-hint"
    @mouseenter="open"
    @mouseleave="close">
    <span
      ref="anchorRef"
      class="info-hint__anchor">
      <slot
        name="trigger"
        :is-open="isOpen"
        :open="open"
        :close="close"
        :toggle="toggle">
        <button
          type="button"
          class="info-hint__trigger"
          :aria-label="props.label"
          :aria-expanded="isOpen"
          @click.stop="toggle"
          @focus="open"
          @blur="close">
          <span aria-hidden="true">!</span>
        </button>
      </slot>
    </span>

    <Teleport to="body">
      <transition name="info-hint">
        <div
          v-if="isOpen"
          ref="tooltipRef"
          class="info-hint__tooltip"
          :style="tooltipStyle"
          role="tooltip">
          {{ props.content }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<style scoped>
  .info-hint {
    position: relative;
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
  }

  .info-hint__anchor {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
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
    z-index: 9999;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 28%, var(--color-stroke-ui-light) 72%);
    background: color-mix(in srgb, var(--ui-background-card) 92%, transparent);
    backdrop-filter: blur(12px) saturate(1.08);
    box-shadow:
      0 18px 42px rgba(0, 0, 0, 0.18),
      inset 0 1px 0 color-mix(in srgb, white 28%, transparent);
    padding: 11px 13px;
    color: var(--ui-text-main);
    font-size: 12px;
    line-height: 1.5;
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
