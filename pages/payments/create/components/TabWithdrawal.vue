<template>
  <div class="withdrawal">
    <div class="withdrawal-paysystems">
      <div
        class="withdrawal-paysystems__loader-wrapper"
        v-if="props.isLoading">
        <UiIconSpinnerDefault />
      </div>
      <PaymentSystemItem
        v-else
        @select="handleSelectPaymentSystem(index)"
        v-for="(paymentSystemItem, index) in props.paymentSystemsList"
        :name="paymentSystemItem?.name"
        :icon="paymentSystemItem?.icon"
        :key="paymentSystemItem?.name"
        :is-active="props.activePaymentSystemIndex === index" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import PaymentSystemItem from "~/pages/payments/create/components/PaymentSystemItem.vue";

  type PaymentSystemUiItem = {
    name: string;
    icon: object;
  };

  const props = withDefaults(
    defineProps<{
      isLoading?: boolean;
      activeTabIndex?: number;
      activePaymentSystemIndex?: number;
      paymentSystemsList?: PaymentSystemUiItem[];
    }>(),
    {
      isLoading: false,
      activeTabIndex: 0,
      activePaymentSystemIndex: 0,
      paymentSystemsList: () => [],
    }
  );

  const emit = defineEmits(["select"]);

  const handleSelectPaymentSystem = (index: number = 0) => {
    emit("select", index);
  };
</script>

<style lang="scss" scoped>
  .withdrawal {
    &-paysystem {
      &s {
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 20px;
        min-height: 400px;

        &__loader-wrapper {
          position: absolute;
          background-color: var(--ui-background-secondary);
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }
  }
</style>
