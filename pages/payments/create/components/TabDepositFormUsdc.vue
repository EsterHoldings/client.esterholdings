<template>
  <TabDepositFormCoinsbuy v-bind="props" />
</template>

<script lang="ts" setup>
  import TabDepositFormCoinsbuy from "~/pages/payments/create/components/TabDepositFormCoinsbuy.vue";

  const props = defineProps({
    paymentSystem: { type: Object, required: true },
    initialAccountId: { type: String, default: "" },
  });
</script>
