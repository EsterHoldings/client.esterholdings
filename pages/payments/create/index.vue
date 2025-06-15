<template>
  <UiContainer>
    <div class="payment-create">
      <UiTextH4 class="payment-create__title">Создать новый платеж</UiTextH4>
      <div class="payment-create__content">

        <PanelDefault class="payment-create__content__left">
          <UiTextH5 class="payment-create__content__left_title"># Выбор платежного способа</UiTextH5>
          <TabsDefault
              class="payment-create__content__left_tabs"
              :tabsList="tabsList"
              :active-tab-index="tabActiveIndex"
              @select-tab="handleSelectTab"
          />
          <component
              :active-payment-system-index="activePaymentSystemIndex"
              :payment-systems-list="paymentSystemsList"
              :is="componentIs.component"
              :key="componentIs.label"
              @select="handleSelectPaymentSystem"
          />
        </PanelDefault>

        <PanelDefault class="payment-create__content__right">
          <UiTextH5 class="payment-create__content__right_title">Форма оплаты</UiTextH5>
          <div>
            <component :is="activePaymentSystemComponentIs.componentForm" />
          </div>
        </PanelDefault>

      </div>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import {computed, reactive, ref} from "vue";
import {definePageMeta} from "~/.nuxt/imports";

import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiIconBTC from "~/components/ui/UiIconBTC.vue";
import UiIconUsdtErc20 from "~/components/ui/UiIconUsdtErc20.vue";
import UiIconUsdtTrc20 from "~/components/ui/UiIconUsdtTrc20.vue";
import UiIconVisaAndMasterCard from "~/components/ui/UiIconVisaAndMasterCard.vue";
import UiIconPayment from "~/components/ui/UiIconPayment.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import TabsDefault from "~/components/block/tabs/TabsDefault.vue";
import TabDeposit from "~/pages/payments/create/components/TabDeposit.vue";
import TabWithdrawal from "~/pages/payments/create/components/TabWithdrawal.vue";
import TabDepositFormUsdtErc20 from "~/pages/payments/create/components/TabDepositFormUsdtErc20.vue";
import TabDepositFormUsdtTrc20 from "~/pages/payments/create/components/TabDepositFormUsdtTrc20.vue";
import TabDepositFormBTC from "~/pages/payments/create/components/TabDepositFormBTC.vue";

definePageMeta({
  layout: "cabinet",
  middleware: ["auth-client", "client-check-auth"],
});

let activePaymentSystemIndex = ref(0);
const paymentSystemsList = reactive([
  {
    name: "USDT TRC-20",
    icon: UiIconUsdtErc20,
    componentForm: TabDepositFormUsdtErc20
  },
  {
    name: "USDT ERC-20",
    icon: UiIconUsdtTrc20,
    componentForm: TabDepositFormUsdtTrc20
  },
  {
    name: "BTC",
    icon: UiIconBTC,
    componentForm: TabDepositFormBTC
  },
  {
    name: "Visa / MasterCard",
    icon: UiIconVisaAndMasterCard,
    componentForm: TabDepositFormUsdtErc20
  },
  {
    name: "Custom Payment",
    icon: UiIconPayment,
    componentForm: TabDepositFormUsdtErc20
  },
])

const tabActiveIndex = ref(0);
const tabsList = reactive([
  {
    label: 'Пополнение',
    component: TabDeposit
  },
  {
    label: 'Выплата',
    component: TabWithdrawal
  },
]);

const handleSelectTab = (index: number) => {
  console.log('handleSelectTab', index);
  tabActiveIndex.value = index;
}

const handleSelectPaymentSystem = (index: number) => {
  activePaymentSystemIndex.value = index;
}

const componentIs = computed(() => {
  return tabsList[tabActiveIndex.value];
});

const activePaymentSystemComponentIs = computed(() => {
  return paymentSystemsList[activePaymentSystemIndex.value];
});
</script>

<style lang="scss" scoped>
.payment-create {

  color: var(--ui-text-main);

  &__title {
    margin-bottom: 20px;
  }

  &__content {
    display: flex;
    justify-content: space-between;
    gap: 20px;

    &__left {
      padding: 20px;
      width: 50%;

      &_title {
        margin-bottom: 20px;
      }

      &_tabs {
        justify-content: flex-end;
        margin-bottom: 20px;
      }
    }

    &__right {
      padding: 20px;
      width: 50%;

      &_title {
        margin-bottom: 20px;
      }
    }
  }
}
</style>
