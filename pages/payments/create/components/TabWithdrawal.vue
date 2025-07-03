<template>
  Withdrawal
</template>

<script lang="ts" setup>
const props = defineProps({
  activeTabIndex: {
    type: Number,
    default: 0
  },
  paymentSystemsList: {
    type: Array,
    default: [],
  },
})
</script>

<style lang="scss" scoped>

</style>