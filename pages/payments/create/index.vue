<template>
  <UiContainer>
    <div class="payment-create">
      <UiTextH4 class="payment-create__title">Створити новий платіж</UiTextH4>
      <div class="payment-create__content">

        <PanelDefault class="payment-create__content__left">
          <UiTextH5 class="payment-create__content__left_title">
            # Вибір платіжного способу
          </UiTextH5>

          <TabsDefault
              class="payment-create__content__left_tabs"
              :tabsList="tabsList"
              :active-tab-index="tabActiveIndex"
              @select-tab="handleSelectTab"
          />

          <component
              :is="componentIs.component"
              :paymentSystemsList="paymentSystems"
              :activePaymentSystemIndex="activePaymentSystemIndex"
              @select="handleSelectPaymentSystem"
              :isLoading="paymentSystemsListIsLoading"
          />
        </PanelDefault>

        <PanelDefault class="payment-create__content__right">
          <component :is="activePaymentSystem.componentForm" />
        </PanelDefault>

      </div>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import useAppCore from '~/composables/useAppCore'

import { definePageMeta } from '~/.nuxt/imports'
import { reactive, ref, computed, onMounted } from 'vue'

import PanelDefault from '~/components/block/panels/PanelDefault.vue'
import TabDeposit from '~/pages/payments/create/components/TabDeposit.vue'
import TabDepositFormBTC from '~/pages/payments/create/components/TabDepositFormBTC.vue'
import TabDepositFormUsdtErc20 from '~/pages/payments/create/components/TabDepositFormUsdtErc20.vue'
import TabDepositFormUsdtTrc20 from '~/pages/payments/create/components/TabDepositFormUsdtTrc20.vue'
import TabWithdrawal from '~/pages/payments/create/components/TabWithdrawal.vue'
import TabsDefault from '~/components/block/tabs/TabsDefault.vue'
import UiContainer from '~/components/ui/UiContainer.vue'
import UiIconBTC from '~/components/ui/UiIconBTC.vue'
import UiIconPayment from '~/components/ui/UiIconPayment.vue'
import UiIconUsdtErc20 from '~/components/ui/UiIconUsdtErc20.vue'
import UiIconUsdtTrc20 from '~/components/ui/UiIconUsdtTrc20.vue'
import UiIconVisaAndMasterCard from '~/components/ui/UiIconVisaAndMasterCard.vue'
import UiTextH4 from '~/components/ui/UiTextH4.vue'
import UiTextH5 from '~/components/ui/UiTextH5.vue'

definePageMeta({
  layout: 'cabinet',
  middleware: ['auth-client', 'client-check-auth'],
})

const appCore = useAppCore()

const configMap = reactive<Record<string, {
  name: string
  icon: any
  componentForm: any
}>>({
  trc20: {
    name: 'USDT TRC-20',
    icon: UiIconUsdtTrc20,
    componentForm: TabDepositFormUsdtTrc20,
  },
  erc20: {
    name: 'USDT ERC-20',
    icon: UiIconUsdtErc20,
    componentForm: TabDepositFormUsdtErc20,
  },
  btc: {
    name: 'BTC',
    icon: UiIconBTC,
    componentForm: TabDepositFormBTC,
  },
  visa_mastercard: {
    name: 'Visa / MasterCard',
    icon: UiIconVisaAndMasterCard,
    componentForm: TabDepositFormUsdtErc20,
  },
  custom_payment: {
    name: 'Custom Payment',
    icon: UiIconPayment,
    componentForm: TabDepositFormUsdtErc20,
  },
})

const paymentSystems = reactive<Array<{
  id: string
  name: string
  config_key: string
  isActive: boolean
  created_at: string
  updated_at: string
  icon: any
  componentForm: any
}>>([])

const activePaymentSystemIndex = ref(0)
const tabActiveIndex = ref(0)
const paymentSystemsListIsLoading = ref(false)

const tabsList = reactive([
  { label: 'Поповнення', component: TabDeposit },
  { label: 'Виплата',   component: TabWithdrawal },
])

const componentIs = computed(() => tabsList[tabActiveIndex.value])
const activePaymentSystem = computed(
    () => paymentSystems[activePaymentSystemIndex.value] || {}
)

function handleSelectTab(i: number) {
  tabActiveIndex.value = i
}
function handleSelectPaymentSystem(i: number) {
  activePaymentSystemIndex.value = i
}

onMounted(async () => {
  paymentSystemsListIsLoading.value = true;
  const { data } = await appCore.paymentSystems.get()
  paymentSystems.splice(0, paymentSystems.length,
      ...data.filter(x => x.isActive).map(item => {
        const cfg = configMap[item.config_key] || {}
        return {...item, ...cfg,}
      })
  )
  paymentSystemsListIsLoading.value = false;
})
</script>

<style lang="scss" scoped>
.payment-create {
  color: var(--ui-text-main);

  &__title {
    margin-bottom: 20px;
  }

  &__content {
    display: flex;
    gap: 20px;
    justify-content: space-between;

    &__left,
    &__right {
      padding: 20px;
      width: 50%;
    }

    &__left_title,
    &__right_title {
      margin-bottom: 20px;
    }

    &__left_tabs {
      justify-content: flex-end;
      margin-bottom: 20px;
    }
  }
}
</style>



<!--<template>-->
<!--  <UiContainer>-->
<!--    <div class="payment-create">-->
<!--      <UiTextH4 class="payment-create__title">Створити новий платіж</UiTextH4>-->
<!--      <div class="payment-create__content">-->

<!--        <PanelDefault class="payment-create__content__left">-->
<!--          <UiTextH5 class="payment-create__content__left_title"># Вибір платіжного способу</UiTextH5>-->
<!--          <TabsDefault-->
<!--              class="payment-create__content__left_tabs"-->
<!--              :tabsList="tabsList"-->
<!--              :active-tab-index="tabActiveIndex"-->
<!--              @select-tab="handleSelectTab"-->
<!--          />-->
<!--          <component-->
<!--              :is="componentIs.component"-->
<!--              :payment-systems-list="paymentSystems"-->
<!--              :active-payment-system-index="activePaymentSystemIndex"-->
<!--              @select="handleSelectPaymentSystem"-->
<!--          />-->
<!--        </PanelDefault>-->

<!--        <PanelDefault class="payment-create__content__right">-->
<!--           <pre>{{ paymentSystems }}</pre>-->
<!--          <component :is="activePaymentSystem.componentForm"-->
<!--          />-->
<!--        </PanelDefault>-->

<!--      </div>-->
<!--    </div>-->
<!--  </UiContainer>-->
<!--</template>-->

<!--<script lang="ts" setup>-->
<!--import { ref, computed, onMounted } from 'vue'-->
<!--import { definePageMeta } from '~/.nuxt/imports'-->
<!--import useAppCore from '~/composables/useAppCore'-->

<!--import PanelDefault from '~/components/block/panels/PanelDefault.vue'-->
<!--import TabDeposit from '~/pages/payments/create/components/TabDeposit.vue'-->
<!--import TabDepositFormBTC from '~/pages/payments/create/components/TabDepositFormBTC.vue'-->
<!--import TabDepositFormUsdtErc20 from '~/pages/payments/create/components/TabDepositFormUsdtErc20.vue'-->
<!--import TabDepositFormUsdtTrc20 from '~/pages/payments/create/components/TabDepositFormUsdtTrc20.vue'-->
<!--import TabWithdrawal from '~/pages/payments/create/components/TabWithdrawal.vue'-->
<!--import TabsDefault from '~/components/block/tabs/TabsDefault.vue'-->
<!--import UiContainer from '~/components/ui/UiContainer.vue'-->
<!--import UiIconBTC from '~/components/ui/UiIconBTC.vue'-->
<!--import UiIconPayment from '~/components/ui/UiIconPayment.vue'-->
<!--import UiIconUsdtErc20 from '~/components/ui/UiIconUsdtErc20.vue'-->
<!--import UiIconUsdtTrc20 from '~/components/ui/UiIconUsdtTrc20.vue'-->
<!--import UiIconVisaAndMasterCard from '~/components/ui/UiIconVisaAndMasterCard.vue'-->
<!--import UiTextH4 from '~/components/ui/UiTextH4.vue'-->
<!--import UiTextH5 from '~/components/ui/UiTextH5.vue'-->

<!--definePageMeta({-->
<!--  layout: 'cabinet',-->
<!--  middleware: ['auth-client', 'client-check-auth'],-->
<!--})-->

<!--const appCore = useAppCore()-->

<!--const configMap: Record<string, {-->
<!--  name: string,-->
<!--  icon: any,-->
<!--  componentForm: any-->
<!--}> = {-->
<!--  trc20: {-->
<!--    name: 'USDT TRC-20',-->
<!--    icon: UiIconUsdtTrc20,-->
<!--    componentForm: TabDepositFormUsdtTrc20,-->
<!--  },-->
<!--  erc20: {-->
<!--    name: 'USDT ERC-20',-->
<!--    icon: UiIconUsdtErc20,-->
<!--    componentForm: TabDepositFormUsdtErc20,-->
<!--  },-->
<!--  btc: {-->
<!--    name: 'BTC',-->
<!--    icon: UiIconBTC,-->
<!--    componentForm: TabDepositFormBTC,-->
<!--  },-->
<!--  visa_mastercard: {-->
<!--    name: 'Visa / MasterCard',-->
<!--    icon: UiIconVisaAndMasterCard,-->
<!--    componentForm: TabDepositFormUsdtErc20,-->
<!--  },-->
<!--  custom_payment: {-->
<!--    name: 'Custom Payment',-->
<!--    icon: UiIconPayment,-->
<!--    componentForm: TabDepositFormUsdtErc20,-->
<!--  },-->
<!--}-->

<!--const paymentSystems = ref<Array<{-->
<!--  id: string,-->
<!--  name: string,-->
<!--  config_key: string,-->
<!--  isActive: boolean,-->
<!--  created_at: string,-->
<!--  updated_at: string,-->
<!--  icon: any,-->
<!--  componentForm: any,-->
<!--}>>([])-->

<!--const activePaymentSystemIndex = ref(0)-->
<!--const tabActiveIndex = ref(0)-->

<!--const tabsList = [-->
<!--  { label: 'Поповнення', component: TabDeposit },-->
<!--  { label: 'Виплата',   component: TabWithdrawal },-->
<!--]-->

<!--const componentIs = computed(() => tabsList[tabActiveIndex.value])-->

<!--const activePaymentSystem = computed(() =>-->
<!--    paymentSystems.value[activePaymentSystemIndex.value] || {}-->
<!--)-->

<!--const handleSelectTab = (i: number) => tabActiveIndex.value = i-->
<!--const handleSelectPaymentSystem = (i: number) => activePaymentSystemIndex.value = i-->

<!--onMounted(async () => {-->
<!--  const response = await appCore.paymentSystems.get()-->
<!--  paymentSystems.value = response.data.map(item => {-->
<!--    const cfg = configMap[item.config_key] || {}-->
<!--    return {-->
<!--      ...item,-->
<!--      ...cfg,-->
<!--    }-->
<!--  })-->
<!--})-->
<!--</script>-->

<!--<style lang="scss" scoped>-->
<!--.payment-create {-->
<!--  color: var(&#45;&#45;ui-text-main);-->

<!--  &__title {-->
<!--    margin-bottom: 20px;-->
<!--  }-->

<!--  &__content {-->
<!--    display: flex;-->
<!--    gap: 20px;-->
<!--    justify-content: space-between;-->

<!--    &__left, &__right {-->
<!--      padding: 20px;-->
<!--      width: 50%;-->
<!--    }-->

<!--    &__left_title,-->
<!--    &__right_title {-->
<!--      margin-bottom: 20px;-->
<!--    }-->

<!--    &__left_tabs {-->
<!--      justify-content: flex-end;-->
<!--      margin-bottom: 20px;-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</style>-->



<!--<template>-->
<!--  <UiContainer>-->
<!--    <div class="payment-create">-->
<!--      <UiTextH4 class="payment-create__title">Создать новый платеж</UiTextH4>-->
<!--      <div class="payment-create__content">-->

<!--        <PanelDefault class="payment-create__content__left">-->
<!--          <UiTextH5 class="payment-create__content__left_title"># Выбор платежного способа</UiTextH5>-->
<!--          <TabsDefault-->
<!--              class="payment-create__content__left_tabs"-->
<!--              :tabsList="tabsList"-->
<!--              :active-tab-index="tabActiveIndex"-->
<!--              @select-tab="handleSelectTab"-->
<!--          />-->
<!--          <component-->
<!--              :active-payment-system-index="activePaymentSystemIndex"-->
<!--              :payment-systems-list="paymentSystemsList"-->
<!--              :is="componentIs.component"-->
<!--              :key="componentIs.label"-->
<!--              @select="handleSelectPaymentSystem"-->
<!--          />-->
<!--        </PanelDefault>-->

<!--        <PanelDefault class="payment-create__content__right">-->
<!--&lt;!&ndash;          <UiTextH5 class="payment-create__content__right_title">Форма оплаты</UiTextH5>&ndash;&gt;-->
<!--          <pre>-->
<!--            {{ paymentSystemsList }}-->
<!--          </pre>-->
<!--          <div>-->
<!--            <component :is="activePaymentSystemComponentIs.componentForm" />-->
<!--          </div>-->
<!--        </PanelDefault>-->

<!--      </div>-->
<!--    </div>-->
<!--  </UiContainer>-->
<!--</template>-->

<!--<script lang="ts" setup>-->
<!--import {computed, onMounted, reactive, ref} from "vue";-->
<!--import {definePageMeta} from "~/.nuxt/imports";-->

<!--import PanelDefault from "~/components/block/panels/PanelDefault.vue";-->
<!--import TabDeposit from "~/pages/payments/create/components/TabDeposit.vue";-->
<!--import TabDepositFormBTC from "~/pages/payments/create/components/TabDepositFormBTC.vue";-->
<!--import TabDepositFormUsdtErc20 from "~/pages/payments/create/components/TabDepositFormUsdtErc20.vue";-->
<!--import TabDepositFormUsdtTrc20 from "~/pages/payments/create/components/TabDepositFormUsdtTrc20.vue";-->
<!--import TabWithdrawal from "~/pages/payments/create/components/TabWithdrawal.vue";-->
<!--import TabsDefault from "~/components/block/tabs/TabsDefault.vue";-->
<!--import UiContainer from "~/components/ui/UiContainer.vue";-->
<!--import UiIconBTC from "~/components/ui/UiIconBTC.vue";-->
<!--import UiIconPayment from "~/components/ui/UiIconPayment.vue";-->
<!--import UiIconUsdtErc20 from "~/components/ui/UiIconUsdtErc20.vue";-->
<!--import UiIconUsdtTrc20 from "~/components/ui/UiIconUsdtTrc20.vue";-->
<!--import UiIconVisaAndMasterCard from "~/components/ui/UiIconVisaAndMasterCard.vue";-->
<!--import UiTextH4 from "~/components/ui/UiTextH4.vue";-->
<!--import UiTextH5 from "~/components/ui/UiTextH5.vue";-->
<!--import useAppCore from "~/composables/useAppCore";-->

<!--definePageMeta({-->
<!--  layout: "cabinet",-->
<!--  middleware: ["auth-client", "client-check-auth"],-->
<!--});-->

<!--const appCore = useAppCore();-->

<!--let activePaymentSystemIndex = ref(0);-->
<!--const paymentSystemsList = reactive([-->
<!--  {-->
<!--    name: "USDT TRC-20",-->
<!--    icon: UiIconUsdtErc20,-->
<!--    componentForm: TabDepositFormUsdtErc20-->
<!--  },-->
<!--  {-->
<!--    name: "USDT ERC-20",-->
<!--    icon: UiIconUsdtTrc20,-->
<!--    componentForm: TabDepositFormUsdtTrc20-->
<!--  },-->
<!--  {-->
<!--    name: "BTC",-->
<!--    icon: UiIconBTC,-->
<!--    componentForm: TabDepositFormBTC-->
<!--  },-->
<!--  {-->
<!--    name: "Visa / MasterCard",-->
<!--    icon: UiIconVisaAndMasterCard,-->
<!--    componentForm: TabDepositFormUsdtErc20-->
<!--  },-->
<!--  {-->
<!--    name: "Custom Payment",-->
<!--    icon: UiIconPayment,-->
<!--    componentForm: TabDepositFormUsdtErc20-->
<!--  },-->
<!--])-->

<!--const tabActiveIndex = ref(0);-->
<!--const tabsList = reactive([-->
<!--  {-->
<!--    label: 'Пополнение',-->
<!--    component: TabDeposit-->
<!--  },-->
<!--  {-->
<!--    label: 'Выплата',-->
<!--    component: TabWithdrawal-->
<!--  },-->
<!--]);-->

<!--const handleSelectTab = (index: number) => tabActiveIndex.value = index;-->

<!--const handleSelectPaymentSystem = (index: number) => activePaymentSystemIndex.value = index;-->

<!--const componentIs = computed(() => tabsList[tabActiveIndex.value])-->

<!--const activePaymentSystemComponentIs = computed(() => {-->
<!--  return paymentSystemsList[activePaymentSystemIndex.value];-->
<!--});-->

<!--const paymentSystemsConfigList = {-->
<!--  'trc20': {-->
<!--    icon: UiIconUsdtErc20,-->
<!--    componentForm: TabDepositFormUsdtTrc20,-->
<!--  },-->
<!--  'erc20': {-->
<!--    icon: UiIconUsdtTrc20,-->
<!--    componentForm: TabDepositFormUsdtTrc20,-->
<!--  },-->
<!--  'btc': {-->
<!--    icon: UiIconBTC,-->
<!--    componentForm: TabDepositFormBTC,-->
<!--  },-->
<!--  'visa_mastercard': {-->
<!--    icon: UiIconVisaAndMasterCard,-->
<!--    componentForm: TabDepositFormUsdtErc20,-->
<!--  },-->
<!--  'custom_payment': {-->
<!--    icon: UiIconPayment,-->
<!--    componentForm: TabDepositFormUsdtErc20,-->
<!--  },-->
<!--};-->

<!--onMounted(async () => {-->
<!--  const response = await appCore.paymentSystems.get()-->
<!--  const merged = response.data.map(item => ({...item, ...paymentSystemsConfigList[item.config_key]}))-->

<!--  paymentSystemsList.splice(0, paymentSystemsList.length, ...merged)-->

<!--  console.log('==============');-->
<!--  console.log(paymentSystemsList);-->
<!--})-->
<!--</script>-->

<!--<style lang="scss" scoped>-->
<!--.payment-create {-->

<!--  color: var(&#45;&#45;ui-text-main);-->

<!--  &__title {-->
<!--    margin-bottom: 20px;-->
<!--  }-->

<!--  &__content {-->
<!--    display: flex;-->
<!--    justify-content: space-between;-->
<!--    gap: 20px;-->

<!--    &__left {-->
<!--      padding: 20px;-->
<!--      width: 50%;-->

<!--      &_title {-->
<!--        margin-bottom: 20px;-->
<!--      }-->

<!--      &_tabs {-->
<!--        justify-content: flex-end;-->
<!--        margin-bottom: 20px;-->
<!--      }-->
<!--    }-->

<!--    &__right {-->
<!--      padding: 20px;-->
<!--      width: 50%;-->

<!--      &_title {-->
<!--        margin-bottom: 20px;-->
<!--      }-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</style>-->
