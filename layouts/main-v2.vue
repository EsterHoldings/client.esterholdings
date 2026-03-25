<template>
  <div class="page-wrapper">
    <div class="page-content">
      <LandingHeaderV2 class="header" />
      <div class="page">
        <slot />
      </div>
      <LandingFooterV2 />
    </div>
  </div>
</template>

<script setup lang="ts">
  import LandingHeaderV2 from "~/components/block/LandingHeaderV2.vue";
  import LandingFooterV2 from "~/components/block/LandingFooterV2.vue";
</script>

<style lang="scss" scoped>
  .header {
    z-index: 9999;
  }

  .page {
    overflow: unset;

    &-wrapper {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    &-content {
      width: 100%;
      background-color: #f6f6f6;
      position: relative;
    }
  }
</style>
