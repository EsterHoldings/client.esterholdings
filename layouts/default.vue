<template>
  <div class="container">
    <TheHeader />
    <div class="page--min-height h-100"><slot /></div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import TheHeader from "@/components/block/TheHeader.vue";
import TheFooter from "@/components/block/TheFooter.vue";
</script>

<style lang="scss" scoped>
@media screen and (max-width: 1040px) {
  .container {
    padding: 0 10px;
  }
}
</style>
