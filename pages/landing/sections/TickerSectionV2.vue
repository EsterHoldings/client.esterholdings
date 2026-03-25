<template>
  <section class="ticker-v2">
    <RunningLineDefaultV2 :items="items" />
  </section>
</template>

<script setup lang="ts">
  import RunningLineDefaultV2 from "~/components/block/lines/RunningLineDefaultV2.vue";

  const items = [
    { symbol: "EURUSD", price: "1.04282 / 0.00014", isUp: true },
    { symbol: "GBPUSD", price: "2655.08 / -6.84", isUp: false },
    { symbol: "WTI", price: "71.11 / 0.21", isUp: true },
    { symbol: "GBPUSD", price: "2655.08 / -6.84", isUp: false },
    { symbol: "EURUSD", price: "1.04282 / 0.00014", isUp: true },
    { symbol: "GBPUSD", price: "2655.08 / -6.84", isUp: false },
    { symbol: "WTI", price: "71.11 / 0.21", isUp: true },
  ];
</script>

<style lang="scss" scoped>
  .ticker-v2 {
    overflow: hidden;
  }
</style>
