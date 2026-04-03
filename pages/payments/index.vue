<template>
  <PageStructureDefault>
    <template #header>
      <div class="payments-header">
        <UiTextH4 class="text-[var(--ui-text-main)] mr-5">
          {{ t("cabinet.billing.title") }}
        </UiTextH4>

        <div class="payments-header__actions">
          <template v-if="canCreatePayment">
            <UiButtonDefault
              state="success--outline"
              class="w-full md:w-auto"
              @click="handleClickCreateNewDeposit">
              {{ createDepositLabel }}
            </UiButtonDefault>
          </template>
          <UiButtonDefault
            v-else
            state="info--outline"
            class="w-full md:w-auto"
            @click="handleGoToVerification">
            {{ verifyActionLabel }}
          </UiButtonDefault>
        </div>
      </div>
      <div
        v-if="isVerificationRequired"
        class="payments-header__notice">
        {{ paymentCreationBlockedReason }}
      </div>
    </template>

    <template #content>
      <PageStructureContent
        v-if="!isInitialLoading && payments.length > 0"
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
                class="min-w-[180px] sm:w-[200px]"
                :value="orderBy"
                :data="sortByFilterData"
                :withoutNoSelect="true"
                @change="handleOrderByAndDirection">
                <template #icon-left>
                  <UiIconSortBy
                    class="!h-4 !w-4"
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
          <TableMain v-if="viewMode === 'table'">
            <template #thead>
              <tr>
                <th class="px-4 py-1 text-left font-normal w-[60px]">
                  <div class="flex items-center">
                    <span
                      class="mr-2.5 cursor-pointer"
                      @click="handleOrderByAndDirection('id')">
                      {{ t("cabinet.billing.columns.id") }}
                    </span>
                    <UiIconSort
                      :active="orderBy === 'id'"
                      :direction="orderDirection"
                      @click="handleOrderByAndDirection('id')" />
                  </div>
                </th>

                <th class="px-4 py-3 text-left font-normal">
                  <div class="flex items-center">
                    <span
                      class="mr-2.5 cursor-pointer truncate max-w-[90px]"
                      title="Номер счёта"
                      @click="handleOrderByAndDirection('account_number')">
                      № счёта
                    </span>
                    <UiIconSort
                      :active="orderBy === 'account_number'"
                      :direction="orderDirection"
                      @click="handleOrderByAndDirection('account_number')" />
                  </div>
                </th>

                <th class="px-4 py-3 text-left font-normal">
                  <div class="flex items-center">
                    <span
                      class="mr-2.5 cursor-pointer truncate max-w-[90px]"
                      title="Платёжная система"
                      @click="handleOrderByAndDirection('payment_system')">
                      ПС
                    </span>
                    <UiIconSort
                      :active="orderBy === 'payment_system'"
                      :direction="orderDirection"
                      @click="handleOrderByAndDirection('payment_system')" />
                  </div>
                </th>

                <th class="px-4 py-3 text-left font-normal">
                  <div class="flex items-center">
                    <span
                      class="mr-2.5 cursor-pointer"
                      @click="handleOrderByAndDirection('amount')">
                      {{ t("cabinet.billing.columns.amount") }}
                    </span>
                    <UiIconSort
                      :active="orderBy === 'amount'"
                      :direction="orderDirection"
                      @click="handleOrderByAndDirection('amount')" />
                  </div>
                </th>

                <th class="px-4 py-3 text-left font-normal">
                  <div class="flex items-center">
                    <span
                      class="mr-2.5 cursor-pointer"
                      @click="handleOrderByAndDirection('status')">
                      {{ t("cabinet.billing.columns.status") }}
                    </span>
                    <UiIconSort
                      :active="orderBy === 'status'"
                      :direction="orderDirection"
                      @click="handleOrderByAndDirection('status')" />
                  </div>
                </th>

                <th class="px-4 py-3 text-left font-normal">
                  <div class="flex items-center">
                    <span
                      class="mr-2.5 cursor-pointer truncate max-w-[160px]"
                      @click="handleOrderByAndDirection('created_at')">
                      {{ t("cabinet.billing.columns.createdAt") }}
                    </span>
                    <UiIconSort
                      :active="orderBy === 'created_at'"
                      :direction="orderDirection"
                      @click="handleOrderByAndDirection('created_at')" />
                  </div>
                </th>

                <th class="px-4 py-3 text-right font-normal w-[52px]"></th>
              </tr>
            </template>

            <template #tbody>
              <div
                class="backdrop-blur-[2px] w-full absolute bottom-0 top-[45px] flex items-center justify-center z-10"
                v-if="isLoading && !isInitialLoading">
                <UiIconSpinnerDefault />
              </div>

              <template v-if="payments.length">
                <tr
                  v-for="payment in payments"
                  :key="payment.id"
                  class="cursor-pointer border-t border-[var(--color-ui-border)] hover:bg-[var(--color-stroke-ui-dark)]"
                  @click="handlePaymentItemClick($event, payment.id)">
                  <td class="px-2 py-3 font-bold flex justify-center items-center">
                    <button
                      class="cursor-pointer"
                      aria-label="Copy id"
                      @click.stop>
                      <UiIconCopy :text="payment.id" />
                    </button>
                  </td>

                  <td
                    class="px-4 py-3 truncate max-w-[220px]"
                    :title="displayAccountRoute(payment)">
                    <strong>{{ displayAccountRoute(payment) }}</strong>
                  </td>

                  <td
                    class="px-4 py-3 truncate max-w-[170px]"
                    :title="displayPaymentSystem(payment)">
                    <span>{{ displayPaymentSystem(payment) }}</span>
                  </td>

                  <td
                    class="px-4 py-3 font-bold whitespace-nowrap"
                    :class="true ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'">
                    <span>$</span> <span>{{ payment.amount }}</span>
                  </td>

                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="inline-flex items-center gap-2 capitalize">
                      <span
                        class="h-2 w-2 rounded-full"
                        :class="statusDotClass(payment.status)"></span>
                      <span>{{ statusText(payment.status) }}</span>
                    </div>
                  </td>

                  <td class="px-4 py-3 text-xs whitespace-nowrap">
                    {{ new Date(payment.created_at).toLocaleString() }}
                  </td>

                  <td class="px-2 py-3 text-right align-middle">
                    <button
                      type="button"
                      class="action-btn"
                      :aria-label="openMenuLabel"
                      @click.stop="togglePaymentMenu(payment.id)"
                      :ref="el => setPaymentMenuTriggerRef(payment.id, el as HTMLElement | null)">
                      <UiIconDotsVertical class="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              </template>
            </template>
          </TableMain>

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
                v-for="payment in payments"
                :key="payment.id"
                :class="[
                  'cabinet-card card-with-actions cursor-pointer',
                  viewMode === 'full' ? 'cabinet-card--full-row' : '',
                ]"
                @click="handlePaymentItemClick($event, payment.id)">
                <div
                  class="card-actions"
                  aria-hidden="true">
                  <button
                    class="copy-btn"
                    aria-label="Copy id"
                    @click.stop>
                    <UiIconCopy :text="payment.id" />
                  </button>

                  <button
                    type="button"
                    class="action-btn"
                    :aria-label="openMenuLabel"
                    @click.stop="togglePaymentMenu(payment.id)"
                    :ref="el => setPaymentMenuTriggerRef(payment.id, el as HTMLElement | null)">
                    <UiIconDotsVertical class="h-4 w-4" />
                  </button>
                </div>

                <div class="cabinet-card__header">
                  <div class="cabinet-card__head-main">
                    <UiTextSmall class="cabinet-card__eyebrow">
                      {{ t("cabinet.billing.columns.accountNumber") }}
                    </UiTextSmall>
                    <div class="cabinet-card__title">{{ displayAccountRoute(payment) }}</div>
                    <div class="cabinet-card__subtitle">{{ displayPaymentSystem(payment) }}</div>
                  </div>

                  <div class="cabinet-card__head-side">
                    <div class="status-inline">
                      <span
                        class="h-2 w-2 rounded-full"
                        :class="statusDotClass(payment.status)"></span>
                      <span>{{ statusText(payment.status) }}</span>
                    </div>
                  </div>
                </div>

                <div
                  class="cabinet-card__grid"
                  :class="viewMode === 'full' ? 'cabinet-card__grid--full' : ''">
                  <div class="cabinet-card__field">
                    <UiTextSmall class="cabinet-card__label">
                      {{ t("cabinet.billing.columns.amount") }}
                    </UiTextSmall>
                    <div class="cabinet-card__value cabinet-card__value--positive">${{ payment.amount }}</div>
                  </div>
                  <div class="cabinet-card__field">
                    <UiTextSmall class="cabinet-card__label">
                      {{ t("cabinet.billing.columns.createdAt") }}
                    </UiTextSmall>
                    <div class="cabinet-card__value">
                      {{ new Date(payment.created_at).toLocaleString() }}
                    </div>
                  </div>
                  <div
                    v-if="viewMode === 'full'"
                    class="cabinet-card__field">
                    <UiTextSmall class="cabinet-card__label">
                      {{ t("cabinet.billing.columns.id") }}
                    </UiTextSmall>
                    <div
                      class="cabinet-card__value"
                      :title="payment.id">
                      {{ shortId(payment.id) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Teleport to="body">
            <div
              v-if="activePaymentMenuId !== null"
              ref="paymentMenuRef"
              class="fixed z-[9999] max-h-[70vh] overflow-auto text-[var(--ui-text-main)]"
              :class="[
                'flex min-w-[150px] max-w-[70vw] flex-col gap-1 rounded-md border border-[var(--color-stroke-ui-light)] bg-[var(--color-stroke-ui-dark)] p-2 shadow-lg transition-opacity duration-100',
                paymentMenuReady ? 'opacity-100' : 'opacity-0 pointer-events-none',
              ]"
              :style="paymentMenuStyle">
              <button
                type="button"
                class="flex h-8 items-center justify-start gap-2 rounded-md px-2 hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                @click="handleOpenPayment(activePaymentMenuId)">
                <UiIconEye class="!h-[14px] !w-[14px]" />
                <UiTextSmall class="whitespace-nowrap">{{ openMenuLabel }}</UiTextSmall>
              </button>

              <button
                v-if="activePaymentMenuId !== null && canSyncPaymentById(activePaymentMenuId)"
                type="button"
                class="flex h-8 items-center justify-start gap-2 rounded-md px-2 hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                :disabled="syncingPaymentId === activePaymentMenuId"
                @click="handleSyncPayment(activePaymentMenuId)">
                <UiIconUpdate
                  class="!h-[14px] !w-[14px]"
                  :spinning="syncingPaymentId === activePaymentMenuId" />
                <UiTextSmall class="whitespace-nowrap">{{ syncMenuLabel }}</UiTextSmall>
              </button>

              <button
                type="button"
                class="flex h-8 items-center justify-start gap-2 rounded-md px-2 hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                :disabled="deletingPaymentId === activePaymentMenuId"
                @click="handleDeletePayment(activePaymentMenuId)">
                <UiIconTrash class="!h-[14px] !w-[14px] stroke-[var(--ui-sticker-danger)]" />
                <UiTextSmall class="whitespace-nowrap">{{ deleteMenuLabel }}</UiTextSmall>
              </button>
            </div>
          </Teleport>
        </template>
      </PageStructureContent>

      <template v-if="isInitialLoading">
        <div class="flex min-h-[55vh] w-full flex-col items-center justify-center">
          <UiIconLogo class="mb-4 h-[44px] w-[44px]" />
          <UiIconSpinnerDefault class="h-[44px] w-[44px]" />
        </div>
      </template>

      <template v-if="!isInitialLoading && payments.length === 0">
        <div class="payments-empty-state">
          <div class="payments-empty-state__icon-wrap">
            <UiIconCardCheck class="payments-empty-state__icon" />
          </div>
          <div class="payments-empty-state__title">
            {{ emptyStateTitle }}
          </div>
          <UiTextSmall class="payments-empty-state__subtitle">
            {{ emptyStateSubtitle }}
          </UiTextSmall>
          <UiTextSmall
            v-if="isVerificationRequired"
            class="payments-empty-state__warning">
            {{ paymentCreationBlockedReason }}
          </UiTextSmall>

          <div
            v-if="canCreatePayment"
            class="payments-empty-state__actions">
            <UiButtonDefault
              state="success--outline"
              class="payments-empty-state__button"
              @click="handleClickCreateNewDeposit">
              {{ createDepositLabel }}
            </UiButtonDefault>
          </div>
          <UiButtonDefault
            v-else
            state="info--outline"
            class="payments-empty-state__button"
            @click="handleGoToVerification">
            {{ verifyActionLabel }}
          </UiButtonDefault>
        </div>
      </template>

      <PaginationMain
        v-if="!isInitialLoading && payments.length > 0"
        class="px-5 py-2"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="total"
        :per-page="perPage"
        :visible-pages="visiblePages"
        :per-page-options="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 50, 100]"
        @go-prev="goPrev"
        @go-next="goNext"
        @set-page="setPage"
        @set-per-page="handleSetPerPage" />
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
  import type Echo from "laravel-echo";
  import CreateNewDeposit from "~/pages/payments/create/index.vue";
  import PageStructureContent from "~/components/block/pages/PageStructureContent.vue";
  import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
  import PaginationMain from "~/components/block/paginations/PaginationMain.vue";
  import TableMain from "~/components/block/tables/TableMain.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconCardCheck from "~/components/ui/UiIconCardCheck.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import UiIconSearch from "~/components/ui/UiIconSearch.vue";
  import UiIconSort from "~/components/ui/UiIconSort.vue";
  import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";
  import UiIconEye from "~/components/ui/UiIconEye.vue";
  import UiIconTrash from "~/components/ui/UiIconTrash.vue";
  import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import ViewModeToggle from "~/components/block/controls/ViewModeToggle.vue";
  import useAccountCreationEligibility from "~/composables/useAccountCreationEligibility";
  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import { useAuthStore } from "~/stores/authStore";

  import { definePageMeta, navigateTo, useLocalePath, useNuxtApp } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";
  import { computed, h, inject, onBeforeUnmount, onMounted, reactive, ref, watch, nextTick } from "vue";
  import UiIconLogo from "~/components/ui/UiIconLogo.vue";
  import { useRoute, useRouter } from "vue-router";
  import { useToast } from "vue-toastification";

  definePageMeta({
    layout: "cabinet",
    middleware: ["auth-client", "client-check-auth"],
  });

  const { t } = useI18n({ useScope: "global" });
  const { openModal } = inject("modalControl") as { openModal: Function };
  const route = useRoute();
  const router = useRouter();
  const localePath = useLocalePath();
  const toast = useToast();
  const authStore = useAuthStore();
  const { $echo } = useNuxtApp() as { $echo?: Echo<any> };

  const appCore = useAppCore();
  const { canCreateAccount, isEligibilityLoaded, refreshAccountCreationEligibility } = useAccountCreationEligibility();

  const ORDER_DIRECTION_ASC = "asc";
  const ORDER_DIRECTION_DESC = "desc";
  const VIEW_MODE_STORAGE_KEY = "paymentsViewMode";
  const CLIENT_NOTIFICATION_RECEIVED_EVENT = "client-notification-received";
  const BILLING_NOTIFICATION_TYPES = ["payments.withdrawal.status-updated", "payments.deposit.status-updated"];
  const PAYMENT_REALTIME_EVENT_NAMES = [
    ".user.payment.updated",
    "user.payment.updated",
    ".Modules\\Billing\\Events\\UserPaymentUpdated",
    "Modules\\Billing\\Events\\UserPaymentUpdated",
    ".UserPaymentUpdated",
    "UserPaymentUpdated",
  ];

  const search = ref("");
  const total = ref(0);
  const perPage = ref(6);
  const currentPage = ref(1);
  const orderBy = ref<string>("created_at");
  const orderDirection = ref<string>(ORDER_DIRECTION_DESC);
  const isLoading = ref(false);
  const isInitialLoading = ref(true);
  const viewMode = ref<"table" | "cards" | "full">("table");
  const isMobileViewport = ref(false);
  const sortByFilterData = reactive([
    { id: "created_at", value: "created_at", text: "Created at" },
    { id: "amount", value: "amount", text: "Amount" },
    { id: "status", value: "status", text: "Status" },
    { id: "payment_system", value: "payment_system", text: "Payment system" },
  ]);
  const viewOptions = [
    {
      value: "table" as const,
      label: t("cabinet.billing.view.list") || "Список",
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
      label: t("cabinet.billing.view.cards") || "Картки",
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
      label: t("cabinet.billing.view.full") || "На всю ширину",
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

  const payments = reactive<any[]>([]);
  const spinIcon = ref(false);
  const activePaymentMenuId = ref<string | null>(null);
  const deletingPaymentId = ref<string | null>(null);
  const syncingPaymentId = ref<string | null>(null);
  const paymentMenuReady = ref(false);
  const paymentMenuRef = ref<HTMLElement | null>(null);
  const paymentMenuTriggerRefs = ref<Record<string, HTMLElement | null>>({});
  const paymentMenuPosition = reactive({ top: 0, left: 0 });
  const paymentRealtimeChannel = ref<any>(null);
  const currentPaymentRealtimeChannelName = ref("");

  const resolveI18nValue = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const canCreatePayment = computed(() => canCreateAccount.value);
  const isVerificationRequired = computed(() => isEligibilityLoaded.value && !canCreateAccount.value);
  const createDepositLabel = computed(() => resolveI18nValue("cabinet.accounts.actions.deposit", "Пополнить счет"));
  const createWithdrawalLabel = computed(() =>
    resolveI18nValue("cabinet.accounts.actions.withdraw", "Вывести средства")
  );
  const verifyActionLabel = computed(() =>
    resolveI18nValue("cabinet.dashboard.accountVerification.goToVerification", "Перейти к верификации")
  );
  const paymentCreationBlockedReason = computed(() =>
    resolveI18nValue(
      "cabinet.accounts.openBlocked",
      "Открытие счета будет доступно после верификации данных профиля и документов."
    )
  );
  const emptyStateTitle = computed(() =>
    isVerificationRequired.value
      ? resolveI18nValue("cabinet.dashboard.mt4.verifyTitle", "Завершите верификацию для создания платежа")
      : resolveI18nValue("cabinet.billing.emptyTitle", "Платежей пока нет")
  );
  const emptyStateSubtitle = computed(() =>
    isVerificationRequired.value
      ? resolveI18nValue(
          "cabinet.dashboard.mt4.verifySubtitle",
          "Подтвердите данные профиля и документы, после этого сможете создать платеж."
        )
      : resolveI18nValue("cabinet.billing.emptySubtitle", "Создайте первый платёж, чтобы начать работу.")
  );

  const openMenuLabel = computed(() => resolveI18nValue("cabinet.billing.openPayment", "Открыть"));
  const syncMenuLabel = computed(() => resolveI18nValue("cabinet.billing.syncPayment", "Синхронизировать"));
  const deleteMenuLabel = computed(() => resolveI18nValue("cabinet.billing.deletePayment", "Удалить"));
  const syncPaymentSuccessLabel = computed(() =>
    resolveI18nValue("cabinet.billing.syncPaymentSuccess", "Синхронизация платежа выполнена.")
  );
  const syncPaymentErrorLabel = computed(() =>
    resolveI18nValue("cabinet.billing.syncPaymentError", "Не удалось синхронизировать платеж.")
  );
  const deletePaymentConfirmLabel = computed(() =>
    resolveI18nValue("cabinet.billing.deletePaymentConfirm", "Удалить платеж?")
  );
  const deletePaymentSuccessLabel = computed(() =>
    resolveI18nValue("cabinet.billing.deletePaymentSuccess", "Платеж удален.")
  );
  const deletePaymentErrorLabel = computed(() =>
    resolveI18nValue("cabinet.billing.deletePaymentError", "Не удалось удалить платеж.")
  );
  const internalTransferLabel = computed(() =>
    resolveI18nValue("cabinet.billing.internalTransfer", "Transfer between accounts")
  );
  const transferCreatedLabel = computed(() =>
    resolveI18nValue("cabinet.billing.transferCreated", "Transfer between accounts created.")
  );

  const paymentMenuStyle = computed(() => ({
    top: `${paymentMenuPosition.top}px`,
    left: `${paymentMenuPosition.left}px`,
  }));

  const totalPages = computed(() => Math.ceil(total.value / perPage.value));

  const visiblePages = computed(() => {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    const half = Math.floor(maxPagesToShow / 2);
    let start = Math.max(1, currentPage.value - half);
    let end = Math.min(totalPages.value, start + maxPagesToShow - 1);
    if (end - start < maxPagesToShow - 1) start = Math.max(1, end - maxPagesToShow + 1);
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

  const statusDotClass = (status?: string) => {
    const s = (status ?? "").trim().toLowerCase();

    const map: Record<string, string> = {
      pending: "bg-yellow-500",
      processing: "bg-blue-500",
      failed: "bg-red-600",
      rejected: "bg-rose-600",
      approved: "bg-emerald-600",
      success: "bg-green-600",
      successful: "bg-green-600",
    };

    return map[s] ?? "bg-[var(--ui-text-secondary)]";
  };

  const statusText = (status?: string): string => {
    const value = String(status ?? "").trim();
    return value === "" ? "-" : value;
  };

  const isInternalTransfer = (payment: any): boolean =>
    Boolean(payment?.is_internal_transfer || payment?.meta?.is_internal_transfer);

  const displayAccountRoute = (payment: any): string => {
    if (isInternalTransfer(payment)) {
      const fromNumber = String(payment?.transfer_from_account_number ?? payment?.account_number ?? "").trim();
      const toNumber = String(payment?.transfer_to_account_number ?? "").trim();
      if (fromNumber !== "" && toNumber !== "") {
        return `${fromNumber} -> ${toNumber}`;
      }
    }

    const accountNumber = String(payment?.account_number ?? "").trim();
    return accountNumber !== "" ? accountNumber : "-";
  };

  const displayPaymentSystem = (payment: any): string => {
    if (isInternalTransfer(payment)) {
      return internalTransferLabel.value;
    }

    const paymentSystemName = String(payment?.payment_system_name ?? "").trim();
    return paymentSystemName !== "" ? paymentSystemName : "-";
  };

  const isTruthyQueryValue = (value: unknown): boolean => {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase();

    return normalized === "1" || normalized === "true" || normalized === "yes";
  };

  const clearTransferQuery = async () => {
    if (route.query?.transferSuccess === undefined && route.query?.transferPaymentId === undefined) {
      return;
    }

    const nextQuery = { ...route.query };
    delete nextQuery.transferSuccess;
    delete nextQuery.transferPaymentId;

    await router.replace({ query: nextQuery });
  };

  const maybeShowTransferCreatedToast = async () => {
    if (!isTruthyQueryValue(route.query?.transferSuccess)) {
      return;
    }

    const transferPaymentId = String(route.query?.transferPaymentId ?? "").trim();
    const paymentShortId = transferPaymentId.split("-").pop() ?? transferPaymentId;
    const suffix = transferPaymentId !== "" ? ` #${paymentShortId}` : "";
    toast.success(`${transferCreatedLabel.value}${suffix}`);
    await clearTransferQuery();
  };

  const setPaymentMenuTriggerRef = (paymentId: string | number, el: HTMLElement | null) => {
    const id = String(paymentId);
    if (el) {
      paymentMenuTriggerRefs.value[id] = el;
      return;
    }

    delete paymentMenuTriggerRefs.value[id];
  };

  const closePaymentMenu = () => {
    activePaymentMenuId.value = null;
    paymentMenuReady.value = false;
  };

  const updatePaymentMenuPosition = () => {
    const paymentId = activePaymentMenuId.value;
    if (paymentId === null) return;

    const trigger = paymentMenuTriggerRefs.value[paymentId];
    const menu = paymentMenuRef.value;
    if (!trigger || !menu) return;

    const offset = 8;
    const triggerRect = trigger.getBoundingClientRect();
    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;

    const availableDown = window.innerHeight - triggerRect.bottom;
    const availableUp = triggerRect.top;
    const openUp =
      availableDown >= menuHeight + offset
        ? false
        : availableUp >= menuHeight + offset
          ? true
          : availableUp > availableDown;

    let top = openUp ? triggerRect.top - offset - menuHeight : triggerRect.bottom + offset;
    let left = triggerRect.right - menuWidth;

    const minX = 8;
    const maxX = Math.max(8, window.innerWidth - menuWidth - 8);
    left = Math.min(Math.max(left, minX), maxX);

    const minY = 8;
    const maxY = Math.max(8, window.innerHeight - menuHeight - 8);
    top = Math.min(Math.max(top, minY), maxY);

    paymentMenuPosition.top = top;
    paymentMenuPosition.left = left;
  };

  const togglePaymentMenu = async (paymentId: string | number) => {
    const id = String(paymentId);

    if (activePaymentMenuId.value === id) {
      closePaymentMenu();
      return;
    }

    activePaymentMenuId.value = id;
    paymentMenuReady.value = false;

    await nextTick();
    updatePaymentMenuPosition();

    requestAnimationFrame(() => {
      paymentMenuReady.value = true;
    });
  };

  const handleOpenPayment = (paymentId: string | number | null) => {
    if (paymentId === null) return;

    const id = String(paymentId);
    closePaymentMenu();
    router.push(localePath(`/payments/${id}`));
  };

  const shouldSkipPaymentNavigation = (event: MouseEvent): boolean => {
    const target = event.target as HTMLElement | null;

    if (target?.closest('button, a, input, select, textarea, [role="button"]')) {
      return true;
    }

    const selection = window.getSelection?.();
    if (!selection) {
      return false;
    }

    return selection.type === "Range" && selection.toString().trim().length > 0;
  };

  const handlePaymentItemClick = (event: MouseEvent, paymentId: string | number): void => {
    if (shouldSkipPaymentNavigation(event)) {
      return;
    }

    handleOpenPayment(paymentId);
  };

  const handleDeletePayment = async (paymentId: string | number | null) => {
    if (paymentId === null) return;

    const id = String(paymentId);
    closePaymentMenu();

    if (!window.confirm(deletePaymentConfirmLabel.value)) {
      return;
    }

    deletingPaymentId.value = id;

    try {
      await appCore.payments.delete(id);
      await loadData();
      toast.success(deletePaymentSuccessLabel.value);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? deletePaymentErrorLabel.value);
    } finally {
      deletingPaymentId.value = null;
    }
  };

  const canSyncPayment = (payment: any): boolean => {
    return (
      String(payment?.type ?? "").trim() === "deposit" && String(payment?.payment_gateway ?? "").trim() === "coinsbuy"
    );
  };

  const canSyncPaymentById = (paymentId: string | number): boolean => {
    const payment = payments.find(item => String(item?.id ?? "") === String(paymentId));
    return payment ? canSyncPayment(payment) : false;
  };

  const handleSyncPayment = async (paymentId: string | number | null) => {
    if (paymentId === null) return;

    const id = String(paymentId);
    if (!canSyncPaymentById(id)) {
      return;
    }

    closePaymentMenu();
    syncingPaymentId.value = id;

    try {
      const response = await appCore.payments.sync(id);
      await loadData({ silent: true });
      toast.success(response?.data?.message ?? syncPaymentSuccessLabel.value);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? syncPaymentErrorLabel.value);
    } finally {
      syncingPaymentId.value = null;
    }
  };

  const recalcPaymentMenu = () => {
    if (activePaymentMenuId.value !== null) {
      updatePaymentMenuPosition();
    }
  };

  const handlePaymentMenuOutside = (event: MouseEvent) => {
    const paymentId = activePaymentMenuId.value;
    if (paymentId === null) return;

    const target = event.target as Node | null;
    if (!target) return;

    const trigger = paymentMenuTriggerRefs.value[paymentId];
    const insideTrigger = !!trigger && trigger.contains(target);
    const insideMenu = !!paymentMenuRef.value && paymentMenuRef.value.contains(target);

    if (!insideTrigger && !insideMenu) {
      closePaymentMenu();
    }
  };

  const handlePaymentMenuEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closePaymentMenu();
    }
  };

  const handleIconClick = (id: string) => {
    const payment = payments.find(x => x.id === id);
    if (payment) payment.isSpinning = true;
  };

  const onIconAnimationEnd = () => {
    spinIcon.value = false;
  };

  const handleInputSearch = async (value: any) => {
    search.value = value;
    currentPage.value = 1;
    await loadData();
  };

  const handleOrderByAndDirection = async (value: string) => {
    orderDirection.value = orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC;
    orderBy.value = value;
    await loadData();
  };

  const loadData = async (options: { silent?: boolean } = {}) => {
    const { silent = false } = options;
    const shouldShowLoader = !silent || isInitialLoading.value;

    if (shouldShowLoader) {
      isLoading.value = true;
    }

    try {
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

      const paymentsData = response.data.data.data.map((x: any) => {
        x.isSpinning = false;
        return x;
      });

      payments.splice(0, payments.length, ...paymentsData);
    } finally {
      if (shouldShowLoader) {
        isLoading.value = false;
      }
      isInitialLoading.value = false;
    }
  };

  const handleClientNotificationReceived = async (payload: any) => {
    const notification = payload?.notification;
    const type = String(notification?.type ?? "").trim();

    if (!BILLING_NOTIFICATION_TYPES.includes(type)) {
      return;
    }

    try {
      await loadData({ silent: true });
    } catch {
      // no-op
    }
  };

  const resolveEchoClient = () => {
    if ($echo && typeof ($echo as any).private === "function") {
      return $echo as any;
    }

    if (typeof window !== "undefined") {
      const fallbackEcho = (window as any).Echo;
      if (fallbackEcho && typeof fallbackEcho.private === "function") {
        return fallbackEcho;
      }
    }

    return null;
  };

  const handlePaymentRealtimeUpdated = async () => {
    try {
      await loadData({ silent: true });
    } catch {
      // no-op
    }
  };

  const subscribeToPaymentRealtime = () => {
    const userId = String(authStore.user?.id ?? "").trim();
    if (userId === "") {
      return;
    }

    const echoClient = resolveEchoClient();
    if (!echoClient) {
      return;
    }

    const channelName = `payments.user.${userId}`;
    if (currentPaymentRealtimeChannelName.value === channelName && paymentRealtimeChannel.value) {
      return;
    }

    unsubscribeFromPaymentRealtime();
    currentPaymentRealtimeChannelName.value = channelName;
    paymentRealtimeChannel.value = echoClient.private(channelName);

    PAYMENT_REALTIME_EVENT_NAMES.forEach(eventName => {
      paymentRealtimeChannel.value.stopListening(eventName, handlePaymentRealtimeUpdated);
      paymentRealtimeChannel.value.listen(eventName, handlePaymentRealtimeUpdated);
    });
  };

  const unsubscribeFromPaymentRealtime = () => {
    const channelName = currentPaymentRealtimeChannelName.value;
    currentPaymentRealtimeChannelName.value = "";
    paymentRealtimeChannel.value = null;

    if (channelName === "") {
      return;
    }

    const echoClient = resolveEchoClient();
    if (!echoClient) {
      return;
    }

    try {
      echoClient.leave(channelName);
    } catch {
      // no-op
    }
  };

  const shortId = (uuid: string) => uuid.split("-").pop();

  const copyToClipboard = (paymentId: string) => {
    const id = shortId(paymentId);
    if (id) navigator.clipboard.writeText(id);
  };

  const handleGoToVerification = async () => {
    await navigateTo(localePath({ path: "/profile", query: { tab: "verification" } }));
  };

  const resolveQueryString = (value: unknown): string => {
    if (Array.isArray(value)) {
      return String(value[0] ?? "").trim();
    }

    return String(value ?? "").trim();
  };

  const handleClickCreateNewDeposit = async (
    initialTab: "deposit" | "withdrawal" = "deposit",
    initialAccountId = ""
  ) => {
    if (isVerificationRequired.value) {
      await handleGoToVerification();
      return;
    }

    openModal(CreateNewDeposit, {
      title: initialTab === "withdrawal" ? createWithdrawalLabel.value : createDepositLabel.value,
      initialTab,
      initialAccountId,
    });
  };

  const handleClickUpdate = async () => {
    await loadData();
  };

  const handleSetPerPage = async (value: number) => {
    perPage.value = value;
    currentPage.value = 1;
    await loadData();
  };

  const isViewModeValue = (value: string | null): value is "table" | "cards" | "full" =>
    value === "table" || value === "cards" || value === "full";

  const initViewMode = () => {
    if (typeof window === "undefined") return;
    syncViewModeWithViewport(true);
  };

  watch(viewMode, mode => {
    if (typeof window === "undefined") return;
    if (isMobileViewport.value) return;
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  });

  watch(
    () => authStore.user?.id,
    () => {
      subscribeToPaymentRealtime();
    }
  );

  const handleChangeViewMode = (nextViewMode: string) => {
    if (isMobileViewport.value) return;
    if (nextViewMode === "table" || nextViewMode === "cards" || nextViewMode === "full") {
      viewMode.value = nextViewMode;
    }
  };

  const resolveDefaultViewMode = (width: number): "table" | "cards" | "full" => {
    if (width < 768) return "cards";
    if (width < 1024) return "full";
    return "table";
  };

  const syncViewport = (): boolean => {
    if (typeof window === "undefined") return false;
    const wasMobile = isMobileViewport.value;
    isMobileViewport.value = window.innerWidth < 768;
    return wasMobile !== isMobileViewport.value;
  };

  const syncViewModeWithViewport = (forceRestore = false) => {
    if (typeof window === "undefined") return;

    const viewportChanged = syncViewport();

    if (isMobileViewport.value) {
      if (viewMode.value !== "cards") {
        viewMode.value = "cards";
      }
      return;
    }

    if (!forceRestore && !viewportChanged) return;

    const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (isViewModeValue(saved)) {
      viewMode.value = saved;
      return;
    }

    viewMode.value = resolveDefaultViewMode(window.innerWidth);
  };

  const handleViewportResize = () => {
    syncViewModeWithViewport();
    recalcPaymentMenu();
  };

  onMounted(async () => {
    initViewMode();
    useEventBus.on("loadDataForPayments", loadData);
    useEventBus.on(CLIENT_NOTIFICATION_RECEIVED_EVENT, handleClientNotificationReceived);
    subscribeToPaymentRealtime();
    await Promise.all([loadData(), refreshAccountCreationEligibility()]);
    await nextTick();
    const openDeposit = resolveQueryString(route.query?.openDeposit);
    const openWithdrawal = resolveQueryString(route.query?.openWithdrawal);
    const initialAccountId = resolveQueryString(route.query?.accountId || route.query?.account_id);

    if (openWithdrawal === "1" || openWithdrawal === "true" || openWithdrawal === "yes") {
      await handleClickCreateNewDeposit("withdrawal", initialAccountId);
    } else if (openDeposit === "1" || openDeposit === "true" || openDeposit === "yes") {
      await handleClickCreateNewDeposit("deposit", initialAccountId);
    }

    await maybeShowTransferCreatedToast();

    window.addEventListener("resize", handleViewportResize, { passive: true });
    window.addEventListener("scroll", recalcPaymentMenu, { passive: true, capture: true });
    window.addEventListener("mousedown", handlePaymentMenuOutside, true);
    window.addEventListener("keydown", handlePaymentMenuEscape, true);
  });

  onBeforeUnmount(() => {
    useEventBus.off("loadDataForPayments", loadData);
    useEventBus.off(CLIENT_NOTIFICATION_RECEIVED_EVENT, handleClientNotificationReceived);
    unsubscribeFromPaymentRealtime();
    window.removeEventListener("resize", handleViewportResize);
    window.removeEventListener("scroll", recalcPaymentMenu, true);
    window.removeEventListener("mousedown", handlePaymentMenuOutside, true);
    window.removeEventListener("keydown", handlePaymentMenuEscape, true);
  });
</script>

<style scoped>
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

  .payments-header {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 12px;
  }

  .payments-header__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    width: 100%;
  }

  .payments-header__notice {
    margin-top: 8px;
    color: var(--color-warning);
    font-size: 13px;
    line-height: 1.35;
  }

  .payments-empty-state {
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

  .payments-empty-state__icon-wrap {
    height: 64px;
    width: 64px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--ui-primary-main) 16%, transparent);
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 36%, transparent);
  }

  .payments-empty-state__icon {
    width: 28px;
    height: 28px;
    color: var(--ui-primary-main);
  }

  .payments-empty-state__title {
    color: var(--ui-text-main);
    font-size: 18px;
    font-weight: 700;
  }

  .payments-empty-state__subtitle {
    color: var(--ui-text-secondary);
    max-width: 420px;
  }

  .payments-empty-state__warning {
    color: var(--color-warning);
    max-width: 460px;
  }

  .payments-empty-state__button {
    min-width: 220px;
    justify-content: center;
  }

  .payments-empty-state__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    width: 100%;
  }

  @media (max-width: 767px) {
    .payments-header {
      flex-direction: column;
      align-items: stretch;
    }

    .payments-header__actions {
      flex-direction: column;
      align-items: stretch;
    }

    .payments-empty-state__button {
      width: 100%;
      min-width: 0;
    }
  }

  @keyframes wiggle {
    0% {
      transform: translateX(0);
    }
    20% {
      transform: translateX(-1px);
    }
    40% {
      transform: translateX(1px);
    }
    60% {
      transform: translateX(-1px);
    }
    80% {
      transform: translateX(1px);
    }
    100% {
      transform: translateX(0);
    }
  }

  .cabinet-card {
    position: relative;
    background: var(--ui-background-panel);
    border: 1px solid var(--color-stroke-ui-dark);
    border-radius: 12px;
    padding: 12px 14px;
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease,
      transform 0.2s ease;
  }

  .cabinet-card:hover {
    border-color: var(--color-stroke-ui-light);
    background: var(--color-stroke-ui-dark);
    transform: translateY(-1px);
  }

  .card-with-actions {
    padding-right: 86px;
  }

  .cabinet-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px 12px;
    min-height: 48px;
  }

  .cabinet-card__head-main {
    min-width: 0;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .cabinet-card__head-side {
    min-width: 120px;
    display: inline-flex;
    justify-content: flex-end;
    align-items: flex-start;
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

  .cabinet-card__value--positive {
    color: var(--ui-sticker-success);
  }

  .status-inline {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--ui-text-main);
    text-transform: capitalize;
    font-weight: 600;
  }

  .cabinet-card--full-row {
    display: grid;
    grid-template-columns: minmax(280px, 1.3fr) minmax(360px, 1.7fr);
    align-items: center;
    column-gap: 16px;
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .cabinet-card--full-row .cabinet-card__header {
    min-height: 0;
    align-items: center;
  }

  .cabinet-card--full-row .cabinet-card__head-side {
    min-width: 0;
  }

  .cabinet-card--full-row .cabinet-card__grid {
    margin-top: 0;
  }

  @media (max-width: 1024px) {
    .cabinet-card--full-row {
      grid-template-columns: 1fr;
      row-gap: 10px;
    }

    .cabinet-card--full-row .cabinet-card__grid {
      margin-top: 0;
    }

    .cabinet-card__grid--full {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .card-with-actions {
      padding-right: 82px;
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

  .copy-btn,
  .action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    width: 32px;
    border-radius: 8px;
    color: var(--ui-text-secondary);
    background: transparent;
    border: 1px solid transparent;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease,
      transform 0.15s ease;
  }

  .copy-btn:hover,
  .action-btn:hover {
    color: var(--ui-text-main);
    border-color: var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--color-stroke-ui-light) 40%, transparent);
    transform: translateY(-1px);
  }

  .action-btn:disabled {
    opacity: 0.6;
    pointer-events: none;
  }
</style>
