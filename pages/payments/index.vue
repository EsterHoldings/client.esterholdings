<template>
  <UiContainer>

    <div class="payments__title">
      <UiTextH4>{{ t("cabinet.billing.title") }}</UiTextH4>
    </div>

    <PanelDefault class="payments__wrapper">
      <div class="payments">
        <div class="payments__content">

          <div class="payments__content__options">

            <div class="payments__content__search">
              <UiInput
                  @input="handleInputSearch"
                  :value="search"
                  :placeholder="t('cabinet.billing.search')"
              />
            </div>

            <div class="payments__content__option">
              <NuxtLink to="/payments/create">
                <UiButtonDefault state="success">{{ t("cabinet.billing.create") }}</UiButtonDefault>
              </NuxtLink>

            </div>
          </div>

          <div class="payments__content__payment_item__data-wrapper--header">
            <div
                class="payments__content__payment_item__data-wrapper--header__cell"
            >
              <span @click="handleOrderByAndDirection('id')">{{ t("cabinet.billing.columns.id") }}</span>
              <UiIconSort
                  :active="orderBy === 'id'"
                  :direction="orderDirection"
                  @click="handleOrderByAndDirection('id')"
              />
            </div>

            <div class="payments__content__payment_item__data-wrapper--header__cell">
              <span @click="handleOrderByAndDirection('payment_system')">
                {{ t("cabinet.billing.columns.paysystem") }}
              </span>
              <UiIconSort
                  :active="orderBy === 'payment_system'"
                  :direction="orderDirection"
                  @click="handleOrderByAndDirection('payment_system')"
              />
            </div>

            <div class="payments__content__payment_item__data-wrapper--header__cell">
              <span @click="handleOrderByAndDirection('status')">
                {{ t("cabinet.billing.columns.status") }}
              </span>
              <UiIconSort
                  :active="orderBy === 'status'"
                  :direction="orderDirection"
                  @click="handleOrderByAndDirection('status')"
              />
            </div>

            <div class="payments__content__payment_item__data-wrapper--header__cell">
              <span @click="handleOrderByAndDirection('currency')">
                {{ t("cabinet.billing.columns.currency") }}
              </span>
              <UiIconSort
                  :active="orderBy === 'currency'"
                  :direction="orderDirection"
                  @click="handleOrderByAndDirection('currency')"
              />
            </div>

            <div class="payments__content__payment_item__data-wrapper--header__cell">
              <span @click="handleOrderByAndDirection('amount')">
                {{ t("cabinet.billing.columns.amount") }}
              </span>
              <UiIconSort
                  :active="orderBy === 'amount'"
                  :direction="orderDirection"
                  @click="handleOrderByAndDirection('amount')"
              />
            </div>

            <div class="payments__content__payment_item__data-wrapper--header__cell">
              <span @click="handleOrderByAndDirection('created_at')">
                {{ t("cabinet.billing.columns.createdAt") }}
              </span>
              <UiIconSort
                  :active="orderBy === 'created_at'"
                  :direction="orderDirection"
                  @click="handleOrderByAndDirection('created_at')"
              />
            </div>

            <div class="payments__content__payment_item__data-wrapper--header__cell">
              <span @click="handleOrderByAndDirection('created_at')"></span>
            </div>
          </div>

          <template v-if="payments.length === 0">
            <div class="payments__content__nothing-to-show">
              <span v-if="!isLoading">{{t("cabinet.billing.nothingToShow")}}</span>
              <UiIconSpinnerDefault v-if="isLoading" />
            </div>
          </template>

          <template v-if="payments.length > 0">
            <PanelDefault
                class="payments__content__payment_item"
                v-for="payment in payments"
                :key="payment.id"
            >
              <div class="payments__content__payment_item__data-wrapper">
                <div @click="copyToClipboard(payment.id)" style="display: flex">
                  <UiIconCopy/>
                  <span style="margin-left: 5px; font-size: 12px">{{ shortId(payment.id) }}</span>
                </div>
                <div>{{ payment.payment_system }}</div>
                <div>{{ payment.status }}</div>
                <div>{{ payment.currency }}</div>
                <div :class="[Math.random() < 0.5 ? 'withdrawal' : 'deposit']">
                  {{ payment.amount }}
                </div>
                <div class="date">
                  {{ new Date(payment.created_at).toLocaleString() }}
                </div>
                <div>
                  <UiIconUpdate
                      class="icon-update"
                      ref="iconUpdate"
                      :class="{ spinning: spinIcon }"
                      @click="handleIconClick(payment.id)"
                      @animationend="onIconAnimationEnd"
                  />
                </div>
              </div>
            </PanelDefault>
          </template>

          <div class="payments__content__pagination">
            <button
                class="page-btn"
                v-if="currentPage !== 1 && total > perPage"
                @click="goPrev"
            >
              {{ t("cabinet.billing.pagination.prev") }}
            </button>

            <button
                v-if="visiblePages[0] > 1"
                class="page-link"
                @click="setPage(1)"
            >
              1
            </button>
            <span v-if="visiblePages[0] > 2">...</span>

            <button
                v-for="page in visiblePages"
                :key="page"
                class="page-link"
                :class="{ active: currentPage === page }"
                @click="setPage(page)"
            >
              {{ page }}
            </button>

            <span v-if="visiblePages[visiblePages.length - 1] < totalPages"
            >...</span
            >
            <button
                v-if="visiblePages[visiblePages.length - 1] < totalPages"
                class="page-link"
                @click="setPage(totalPages)"
            >
              {{ totalPages }}
            </button>

            <button
                class="page-btn"
                v-if="currentPage !== totalPages && total > perPage"
                @click="goNext"
            >
              {{ t("cabinet.billing.pagination.next") }}
            </button>
          </div>
        </div>
      </div>
    </PanelDefault>
  </UiContainer>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import {computed, onMounted, reactive, ref} from "vue";
import {definePageMeta} from "~/.nuxt/imports";

import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiIconSort from "~/components/ui/UiIconSort.vue";
import useAppCore from "~/composables/useAppCore";
import UiIconCopy from "~/components/ui/UiIconCopy.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import {isLoading} from "~/pages/admin/accounts/composables";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";


definePageMeta({
  layout: "cabinet",
  middleware: ["auth-client", "client-check-auth"],
});

const {t} = useI18n({useScope: "global"});
const appCore = useAppCore();

const ORDER_DIRECTION_ASC = "asc";
const ORDER_DIRECTION_DESC = "desc";

const search = ref("");
const total = ref(0);
const perPage = ref(4);
const currentPage = ref(1);
const orderBy = ref("");
const orderDirection = ref(ORDER_DIRECTION_DESC);
const isLoading = ref(false)

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
  const payment = payments.find((x) => x.id === id);
  if (payment) payment.isSpinning = true;
};

const onIconAnimationEnd = () => {
  spinIcon.value = false;
};

const handleInputSearch = async (value:any) => {
  search.value = value;
  currentPage.value = 1;
  await loadData();
};

const handleOrderByAndDirection = async (value) => {
  orderDirection.value =
      orderDirection.value === ORDER_DIRECTION_ASC
          ? ORDER_DIRECTION_DESC
          : ORDER_DIRECTION_ASC;
  orderBy.value = value;
  await loadData();
};

const loadData = async () => {
  isLoading.value = true;
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

  const paymentsData = response.data.data.data.map((x) => {
    x.isSpinning = false;
    return x;
  });
  payments.splice(0, payments.length, ...paymentsData);
  isLoading.value = false;
};

const shortId = (uuid: string) => {
  return uuid.split("-").pop();
};

const copyToClipboard = (paymentId) => {
  const id = shortId(paymentId);
  navigator.clipboard.writeText(id);
};

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

.payments {
  padding-bottom: 40px;

  &__wrapper {
    padding: 20px;
  }

  &__title {
    margin-bottom: 20px;

    h4 {
      color: var(--ui-text-main);
    }
  }

  &__content {

    &__search {
      width: 400px;
    }

    &__nothing-to-show {
      height: 40vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__option {
      &s {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }
    }

    &__payment_item__data-wrapper--header {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
      column-gap: 20px;
      row-gap: 10px;
      padding: 20px;
      width: 100%;
      color: var(--ui-text-main);

      & > div:last-child {
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
      margin-bottom: 10px;

      &:hover {
        background-color: var(--color-stroke-ui-dark);
      }

      &__options {
        // code...
        &.input {
          border-radius: var(--ui-border--raduis);
        }
      }

      &__data-wrapper {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
        column-gap: 20px;
        row-gap: 10px;
        align-items: center;
        color: var(--ui-text-main);

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

      .page-btn,
      .page-link {
        padding: 6px 12px;
        border: 1px solid var(--color-ui-border);
        background: var(--ui-background);
        cursor: pointer;
        font-size: 14px;
        border-radius: 4px;
        color: var(--ui-text-main);
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
