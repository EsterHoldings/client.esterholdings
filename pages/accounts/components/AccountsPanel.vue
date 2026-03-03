<!-- pages/accounts/components/AccountsPanel.vue -->
<template>
  <div>
    <PageStructureContent
      v-if="!isInitialLoading && accounts.length > 0"
      :plain="viewMode !== 'table'">
      <template #top>
        <div class="cabinet-controls-row">
          <div class="cabinet-controls-row__left">
            <UiInput
              class="w-full"
              @input="handleInputSearch"
              :value="search"
              :placeholder="t('cabinet.accounts.search')">
              <template #icon-left>
                <UiIconSearch />
              </template>
            </UiInput>

            <UiButtonDefault
              state="info--small"
              class="!w-[44px]"
              @click="handleClickUpdate">
              <UiIconUpdate :spinning="isLoading" />
            </UiButtonDefault>
          </div>

          <div class="cabinet-controls-row__right">
            <UiSelect
              class="w-full min-w-[180px] sm:w-[200px]"
              :value="orderBy"
              :data="sortByFilterData"
              :withoutNoSelect="true"
              @change="handleChangeFilterSortBy">
              <template #icon-left>
                <UiIconSortBy
                  class="mr-2 !w-[16px] !h-[16px]"
                  :orderDirectionEnabled="true"
                  :orderDirection="orderDirection" />
              </template>
            </UiSelect>

            <ViewModeToggle
              v-if="!isMobileViewport"
              class="w-full sm:w-auto"
              bordered
              :modelValue="viewMode"
              :options="viewOptions"
              @update:modelValue="handleChangeViewMode" />
          </div>
        </div>
      </template>

      <template #content>
        <template v-if="viewMode === 'table'">
          <TableMain ref="tableRef">
            <template #thead>
              <tr>
                <th class="px-4 py-2 text-left font-normal">
                  <div class="flex items-center justify-start gap-2">
                    <UiTextSmall
                      class="cursor-pointer"
                      @click="handleOrderByAndDirection('number')">
                      {{ t("cabinet.accounts.columns.number") }}
                    </UiTextSmall>
                    <UiIconSort
                      :active="orderBy === 'number'"
                      :direction="orderDirection"
                      @click="handleOrderByAndDirection('number')" />
                  </div>
                </th>

                <th class="px-5 py-2 text-right font-normal">
                  <div class="table-account-right-head">
                    <UiTextSmall class="table-account-col table-account-col--type whitespace-nowrap">
                      {{ t("cabinet.accounts.columns.type") }}
                    </UiTextSmall>
                    <UiTextSmall class="table-account-col table-account-col--leverage whitespace-nowrap">
                      {{ t("cabinet.accounts.columns.leverage") }}
                    </UiTextSmall>
                    <div class="table-account-col table-account-col--balance table-account-balance-head">
                      <UiTextSmall
                        class="cursor-pointer whitespace-nowrap"
                        @click="handleOrderByAndDirection('balance')">
                        {{ t("cabinet.accounts.columns.balance") }}
                      </UiTextSmall>
                      <UiIconSort
                        :active="orderBy === 'balance'"
                        :direction="orderDirection"
                        @click="handleOrderByAndDirection('balance')" />
                    </div>
                    <span
                      class="table-account-col table-account-col--actions"
                      aria-hidden="true"></span>
                  </div>
                </th>
              </tr>
            </template>

            <template #tbody>
              <div
                v-if="isLoading"
                class="backdrop-blur-[2px] w-full absolute bottom-0 top-[45px] flex items-center justify-center z-10">
                <UiIconSpinnerDefault />
              </div>

              <template v-if="accounts.length > 0">
                <tr
                  v-for="(account, index) in accounts"
                  :key="account.id"
                  class="table-account-row border-t border-[var(--color-ui-border)] hover:bg-[var(--color-stroke-ui-dark)] cursor-pointer"
                  @click="handleOpenAccount(account.id)">
                  <td class="px-4 py-3 align-middle">
                    <div class="flex items-center gap-2 min-w-0">
                      <button
                        class="flex h-8 w-8 items-center justify-center rounded-md transition text-[var(--ui-text-secondary)]"
                        type="button"
                        :aria-pressed="account.is_favorite"
                        :title="account.is_favorite ? 'Remove from favorites' : 'Add to favorites'"
                        @click.stop="handleToggleFavorite(account)">
                        <svg
                          viewBox="0 0 24 24"
                          class="h-4 w-4"
                          :fill="account.is_favorite ? 'var(--ui-primary-accent)' : 'none'"
                          :stroke="account.is_favorite ? 'var(--ui-primary-accent)' : 'var(--ui-text-secondary)'"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          aria-hidden="true">
                          <path
                            d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      </button>
                      <span @click.stop>
                        <UiIconCopy :text="account.number" />
                      </span>
                      <span class="table-account-number">{{ account.number }}</span>
                    </div>
                  </td>
                  <td class="px-5 py-3 align-middle">
                    <div class="table-account-right-cell">
                      <span class="table-account-col table-account-col--type table-account-type">{{
                        account.account_type.name
                      }}</span>
                      <span class="table-account-col table-account-col--leverage table-account-leverage">{{
                        getLeverageDisplay(account)
                      }}</span>
                      <div class="table-account-col table-account-col--balance table-account-balance">
                        <span
                          class="cursor-pointer"
                          :class="getBalanceHighlightClass(account.id)">
                          $ {{ account.balance }}
                        </span>
                        <button
                          type="button"
                          class="refresh-balance-btn"
                          :disabled="isBalanceRefreshing(account.id)"
                          title="Refresh balance"
                          @click.stop="refreshAccountBalance(account)">
                          <UiIconUpdate
                            class="h-[14px] w-[14px]"
                            :spinning="isBalanceRefreshing(account.id)" />
                        </button>
                      </div>
                      <button
                        type="button"
                        @click.stop="toggleRowOptions(index)"
                        class="table-account-col table-account-col--actions relative flex items-center justify-center h-[32px] w-[32px] rounded-md hover:border-[var(--color-stroke-ui-light)] border border-transparent transition-colors transition-opacity cursor-pointer"
                        :ref="el => (triggerRefs[index] = el as HTMLElement)"
                        aria-label="Open menu">
                        <UiIconDotsVertical />
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
          </TableMain>
          <Teleport to="body">
            <div
              v-if="activeTableAccount"
              ref="tableMenuRef"
              class="card-menu"
              :style="tableMenuStyle">
              <button
                class="card-menu__item"
                type="button">
                <UiIconPayment class="!h-4 !w-4 text-[var(--ui-text-main)] stroke-[var(--ui-sticker-success)]" />
                <UiTextSmall class="whitespace-nowrap">{{
                  t("cabinet.accounts.actions.deposit") || "Deposit"
                }}</UiTextSmall>
              </button>
              <button
                class="card-menu__item"
                type="button">
                <UiIconWithdraw class="!h-4 !w-4 text-[var(--ui-text-main)]" />
                <UiTextSmall class="whitespace-nowrap">{{
                  t("cabinet.accounts.actions.withdraw") || "Withdraw"
                }}</UiTextSmall>
              </button>
              <button
                class="card-menu__item"
                type="button"
                @click="handleClickTransfer(activeTableAccount.id)">
                <UiIconTransfer class="!h-4 !w-4 text-[var(--ui-text-main)]" />
                <UiTextSmall class="whitespace-nowrap">{{
                  t("cabinet.accounts.actions.transfer") || "Transfer"
                }}</UiTextSmall>
              </button>
              <button
                class="card-menu__item"
                type="button"
                @click="handleClickHistory(activeTableAccount.id)">
                <UiIconHistory class="!h-4 !w-4 text-[var(--ui-text-main)]" />
                <UiTextSmall class="whitespace-nowrap">{{
                  t("cabinet.accounts.actions.history") || "History"
                }}</UiTextSmall>
              </button>
              <button
                class="card-menu__item"
                type="button">
                <UiIconUpdate class="!h-4 !w-4 text-[var(--ui-text-main)]" />
                <UiTextSmall class="whitespace-nowrap">{{
                  t("cabinet.accounts.actions.changeType") || "Change type"
                }}</UiTextSmall>
              </button>
              <button
                class="card-menu__item"
                type="button"
                @click="handleClickDelete(activeTableAccount.id)">
                <UiIconTrash class="!h-4 !w-4 text-[var(--ui-text-main)] stroke-[var(--ui-sticker-danger)]" />
                <UiTextSmall class="whitespace-nowrap">{{
                  t("cabinet.accounts.actions.remove") || "Remove"
                }}</UiTextSmall>
              </button>
            </div>
          </Teleport>
        </template>

        <div
          v-else
          class="relative">
          <div
            class="backdrop-blur-[2px] w-full absolute inset-0 flex items-center justify-center z-10"
            v-if="isLoading && !isInitialLoading">
            <UiIconSpinnerDefault />
          </div>

          <div
            class="grid gap-3"
            :class="viewMode === 'full' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'">
            <div
              v-for="account in accounts"
              :key="account.id"
              :class="['cabinet-card card-with-actions', cardMenuOpenId === account.id ? 'card-open' : '']"
              role="button"
              tabindex="0"
              :aria-label="`Open account ${account.number}`"
              @click="handleOpenAccount(account.id)"
              @keydown.enter.prevent="handleOpenAccount(account.id)"
              @keydown.space.prevent="handleOpenAccount(account.id)">
              <div class="card-actions">
                <button
                  type="button"
                  class="menu-btn"
                  :aria-pressed="account.is_favorite"
                  :title="account.is_favorite ? 'Remove from favorites' : 'Add to favorites'"
                  @click.stop="handleToggleFavorite(account)">
                  <svg
                    viewBox="0 0 24 24"
                    class="h-4 w-4"
                    :fill="account.is_favorite ? 'var(--ui-primary-accent)' : 'none'"
                    :stroke="account.is_favorite ? 'var(--ui-primary-accent)' : 'var(--ui-text-secondary)'"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true">
                    <path
                      d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </button>
                <button
                  class="menu-btn copy-btn"
                  aria-label="Copy number">
                  <UiIconCopy :text="account.number" />
                </button>
                <button
                  type="button"
                  class="menu-btn action-btn card-menu-trigger"
                  @click.stop="toggleCardMenu(account.id)"
                  :ref="el => (cardMenuTriggerRefs[account.id] = el as HTMLElement | null)"
                  aria-label="Open menu">
                  <UiIconDotsVertical class="h-4 w-4" />
                </button>

                <Teleport to="body">
                  <div
                    v-if="cardMenuOpenId === account.id"
                    :ref="setCardMenuRef"
                    class="card-menu"
                    :style="cardMenuStyle">
                    <button
                      class="card-menu__item"
                      type="button">
                      <UiIconPayment class="!h-4 !w-4 text-[var(--ui-text-main)] stroke-[var(--ui-sticker-success)]" />
                      <UiTextSmall class="whitespace-nowrap">{{
                        t("cabinet.accounts.actions.deposit") || "Deposit"
                      }}</UiTextSmall>
                    </button>
                    <button
                      class="card-menu__item"
                      type="button">
                      <UiIconWithdraw class="!h-4 !w-4 text-[var(--ui-text-main)]" />
                      <UiTextSmall class="whitespace-nowrap">{{
                        t("cabinet.accounts.actions.withdraw") || "Withdraw"
                      }}</UiTextSmall>
                    </button>
                    <button
                      class="card-menu__item"
                      type="button"
                      @click="handleClickTransfer(account.id)">
                      <UiIconTransfer class="!h-4 !w-4 text-[var(--ui-text-main)]" />
                      <UiTextSmall class="whitespace-nowrap">{{
                        t("cabinet.accounts.actions.transfer") || "Transfer"
                      }}</UiTextSmall>
                    </button>
                    <button
                      class="card-menu__item"
                      type="button"
                      @click="handleClickHistory(account.id)">
                      <UiIconHistory class="!h-4 !w-4 text-[var(--ui-text-main)]" />
                      <UiTextSmall class="whitespace-nowrap">{{
                        t("cabinet.accounts.actions.history") || "History"
                      }}</UiTextSmall>
                    </button>
                    <button
                      class="card-menu__item"
                      type="button">
                      <UiIconUpdate class="!h-4 !w-4 text-[var(--ui-text-main)]" />
                      <UiTextSmall class="whitespace-nowrap">{{
                        t("cabinet.accounts.actions.changeType") || "Change type"
                      }}</UiTextSmall>
                    </button>
                    <button
                      class="card-menu__item"
                      type="button"
                      @click="handleClickDelete(account.id)">
                      <UiIconTrash class="!h-4 !w-4 text-[var(--ui-text-main)] stroke-[var(--ui-sticker-danger)]" />
                      <UiTextSmall class="whitespace-nowrap">{{
                        t("cabinet.accounts.actions.remove") || "Remove"
                      }}</UiTextSmall>
                    </button>
                  </div>
                </Teleport>
              </div>

              <div class="cabinet-card__header">
                <div class="cabinet-card__head-main">
                  <UiTextSmall class="cabinet-card__eyebrow">
                    {{ t("cabinet.accounts.columns.number") }}
                  </UiTextSmall>
                  <div class="cabinet-card__title">#{{ account.number }}</div>
                  <div class="cabinet-card__subtitle">{{ account.account_type.name }}</div>
                </div>

                <div class="cabinet-card__head-side">
                  <div class="account-balance-block">
                    <UiTextSmall class="cabinet-card__eyebrow">
                      {{ t("cabinet.accounts.columns.balance") }}
                    </UiTextSmall>
                    <div class="account-balance-block__value">
                      <span :class="getBalanceHighlightClass(account.id)">${{ account.balance }}</span>
                      <button
                        type="button"
                        class="refresh-balance-btn"
                        @click.stop="refreshAccountBalance(account)"
                        :disabled="isBalanceRefreshing(account.id)"
                        title="Refresh balance">
                        <UiIconUpdate
                          class="h-[14px] w-[14px]"
                          :spinning="isBalanceRefreshing(account.id)" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="cabinet-card__grid"
                :class="viewMode === 'full' ? 'cabinet-card__grid--full' : ''">
                <div class="cabinet-card__field">
                  <UiTextSmall class="cabinet-card__label">
                    {{ t("cabinet.accounts.columns.type") }}
                  </UiTextSmall>
                  <div class="cabinet-card__value">{{ account.account_type.name }}</div>
                </div>
                <div class="cabinet-card__field">
                  <UiTextSmall class="cabinet-card__label">
                    {{ t("cabinet.accounts.columns.leverage") }}
                  </UiTextSmall>
                  <div class="cabinet-card__value">{{ getLeverageDisplay(account) }}</div>
                </div>
                <div
                  v-if="viewMode === 'full'"
                  class="cabinet-card__field">
                  <UiTextSmall class="cabinet-card__label">ID</UiTextSmall>
                  <div
                    class="cabinet-card__value truncate"
                    :title="account.id">
                    {{ account.id }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </PageStructureContent>

    <template v-if="!isInitialLoading && accounts.length === 0">
      <div class="accounts-empty-state">
        <div class="accounts-empty-state__icon-wrap">
          <UiIconCardCheck class="accounts-empty-state__icon" />
        </div>
        <div class="accounts-empty-state__title">
          {{ currentEmptyTitle }}
        </div>
        <UiTextSmall class="accounts-empty-state__subtitle">
          {{ currentEmptySubtitle }}
        </UiTextSmall>
        <UiTextSmall
          v-if="showBlockedNotice"
          class="accounts-empty-state__warning">
          {{ props.accountCreationBlockedReason }}
        </UiTextSmall>

        <UiButtonDefault
          v-if="!isVerificationRequired"
          state="success--outline"
          class="accounts-empty-state__button"
          :disabled="!props.canCreateAccount"
          @click="handleClickCreateNewAccount">
          {{ openAccountLabel }}
          &nbsp;
          <UiIconSuccess />
        </UiButtonDefault>
        <UiButtonDefault
          v-else
          state="info--outline"
          class="accounts-empty-state__button"
          @click="handleClickGoToVerification">
          {{ verifyActionLabel }}
        </UiButtonDefault>
      </div>
    </template>

    <template v-if="isInitialLoading">
      <div class="flex min-h-[55vh] w-full flex-col items-center justify-center">
        <UiIconLogo class="mb-4 h-[44px] w-[44px]" />
        <UiIconSpinnerDefault class="h-[44px] w-[44px]" />
      </div>
    </template>

    <PaginationMain
      v-if="!isInitialLoading && accounts.length > 0"
      class="px-5 py-2"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total="total"
      :per-page="perPage"
      :visible-pages="visiblePages"
      :per-page-options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 50, 100]"
      @go-prev="goPrev"
      @go-next="goNext"
      @set-page="setPage"
      @set-per-page="handleSetPerPage" />
  </div>
</template>

<script lang="ts" setup>
  import AccountsCreateNew from "~/pages/accounts/components/AccountsCreateNew.vue";

  import PageStructureContent from "~/components/block/pages/PageStructureContent.vue";
  import PaginationMain from "~/components/block/paginations/PaginationMain.vue";
  import TableMain from "~/components/block/tables/TableMain.vue";

  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconHistory from "~/components/ui/UiIconHistory.vue";
  import UiIconPayment from "~/components/ui/UiIconPayment.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import UiIconSort from "~/components/ui/UiIconSort.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
  import UiIconTransfer from "~/components/ui/UiIconTransfer.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import { computed, inject, onMounted, reactive, ref, nextTick, onBeforeUnmount, watch, h } from "vue";
  import { navigateTo, useLocalePath } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import UiIconSearch from "~/components/ui/UiIconSearch.vue";
  import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";
  import UiIconWithdraw from "~/components/ui/UiIconWithdraw.vue";
  import UiIconTrash from "~/components/ui/UiIconTrash.vue";
  import UiIconLogo from "~/components/ui/UiIconLogo.vue";
  import UiIconCardCheck from "~/components/ui/UiIconCardCheck.vue";
  import ViewModeToggle from "~/components/block/controls/ViewModeToggle.vue";

  const isInitialLoading = ref(true);
  const props = withDefaults(
    defineProps<{
      canCreateAccount?: boolean;
      accountCreationBlockedReason?: string;
      isEligibilityLoaded?: boolean;
    }>(),
    {
      canCreateAccount: true,
      accountCreationBlockedReason: "",
      isEligibilityLoaded: false,
    }
  );

  const { t } = useI18n({ useScope: "global" });
  const appCore = useAppCore();
  const localePath = useLocalePath();

  const ORDER_DIRECTION_ASC = "asc";
  const ORDER_DIRECTION_DESC = "desc";
  const VIEW_MODE_STORAGE_KEY = "accountsViewMode";

  const toast = useToast();

  const isLoading = ref(true);

  const search = ref("");
  const total = ref(0);
  const perPage = ref(7);
  const currentPage = ref(1);
  const orderBy = ref("balance");
  const orderDirection = ref(ORDER_DIRECTION_DESC);
  const currentRowActiveOptions = ref<number | null>(null);
  const isMobileViewport = ref(false);

  const sortByFilterData = reactive([
    { id: "number", value: "number", text: "Number" },
    { id: "balance", value: "balance", text: "Balance" },
  ]);

  const accounts = reactive<any[]>([]);
  const refreshingBalanceIds = reactive<Record<string, boolean>>({});
  type BalanceChangeDirection = "up" | "down" | "same";
  const balanceHighlightById = reactive<Record<string, BalanceChangeDirection | undefined>>({});
  const balanceHighlightTimers = new Map<string, ReturnType<typeof setTimeout>>();
  const tableMenuStyle = ref<Record<string, string>>({});
  const tableMenuRef = ref<HTMLElement | null>(null);
  const cardMenuOpenId = ref<string | number | null>(null);
  const cardMenuStyle = ref<Record<string, string>>({});
  const cardMenuRef = ref<HTMLElement | null>(null);
  const cardMenuTriggerRefs = reactive<Record<string | number, HTMLElement | null>>({});
  const activeTableAccount = computed(() =>
    currentRowActiveOptions.value === null ? null : (accounts[currentRowActiveOptions.value] ?? null)
  );
  const viewMode = ref<"table" | "cards" | "full">("table");
  const viewOptions = [
    {
      value: "table" as const,
      label: t("cabinet.billing.view.list") || "List",
      icon: {
        render() {
          return h(
            "svg",
            {
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              h("line", { x1: "8", y1: "6", x2: "21", y2: "6" }),
              h("line", { x1: "3", y1: "6", x2: "4", y2: "6" }),
              h("line", { x1: "8", y1: "12", x2: "21", y2: "12" }),
              h("line", { x1: "3", y1: "12", x2: "4", y2: "12" }),
              h("line", { x1: "8", y1: "18", x2: "21", y2: "18" }),
              h("line", { x1: "3", y1: "18", x2: "4", y2: "18" }),
            ]
          );
        },
      },
    },
    {
      value: "cards" as const,
      label: t("cabinet.billing.view.cards") || "Cards",
      icon: {
        render() {
          return h(
            "svg",
            {
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              h("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1" }),
              h("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1" }),
              h("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" }),
              h("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1" }),
            ]
          );
        },
      },
    },
    {
      value: "full" as const,
      label: t("cabinet.billing.view.full") || "Full width",
      icon: {
        render() {
          return h(
            "svg",
            {
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
            },
            [
              h("rect", { x: "3", y: "6", width: "18", height: "4", rx: "1" }),
              h("rect", { x: "3", y: "14", width: "18", height: "4", rx: "1" }),
            ]
          );
        },
      },
    },
  ];

  const totalPages = computed(() => Math.ceil(total.value / perPage.value));

  const visiblePages = computed(() => {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);

    let start = Math.max(1, currentPage.value - half);
    let end = Math.min(totalPages.value, start + maxPagesToShow - 1);

    if (end - start < maxPagesToShow - 1) {
      start = Math.max(1, end - maxPagesToShow + 1);
    }

    for (let i = start; i <= end; i++) pages.push(i);
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

  const refreshKey = (id: string | number) => String(id);
  const isBalanceRefreshing = (id: string | number) => !!refreshingBalanceIds[refreshKey(id)];
  const normalizeBalanceValue = (value: unknown): number | null => {
    const parsed = Number.parseFloat(String(value).replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  };
  const clearTimer = (timers: Map<string, ReturnType<typeof setTimeout>>, key: string) => {
    const timer = timers.get(key);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.delete(key);
    }
  };
  const setBalanceHighlight = (id: string | number, direction: BalanceChangeDirection) => {
    const key = refreshKey(id);
    clearTimer(balanceHighlightTimers, key);
    balanceHighlightById[key] = direction;
    const timer = setTimeout(() => {
      delete balanceHighlightById[key];
      balanceHighlightTimers.delete(key);
    }, 1000);
    balanceHighlightTimers.set(key, timer);
  };
  const getBalanceHighlightClass = (id: string | number) => {
    const state = balanceHighlightById[refreshKey(id)];
    if (state === "up") return "balance-highlight-up";
    if (state === "down") return "balance-highlight-down";
    if (state === "same") return "balance-highlight-same";
    return "";
  };
  const getLeverageDisplay = (account: any): string => {
    const value = String(account?.leverage_display ?? "").trim();

    return value !== "" ? value : "1:100";
  };

  const resolveText = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const emptyTitle = computed(() => resolveText("cabinet.accounts.emptyTitle", "Счетов пока нет"));
  const emptySubtitle = computed(() =>
    resolveText("cabinet.accounts.emptySubtitle", "Откройте первый торговый счет, чтобы начать работу.")
  );
  const verifyTitle = computed(() =>
    resolveText("cabinet.dashboard.mt4.verifyTitle", "Завершите верификацию для открытия счёта")
  );
  const verifySubtitle = computed(() =>
    resolveText(
      "cabinet.dashboard.mt4.verifySubtitle",
      "Подтвердите данные профиля и документы, после этого сможете открыть MT4 счёт."
    )
  );
  const openAccountLabel = computed(() => resolveText("cabinet.accounts.openAccount", "Открыть счет"));
  const verifyActionLabel = computed(() =>
    resolveText("cabinet.dashboard.accountVerification.goToVerification", "Перейти к верификации")
  );
  const showBlockedNotice = computed(() => props.isEligibilityLoaded && !props.canCreateAccount);
  const isVerificationRequired = computed(() => props.isEligibilityLoaded && !props.canCreateAccount);
  const currentEmptyTitle = computed(() => (isVerificationRequired.value ? verifyTitle.value : emptyTitle.value));
  const currentEmptySubtitle = computed(() =>
    isVerificationRequired.value ? verifySubtitle.value : emptySubtitle.value
  );
  const verificationLink = computed(() => localePath({ path: "/profile", query: { tab: "verification" } }));

  const refreshAccountBalance = async (account: any) => {
    const key = refreshKey(account.id);
    if (refreshingBalanceIds[key]) return;

    const previousBalance = normalizeBalanceValue(account.balance);
    refreshingBalanceIds[key] = true;
    try {
      const response = await appCore.accounts.refreshBalance(account.id);
      const data = response?.data?.data ?? {};
      const updatedBalance = data.balance;

      if (updatedBalance !== undefined && updatedBalance !== null) {
        const nextBalance = normalizeBalanceValue(updatedBalance);
        account.balance = String(updatedBalance);

        if (previousBalance !== null && nextBalance !== null) {
          if (nextBalance > previousBalance) {
            setBalanceHighlight(account.id, "up");
          } else if (nextBalance < previousBalance) {
            setBalanceHighlight(account.id, "down");
          } else {
            setBalanceHighlight(account.id, "same");
          }
        }

        return;
      }

      toast.error("Failed to refresh account balance.");
    } catch {
      toast.error("Failed to refresh account balance.");
    } finally {
      refreshingBalanceIds[key] = false;
    }
  };

  const handleInputSearch = async (value: any) => {
    search.value = value;
    currentPage.value = 1;
    await loadData();
  };

  const resolveSortValue = (value: unknown): string | null => {
    if (typeof value === "string") {
      const normalized = value.trim();
      return normalized !== "" ? normalized : null;
    }

    if (value && typeof value === "object" && "value" in value) {
      const optionValue = (value as { value?: unknown }).value;
      if (typeof optionValue === "string") {
        const normalized = optionValue.trim();
        return normalized !== "" ? normalized : null;
      }
    }

    return null;
  };

  const applySorting = async (value: unknown) => {
    const nextOrderBy = resolveSortValue(value);
    if (!nextOrderBy) {
      return;
    }

    if (orderBy.value === nextOrderBy) {
      orderDirection.value = orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC;
    } else {
      orderBy.value = nextOrderBy;
      orderDirection.value = ORDER_DIRECTION_DESC;
    }

    currentPage.value = 1;
    await loadData();
  };

  const handleOrderByAndDirection = async (value: string) => {
    await applySorting(value);
  };

  const handleChangeFilterSortBy = async (value: string | null) => {
    await applySorting(value);
  };

  const handleSetPerPage = async (value: number) => {
    perPage.value = value;
    currentPage.value = 1;
    await loadData();
  };

  const loadData = async () => {
    isLoading.value = true;
    closeOptions();
    closeCardMenu();

    const response = await appCore.accounts.get({
      search: search.value,
      perPage: perPage.value,
      page: currentPage.value,
      orderBy: orderBy.value,
      orderDirection: orderDirection.value,
      order_by: orderBy.value,
      order_direction: orderDirection.value,
    });

    perPage.value = response.data.data.per_page;
    currentPage.value = response.data.data.current_page;
    total.value = response.data.data.total;

    const accountsData = response.data.data.data.map((x: any) => {
      x.is_favorite = !!x.is_favorite;
      return x;
    });

    accounts.splice(0, accounts.length, ...accountsData);

    isLoading.value = false;
    isInitialLoading.value = false;
  };

  const resolveDefaultViewMode = (width: number): "table" | "cards" | "full" => {
    if (width < 768) return "full";
    if (width < 1024) return "cards";
    return "table";
  };

  const syncViewport = () => {
    if (typeof window === "undefined") return;
    isMobileViewport.value = window.innerWidth < 768;
  };

  const initViewMode = () => {
    if (typeof window === "undefined") return;
    syncViewport();

    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (saved && ["table", "cards", "full"].includes(saved)) {
      viewMode.value = saved as typeof viewMode.value;
      return;
    }

    viewMode.value = resolveDefaultViewMode(window.innerWidth);
  };

  watch(viewMode, mode => {
    if (typeof window === "undefined") return;
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  });

  const handleChangeViewMode = (nextViewMode: string) => {
    if (nextViewMode === "table" || nextViewMode === "cards" || nextViewMode === "full") {
      viewMode.value = nextViewMode;
    }
  };

  const tableRef = ref<any>(null);

  const triggerRefs = ref<(HTMLElement | null)[]>([]);
  const MENU_WIDTH = 180;
  const MENU_GAP = 8;
  const VIEWPORT_OFFSET = 8;
  const FALLBACK_MENU_HEIGHT = 260;

  const closeOptions = () => {
    currentRowActiveOptions.value = null;
    tableMenuStyle.value = {};
  };

  const closeCardMenu = () => {
    cardMenuOpenId.value = null;
    cardMenuStyle.value = {};
  };

  const buildFloatingMenuStyle = (trigger: HTMLElement, menuElement?: HTMLElement | null): Record<string, string> => {
    const rect = trigger.getBoundingClientRect();
    const menuHeight = menuElement?.offsetHeight ?? FALLBACK_MENU_HEIGHT;

    const maxLeft = Math.max(VIEWPORT_OFFSET, window.innerWidth - MENU_WIDTH - VIEWPORT_OFFSET);
    const left = Math.min(Math.max(rect.right - MENU_WIDTH, VIEWPORT_OFFSET), maxLeft);

    const fitsBottom = rect.bottom + MENU_GAP + menuHeight <= window.innerHeight - VIEWPORT_OFFSET;
    const top = fitsBottom ? rect.bottom + MENU_GAP : Math.max(VIEWPORT_OFFSET, rect.top - menuHeight - MENU_GAP);

    return {
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      width: `${MENU_WIDTH}px`,
    };
  };

  const updateTableMenuPosition = (index: number) => {
    const trigger = triggerRefs.value[index];
    if (!trigger) return;

    tableMenuStyle.value = buildFloatingMenuStyle(trigger, tableMenuRef.value);
  };

  const toggleRowOptions = async (index: number) => {
    const willOpen = currentRowActiveOptions.value !== index;
    if (!willOpen) {
      closeOptions();
      return;
    }

    closeCardMenu();
    currentRowActiveOptions.value = index;
    tableMenuStyle.value = {};

    await nextTick();
    updateTableMenuPosition(index);
    await nextTick();
    updateTableMenuPosition(index);
  };

  const updateCardMenuPosition = (id: string | number) => {
    const trigger = cardMenuTriggerRefs[id];
    if (!trigger) return;

    cardMenuStyle.value = buildFloatingMenuStyle(trigger, cardMenuRef.value);
  };

  const setCardMenuRef = (element: Element | null) => {
    cardMenuRef.value = element as HTMLElement | null;
  };

  const toggleCardMenu = async (id: string | number) => {
    const willOpen = cardMenuOpenId.value !== id;
    if (!willOpen) {
      closeCardMenu();
      return;
    }

    closeOptions();
    cardMenuOpenId.value = id;
    cardMenuStyle.value = {};

    await nextTick();
    updateCardMenuPosition(id);
    await nextTick();
    updateCardMenuPosition(id);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (currentRowActiveOptions.value === null) return;

    const target = event.target as Node | null;
    if (!target) return;

    const index = currentRowActiveOptions.value;
    const trigger = triggerRefs.value[index];

    if (tableMenuRef.value?.contains(target) || trigger?.contains(target)) return;
    closeOptions();
  };

  const handleOutsideCardMenu = (event: MouseEvent) => {
    if (!cardMenuOpenId.value) return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".card-menu") || target.closest(".card-menu-trigger")) return;
    closeCardMenu();
  };

  const recalc = () => {
    syncViewport();
    if (currentRowActiveOptions.value != null) {
      updateTableMenuPosition(currentRowActiveOptions.value);
    }
    if (cardMenuOpenId.value != null) {
      updateCardMenuPosition(cardMenuOpenId.value);
    }
  };

  onMounted(async () => {
    initViewMode();
    useEventBus.on("loadDataForAccounts", loadData);
    await loadData();

    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);

    const el = (tableRef.value?.$el ?? null) as HTMLElement | null;
    el?.addEventListener("scroll", recalc, { passive: true });

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("click", handleOutsideCardMenu, true);
  });

  onBeforeUnmount(() => {
    balanceHighlightTimers.forEach(timer => clearTimeout(timer));
    balanceHighlightTimers.clear();

    window.removeEventListener("resize", recalc);
    window.removeEventListener("scroll", recalc, true);

    const el = (tableRef.value?.$el ?? null) as HTMLElement | null;
    el?.removeEventListener("scroll", recalc);

    document.removeEventListener("mousedown", handleClickOutside);
    window.removeEventListener("click", handleOutsideCardMenu, true);
  });

  const { openModal } = inject("modalControl") as { openModal: Function };

  const handleClickUpdate = async () => {
    await loadData();
  };

  const handleToggleFavorite = async (account: any) => {
    try {
      await appCore.accounts.toggleFavorite(account.id);
      await loadData();
    } catch {
      await loadData();
    }
  };

  const handleClickTransfer = async (accountId: string | number, tab: number | string = "general") => {
    closeOptions();
    closeCardMenu();

    return navigateTo(resolveAccountRoute(accountId, tab));
  };

  const handleClickHistory = (accountId: string | number, tab: number | string = "history") => {
    closeOptions();
    closeCardMenu();

    return navigateTo(resolveAccountRoute(accountId, tab));
  };

  const tabSlugByIndex: Record<number, string> = {
    0: "general",
    1: "history",
    2: "trade-history",
  };

  const resolveAccountRoute = (accountId: string | number, tab?: number | string) => {
    const path = `/accounts/${encodeURIComponent(String(accountId))}`;
    if (tab === undefined) {
      return { path };
    }

    const tabQuery = typeof tab === "number" ? (tabSlugByIndex[tab] ?? "general") : String(tab);

    return {
      path,
      query: { tab: tabQuery },
    };
  };

  const handleOpenAccount = async (accountId: string | number) => {
    closeOptions();
    closeCardMenu();
    await navigateTo(resolveAccountRoute(accountId));
  };

  const handleClickDelete = async (accountId: string) => {
    if (confirm("Archive this account?")) {
      await appCore.accounts.delete(accountId);
      await loadData();
      toast.success("Account archived!");
    }
    closeOptions();
    closeCardMenu();
  };

  const handleClickCreateNewAccount = () => {
    if (!props.canCreateAccount) return;
    openModal(AccountsCreateNew, {
      title: t("cabinet.accounts.accounts-form.title"),
    });
  };

  const handleClickGoToVerification = async () => {
    await navigateTo(verificationLink.value);
  };
</script>

<style lang="postcss" scoped>
  .cabinet-controls-row {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 0.5rem;
  }

  .cabinet-controls-row__left {
    display: flex;
    width: 100%;
    min-width: 260px;
    flex: 1 1 auto;
    align-items: center;
    gap: 0.5rem;
  }

  .cabinet-controls-row__right {
    display: flex;
    width: 100%;
    flex: 1 1 auto;
    align-items: center;
    gap: 0.5rem;
  }

  @media (min-width: 768px) {
    .cabinet-controls-row {
      flex-direction: row;
      align-items: center;
    }

    .cabinet-controls-row__right {
      width: auto;
      flex: none;
      justify-content: flex-end;
    }
  }

  .accounts-empty-state {
    min-height: calc(100vh - 370px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 12px;
    padding: 24px 18px;
    margin: 0 auto;
    max-width: 680px;
    border-radius: 14px;
    border: 1px dashed var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--ui-background-card) 76%, transparent);
  }

  .accounts-empty-state__icon-wrap {
    height: 64px;
    width: 64px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--ui-primary-main) 16%, transparent);
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 36%, transparent);
  }

  .accounts-empty-state__icon {
    width: 28px;
    height: 28px;
    color: var(--ui-primary-main);
  }

  .accounts-empty-state__title {
    color: var(--ui-text-main);
    font-size: 18px;
    font-weight: 700;
  }

  .accounts-empty-state__subtitle {
    color: var(--ui-text-secondary);
    max-width: 420px;
  }

  .accounts-empty-state__warning {
    color: var(--color-warning);
    max-width: 460px;
  }

  .accounts-empty-state__button {
    min-width: 220px;
    justify-content: center;
  }

  .cabinet-card {
    position: relative;
    background: var(--ui-background-panel);
    border: 1px solid var(--color-stroke-ui-dark);
    border-radius: 12px;
    padding: 12px 14px;
    overflow: visible;
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease,
      transform 0.2s ease;
    color: var(--ui-text-main);
    cursor: pointer;
  }

  .cabinet-card:focus-visible {
    outline: 2px solid var(--ui-primary-main);
    outline-offset: 2px;
  }

  .cabinet-card:hover:not(.card-open) {
    border-color: var(--color-stroke-ui-light);
    background: var(--color-stroke-ui-dark);
    transform: translateY(-1px);
  }

  .cabinet-card.card-open,
  .cabinet-card.card-open:hover {
    border-color: var(--color-stroke-ui-light);
    background: var(--color-stroke-ui-dark);
    transform: none;
  }

  .card-with-actions {
    padding-right: 122px;
  }

  .cabinet-card__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px 12px;
    min-height: 48px;
  }

  .cabinet-card__head-main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1 1 auto;
  }

  .cabinet-card__head-side {
    min-width: 150px;
    display: inline-flex;
    justify-content: flex-end;
  }

  .cabinet-card__eyebrow {
    color: var(--ui-text-secondary);
    font-size: 11px;
    line-height: 1.2;
  }

  .cabinet-card__title {
    color: var(--ui-text-main);
    font-size: 18px;
    line-height: 1.2;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cabinet-card__subtitle {
    color: var(--ui-text-secondary);
    font-size: 13px;
    line-height: 1.25;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cabinet-card__grid {
    margin-top: 12px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px 14px;
  }

  .cabinet-card__grid--full {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .cabinet-card__field {
    min-width: 0;
  }

  .cabinet-card__label {
    color: var(--ui-text-secondary);
    font-size: 11px;
    line-height: 1.2;
  }

  .cabinet-card__value {
    margin-top: 3px;
    color: var(--ui-text-main);
    font-size: 14px;
    line-height: 1.3;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .account-balance-block {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  .account-balance-block__value {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--ui-text-main);
    font-size: 20px;
    line-height: 1;
    font-weight: 700;
    white-space: nowrap;
  }

  .table-account-number {
    font-weight: 700;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }

  .table-account-right-head {
    display: grid;
    align-items: center;
    justify-content: end;
    grid-template-columns: 150px 120px 190px 32px;
    column-gap: 20px;
    width: 100%;
  }

  .table-account-right-cell {
    display: grid;
    align-items: center;
    justify-content: end;
    grid-template-columns: 150px 120px 190px 32px;
    column-gap: 20px;
    width: 100%;
  }

  .table-account-col {
    min-width: 0;
  }

  .table-account-col--type,
  .table-account-col--leverage {
    justify-self: start;
    text-align: left;
  }

  .table-account-col--balance {
    justify-self: end;
    text-align: right;
  }

  .table-account-col--actions {
    justify-self: end;
    width: 32px;
    height: 32px;
  }

  .table-account-balance-head {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  .table-account-type,
  .table-account-leverage {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--ui-text-secondary);
    font-size: 13px;
  }

  .table-account-balance {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    text-align: right;
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
    color: var(--ui-text-main);
    white-space: nowrap;
  }

  @media (max-width: 1024px) {
    .table-account-right-head,
    .table-account-right-cell {
      grid-template-columns: 130px 100px 170px 32px;
      column-gap: 12px;
    }

    .cabinet-card__grid--full {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .card-with-actions {
      padding-right: 108px;
    }

    .cabinet-card__header {
      flex-direction: column;
      align-items: flex-start;
    }

    .cabinet-card__head-side {
      min-width: 0;
      width: 100%;
      justify-content: flex-start;
    }

    .account-balance-block {
      align-items: flex-start;
    }

    .cabinet-card__grid,
    .cabinet-card__grid--full {
      grid-template-columns: 1fr;
    }
  }

  .card-actions {
    position: absolute;
    top: 10px;
    right: 10px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    z-index: 2;
  }

  .menu-btn,
  .copy-btn,
  .action-btn {
    height: 32px;
    width: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: transparent;
    border: 1px solid transparent;
    color: var(--ui-text-secondary);
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease,
      transform 0.15s ease;
    position: relative;
  }

  .menu-btn:hover,
  .copy-btn:hover,
  .action-btn:hover {
    color: var(--ui-text-main);
    border-color: var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--color-stroke-ui-light) 40%, transparent);
    transform: translateY(-1px);
  }

  .refresh-balance-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--ui-text-main);
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
  }

  .refresh-balance-btn:hover,
  .refresh-balance-btn:focus-visible {
    color: var(--ui-text-main);
  }

  .refresh-balance-btn:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .balance-highlight-up {
    animation: balance-highlight-up 1s ease;
  }

  .balance-highlight-down {
    animation: balance-highlight-down 1s ease;
  }

  .balance-highlight-same {
    animation: balance-highlight-same 1s ease;
  }

  .card-menu {
    position: fixed;
    z-index: 9999;
    min-width: 160px;
    width: 180px;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-panel);
    opacity: 1;
    pointer-events: auto;
    padding: 8px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
  }

  .card-menu-trigger {
    position: static;
  }

  .card-menu__item {
    width: 100%;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 34px;
    padding: 0 8px;
    border-radius: 8px;
    transition: background-color 0.2s ease;
  }

  .card-menu__item:hover {
    background: var(--color-stroke-ui-light);
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes balance-highlight-up {
    0% {
      color: inherit;
    }
    30% {
      color: var(--ui-sticker-success);
    }
    100% {
      color: inherit;
    }
  }

  @keyframes balance-highlight-down {
    0% {
      color: inherit;
    }
    30% {
      color: var(--ui-sticker-danger);
    }
    100% {
      color: inherit;
    }
  }

  @keyframes balance-highlight-same {
    0%,
    100% {
      opacity: 1;
    }
    20% {
      opacity: 0.35;
    }
    40% {
      opacity: 1;
    }
    60% {
      opacity: 0.35;
    }
    80% {
      opacity: 1;
    }
  }

  .spinning {
    animation: spin 0.5s linear;
  }
</style>

<!--<template>-->
<!--  <div>-->
<!--    &lt;!&ndash; Top options &ndash;&gt;-->
<!--    <div class="flex items-center justify-between mb-5">-->
<!--      <div class="flex items-center justify-center gap-1 w-full max-w-60">-->
<!--        <UiInput-->
<!--          class="w-full"-->
<!--          @input="handleInputSearch"-->
<!--          :value="search"-->
<!--          :placeholder="t('cabinet.accounts.search')">-->
<!--          <template #icon-left>-->
<!--            <UiIconSearch />-->
<!--          </template>-->
<!--        </UiInput>-->
<!--      </div>-->
<!--      <div class="flex items-center justify-center gap-1">-->
<!--        <UiButtonDefault-->
<!--          state="info&#45;&#45;small"-->
<!--          class="mr-2"-->
<!--          @click="handleClickUpdate">-->
<!--          <UiIconUpdate v-if="!isLoading" />-->
<!--          <UiIconSpinnerDefault v-if="isLoading" />-->
<!--        </UiButtonDefault>-->

<!--        <UiSelect-->
<!--          class="mr-2"-->
<!--          :value="orderBy"-->
<!--          :data="sortByFilterData"-->
<!--          :withoutNoSelect="true"-->
<!--          @change="handleChangeFilterSortBy">-->
<!--          <template #icon-left>-->
<!--            <UiIconSortBy-->
<!--              class="mr-2 !w-[16px] !h-[16px]"-->
<!--              :orderDirectionEnabled="true"-->
<!--              :orderDirection="orderDirection" />-->
<!--          </template>-->
<!--        </UiSelect>-->

<!--        <UiButtonDefault state="info&#45;&#45;small">-->
<!--          <UiIconFilters class="mr-2" />-->
<!--          <UiTextSmall>Filters</UiTextSmall>-->
<!--        </UiButtonDefault>-->
<!--      </div>-->
<!--    </div>-->

<!--    <PanelDefault class="relative overflow-visible">-->
<!--      &lt;!&ndash; Header &ndash;&gt;-->
<!--      <div-->
<!--        class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_50px] items-center text-[var(&#45;&#45;ui-text-main)] gap-x-5 gap-y-2 h-[46px] px-5 bg-[var(&#45;&#45;color-stroke-ui-light)] rounded-t-[10px] w-full">-->
<!--        <div class="flex items-center justify-start">-->
<!--          <UiTextSmall-->
<!--            class="cursor-default mr-[10px]"-->
<!--            @click="handleOrderByAndDirection('type')">-->
<!--            {{ t("cabinet.accounts.columns.type") }}-->
<!--          </UiTextSmall>-->
<!--        </div>-->

<!--        <div class="flex items-center justify-start">-->
<!--          <UiTextSmall-->
<!--            class="cursor-default mr-[10px]"-->
<!--            @click="handleOrderByAndDirection('number')">-->
<!--            {{ t("cabinet.accounts.columns.number") }}-->
<!--          </UiTextSmall>-->
<!--          <UiIconSort-->
<!--            :active="orderBy === 'number'"-->
<!--            :direction="orderDirection"-->
<!--            @click="handleOrderByAndDirection('number')" />-->
<!--        </div>-->

<!--        <div class="flex items-center justify-start">-->
<!--          <UiTextSmall-->
<!--            class="cursor-default mr-[10px]"-->
<!--            @click="handleOrderByAndDirection('leverage')">-->
<!--            {{ t("cabinet.accounts.columns.leverage") }}-->
<!--          </UiTextSmall>-->
<!--        </div>-->

<!--        <div class="flex items-center justify-end">-->
<!--          <UiTextSmall-->
<!--            class="cursor-default mr-[10px]"-->
<!--            @click="handleOrderByAndDirection('balance')">-->
<!--            {{ t("cabinet.accounts.columns.balance") }}-->
<!--          </UiTextSmall>-->
<!--          <UiIconSort-->
<!--            :active="orderBy === 'balance'"-->
<!--            :direction="orderDirection"-->
<!--            @click="handleOrderByAndDirection('balance')" />-->
<!--        </div>-->

<!--        <div class="w-[240px]"></div>-->
<!--      </div>-->

<!--      &lt;!&ndash; Empty state &ndash;&gt;-->
<!--      <template v-if="!isLoading && accounts.length === 0">-->
<!--        <div class="flex items-center justify-center flex-col gap-5 h-[calc(100vh-370px)]">-->
<!--          <span>{{ t("cabinet.accounts.nothingToShow") }}</span>-->
<!--          <UiButtonDefault-->
<!--            state="success&#45;&#45;outline"-->
<!--            @click="handleClickCreateNewAccount">-->
<!--            {{ t("cabinet.accounts.openAccount") }}-->
<!--            &nbsp;-->
<!--            <UiIconSuccess />-->
<!--          </UiButtonDefault>-->
<!--        </div>-->
<!--      </template>-->

<!--      &lt;!&ndash; Loader &ndash;&gt;-->
<!--      <template v-if="isLoading">-->
<!--        <div class="flex items-center justify-center h-[calc(100vh-370px)]">-->
<!--          <UiIconSpinnerDefault />-->
<!--        </div>-->
<!--      </template>-->

<!--      &lt;!&ndash; Accounts list &ndash;&gt;-->
<!--      <div-->
<!--        v-if="!isLoading && accounts.length > 0"-->
<!--        ref="scrollArea"-->
<!--        class="rounded-b-[10px]">-->
<!--        <PanelDefault-->
<!--          class="flex items-center h-[60px] px-5 w-full !border-none rounded-none border-b border-[var(&#45;&#45;color-stroke-ui-light)] last:border-b-0 hover:bg-[var(&#45;&#45;color-stroke-ui-dark)]"-->
<!--          v-for="(account, index) in accounts"-->
<!--          :key="account.id">-->
<!--          <div-->
<!--            class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_50px] gap-x-5 gap-y-2 items-center text-[var(&#45;&#45;ui-text-main)] w-full">-->
<!--            <div class="text-[var(&#45;&#45;color-ui-accent)] font-bold">{{ account.account_type.name }}</div>-->
<!--            <div>{{ account.number }}</div>-->
<!--            <div>1:50</div>-->
<!--            <div class="flex items-center justify-end gap-[10px] text-right text-[20px] font-bold">-->
<!--              <span class="cursor-pointer">$ {{ account.balance }}</span>-->
<!--              <UiIconUpdate-->
<!--                class="h-[14px] w-[14px] mr-[10px] cursor-pointer transition-transform duration-200 hover:animate-[wiggle_0.2s_ease]"-->
<!--                ref="iconUpdate"-->
<!--                :class="{ spinning: spinIcon }"-->
<!--                @click="handleIconClick(account.id)"-->
<!--                @animationend="onIconAnimationEnd" />-->
<!--            </div>-->

<!--            <div class="flex justify-end items-center gap-[5px] w-auto">-->
<!--              <span-->
<!--                @click="toggleRowOptions(index)"-->
<!--                class="relative flex items-center justify-center h-[32px] w-[32px] rounded-md hover:border-[var(&#45;&#45;color-stroke-ui-light)] border border-transparent transition-colors transition-opacity"-->
<!--                :ref="el => (triggerRefs[index] = el as HTMLElement)">-->
<!--                <UiIconDotsVertical />-->

<!--                &lt;!&ndash; Меню опцій &ndash;&gt;-->

<!--                <div-->
<!--                  v-if="currentRowActiveOptions === index"-->
<!--                  :ref="el => (menuRefs[index] = el as HTMLElement)"-->
<!--                  :class="[-->
<!--                    'p-3 absolute right-3 min-w-[100px] border border-[var(&#45;&#45;color-stroke-ui-light)] bg-[var(&#45;&#45;color-stroke-ui-dark)] rounded-md z-10 flex flex-col gap-1 ',-->
<!--                    dropUp[index] ? 'bottom-[calc(100%+8px)] top-auto' : 'top-10',-->
<!--                  ]">-->
<!--                  <div-->
<!--                    class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(&#45;&#45;color-stroke-ui-light)] hover:opacity-70">-->
<!--                    <UiIconPayment class="!w-[14px] !h-[14px] stroke-[var(&#45;&#45;ui-sticker-success)]" />-->
<!--                    <UiTextSmall class="whitespace-nowrap">Deposit</UiTextSmall>-->
<!--                  </div>-->

<!--                  <div-->
<!--                    class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(&#45;&#45;color-stroke-ui-light)] hover:opacity-70"-->
<!--                    :class="{ 'bg-[var(&#45;&#45;color-stroke-ui-light)]': false }">-->
<!--                    <UiIconWithdraw class="!w-[14px] !h-[14px]" />-->
<!--                    <UiTextSmall class="whitespace-nowrap">Withdraw</UiTextSmall>-->
<!--                  </div>-->

<!--                  <div-->
<!--                    class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(&#45;&#45;color-stroke-ui-light)] hover:opacity-70"-->
<!--                    :class="{ 'bg-[var(&#45;&#45;color-stroke-ui-light)]': false }"-->
<!--                    @click="handleClickTransfer(account.id)">-->
<!--                    <UiIconTransfer class="!w-[14px] !h-[14px]" />-->
<!--                    <UiTextSmall class="whitespace-nowrap">Transfer</UiTextSmall>-->
<!--                  </div>-->

<!--                  <div-->
<!--                    class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(&#45;&#45;color-stroke-ui-light)] hover:opacity-70"-->
<!--                    :class="{ 'bg-[var(&#45;&#45;color-stroke-ui-light)]': false }"-->
<!--                    @click="handleClickHistory(account.id)">-->
<!--                    <UiIconHistory class="!w-[14px] !h-[14px]" />-->
<!--                    <UiTextSmall class="whitespace-nowrap">History</UiTextSmall>-->
<!--                  </div>-->

<!--                  <div-->
<!--                    class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(&#45;&#45;color-stroke-ui-light)] hover:opacity-70"-->
<!--                    :class="{ 'bg-[var(&#45;&#45;color-stroke-ui-light)]': false }">-->
<!--                    <UiIconUpdate class="!w-[14px] !h-[14px]" />-->
<!--                    <UiTextSmall class="whitespace-nowrap">Change type</UiTextSmall>-->
<!--                  </div>-->

<!--                  <div-->
<!--                    class="cursor-pointer flex items-center justify-start gap-2 h-[32px] pl-2 pr-2 rounded-md hover:bg-[var(&#45;&#45;color-stroke-ui-light)] hover:opacity-70"-->
<!--                    :class="{ 'bg-[var(&#45;&#45;color-stroke-ui-light)]': false }"-->
<!--                    @click="handleClickDelete(account.id)">-->
<!--                    <UiIconTrash class="!w-[14px] !h-[14px] stroke-[var(&#45;&#45;ui-sticker-danger)]" />-->
<!--                    <UiTextSmall class="whitespace-nowrap">Remove</UiTextSmall>-->
<!--                  </div>-->
<!--                </div>-->
<!--              </span>-->
<!--            </div>-->
<!--          </div>-->
<!--        </PanelDefault>-->
<!--      </div>-->
<!--    </PanelDefault>-->

<!--    <div class="px-5 h-[50px] mt-2 flex items-center justify-between">-->
<!--      <div class="p-0 flex items-center justify-center [&>div]:h-[33px] [&>div]:w-[33px]">-->
<!--        <UiTextSmall class="mr-2">Per page:</UiTextSmall>-->
<!--        <UiSelect-->
<!--          class="!w-min flex items-center justify-center !h-[32px]"-->
<!--          :data="perPageList"-->
<!--          :value="perPage"-->
<!--          @change="handleChangePerPage"-->
<!--          :withoutNoSelect="true" />-->
<!--      </div>-->

<!--      <UiTextSmall>{{ currentPage * perPage - perPage }}-{{ currentPage * perPage }} / {{ total }}</UiTextSmall>-->

<!--      <div class="flex items-center justify-center gap-2">-->
<!--        <UiTextSmall-->
<!--          class="px-3 py-1.5 h-[32px] border border-[&#45;&#45;color-stroke-ui-dark] cursor-pointer text-[14px] rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--          v-if="currentPage !== 1 && total > perPage"-->
<!--          @click="goPrev">-->
<!--          {{ t("cabinet.accounts.pagination.prev") }}-->
<!--        </UiTextSmall>-->

<!--        <UiTextSmall-->
<!--          v-if="visiblePages[0] > 1"-->
<!--          class="px-3 py-1.5 h-[32px] border border-[var(&#45;&#45;color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--          @click="setPage(1)">-->
<!--          1-->
<!--        </UiTextSmall>-->

<!--        <UiTextSmall v-if="visiblePages[0] > 2">...</UiTextSmall>-->

<!--        <UiTextSmall-->
<!--          v-for="page in visiblePages"-->
<!--          :key="page"-->
<!--          class="px-3 py-1.5 h-[32px] border border-[var(&#45;&#45;color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--          :class="{ 'bg-[var(&#45;&#45;ui-primary-main)] text-white': currentPage === page }"-->
<!--          @click="setPage(page)">-->
<!--          {{ page }}-->
<!--        </UiTextSmall>-->

<!--        <UiTextSmall v-if="visiblePages[visiblePages.length - 1] < totalPages">...</UiTextSmall>-->

<!--        <UiTextSmall-->
<!--          v-if="visiblePages[visiblePages.length - 1] < totalPages"-->
<!--          class="px-3 py-1.5 h-[32px] border border-[var(&#45;&#45;color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--          @click="setPage(totalPages)"-->
<!--          >{{ totalPages }}-->
<!--        </UiTextSmall>-->

<!--        <UiTextSmall-->
<!--          class="px-3 py-1.5 border border-[var(&#45;&#45;color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--          v-if="currentPage !== totalPages && total > perPage"-->
<!--          @click="goNext">-->
<!--          {{ t("cabinet.accounts.pagination.next") }}-->
<!--        </UiTextSmall>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script lang="ts" setup>-->
<!--  import AccountsCreateNew from "~/pages/accounts/components/AccountsCreateNew.vue";-->
<!--  import PanelDefault from "~/components/block/panels/PanelDefault.vue";-->
<!--  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";-->
<!--  import UiIconFilters from "~/components/ui/UiIconFilters.vue";-->
<!--  import UiIconHistory from "~/components/ui/UiIconHistory.vue";-->
<!--  import UiIconPayment from "~/components/ui/UiIconPayment.vue";-->
<!--  import UiIconSort from "~/components/ui/UiIconSort.vue";-->
<!--  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";-->
<!--  import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";-->
<!--  import UiIconTransfer from "~/components/ui/UiIconTransfer.vue";-->
<!--  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";-->
<!--  import UiInput from "~/components/ui/UiInput.vue";-->
<!--  import UiSelect from "~/components/ui/UiSelect.vue";-->
<!--  import useAppCore from "~/composables/useAppCore";-->
<!--  import useEventBus from "~/composables/useEventBus";-->
<!--  import { computed, inject, onMounted, reactive, ref, nextTick, onBeforeUnmount } from "vue";-->
<!--  import { navigateTo } from "nuxt/app";-->
<!--  import { useI18n } from "vue-i18n";-->
<!--  import { useToast } from "vue-toastification";-->
<!--  import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";-->
<!--  import UiTextSmall from "~/components/ui/UiTextSmall.vue";-->
<!--  import UiIconSearch from "~/components/ui/UiIconSearch.vue";-->
<!--  import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";-->
<!--  import UiIconWithdraw from "~/components/ui/UiIconWithdraw.vue";-->
<!--  import UiIconTrash from "~/components/ui/UiIconTrash.vue";-->

<!--  const { t } = useI18n({ useScope: "global" });-->
<!--  const appCore = useAppCore();-->

<!--  const ORDER_DIRECTION_ASC = "asc";-->
<!--  const ORDER_DIRECTION_DESC = "desc";-->

<!--  const toast = useToast();-->

<!--  const isLoading = ref(true);-->

<!--  const search = ref("");-->
<!--  const total = ref(0);-->
<!--  const perPage = ref(7);-->
<!--  const currentPage = ref(1);-->
<!--  const orderBy = ref("balance");-->
<!--  const orderDirection = ref(ORDER_DIRECTION_DESC);-->
<!--  const currentRowActiveOptions = ref<number | null>(null);-->

<!--  const sortByFilterData = reactive([-->
<!--    {-->
<!--      id: "number",-->
<!--      value: "number",-->
<!--      text: "Number",-->
<!--    },-->
<!--    {-->
<!--      id: "balance",-->
<!--      value: "balance",-->
<!--      text: "Balance",-->
<!--    },-->
<!--  ]);-->

<!--  const accounts = reactive<any[]>([]);-->
<!--  const spinIcon = ref(false);-->

<!--  const totalPages = computed(() => Math.ceil(total.value / perPage.value));-->

<!--  const perPageList = reactive([-->
<!--    { id: 1, value: 1, text: "1" },-->
<!--    { id: 2, value: 2, text: "2" },-->
<!--    { id: 3, value: 3, text: "3" },-->
<!--    { id: 4, value: 4, text: "4" },-->
<!--    { id: 5, value: 5, text: "5" },-->
<!--    { id: 6, value: 6, text: "6" },-->
<!--    { id: 7, value: 7, text: "7" },-->
<!--    { id: 8, value: 8, text: "8" },-->
<!--    { id: 9, value: 9, text: "9" },-->
<!--    { id: 10, value: 10, text: "10" },-->
<!--    { id: 12, value: 12, text: "12" },-->
<!--    { id: 15, value: 15, text: "15" },-->
<!--    { id: 20, value: 20, text: "20" },-->
<!--    { id: 25, value: 25, text: "25" },-->
<!--    { id: 50, value: 50, text: "50" },-->
<!--    { id: 100, value: 100, text: "100" },-->
<!--  ]);-->

<!--  const visiblePages = computed(() => {-->
<!--    const pages: number[] = [];-->
<!--    const maxPagesToShow = 5;-->
<!--    const half = Math.floor(maxPagesToShow / 2);-->

<!--    let start = Math.max(1, currentPage.value - half);-->
<!--    let end = Math.min(totalPages.value, start + maxPagesToShow - 1);-->

<!--    if (end - start < maxPagesToShow - 1) {-->
<!--      start = Math.max(1, end - maxPagesToShow + 1);-->
<!--    }-->

<!--    for (let i = start; i <= end; i++) {-->
<!--      pages.push(i);-->
<!--    }-->

<!--    return pages;-->
<!--  });-->

<!--  async function setPage(page: number) {-->
<!--    if (page >= 1 && page <= totalPages.value) {-->
<!--      currentPage.value = page;-->
<!--      await loadData();-->
<!--    }-->
<!--  }-->

<!--  async function goPrev() {-->
<!--    if (currentPage.value > 1) {-->
<!--      currentPage.value&#45;&#45;;-->
<!--      await loadData();-->
<!--    }-->
<!--  }-->

<!--  async function goNext() {-->
<!--    if (currentPage.value < totalPages.value) {-->
<!--      currentPage.value++;-->
<!--      await loadData();-->
<!--    }-->
<!--  }-->

<!--  const handleIconClick = (id: string) => {-->
<!--    const account: any = accounts.find((x: any) => x.id === id);-->
<!--    if (account) account.isSpinning = true;-->
<!--  };-->

<!--  const onIconAnimationEnd = () => {-->
<!--    spinIcon.value = false;-->
<!--  };-->

<!--  const handleInputSearch = async (value: any) => {-->
<!--    search.value = value;-->
<!--    currentPage.value = 1;-->
<!--    await loadData();-->
<!--  };-->

<!--  const handleOrderByAndDirection = async (value: string) => {-->
<!--    orderDirection.value = orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC;-->
<!--    orderBy.value = value;-->
<!--    await loadData();-->
<!--  };-->

<!--  const handleChangePerPage = async (newPerPage: number) => {-->
<!--    perPage.value = newPerPage;-->
<!--    await loadData();-->
<!--  };-->

<!--  const handleChangeFilterSortBy = async (value: string) => {-->
<!--    if (orderBy.value === value)-->
<!--      orderDirection.value = orderDirection.value === ORDER_DIRECTION_DESC ? ORDER_DIRECTION_ASC : ORDER_DIRECTION_DESC;-->
<!--    else orderBy.value = value;-->

<!--    await loadData();-->
<!--  };-->

<!--  const loadData = async () => {-->
<!--    isLoading.value = true;-->
<!--    const response = await appCore.accounts.get({-->
<!--      search: search.value,-->
<!--      perPage: perPage.value,-->
<!--      page: currentPage.value,-->
<!--      orderBy: orderBy.value,-->
<!--      orderDirection: orderDirection.value,-->
<!--    });-->

<!--    perPage.value = response.data.data.per_page;-->
<!--    currentPage.value = response.data.data.current_page;-->
<!--    total.value = response.data.data.total;-->
<!--    const accountsData = response.data.data.data.map((x: any) => {-->
<!--      x.isSpinning = false;-->
<!--      return x;-->
<!--    });-->
<!--    accounts.splice(0, accounts.length, ...accountsData);-->

<!--    isLoading.value = false;-->
<!--  };-->

<!--  // -&#45;&#45; Dropdown flip logic -&#45;&#45;-->
<!--  const scrollArea = ref<HTMLElement | null>(null);-->
<!--  const triggerRefs = ref<(HTMLElement | null)[]>([]);-->
<!--  const menuRefs = ref<(HTMLElement | null)[]>([]);-->
<!--  const dropUp = reactive<Record<number, boolean>>({});-->

<!--  const closeOptions = () => {-->
<!--    currentRowActiveOptions.value = null;-->
<!--  };-->

<!--  const toggleRowOptions = async (index: number) => {-->
<!--    currentRowActiveOptions.value = currentRowActiveOptions.value === index ? null : index;-->
<!--    await nextTick();-->
<!--    if (currentRowActiveOptions.value === index) {-->
<!--      updateMenuPosition(index);-->
<!--    }-->
<!--  };-->

<!--  const updateMenuPosition = (index: number) => {-->
<!--    const trigger = triggerRefs.value[index];-->
<!--    const menu = menuRefs.value[index];-->
<!--    if (!trigger || !menu) return;-->

<!--    const offset = 8; // px-->
<!--    const menuHeight = menu.offsetHeight;-->
<!--    const triggerRect = trigger.getBoundingClientRect();-->
<!--    const containerRect = (scrollArea.value ?? document.documentElement).getBoundingClientRect();-->

<!--    const fitsDown = triggerRect.bottom + offset + menuHeight <= containerRect.bottom;-->

<!--    dropUp[index] = !fitsDown;-->
<!--  };-->

<!--  const handleClickOutside = (event: MouseEvent) => {-->
<!--    if (currentRowActiveOptions.value === null) return;-->

<!--    const target = event.target as Node | null;-->
<!--    if (!target) return;-->

<!--    const index = currentRowActiveOptions.value;-->
<!--    const menu = menuRefs.value[index];-->
<!--    const trigger = triggerRefs.value[index];-->

<!--    if (menu?.contains(target) || trigger?.contains(target)) return;-->

<!--    closeOptions();-->
<!--  };-->

<!--  onMounted(async () => {-->
<!--    useEventBus.on("loadDataForAccounts", loadData);-->
<!--    await loadData();-->

<!--    const recalc = () => {-->
<!--      if (currentRowActiveOptions.value != null) {-->
<!--        updateMenuPosition(currentRowActiveOptions.value);-->
<!--      }-->
<!--    };-->
<!--    window.addEventListener("resize", recalc);-->
<!--    scrollArea.value?.addEventListener("scroll", recalc, { passive: true });-->
<!--    document.addEventListener("mousedown", handleClickOutside);-->

<!--    onBeforeUnmount(() => {-->
<!--      window.removeEventListener("resize", recalc);-->
<!--      scrollArea.value?.removeEventListener("scroll", recalc);-->
<!--      document.removeEventListener("mousedown", handleClickOutside);-->
<!--    });-->
<!--  });-->

<!--  // -&#45;&#45; -&#45;&#45;-->

<!--  const { openModal } = inject("modalControl") as { openModal: Function };-->

<!--  const handleClickUpdate = async () => {-->
<!--    await loadData();-->
<!--  };-->

<!--  const handleClickTransfer = async (accountId: string, tab: number | string = 0) => {-->
<!--    closeOptions();-->

<!--    return navigateTo({-->
<!--      path: `/accounts/${encodeURIComponent(accountId)}`,-->
<!--      query: { tab: String(tab) },-->
<!--    });-->
<!--  };-->

<!--  const handleClickHistory = (accountId: string, tab: number | string = 1) => {-->
<!--    closeOptions();-->

<!--    return navigateTo({-->
<!--      path: `/accounts/${encodeURIComponent(accountId)}`,-->
<!--      query: { tab: String(tab) },-->
<!--    });-->
<!--  };-->

<!--  const handleClickDelete = async (accountId: string) => {-->
<!--    if (confirm("Are you sure?")) {-->
<!--      await appCore.accounts.delete(accountId);-->
<!--      await loadData();-->
<!--      toast.success("Account deleted!");-->
<!--    }-->
<!--    closeOptions();-->
<!--  };-->

<!--  const handleClickCreateNewAccount = () =>-->
<!--    openModal(AccountsCreateNew, {-->
<!--      title: t("cabinet.accounts.accounts-form.title"),-->
<!--    });-->
<!--</script>-->

<!--<style lang="postcss" scoped>-->
<!--  @keyframes spin {-->
<!--    0% {-->
<!--      transform: rotate(0deg);-->
<!--    }-->
<!--    100% {-->
<!--      transform: rotate(360deg);-->
<!--    }-->
<!--  }-->

<!--  @keyframes wiggle {-->
<!--    0% {-->
<!--      transform: translateX(0);-->
<!--    }-->
<!--    20% {-->
<!--      transform: translateX(-2px);-->
<!--    }-->
<!--    40% {-->
<!--      transform: translateX(2px);-->
<!--    }-->
<!--    60% {-->
<!--      transform: translateX(-2px);-->
<!--    }-->
<!--    80% {-->
<!--      transform: translateX(2px);-->
<!--    }-->
<!--    100% {-->
<!--      transform: translateX(0);-->
<!--    }-->
<!--  }-->

<!--  /* Локальний клас без Tailwind layer */-->
<!--  .spinning {-->
<!--    animation: spin 0.5s linear;-->
<!--  }-->
<!--</style>-->
