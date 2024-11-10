<template>
  <div class="container">
    <TheHeader />
    <!-- TODO :: HERE WILL BE ADDED SIDEBAR COMPONENT -->
    <div class="page--min-height">
      <slot />
    </div>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
// import TheHeader from "@/components/block/TheHeader.vue";
// import TheFooter from "@/components/block/TheFooter.vue";
</script>
