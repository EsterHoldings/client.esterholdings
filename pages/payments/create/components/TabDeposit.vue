<template>
  <div class="deposit">
    <div class="deposit-paysystems">
      <PaymentSystemItem
          @select="handleSelectPaymentSystem(index)"
          v-for="(paymentSystemItem, index) in paymentSystemsList"
          :name="paymentSystemItem.name"
          :icon="paymentSystemItem.icon"
          :key="paymentSystemItem.name"
          :is-active="activePaymentSystemIndex === index"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import PaymentSystemItem from "~/pages/payments/create/components/PaymentSystemItem.vue";

const props = defineProps({
  activeTabIndex: {
    type: Number,
    default: 0
  },
  activePaymentSystemIndex: {
    type: Number,
    default: 0,
  },
  paymentSystemsList: {
    type: Array,
    default: [],
  },
})

const emit = defineEmits(['select']);

const handleSelectPaymentSystem = (index: number = 0) => {
  emit('select', index);
}
</script>

<style lang="scss" scoped>
.deposit {
  &-paysystem {
    &s {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px
    }
  }
}
</style>