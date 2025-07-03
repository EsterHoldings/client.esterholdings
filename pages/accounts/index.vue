<template>
  <UiContainer>
    <div class="accounts">
      <div class="accounts__title">
        <UiTextH4>{{ t("cabinet.accounts.title") }}</UiTextH4>
      </div>

      <div class="accounts__content">
        <div class="accounts__content__options">
          <div class="accounts__content__option">
            <UiButtonDefault
              state="success"
              @click="handleClickCreateNewAccount"
            >
              {{ t("cabinet.accounts.openNew") }}</UiButtonDefault
            >
          </div>
        </div>

        <div class="accounts__content__account_item__options">
          <UiInput
            @input="handleInputSearch"
            :value="search"
            :placeholder="t('cabinet.accounts.search')"
          />
        </div>

        <div class="accounts__content__account_item__data-wrapper--header">
          <div
            class="accounts__content__account_item__data-wrapper--header__cell"
          >
            <span @click="handleOrderByAndDirection('type')">{{
              t("cabinet.accounts.columns.type")
            }}</span>
            <UiIconSort
              :active="orderBy === 'type'"
              :direction="orderDirection"
              @click="handleOrderByAndDirection('type')"
            />
          </div>

          <div
            class="accounts__content__account_item__data-wrapper--header__cell"
          >
            <span @click="handleOrderByAndDirection('leverage')">{{
              t("cabinet.accounts.columns.leverage")
            }}</span>
            <UiIconSort
              :active="orderBy === 'leverage'"
              :direction="orderDirection"
              @click="handleOrderByAndDirection('leverage')"
            />
          </div>

          <div
            class="accounts__content__account_item__data-wrapper--header__cell"
          >
            <span @click="handleOrderByAndDirection('number')">{{
              t("cabinet.accounts.columns.number")
            }}</span>
            <UiIconSort
              :active="orderBy === 'number'"
              :direction="orderDirection"
              @click="handleOrderByAndDirection('number')"
            />
          </div>

          <div
            class="accounts__content__account_item__data-wrapper--header__cell"
          >
            <span @click="handleOrderByAndDirection('balance')">{{
              t("cabinet.accounts.columns.balance")
            }}</span>
            <UiIconSort
              :active="orderBy === 'balance'"
              :direction="orderDirection"
              @click="handleOrderByAndDirection('balance')"
            />
          </div>
        </div>

        <template v-if="accounts.length === 0">
          <div class="accounts__content__nothing-to-show">
            {{ t("cabinet.accounts.nothingToShow") }}
          </div>
        </template>

        <template v-if="accounts.length > 0">
          <PanelDefault
            class="accounts__content__account_item"
            v-for="account in accounts"
            :key="account.id"
          >
            <div class="accounts__content__account_item__data-wrapper">
              <div>{{ account.account_type.name }}</div>
              <div>{{ account.leverage }}</div>
              <div>{{ account.number }}</div>
              <div>
                <UiIconUpdate
                  class="icon-update"
                  ref="iconUpdate"
                  :class="{ spinning: spinIcon }"
                  @click="handleIconClick(account.id)"
                  @animationend="onIconAnimationEnd"
                />
                <span class="balance-sum">{{ account.balance }}</span>
              </div>
            </div>
          </PanelDefault>
        </template>

        <div class="accounts__content__pagination">
          <button
            class="page-btn"
            v-if="currentPage !== 1 && total > perPage"
            @click="goPrev"
          >
            {{ t("cabinet.accounts.pagination.prev") }}
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
            {{ t("cabinet.accounts.pagination.next") }}
          </button>
        </div>
      </div>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiIconSort from "~/components/ui/UiIconSort.vue";
import useAppCore from "~/composables/useAppCore";
import { computed, onMounted, reactive, ref, inject } from "vue";
import { definePageMeta } from "~/.nuxt/imports";
import AccountsCreateNew from "~/pages/accounts/components/AccountsCreateNew.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";

definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });

const { t } = useI18n({ useScope: "global" });
const appCore = useAppCore();

const ORDER_DIRECTION_ASC = "asc";
const ORDER_DIRECTION_DESC = "desc";

const search = ref("");
const total = ref(0);
const perPage = ref(6);
const currentPage = ref(1);
const orderBy = ref("");
const orderDirection = ref(ORDER_DIRECTION_DESC);

const accounts = reactive([]);
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
  const account = accounts.find((x) => x.id === id);
  if (account) account.isSpinning = true;
};

const onIconAnimationEnd = () => {
  spinIcon.value = false;
};

const handleInputSearch = async (value) => {
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
  const response = await appCore.accounts.get({
    search: search.value,
    perPage: perPage.value,
    page: currentPage.value,
    orderBy: orderBy.value,
    orderDirection: orderDirection.value,
  });

  perPage.value = response.data.data.per_page;
  currentPage.value = response.data.data.current_page;
  total.value = response.data.data.total;
  const accountsData = response.data.data.data.map((x) => {
    x.isSpinning = false;
    return x;
  });
  accounts.splice(0, accounts.length, ...accountsData);
};

// --- --- ---

const { openModal } = inject("modalControl") as { openModal: Function };
// const { closeModal } = inject("modalControl") as { closeModal: Function };

const handleClickCreateNewAccount = () =>
  openModal(AccountsCreateNew, {
    title: t("cabinet.accounts.accounts-form.title"),
  });

onMounted(async () => {
  await loadData();
});
</script>

<style lang="scss" scoped>
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

.accounts {
  &__title {
    margin-bottom: 20px;

    h4 {
      color: var(--ui-text-main);
    }
  }

  &__content {
    &__nothing-to-show {
      height: 40vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__option {
      &s {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 20px;
      }
    }

    &__account_item__data-wrapper--header {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      color: var(--ui-text-main);
      column-gap: 20px;
      row-gap: 10px;
      padding: 20px;
      width: 100%;

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

    &__account_item {
      padding: 20px;
      width: 100%;
      margin-bottom: 10px;

      &:hover {
        background-color: var(--color-stroke-ui-dark);
      }

      &__options {
        // code...
        &.input {
          border-radius: 8px;
        }
      }

      &__data-wrapper {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
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
