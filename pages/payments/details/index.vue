<template>
  <PageStructureDefault>
    <template #header>
      <UiTextH4 class="text-[var(--ui-text-main)] mr-5">
        {{ t("cabinet.payments.title") }}
      </UiTextH4>

      <UiButtonDefault state="info" class="w-full md:w-auto" @click="handleClickCreateNewPaymentDetail">
        <UiIconPlus class="mr-2" />
        <span>{{ t("cabinet.payments.details.createNew.title") }}</span>
      </UiButtonDefault>
    </template>

    <template #content>
      <PageStructureContent>
        <template #top>
          <div class="relative w-full md:w-[420px]">
            <UiInput class="w-full" @input="handleInputSearch" :value="search" :placeholder="t('cabinet.accounts.search')">
              <template #icon-left>
                <UiIconSearch />
              </template>
            </UiInput>
          </div>

          <div class="flex items-center gap-2">
            <UiButtonDefault state="info--small" @click="handleClickUpdate">
              <UiIconUpdate :spinning="isLoading" />
            </UiButtonDefault>

            <UiSelect
                class="min-w-[180px]"
                :value="orderBy"
                :data="sortByFilterData"
                :withoutNoSelect="true"
                @change="handleChangeFilterSortBy"
            >
              <template #icon-left>
                <UiIconSortBy class="!h-4 !w-4" :orderDirectionEnabled="true" :orderDirection="orderDirection" />
              </template>
            </UiSelect>

            <UiButtonDefault state="info--small">
              <UiIconFilters class="mr-2" />
              <UiTextSmall>Filters</UiTextSmall>
              <UiIconArrowDown :rotate180="false" class="ml-2" />
            </UiButtonDefault>
          </div>
        </template>

        <template #content>
          <TableMain ref="tableRef">
            <template #thead>
              <tr>
                <th class="px-5 py-2 text-left font-normal w-[16rem]">
                  <button type="button" class="flex items-center gap-2" @click="handleOrderByAndDirection('name')">
                    <UiTextSmall>Name</UiTextSmall>
                    <UiIconSort :active="orderBy === 'name'" :direction="orderDirection" />
                  </button>
                </th>

                <th class="px-5 py-2 text-left font-normal w-[12rem]">
                  <button type="button" class="flex items-center gap-2" @click="handleOrderByAndDirection('payment_system')">
                    <UiTextSmall>Payment system</UiTextSmall>
                  </button>
                </th>

                <th class="px-5 py-2 text-left font-normal w-[6rem]">
                  <button type="button" class="flex items-center gap-2" @click="handleOrderByAndDirection('currency')">
                    <UiTextSmall>Currency</UiTextSmall>
                  </button>
                </th>

                <th class="px-5 py-2 text-left font-normal w-[8rem]">
                  <button type="button" class="flex items-center gap-2" @click="handleOrderByAndDirection('status')">
                    <UiTextSmall>Status</UiTextSmall>
                    <UiIconSort :active="orderBy === 'status'" :direction="orderDirection" />
                  </button>
                </th>

                <th class="px-5 py-2 text-left font-normal w-[14rem]">
                  <button type="button" class="flex items-center gap-2" @click="handleOrderByAndDirection('updated_at')">
                    <UiTextSmall>UpdatedAt</UiTextSmall>
                    <UiIconSort :active="orderBy === 'updated_at'" :direction="orderDirection" />
                  </button>
                </th>

                <th class="px-5 py-2 text-right font-normal w-[3rem]"></th>
              </tr>
            </template>

            <template #tbody>
              <div
                  v-if="isLoading"
                  class="backdrop-blur-[2px] w-full absolute bottom-0 top-[45px] flex items-center justify-center z-10"
              >
                <UiIconSpinnerDefault />
              </div>

              <template v-if="paymentDetails.length">
                <tr
                    v-for="(paymentDetail, index) in paymentDetails"
                    :key="paymentDetail.id"
                    class="border-t border-[var(--color-ui-border)] hover:bg-[var(--color-stroke-ui-dark)]"
                >
                  <td
                      class="px-5 py-3 align-middle font-bold text-[var(--color-ui-accent)] truncate"
                      :title="paymentDetail?.name"
                  >
                    {{ paymentDetail?.name }}
                  </td>

                  <td class="px-5 py-3 align-middle truncate" :title="paymentDetail.payment_system_name">
                    {{ paymentDetail.payment_system_name }}
                  </td>

                  <td class="px-5 py-3 align-middle">
                    {{ paymentDetail.currency ?? "USD" }}
                  </td>

                  <td class="px-5 py-3 align-middle capitalize">
                    {{ paymentDetail.status }}
                  </td>

                  <td class="px-5 py-3 align-middle whitespace-nowrap">
                    {{ new Date(paymentDetail.updated_at).toLocaleString() }}
                  </td>

                  <td class="px-5 py-3 align-middle">
                    <span
                        @click="toggleRowOptions(index)"
                        class="relative flex h-[32px] w-[32px] items-center justify-center rounded-md border border-transparent transition-colors cursor-pointer"
                        :ref="(el) => (triggerRefs[index] = el as HTMLElement | null)"
                    >
                      <UiIconDotsVertical />
                    </span>

                    <Teleport to="body">
                      <div
                          v-if="currentRowActiveOptions === index"
                          :ref="(el) => (menuRefs[index] = el as HTMLElement | null)"
                          class="fixed z-[9999] max-h-[70vh] overflow-auto text-[var(--ui-text-main)]"
                          :class="[
                          'flex min-w-[140px] max-w-[60vw] flex-col gap-1 rounded-md border border-[var(--color-stroke-ui-light)] bg-[var(--color-stroke-ui-dark)] p-3 shadow-lg transition-opacity duration-100',
                          menuReady[index] ? 'opacity-100' : 'opacity-0 pointer-events-none',
                        ]"
                          :style="getMenuStyle(index)"
                      >
                        <div
                            class="flex h-8 cursor-pointer items-center justify-start gap-2 rounded-md px-2 hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                        >
                          <UiIconEye class="!h-[14px] !w-[14px]" />
                          <UiTextSmall class="whitespace-nowrap">View</UiTextSmall>
                        </div>

                        <div
                            class="flex h-8 cursor-pointer items-center justify-start gap-2 rounded-md px-2 hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                        >
                          <UiIconConfirm class="!h-[14px] !w-[14px]" />
                          <UiTextSmall class="whitespace-nowrap">Confirm</UiTextSmall>
                        </div>

                        <div
                            class="flex h-8 cursor-pointer items-center justify-start gap-2 rounded-md px-2 hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                        >
                          <UiIconTrash class="!h-[14px] !w-[14px] stroke-[var(--ui-sticker-danger)]" />
                          <UiTextSmall class="whitespace-nowrap">Delete</UiTextSmall>
                        </div>
                      </div>
                    </Teleport>
                  </td>
                </tr>
              </template>
            </template>
          </TableMain>
        </template>
      </PageStructureContent>

      <template v-if="isInitialLoading">
        <div class="flex min-h-[55vh] w-full flex-col items-center justify-center">
          <UiIconLogo class="mb-4 h-[44px] w-[44px]" />
          <UiIconSpinnerDefault class="h-[44px] w-[44px]" />
        </div>
      </template>


      <template v-if="!isInitialLoading && paymentDetails.length === 0">
        <div class="h-[40vh] flex items-center justify-center">
          <span v-if="!isLoading" class="text-[var(--ui-text-main)]">
            {{ t("cabinet.payments.nothingToShow") }}
          </span>
          <UiIconSpinnerDefault v-else />
        </div>
      </template>

      <PaginationMain
          class="px-5 py-2"
          :current-page="currentPage"
          :total-pages="totalPages"
          :total="total"
          :per-page="perPage"
          :visible-pages="visiblePages"
          :per-page-options="[1,2,3,4,5,6,7,8,9,10,12,15,20,25,50,100]"
          @go-prev="goPrev"
          @go-next="goNext"
          @set-page="setPage"
          @set-per-page="handleSetPerPage"
      />

    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
import PaymentDetailsCreateNew from "~/pages/payments/details/components/PaymentDetailsCreateNew.vue";

import PageStructureContent from "~/components/block/pages/PageStructureContent.vue";
import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
import PaginationMain from "~/components/block/paginations/PaginationMain.vue";
import TableMain from "~/components/block/tables/TableMain.vue";

import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconArrowDown from "~/components/ui/UiIconArrowDown.vue";
import UiIconConfirm from "~/components/ui/UiIconConfirm.vue";
import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";
import UiIconEye from "~/components/ui/UiIconEye.vue";
import UiIconFilters from "~/components/ui/UiIconFilters.vue";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
import UiIconPlus from "~/components/ui/UiIconPlus.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";
import UiIconSort from "~/components/ui/UiIconSort.vue";
import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconTrash from "~/components/ui/UiIconTrash.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiSelect from "~/components/ui/UiSelect.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";

import useAppCore from "~/composables/useAppCore";

import { definePageMeta } from "~/.nuxt/imports";
import { useI18n } from "vue-i18n";
import { computed, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";

definePageMeta({
  layout: "cabinet",
  middleware: ["auth-client", "client-check-auth"],
});

const { t } = useI18n({ useScope: "global" });
const { openModal } = inject("modalControl") as { openModal: Function };

const appCore = useAppCore();

const ORDER_DIRECTION_ASC = "asc";
const ORDER_DIRECTION_DESC = "desc";

const isLoading = ref(false);
const isInitialLoading = ref(true);

const search = ref("");
const total = ref(0);
const perPage = ref(7);
const currentPage = ref(1);
const orderBy = ref("created_at");
const orderDirection = ref<typeof ORDER_DIRECTION_ASC | typeof ORDER_DIRECTION_DESC>(ORDER_DIRECTION_DESC);

const paymentDetails = reactive<any[]>([]);

const tableRef = ref<any>(null);

const currentRowActiveOptions = ref<number | null>(null);
const triggerRefs = ref<(HTMLElement | null)[]>([]);
const menuRefs = ref<(HTMLElement | null)[]>([]);
const menuReady = reactive<Record<number, boolean>>({});
const dropUp = reactive<Record<number, boolean>>({});
const menuPosition = reactive<Record<number, { top: number; left: number }>>({});

const getMenuStyle = (index: number) => {
  const pos = menuPosition[index];
  if (!pos) return { top: "0px", left: "0px" };
  return { top: `${pos.top}px`, left: `${pos.left}px` };
};

const updateMenuPosition = (index: number) => {
  const trigger = triggerRefs.value[index];
  const menu = menuRefs.value[index];
  if (!trigger || !menu) return;

  const offset = 8;
  const triggerRect = trigger.getBoundingClientRect();

  const menuHeight = menu.offsetHeight;
  const menuWidth = menu.offsetWidth;

  const availableDown = window.innerHeight - triggerRect.bottom;
  const availableUp = triggerRect.top;

  let openUp = false;
  if (availableDown >= menuHeight + offset) openUp = false;
  else if (availableUp >= menuHeight + offset) openUp = true;
  else openUp = availableUp > availableDown;

  dropUp[index] = openUp;

  let top = openUp ? triggerRect.top - offset - menuHeight : triggerRect.bottom + offset;
  let left = triggerRect.right - menuWidth - 12;

  const minX = 8;
  const maxX = Math.max(8, window.innerWidth - menuWidth - 8);
  left = Math.min(Math.max(left, minX), maxX);

  const minY = 8;
  const maxY = Math.max(8, window.innerHeight - menuHeight - 8);
  top = Math.min(Math.max(top, minY), maxY);

  menuPosition[index] = { top, left };
};

const toggleRowOptions = async (index: number) => {
  const next = currentRowActiveOptions.value === index ? null : index;
  currentRowActiveOptions.value = next;

  if (next === null) return;

  menuReady[index] = false;

  await nextTick();
  updateMenuPosition(index);

  requestAnimationFrame(() => {
    menuReady[index] = true;
  });
};

const recalcActiveMenu = () => {
  if (currentRowActiveOptions.value !== null) {
    updateMenuPosition(currentRowActiveOptions.value);
  }
};

const onClickOutside = (e: MouseEvent) => {
  const i = currentRowActiveOptions.value;
  if (i === null) return;

  const tEl = triggerRefs.value[i];
  const mEl = menuRefs.value[i];
  const target = e.target as Node | null;
  if (!target) return;

  const inside = (!!tEl && tEl.contains(target)) || (!!mEl && mEl.contains(target));
  if (!inside) currentRowActiveOptions.value = null;
};

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") currentRowActiveOptions.value = null;
};

const sortByFilterData = reactive([
  { id: "name", value: "name", text: "Name" },
  { id: "status", value: "status", text: "Status" },
  { id: "created_at", value: "created_at", text: "Created at" },
  { id: "updated_at", value: "updated_at", text: "Updated at" },
]);

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

const handleInputSearch = async (value: string) => {
  search.value = value;
  currentPage.value = 1;
  await loadData();
};

const handleOrderByAndDirection = async (value: string) => {
  orderDirection.value = orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC;
  orderBy.value = value;
  await loadData();
};

const handleChangeFilterSortBy = async (value: string) => {
  if (orderBy.value === value) {
    orderDirection.value = orderDirection.value === ORDER_DIRECTION_DESC ? ORDER_DIRECTION_ASC : ORDER_DIRECTION_DESC;
  } else {
    orderBy.value = value;
  }
  await loadData();
};

const handleSetPerPage = async (value: number) => {
  perPage.value = value;
  currentPage.value = 1;
  await loadData();
};

const loadData = async () => {
  isLoading.value = true;

  try {
    const response = await appCore.paymentDetails.get({
      search: search.value,
      perPage: perPage.value,
      page: currentPage.value,
      orderBy: orderBy.value,
      orderDirection: orderDirection.value,
    });

    perPage.value = response.data.data.per_page;
    currentPage.value = response.data.data.current_page;
    total.value = response.data.data.total;

    const paymentDetailsData = response.data.data.data.map((x: any) => {
      x.isSpinning = false;
      return x;
    });

    paymentDetails.splice(0, paymentDetails.length, ...paymentDetailsData);
  } finally {
    isLoading.value = false;
    isInitialLoading.value = false;
  }
};

const handleClickUpdate = async () => {
  await loadData();
};

const handleClickCreateNewPaymentDetail = async () => {
  openModal(PaymentDetailsCreateNew, {
    title: t("cabinet.payments.details.createNew.title"),
  });
};

onMounted(async () => {
  await loadData();

  window.addEventListener("resize", recalcActiveMenu, { passive: true });
  window.addEventListener("scroll", recalcActiveMenu, { passive: true, capture: true });

  const el = (tableRef.value?.$el ?? null) as HTMLElement | null;
  el?.addEventListener("scroll", recalcActiveMenu, { passive: true });

  window.addEventListener("mousedown", onClickOutside, true);
  window.addEventListener("keydown", onKeydown, true);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", recalcActiveMenu);
  window.removeEventListener("scroll", recalcActiveMenu, true);

  const el = (tableRef.value?.$el ?? null) as HTMLElement | null;
  el?.removeEventListener("scroll", recalcActiveMenu);

  window.removeEventListener("mousedown", onClickOutside, true);
  window.removeEventListener("keydown", onKeydown, true);
});
</script>



<!--<template>-->
<!--  <UiContainer>-->
<!--    <div class="payments-details pb-10">-->
<!--      <div class="mt-5 mb-5 flex items-center justify-between">-->
<!--        <UiTextH4 class="text-[var(&#45;&#45;ui-text-main)]">-->
<!--          {{ t("cabinet.payments.title") }}-->
<!--        </UiTextH4>-->

<!--        <UiButtonDefault state="info" @click="handleClickCreateNewPaymentDetail">-->
<!--          <UiIconPlus class="mr-2" />-->
<!--          <span>{{ t("cabinet.payments.details.createNew.title") }}</span>-->
<!--        </UiButtonDefault>-->
<!--      </div>-->

<!--      <div>-->
<!--        <div class="mb-5 flex items-center justify-between">-->
<!--          <div class="lex items-center justify-center gap-1 w-full max-w-60">-->
<!--            <UiInput-->
<!--                class="w-full"-->
<!--                @input="handleInputSearch"-->
<!--                :value="search"-->
<!--                :placeholder="t('cabinet.accounts.search')"-->
<!--            >-->
<!--              <template #icon-left>-->
<!--                <UiIconSearch />-->
<!--              </template>-->
<!--            </UiInput>-->
<!--          </div>-->

<!--          <div class="flex items-center gap-2">-->
<!--            <UiButtonDefault state="info&#45;&#45;small" class="mr-2" @click="handleClickUpdate">-->
<!--              <UiIconUpdate v-if="!isLoading" />-->
<!--              <UiIconSpinnerDefault v-else />-->
<!--            </UiButtonDefault>-->

<!--            <UiSelect-->
<!--                class="mr-2"-->
<!--                :value="orderBy"-->
<!--                :data="sortByFilterData"-->
<!--                :withoutNoSelect="true"-->
<!--                @change="handleChangeFilterSortBy"-->
<!--            >-->
<!--              <template #icon-left>-->
<!--                <UiIconSortBy-->
<!--                    class="!h-4 !w-4"-->
<!--                    :orderDirectionEnabled="true"-->
<!--                    :orderDirection="orderDirection"-->
<!--                />-->
<!--              </template>-->
<!--            </UiSelect>-->

<!--            <UiButtonDefault state="info&#45;&#45;small">-->
<!--              <UiIconFilters class="mr-2" />-->
<!--              <UiTextSmall>Filters</UiTextSmall>-->
<!--              <UiIconArrowDown :rotate180="false" class="ml-2" />-->
<!--            </UiButtonDefault>-->
<!--          </div>-->
<!--        </div>-->

<!--        <PanelDefault>-->
<!--          <div v-if="isInitialLoading" class="flex min-h-[55vh] w-full flex-col items-center justify-center">-->
<!--            <UiIconLogo class="mb-4 h-[44px] w-[44px]" />-->
<!--            <UiIconSpinnerDefault class="h-[44px] w-[44px]" />-->
<!--          </div>-->

<!--          <div v-else class="relative rounded-[9px]">-->
<!--            <div-->
<!--                class="pointer-events-none absolute inset-0 z-[1] rounded-[9px] ring-1 ring-[var(&#45;&#45;color-stroke-ui-dark)]"-->
<!--            ></div>-->

<!--            <div class="relative z-[0] overflow-x-auto overscroll-x-contain" ref="scrollArea">-->
<!--              <table class="w-full min-w-[1000px] table-auto whitespace-nowrap text-[var(&#45;&#45;ui-text-main)]">-->
<!--                <colgroup>-->
<!--                  <col class="w-[16rem]" />-->
<!--                  <col class="w-[12rem]" />-->
<!--                  <col class="w-[6rem]" />-->
<!--                  <col class="w-[8rem]" />-->
<!--                  <col class="w-[14rem]" />-->
<!--                  <col class="w-[3rem]" />-->
<!--                </colgroup>-->

<!--                <thead>-->
<!--                <tr class="h-[46px] !border-none">-->
<!--                  <th class="px-5 text-left !border-none bg-[var(&#45;&#45;color-stroke-ui-light)] rounded-tl-[10px]">-->
<!--                    <button type="button" class="flex items-center gap-2" @click="handleOrderByAndDirection('name')">-->
<!--                      <UiTextSmall>Name</UiTextSmall>-->
<!--                      <UiIconSort :active="orderBy === 'name'" :direction="orderDirection" />-->
<!--                    </button>-->
<!--                  </th>-->

<!--                  <th class="px-5 text-left bg-[var(&#45;&#45;color-stroke-ui-light)]">-->
<!--                    <button-->
<!--                        type="button"-->
<!--                        class="flex items-center gap-2"-->
<!--                        @click="handleOrderByAndDirection('payment_system')"-->
<!--                    >-->
<!--                      <UiTextSmall>Payment system</UiTextSmall>-->
<!--                    </button>-->
<!--                  </th>-->

<!--                  <th class="px-5 text-left bg-[var(&#45;&#45;color-stroke-ui-light)]">-->
<!--                    <button type="button" class="flex items-center gap-2" @click="handleOrderByAndDirection('currency')">-->
<!--                      <UiTextSmall>Currency</UiTextSmall>-->
<!--                    </button>-->
<!--                  </th>-->

<!--                  <th class="px-5 text-left bg-[var(&#45;&#45;color-stroke-ui-light)]">-->
<!--                    <button type="button" class="flex items-center gap-2" @click="handleOrderByAndDirection('status')">-->
<!--                      <UiTextSmall>Status</UiTextSmall>-->
<!--                      <UiIconSort :active="orderBy === 'status'" :direction="orderDirection" />-->
<!--                    </button>-->
<!--                  </th>-->

<!--                  <th class="px-5 text-left bg-[var(&#45;&#45;color-stroke-ui-light)]">-->
<!--                    <button-->
<!--                        type="button"-->
<!--                        class="flex items-center gap-2"-->
<!--                        @click="handleOrderByAndDirection('updated_at')"-->
<!--                    >-->
<!--                      <UiTextSmall>UpdatedAt</UiTextSmall>-->
<!--                      <UiIconSort :active="orderBy === 'updated_at'" :direction="orderDirection" />-->
<!--                    </button>-->
<!--                  </th>-->

<!--                  <th class="px-5 text-right bg-[var(&#45;&#45;color-stroke-ui-light)] rounded-tr-[10px]"></th>-->
<!--                </tr>-->
<!--                </thead>-->

<!--                <tbody>-->
<!--                <tr v-if="paymentDetails.length === 0" class="h-[40vh]">-->
<!--                  <td colspan="7" class="px-5 text-center align-middle bg-[var(&#45;&#45;ui-background-panel)] rounded-b-[10px]">-->
<!--                    {{ t("cabinet.payments.nothingToShow") }}-->
<!--                  </td>-->
<!--                </tr>-->

<!--                <tr-->
<!--                    v-else-->
<!--                    v-for="(paymentDetail, index) in paymentDetails"-->
<!--                    :key="paymentDetail.id"-->
<!--                    class="h-[60px] border border-[var(&#45;&#45;color-stroke-ui-dark)] bg-[var(&#45;&#45;ui-background-panel)] hover:bg-[var(&#45;&#45;color-stroke-ui-dark)]"-->
<!--                >-->
<!--                  <td-->
<!--                      class="px-5 align-middle font-bold text-[var(&#45;&#45;color-ui-accent)] truncate bg-inherit"-->
<!--                      :class="index === paymentDetails.length - 1 ? 'rounded-bl-[10px]' : ''"-->
<!--                      :title="paymentDetail?.name"-->
<!--                  >-->
<!--                    {{ paymentDetail?.name }}-->
<!--                  </td>-->

<!--                  <td class="px-5 align-middle truncate bg-inherit" :title="paymentDetail.payment_system_name">-->
<!--                    {{ paymentDetail.payment_system_name }}-->
<!--                  </td>-->

<!--                  <td class="px-5 align-middle bg-inherit">-->
<!--                    {{ paymentDetail.currency ?? "USD" }}-->
<!--                  </td>-->

<!--                  <td class="px-5 align-middle capitalize bg-inherit">-->
<!--                    {{ paymentDetail.status }}-->
<!--                  </td>-->

<!--                  <td class="px-5 align-middle bg-inherit">-->
<!--                    {{ new Date(paymentDetail.updated_at).toLocaleString() }}-->
<!--                  </td>-->

<!--                  <td-->
<!--                      class="px-5 align-middle bg-inherit"-->
<!--                      :class="index === paymentDetails.length - 1 ? 'rounded-br-[10px]' : ''"-->
<!--                  >-->
<!--                      <span-->
<!--                          @click="toggleRowOptions(index)"-->
<!--                          class="relative flex h-[32px] w-[32px] items-center justify-center rounded-md border border-transparent transition-colors"-->
<!--                          :ref="(el) => (triggerRefs[index] = el as HTMLElement | null)"-->
<!--                      >-->
<!--                        <UiIconDotsVertical />-->
<!--                      </span>-->

<!--                    <Teleport to="body">-->
<!--                      <div-->
<!--                          v-if="currentRowActiveOptions === index"-->
<!--                          :ref="(el) => (menuRefs[index] = el as HTMLElement | null)"-->
<!--                          class="fixed z-[9999] max-h-[70vh] overflow-auto text-[var(&#45;&#45;ui-text-main)]"-->
<!--                          :class="[-->
<!--                            'flex min-w-[140px] max-w-[60vw] flex-col gap-1 rounded-md border border-[var(&#45;&#45;color-stroke-ui-light)] bg-[var(&#45;&#45;color-stroke-ui-dark)] p-3 shadow-lg transition-opacity duration-100',-->
<!--                            menuReady[index] ? 'opacity-100' : 'opacity-0 pointer-events-none'-->
<!--                          ]"-->
<!--                          :style="getMenuStyle(index)"-->
<!--                      >-->
<!--                        <div-->
<!--                            class="flex h-8 cursor-pointer items-center justify-start gap-2 rounded-md px-2 hover:bg-[var(&#45;&#45;color-stroke-ui-light)] hover:opacity-70"-->
<!--                        >-->
<!--                          <UiIconEye class="!h-[14px] !w-[14px]" />-->
<!--                          <UiTextSmall class="whitespace-nowrap">View</UiTextSmall>-->
<!--                        </div>-->

<!--                        <div-->
<!--                            class="flex h-8 cursor-pointer items-center justify-start gap-2 rounded-md px-2 hover:bg-[var(&#45;&#45;color-stroke-ui-light)] hover:opacity-70"-->
<!--                        >-->
<!--                          <UiIconConfirm class="!h-[14px] !w-[14px]" />-->
<!--                          <UiTextSmall class="whitespace-nowrap">Confirm</UiTextSmall>-->
<!--                        </div>-->

<!--                        <div-->
<!--                            class="flex h-8 cursor-pointer items-center justify-start gap-2 rounded-md px-2 hover:bg-[var(&#45;&#45;color-stroke-ui-light)] hover:opacity-70"-->
<!--                        >-->
<!--                          <UiIconTrash class="!h-[14px] !w-[14px] stroke-[var(&#45;&#45;ui-sticker-danger)]" />-->
<!--                          <UiTextSmall class="whitespace-nowrap">Delete</UiTextSmall>-->
<!--                        </div>-->
<!--                      </div>-->
<!--                    </Teleport>-->
<!--                  </td>-->
<!--                </tr>-->
<!--                </tbody>-->
<!--              </table>-->
<!--            </div>-->
<!--          </div>-->
<!--        </PanelDefault>-->

<!--        <PanelDefault v-if="!isInitialLoading" class="px-5 h-[50px] mt-2 flex items-center justify-between">-->
<!--          <div class="p-0 flex items-center justify-center [&>div]:h-[33px] [&>div]:w-[33px]">-->
<!--            <UiTextSmall class="mr-2">Per page:</UiTextSmall>-->
<!--            <UiSelect-->
<!--                class="!w-min flex items-center justify-center !h-[32px]"-->
<!--                :data="perPageList"-->
<!--                :value="perPage"-->
<!--                @change="handleChangePerPage"-->
<!--                :withoutNoSelect="true"-->
<!--            />-->
<!--          </div>-->

<!--          <UiTextSmall>{{ (currentPage * perPage) - perPage }}-{{ currentPage * perPage }} / {{ total }}</UiTextSmall>-->

<!--          <div class="flex items-center justify-center gap-2">-->
<!--            <UiTextSmall-->
<!--                class="px-3 py-1.5 h-[32px] border border-[&#45;&#45;color-stroke-ui-dark] cursor-pointer text-[14px] rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--                v-if="currentPage !== 1 && total > perPage"-->
<!--                @click="goPrev"-->
<!--            >-->
<!--              {{ t("cabinet.accounts.pagination.prev") }}-->
<!--            </UiTextSmall>-->

<!--            <UiTextSmall-->
<!--                v-if="visiblePages[0] > 1"-->
<!--                class="px-3 py-1.5 h-[32px] border border-[var(&#45;&#45;color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--                @click="setPage(1)"-->
<!--            >-->
<!--              1-->
<!--            </UiTextSmall>-->

<!--            <UiTextSmall v-if="visiblePages[0] > 2">...</UiTextSmall>-->

<!--            <UiTextSmall-->
<!--                v-for="page in visiblePages"-->
<!--                :key="page"-->
<!--                class="px-3 py-1.5 h-[32px] border border-[var(&#45;&#45;color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--                :class="{ 'bg-[var(&#45;&#45;ui-primary-main)] text-white': currentPage === page }"-->
<!--                @click="setPage(page)"-->
<!--            >-->
<!--              {{ page }}-->
<!--            </UiTextSmall>-->

<!--            <UiTextSmall v-if="visiblePages[visiblePages.length - 1] < totalPages">...</UiTextSmall>-->

<!--            <UiTextSmall-->
<!--                v-if="visiblePages[visiblePages.length - 1] < totalPages"-->
<!--                class="px-3 py-1.5 h-[32px] border border-[var(&#45;&#45;color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--                @click="setPage(totalPages)"-->
<!--            >-->
<!--              {{ totalPages }}-->
<!--            </UiTextSmall>-->

<!--            <UiTextSmall-->
<!--                class="px-3 py-1.5 border border-[var(&#45;&#45;color-stroke-ui-dark)] cursor-pointer text-[14px] rounded text-[var(&#45;&#45;ui-text-main)]"-->
<!--                v-if="currentPage !== totalPages && total > perPage"-->
<!--                @click="goNext"-->
<!--            >-->
<!--              {{ t("cabinet.accounts.pagination.next") }}-->
<!--            </UiTextSmall>-->
<!--          </div>-->
<!--        </PanelDefault>-->
<!--      </div>-->
<!--    </div>-->
<!--  </UiContainer>-->
<!--</template>-->

<!--<script lang="ts" setup>-->
<!--import AdminsPanelAddNew from "~/pages/admin/access/components/AdminsPanelAddNew.vue";-->
<!--import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";-->
<!--import UiContainer from "~/components/ui/UiContainer.vue";-->
<!--import UiIconArrowDown from "~/components/ui/UiIconArrowDown.vue";-->
<!--import UiIconFilters from "~/components/ui/UiIconFilters.vue";-->
<!--import UiIconPlus from "~/components/ui/UiIconPlus.vue";-->
<!--import UiIconSort from "~/components/ui/UiIconSort.vue";-->
<!--import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";-->
<!--import UiInput from "~/components/ui/UiInput.vue";-->
<!--import UiSelect from "~/components/ui/UiSelect.vue";-->
<!--import UiTextH4 from "~/components/ui/UiTextH4.vue";-->
<!--import UiTextSmall from "~/components/ui/UiTextSmall.vue";-->
<!--import useAppCore from "~/composables/useAppCore";-->
<!--import { computed, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref } from "vue";-->
<!--import { definePageMeta } from "~/.nuxt/imports";-->
<!--import { useI18n } from "vue-i18n";-->
<!--import PanelDefault from "~/components/block/panels/PanelDefault.vue";-->
<!--import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";-->
<!--import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";-->
<!--import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";-->
<!--import UiIconTrash from "~/components/ui/UiIconTrash.vue";-->
<!--import UiIconEye from "~/components/ui/UiIconEye.vue";-->
<!--import UiIconConfirm from "~/components/ui/UiIconConfirm.vue";-->
<!--import UiIconSearch from "~/components/ui/UiIconSearch.vue";-->
<!--import UiIconLogo from "~/components/ui/UiIconLogo.vue";-->
<!--import CreateNewDeposit from "~/pages/payments/create/index.vue";-->
<!--import CreateNewPaymentDetail from "~/pages/payments/details/components/CreateNewPaymentDetail.vue";-->
<!--import PaymentDetailsCreateNew from "~/pages/payments/details/components/PaymentDetailsCreateNew.vue";-->

<!--const { t } = useI18n({ useScope: "global" });-->
<!--const { openModal } = inject("modalControl") as { openModal: Function };-->

<!--definePageMeta({-->
<!--  layout: "cabinet",-->
<!--  middleware: ["auth-client", "client-check-auth"],-->
<!--});-->

<!--const appCore = useAppCore();-->

<!--const ORDER_DIRECTION_ASC = "asc";-->
<!--const ORDER_DIRECTION_DESC = "desc";-->

<!--const isLoading = ref(false);-->
<!--const isInitialLoading = ref(true);-->

<!--const search = ref("");-->
<!--const total = ref(0);-->
<!--const perPage = ref(7);-->
<!--const currentPage = ref(1);-->
<!--const orderBy = ref("created_at");-->
<!--const orderDirection = ref<typeof ORDER_DIRECTION_ASC | typeof ORDER_DIRECTION_DESC>(ORDER_DIRECTION_DESC);-->

<!--const paymentDetails = reactive<any[]>([]);-->

<!--const currentRowActiveOptions = ref<number | null>(null);-->
<!--const scrollArea = ref<HTMLElement | null>(null);-->
<!--const triggerRefs = ref<(HTMLElement | null)[]>([]);-->
<!--const menuRefs = ref<(HTMLElement | null)[]>([]);-->
<!--const menuReady = reactive<Record<number, boolean>>({});-->
<!--const dropUp = reactive<Record<number, boolean>>({});-->
<!--const menuPosition = reactive<Record<number, { top: number; left: number }>>({});-->

<!--const perPageList = reactive([-->
<!--  { id: 1, value: 1, text: "1" },-->
<!--  { id: 2, value: 2, text: "2" },-->
<!--  { id: 3, value: 3, text: "3" },-->
<!--  { id: 4, value: 4, text: "4" },-->
<!--  { id: 5, value: 5, text: "5" },-->
<!--  { id: 6, value: 6, text: "6" },-->
<!--  { id: 7, value: 7, text: "7" },-->
<!--  { id: 8, value: 8, text: "8" },-->
<!--  { id: 9, value: 9, text: "9" },-->
<!--  { id: 10, value: 10, text: "10" },-->
<!--  { id: 12, value: 12, text: "12" },-->
<!--  { id: 15, value: 15, text: "15" },-->
<!--  { id: 20, value: 20, text: "20" },-->
<!--  { id: 25, value: 25, text: "25" },-->
<!--  { id: 50, value: 50, text: "50" },-->
<!--  { id: 100, value: 100, text: "100" },-->
<!--]);-->

<!--const getMenuStyle = (index: number) => {-->
<!--  const pos = menuPosition[index];-->
<!--  if (!pos) return { top: "0px", left: "0px" };-->
<!--  return { top: `${pos.top}px`, left: `${pos.left}px` };-->
<!--};-->

<!--const toggleRowOptions = async (index: number) => {-->
<!--  const next = currentRowActiveOptions.value === index ? null : index;-->
<!--  currentRowActiveOptions.value = next;-->

<!--  if (next === null) return;-->

<!--  menuReady[index] = false;-->

<!--  await nextTick();-->
<!--  updateMenuPosition(index);-->

<!--  requestAnimationFrame(() => {-->
<!--    menuReady[index] = true;-->
<!--  });-->
<!--};-->

<!--const updateMenuPosition = (index: number) => {-->
<!--  const trigger = triggerRefs.value[index];-->
<!--  const menu = menuRefs.value[index];-->
<!--  if (!trigger || !menu) return;-->

<!--  const offset = 8;-->
<!--  const triggerRect = trigger.getBoundingClientRect();-->

<!--  const menuHeight = menu.offsetHeight;-->
<!--  const menuWidth = menu.offsetWidth;-->

<!--  const availableDown = window.innerHeight - triggerRect.bottom;-->
<!--  const availableUp = triggerRect.top;-->

<!--  let openUp = false;-->
<!--  if (availableDown >= menuHeight + offset) {-->
<!--    openUp = false;-->
<!--  } else if (availableUp >= menuHeight + offset) {-->
<!--    openUp = true;-->
<!--  } else {-->
<!--    openUp = availableUp > availableDown;-->
<!--  }-->

<!--  dropUp[index] = openUp;-->

<!--  let top = openUp ? triggerRect.top - offset - menuHeight : triggerRect.bottom + offset;-->
<!--  let left = triggerRect.right - menuWidth - 12;-->

<!--  const minX = 8;-->
<!--  const maxX = Math.max(8, window.innerWidth - menuWidth - 8);-->
<!--  left = Math.min(Math.max(left, minX), maxX);-->

<!--  const minY = 8;-->
<!--  const maxY = Math.max(8, window.innerHeight - menuHeight - 8);-->
<!--  top = Math.min(Math.max(top, minY), maxY);-->

<!--  menuPosition[index] = { top, left };-->
<!--};-->

<!--const recalcActiveMenu = () => {-->
<!--  if (currentRowActiveOptions.value !== null) {-->
<!--    updateMenuPosition(currentRowActiveOptions.value);-->
<!--  }-->
<!--};-->

<!--const onClickOutside = (e: MouseEvent) => {-->
<!--  const i = currentRowActiveOptions.value;-->
<!--  if (i === null) return;-->

<!--  const tEl = triggerRefs.value[i];-->
<!--  const mEl = menuRefs.value[i];-->
<!--  const target = e.target as Node | null;-->
<!--  if (!target) return;-->

<!--  const inside = (!!tEl && tEl.contains(target)) || (!!mEl && mEl.contains(target));-->
<!--  if (!inside) currentRowActiveOptions.value = null;-->
<!--};-->

<!--const onKeydown = (e: KeyboardEvent) => {-->
<!--  if (e.key === "Escape") currentRowActiveOptions.value = null;-->
<!--};-->

<!--const sortByFilterData = reactive([-->
<!--  { id: "name", value: "name", text: "Name" },-->
<!--  { id: "status", value: "status", text: "Status" },-->
<!--  { id: "created_at", value: "created_at", text: "Created at" },-->
<!--  { id: "updated_at", value: "updated_at", text: "Updated at" },-->
<!--]);-->

<!--const totalPages = computed(() => Math.ceil(total.value / perPage.value));-->

<!--const visiblePages = computed(() => {-->
<!--  const pages: number[] = [];-->
<!--  const maxPagesToShow = 5;-->
<!--  const half = Math.floor(maxPagesToShow / 2);-->

<!--  let start = Math.max(1, currentPage.value - half);-->
<!--  let end = Math.min(totalPages.value, start + maxPagesToShow - 1);-->

<!--  if (end - start < maxPagesToShow - 1) start = Math.max(1, end - maxPagesToShow + 1);-->
<!--  for (let i = start; i <= end; i++) pages.push(i);-->
<!--  return pages;-->
<!--});-->

<!--async function setPage(page: number) {-->
<!--  if (page >= 1 && page <= totalPages.value) {-->
<!--    currentPage.value = page;-->
<!--    await loadData();-->
<!--  }-->
<!--}-->

<!--async function goPrev() {-->
<!--  if (currentPage.value > 1) {-->
<!--    currentPage.value&#45;&#45;;-->
<!--    await loadData();-->
<!--  }-->
<!--}-->

<!--async function goNext() {-->
<!--  if (currentPage.value < totalPages.value) {-->
<!--    currentPage.value++;-->
<!--    await loadData();-->
<!--  }-->
<!--}-->

<!--const handleInputSearch = async (value: string) => {-->
<!--  search.value = value;-->
<!--  currentPage.value = 1;-->
<!--  await loadData();-->
<!--};-->

<!--const handleOrderByAndDirection = async (value: string) => {-->
<!--  orderDirection.value = orderDirection.value === ORDER_DIRECTION_ASC ? ORDER_DIRECTION_DESC : ORDER_DIRECTION_ASC;-->
<!--  orderBy.value = value;-->
<!--  await loadData();-->
<!--};-->

<!--const loadData = async () => {-->
<!--  isLoading.value = true;-->

<!--  try {-->
<!--    const response = await appCore.paymentDetails.get({-->
<!--      search: search.value,-->
<!--      perPage: perPage.value,-->
<!--      page: currentPage.value,-->
<!--      orderBy: orderBy.value,-->
<!--      orderDirection: orderDirection.value,-->
<!--    });-->

<!--    perPage.value = response.data.data.per_page;-->
<!--    currentPage.value = response.data.data.current_page;-->
<!--    total.value = response.data.data.total;-->

<!--    const paymentDetailsData = response.data.data.data.map((x: any) => {-->
<!--      x.isSpinning = false;-->
<!--      return x;-->
<!--    });-->

<!--    paymentDetails.splice(0, paymentDetails.length, ...paymentDetailsData);-->
<!--  } finally {-->
<!--    isLoading.value = false;-->
<!--    isInitialLoading.value = false;-->
<!--  }-->
<!--};-->

<!--const shortId = (uuid: string) => uuid.split("-").pop();-->
<!--const copyToClipboard = (paymentId: string) => {-->
<!--  const id = shortId(paymentId);-->
<!--  if (id) navigator.clipboard.writeText(id);-->
<!--};-->

<!--const handleChangePerPage = async (newPerPage: number) => {-->
<!--  perPage.value = newPerPage;-->
<!--  await loadData();-->
<!--};-->

<!--const handleChangeFilterSortBy = async (value: string) => {-->
<!--  if (orderBy.value === value) {-->
<!--    orderDirection.value = orderDirection.value === ORDER_DIRECTION_DESC ? ORDER_DIRECTION_ASC : ORDER_DIRECTION_DESC;-->
<!--  } else {-->
<!--    orderBy.value = value;-->
<!--  }-->
<!--  await loadData();-->
<!--};-->

<!--const handleClickUpdate = async () => {-->
<!--  await loadData();-->
<!--};-->

<!--const handleClickCreateNewPaymentDetail = async () => {-->
<!--  openModal(PaymentDetailsCreateNew, {-->
<!--    title: t("cabinet.payments.details.createNew.title"),-->
<!--  });-->
<!--};-->

<!--onMounted(async () => {-->
<!--  await loadData();-->

<!--  window.addEventListener("resize", recalcActiveMenu, { passive: true });-->
<!--  window.addEventListener("scroll", recalcActiveMenu, { passive: true, capture: true });-->

<!--  scrollArea.value?.addEventListener("scroll", recalcActiveMenu, { passive: true });-->

<!--  window.addEventListener("mousedown", onClickOutside, true);-->
<!--  window.addEventListener("keydown", onKeydown, true);-->
<!--});-->

<!--onBeforeUnmount(() => {-->
<!--  window.removeEventListener("resize", recalcActiveMenu);-->
<!--  window.removeEventListener("scroll", recalcActiveMenu, true);-->
<!--  scrollArea.value?.removeEventListener("scroll", recalcActiveMenu);-->

<!--  window.removeEventListener("mousedown", onClickOutside, true);-->
<!--  window.removeEventListener("keydown", onKeydown, true);-->
<!--});-->
<!--</script>-->
