<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="ui-btn-v2"
    :class="`ui-btn-v2--${variant}`">
    <span class="ui-btn-v2__label"><slot /></span>
    <UiIconArrow class="ui-btn-v2__arrow" />
  </NuxtLink>
  <button
    v-else
    type="button"
    class="ui-btn-v2"
    :class="`ui-btn-v2--${variant}`">
    <span class="ui-btn-v2__label"><slot /></span>
    <UiIconArrow class="ui-btn-v2__arrow" />
  </button>
</template>

<script setup lang="ts">
  import UiIconArrow from "~/components/ui/UiIconArrow.vue";

  withDefaults(
    defineProps<{
      to?: string;
      variant?: "primary" | "secondary";
    }>(),
    { variant: "primary" }
  );
</script>

<style lang="scss" scoped>
  .ui-btn-v2 {
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-width: 260px;
    min-height: 70px;
    padding: 14px 22px;
    border-radius: 18px;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.3;
    text-decoration: none;
    cursor: pointer;
    font-family: inherit;
    border: none;
    transition:
      opacity 0.2s,
      background 0.2s;

    &__label {
      flex: 1 1 auto;
      min-width: 0;
      text-align: left;
    }

    &__arrow {
      flex-shrink: 0;
      width: 52px;
      height: 13px;
      transition: transform 0.25s ease;
    }

    &:hover &__arrow {
      transform: translateX(6px);
    }

    &--primary {
      background: #0051ff;
      color: #fff;

      &:hover {
        opacity: 0.9;
      }
    }

    &--secondary {
      background: #fff;
      color: #f75709;
      border: 1.5px solid #f75709;
    }
  }

  @media (max-width: 991px) {
    .ui-btn-v2 {
      font-size: 18px;
      min-height: 56px;
      padding: 12px 20px;

      &__arrow {
        width: 44px;
      }
    }
  }

  @media (max-width: 575px) {
    .ui-btn-v2 {
      min-width: 0;
      width: 100%;
      font-size: 16px;
    }
  }
</style>
