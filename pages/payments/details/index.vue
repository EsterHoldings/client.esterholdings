<template>
  <UiContainer>
    <div class="payments-details">
      <div class="payments-details__title">
        <UiTextH4>Payment details</UiTextH4>
      </div>
      <PanelDefault>
        <div class="payments-details__content">

          <div class="payments-details__content__payment_item__options">
            <div class="payments-details__content__payment_item__options__search">
              <UiInput @input="handleInputSearch" :value="search" placeholder="Search" />
            </div>
            <div class="payments-details__content__payment_item__options__actions">
              <UiButtonDefault state="success--outline"
                               @click="handleClickCreateNewAccount"
              >Create new payment detail</UiButtonDefault>
            </div>
          </div>

          <div class="payments-details__content__payment_item__data-wrapper--header">

            <div class="payments-details__content__payment_item__data-wrapper--header__cell">
              <span @click="handleOrderByAndDirection('id')">Title</span>
              <UiIconSort :active="orderBy === 'id'"
                          :direction="orderDirection"
                          @click="handleOrderByAndDirection('id')"
              />
            </div>

            <div class="payments-details__content__payment_item__data-wrapper--header__cell">
              <span @click="handleOrderByAndDirection('payment_system')">Paysystem</span>
              <UiIconSort :active="orderBy === 'payment_system'"
                          :direction="orderDirection"
                          @click="handleOrderByAndDirection('payment_system')"
              />
            </div>

            <div class="payments-details__content__payment_item__data-wrapper--header__cell">
              <span  @click="handleOrderByAndDirection('currency')">Currency</span>
              <UiIconSort :active="orderBy === 'currency'"
                          :direction="orderDirection"
                          @click="handleOrderByAndDirection('currency')"
              />
            </div>

<!--            <div class="payments-details__content__payment_item__data-wrapper&#45;&#45;header__cell">-->
<!--              <span  @click="handleOrderByAndDirection('amount')">Amount</span>-->
<!--              <UiIconSort :active="orderBy === 'amount'"-->
<!--                          :direction="orderDirection"-->
<!--                          @click="handleOrderByAndDirection('amount')"-->
<!--              />-->
<!--            </div>-->

            <div class="payments-details__content__payment_item__data-wrapper--header__cell">
              <span  @click="handleOrderByAndDirection('created_at')">CreatedAt</span>
              <UiIconSort :active="orderBy === 'created_at'"
                          :direction="orderDirection"
                          @click="handleOrderByAndDirection('created_at')"
              />
            </div>

            <div class="payments-details__content__payment_item__data-wrapper--header__cell">
              <span  @click="handleOrderByAndDirection('created_at')"></span>
            </div>

          </div>

          <template v-if="payments.length === 0">
            <div class="payments-details__content__nothing-to-show">
              Nothing to show =(
            </div>
          </template>

          <template v-if="payments.length > 0">
            <div class="payments-details__content__payment_item"
                          v-for="payment in payments"
                          :key="payment.id"
            >
              <div class="payments-details__content__payment_item__data-wrapper">
<!--                <div @click="copyToClipboard(payment.id)"-->
<!--                     style="display: flex;"-->
<!--                >-->
<!--                  <UiIconCopy />-->
<!--                </div>-->
                <div>{{ payment.payment_system }}</div>
                <div>{{ payment.status }}</div>
                <div>{{ payment.currency }}</div>
<!--                <div :class="[Math.random() < 0.5 ? 'withdrawal' : 'deposit']">{{ payment.amount }}</div>-->
                <div class="date">{{ new Date(payment.created_at).toLocaleString() }}</div>
                <div>
                  <UiIconUpdate class="icon-update" ref="iconUpdate" :class="{ spinning: spinIcon }"
                                @click="handleIconClick(payment.id)" @animationend="onIconAnimationEnd" />
                </div>
              </div>
            </div>
          </template>

          <div class="payments-details__content__pagination">
            <button class="page-btn" v-if="currentPage !== 1 && total > perPage" @click="goPrev">Prev</button>

            <button v-if="visiblePages[0] > 1" class="page-link" @click="setPage(1)">1</button>
            <span v-if="visiblePages[0] > 2">...</span>

            <button v-for="page in visiblePages"
                    :key="page"
                    class="page-link"
                    :class="{ active: currentPage === page }"
                    @click="setPage(page)">
              {{ page }}
            </button>

            <span v-if="visiblePages[visiblePages.length - 1] < totalPages">...</span>
            <button v-if="visiblePages[visiblePages.length - 1] < totalPages"
                    class="page-link"
                    @click="setPage(totalPages)">
              {{ totalPages }}
            </button>

            <button class="page-btn" v-if="currentPage !== totalPages && total > perPage" @click="goNext">Next</button>
          </div>
        </div>
      </PanelDefault>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiIconSort from "~/components/ui/UiIconSort.vue";
import useAppCore from "~/composables/useAppCore";
import {computed, inject, onMounted, reactive, ref} from "vue";
import {definePageMeta} from "~/.nuxt/imports";
import UiIconCopy from "~/components/ui/UiIconCopy.vue";
import AdminsPanelAddNew from "~/pages/admin/access/components/AdminsPanelAddNew.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";

definePageMeta({
  layout: "cabinet",
  middleware: ["auth-client"]
});

const appCore = useAppCore();

const ORDER_DIRECTION_ASC = 'asc';
const ORDER_DIRECTION_DESC = 'desc';

const search = ref('');
const total = ref(0);
const perPage = ref(4);
const currentPage = ref(1);
const orderBy = ref('');
const orderDirection = ref(ORDER_DIRECTION_DESC);

const payments = reactive([]);
const spinIcon = ref(false);

const totalPages = computed(() => Math.ceil(total.value / perPage.value));

const visiblePages = computed(() => {
  const pages = [];
  const maxPagesToShow = 5;
  const half = Math.floor(maxPagesToShow / 2);

  let start = Math.max(1, currentPage.value - half);
  let end = Math.min(totalPages.value, start + maxPagesToShow - 1);

  if (end - start < maxPagesToShow - 1) {
    start = Math.max(1, end - maxPagesToShow + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

async function setPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    await loadData();
  }
}

async function goPrev() {
  if (currentPage.value > 1) {
    currentPage.value--;
    await loadData();
  }
}

async function goNext() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    await loadData();
  }
}

const handleIconClick = (id: string) => {
  const payment = payments.find(x => x.id === id);
  if (payment) payment.isSpinning = true;
};

const onIconAnimationEnd = () => {
  spinIcon.value = false;
};

const handleInputSearch = async (event) => {
  search.value = event.target.value;
  currentPage.value = 1;
  await loadData();
};

const handleOrderByAndDirection = async (value) => {
  orderDirection.value = orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC;
  orderBy.value = value;
  await loadData();
};

const loadData = async () => {
  const response = await appCore.payments.get({
    search: search.value,
    perPage: perPage.value,
    page: currentPage.value,
    orderBy: orderBy.value,
    orderDirection: orderDirection.value,
  });

  perPage.value = response.data.data.per_page;
  currentPage.value = response.data.data.current_page;
  total.value = response.data.data.total;

  const paymentsData = response.data.data.data.map(x => { x.isSpinning = false; return x; });
  payments.splice(0, payments.length, ...paymentsData);
};

const shortId = (uuid: string) => {
  return uuid.split('-').pop()
}

const copyToClipboard = (paymentId) => {
  const id = shortId(paymentId)
  navigator.clipboard.writeText(id)
}

// --- --- ---

// const { closeModal } = inject("modalControl") as { closeModal: Function };
const { openModal } = inject("modalControl") as { openModal: Function };

const handleClickCreateNewAccount = () =>
    openModal(AdminsPanelAddNew, { title: "Add new Admin" });

onMounted(async () => {
  await loadData();
});
</script>

<style lang="scss" scoped>

.date {
  width: 140px;
  font-size: 14px;
}

.withdrawal {
  font-weight: bold;
  color: var(--color-success);
}

.deposit {
  font-weight: bold;
  color: var(--color-danger);
}

.icon-update {
  height: 14px;
  width: 14px;
  margin-right: 10px;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    animation: wiggle 0.2s ease;
  }
}

.icon-update.spinning {
  animation: spin 0.5s linear;
}

.balance-sum {
  cursor: pointer;
}

.wiggle:hover {
  animation: wiggle 0.3s ease;
}

/* ========== KEYFRAMES ========== */

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes wiggle {
  0% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-2px);
  }
  40% {
    transform: translateX(2px);
  }
  60% {
    transform: translateX(-2px);
  }
  80% {
    transform: translateX(2px);
  }
  100% {
    transform: translateX(0);
  }
}

.payments-details {
  padding-bottom: 40px;

  &__title {
    margin-bottom: 20px;
  }

  &__content {
    padding: 20px;

    &__nothing-to-show {
      height: 40vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__payment_item__data-wrapper--header {
      display: grid;
      //grid-template-columns: 80px 1fr 1fr 1fr 1fr 1fr 1fr;
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
      column-gap: 20px;
      row-gap: 10px;
      padding: 20px;
      width: 100%;

      &> div:last-child {
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      &__cell {
        display: flex;
        align-items: center;
        justify-content: flex-start;

        span {
          cursor: default;

          &:first-child {
            margin-right: 10px;
          }
        }
      }
    }

    &__payment_item {
      padding: 20px;
      width: 100%;
      border-bottom: 1px solid var(--color-stroke-ui-dark);

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background-color: var(--color-stroke-ui-dark);
        border-bottom: 1px solid var(--color-ui-primary);
      }

      &__options {
        display: flex;
        align-items: center;
        justify-content: space-between;

        &__search {
          .input {
            border-radius: var(--ui-border--raduis);
            min-width: 400px;
          }
        }

        &__actions {
          // code...
        }
      }

      &__data-wrapper {
        display: grid;
        //grid-template-columns: 80px 1fr 1fr 1fr 1fr 1fr 1fr;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
        column-gap: 20px;
        row-gap: 10px;
        align-items: center;

        > div:first-child {
          color: var(--color-ui-accent);
          font-weight: bold;
        }

        > div:last-child {
          text-align: right;
          font-size: 20px;
          font-weight: bold;
        }
      }
    }

    &__pagination {
      margin-top: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      .page-btn, .page-link {
        border: 1px solid var(--color-ui-border);
        background: var(--color-ui-background);
        cursor: pointer;
        font-size: 14px;
        border-radius: 5px;
        color: white;
        height: 22px;
        min-width: 22px;
        padding: 0 5px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .page-link.active {
        background: var(--color-ui-accent);
        color: #fff;
        border-color: var(--color-ui-accent);
      }
    }
  }
}
</style>