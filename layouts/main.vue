<template>
  <div class="page-wrapper">
    <TheGuestHeader class="header" />
    <UiImage
      class="bg-image"
      src="/space.gif" />
    <div class="page-content">
      <transition
        name="fade"
        mode="out-in">
        <main class="page">
          <slot />
        </main>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  import TheGuestHeader from "~/components/block/TheGuestHeader.vue";
  import UiImage from "~/components/ui/UiImage.vue";
</script>

<style lang="scss" scoped>
  .header {
    z-index: 10;
  }

  .bg-image {
    position: fixed;
    inset: 0;
    z-index: -1;
  }

  .page {
    min-height: 100vh;
    padding-top: 100px;
    overflow: unset;

    &-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background-color: var(--ui-background-admin);
    }

    &-content {
      min-height: 100vh;
      width: 100%;
      position: relative;
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
