<template>
  <PageStructureDefault>
    <template #header>
      <div class="payments-details-header">
        <UiTextH4 class="text-[var(--ui-text-main)] mr-5">
          {{ t("cabinet.payments.title") }}
        </UiTextH4>

        <div class="flex justify-between items-center gap-2">
          <div
              v-if="isVerificationRequired"
              class="payments-details-header__notice">
            {{ paymentDetailCreationBlockedReason }}
          </div>

          <UiButtonDefault
              v-if="canCreatePaymentDetail"
              state="info"
              class="w-full md:w-auto"
              @click="handleClickCreateNewPaymentDetail">
            <UiIconPlus class="mr-2"/>
            <span>{{ createPaymentDetailLabel }}</span>
          </UiButtonDefault>

          <UiButtonDefault
              v-else
              state="info--outline"
              class="w-full md:w-auto"
              @click="handleGoToVerification">
            <span>{{ verifyActionLabel }}</span>
          </UiButtonDefault>
        </div>
      </div>
    </template>

    <template #content>
      <PageStructureContent
          :plain="viewMode !== 'table'"
          v-if="!isInitialLoading && paymentDetails.length > 0">
        <template #top>
          <div class="cabinet-controls-row">
            <div class="cabinet-controls-row__left">
              <UiInput
                  class="w-full"
                  @input="handleInputSearch"
                  :value="search"
                  :placeholder="t('cabinet.accounts.search')">
                <template #icon-left>
                  <UiIconSearch/>
                </template>
              </UiInput>

              <UiButtonDefault
                  state="info--small"
                  class="!w-[44px]"
                  @click="handleClickUpdate">
                <UiIconUpdate :spinning="isLoading"/>
              </UiButtonDefault>
            </div>

            <div class="cabinet-controls-row__right">
              <UiSelect
                  class="min-w-[170px] sm:w-[180px]"
                  :value="archivedFilter"
                  :data="archivedFilterOptions"
                  :withoutNoSelect="true"
                  @change="handleChangeArchivedFilter"/>

              <UiSelect
                  class="min-w-[180px] sm:w-[200px]"
                  :value="orderBy"
                  :data="sortByFilterData"
                  :withoutNoSelect="true"
                  @change="handleChangeFilterSortBy">
                <template #icon-left>
                  <UiIconSortBy
                      class="!h-4 !w-4"
                      :orderDirectionEnabled="true"
                      :orderDirection="orderDirection"/>
                </template>
              </UiSelect>

              <ViewModeToggle
                  v-if="!isMobileViewport"
                  class="w-full sm:w-auto"
                  bordered
                  :modelValue="viewMode"
                  :options="viewOptions"
                  @update:modelValue="handleChangeViewMode"/>
            </div>
          </div>
        </template>

        <template #content>
          <TableMain
              v-if="viewMode === 'table'"
              ref="tableRef">
            <template #thead>
              <tr>
                <th class="px-5 py-2 text-left font-normal w-[16rem]">
                  <button
                      type="button"
                      class="flex items-center gap-2"
                      @click="handleOrderByAndDirection('name')">
                    <UiTextSmall>{{ resolveText("cabinet.payments.details.columns.name", "Name") }}</UiTextSmall>
                    <UiIconSort
                        :active="orderBy === 'name'"
                        :direction="orderDirection"/>
                  </button>
                </th>

                <th class="px-5 py-2 text-left font-normal w-[12rem]">
                  <button
                      type="button"
                      class="flex items-center gap-2"
                      @click="handleOrderByAndDirection('payment_system')">
                    <UiTextSmall>{{
                        resolveText("cabinet.payments.details.columns.paymentSystem", "Payment system")
                      }}
                    </UiTextSmall>
                  </button>
                </th>

                <th class="px-5 py-2 text-left font-normal w-[8rem]">
                  <button
                      type="button"
                      class="flex items-center gap-2"
                      @click="handleOrderByAndDirection('status')">
                    <UiTextSmall>{{ resolveText("cabinet.payments.details.columns.status", "Status") }}</UiTextSmall>
                    <UiIconSort
                        :active="orderBy === 'status'"
                        :direction="orderDirection"/>
                  </button>
                </th>

                <th class="px-5 py-2 text-left font-normal w-[14rem]">
                  <button
                      type="button"
                      class="flex items-center gap-2"
                      @click="handleOrderByAndDirection('updated_at')">
                    <UiTextSmall>{{
                        resolveText("cabinet.payments.details.columns.updatedAt", "Updated at")
                      }}
                    </UiTextSmall>
                    <UiIconSort
                        :active="orderBy === 'updated_at'"
                        :direction="orderDirection"/>
                  </button>
                </th>

                <th class="px-5 py-2 text-right font-normal w-[3rem]"></th>
              </tr>
            </template>

            <template #tbody>
              <div
                  v-if="isLoading"
                  class="backdrop-blur-[2px] w-full absolute bottom-0 top-[45px] flex items-center justify-center z-10">
                <UiIconSpinnerDefault/>
              </div>

              <template v-if="paymentDetails.length">
                <tr
                    v-for="(paymentDetail, index) in paymentDetails"
                    :key="paymentDetail.id"
                    class="border-t border-[var(--color-ui-border)] hover:bg-[var(--color-stroke-ui-dark)] cursor-pointer"
                    @click="handleClickViewPaymentDetail(paymentDetail.id)">
                  <td
                      class="px-5 py-3 align-middle font-bold truncate"
                      :title="paymentDetail?.name">
                    <div class="payment-row-name">
                      <span class="payment-row-name__title">
                        {{ paymentDetail?.name }}
                        <span
                            v-if="paymentDetail?.is_archived"
                            class="payment-row-name__archive-pill">
                          {{ resolveText("cabinet.payments.details.archivedBadge", "Archived") }}
                        </span>
                      </span>
                      <div
                          v-if="resolvePaymentDetailDocuments(paymentDetail).length > 0"
                          class="payment-row-docs">
                        <span
                            v-for="(document, docIndex) in resolvePaymentDetailDocuments(paymentDetail).slice(0, 4)"
                            :key="paymentDetail.id + ':table-doc:' + docIndex"
                            class="payment-row-docs__thumb">
                          <img
                              v-if="
                              resolveDocumentPreviewMeta(document).type === 'image' &&
                              resolveDocumentPreviewMeta(document).src
                            "
                              :src="resolveDocumentPreviewMeta(document).src"
                              :alt="
                              interpolateText('cabinet.payments.details.documents.previewAlt', 'Preview #{count}', {
                                count: docIndex + 1,
                              })
                            "
                              class="payment-row-docs__thumb-img"/>
                          <span
                              v-else
                              class="payment-row-docs__thumb-fallback"
                              :class="`is-${resolveDocumentPreviewMeta(document).type}`"
                          >{{ resolveDocumentPreviewMeta(document).label }}</span
                          >
                        </span>
                        <span
                            v-if="resolvePaymentDetailDocuments(paymentDetail).length > 4"
                            class="payment-row-docs__more">
                          +{{ resolvePaymentDetailDocuments(paymentDetail).length - 4 }}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td
                      class="px-5 py-3 align-middle truncate"
                      :title="paymentDetail.payment_system_name">
                    {{ paymentDetail.payment_system_name }}
                  </td>

                  <td class="px-5 py-3 align-middle">
                    <div class="status-inline">
                      <span
                          class="status-inline__dot"
                          :class="statusDotClass(paymentDetail.status)"></span>
                      <span class="status-inline__text">{{ statusText(paymentDetail.status) }}</span>
                    </div>
                  </td>

                  <td class="px-5 py-3 align-middle whitespace-nowrap">
                    <div class="updated-at-cell">
                      <span class="updated-at-cell__relative">{{ formatRelativeDate(paymentDetail.updated_at) }}</span>
                      <span class="updated-at-cell__absolute">{{ formatDateTime(paymentDetail.updated_at) }}</span>
                    </div>
                  </td>

                  <td
                      class="px-5 py-3 align-middle"
                      @click.stop>
                    <span
                        @click="toggleRowOptions(index)"
                        class="relative flex h-[32px] w-[32px] items-center justify-center rounded-md border border-transparent transition-colors cursor-pointer"
                        :ref="el => (triggerRefs[index] = el as HTMLElement | null)">
                      <UiIconDotsVertical/>
                    </span>

                    <Teleport to="body">
                      <div
                          v-if="currentRowActiveOptions === index"
                          :ref="el => (menuRefs[index] = el as HTMLElement | null)"
                          class="fixed z-[9999] max-h-[70vh] overflow-auto text-[var(--ui-text-main)]"
                          :class="[
                          'flex min-w-[140px] max-w-[60vw] flex-col gap-1 rounded-md border border-[var(--color-stroke-ui-light)] bg-[var(--color-stroke-ui-dark)] p-3 shadow-lg transition-opacity duration-100',
                          menuReady[index] ? 'opacity-100' : 'opacity-0 pointer-events-none',
                        ]"
                          :style="getMenuStyle(index)">
                        <div
                            class="flex h-8 cursor-pointer items-center justify-start gap-2 rounded-md px-2 hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                            @click="handleClickViewPaymentDetail(paymentDetail.id)">
                          <UiIconEye class="!h-[14px] !w-[14px]"/>
                          <UiTextSmall class="whitespace-nowrap">{{ t("cabinet.payments.details.view") }}</UiTextSmall>
                        </div>

                        <div
                            v-if="!paymentDetail.is_archived"
                            class="flex h-8 cursor-pointer items-center justify-start gap-2 rounded-md px-2 hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                            @click="handleEditPaymentDetail(paymentDetail)">
                          <UiIconUpdate class="!h-[14px] !w-[14px]"/>
                          <UiTextSmall class="whitespace-nowrap">{{
                              resolveText("cabinet.payments.details.actions.edit", "Edit")
                            }}
                          </UiTextSmall>
                        </div>

                        <div
                            class="flex h-8 cursor-pointer items-center justify-start gap-2 rounded-md px-2 hover:bg-[var(--color-stroke-ui-light)] hover:opacity-70"
                            @click="
                            paymentDetail.is_archived
                              ? handleRestorePaymentDetail(paymentDetail.id)
                              : handleDeletePaymentDetail(paymentDetail.id)
                          ">
                          <UiIconTrash
                              v-if="!paymentDetail.is_archived"
                              class="!h-[14px] !w-[14px] stroke-[var(--ui-sticker-danger)]"/>
                          <UiIconUpdate
                              v-else
                              class="!h-[14px] !w-[14px]"/>
                          <UiTextSmall class="whitespace-nowrap">{{
                              paymentDetail.is_archived
                                  ? resolveText("cabinet.payments.details.actions.restore", "Restore")
                                  : resolveText("cabinet.payments.details.actions.archive", "Archive")
                            }}
                          </UiTextSmall>
                        </div>
                      </div>
                    </Teleport>
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
              <UiIconSpinnerDefault/>
            </div>

            <div
                class="grid gap-3"
                :class="viewMode === 'full' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'">
              <div
                  v-for="paymentDetail in paymentDetails"
                  :key="paymentDetail.id"
                  :class="[
                  'cabinet-card card-with-actions cursor-pointer',
                  viewMode === 'full' ? 'cabinet-card--full-row' : '',
                ]"
                  @click="handleClickViewPaymentDetail(paymentDetail.id)">
                <div
                    class="card-actions"
                    aria-hidden="true">
                  <button
                      class="copy-btn"
                      :aria-label="resolveText('cabinet.payments.details.actions.copyId', 'Copy ID')"
                      @click.stop>
                    <UiIconCopy :text="paymentDetail.id"/>
                  </button>
                  <button
                      type="button"
                      class="action-btn"
                      @click.stop="toggleCardMenu(paymentDetail.id)"
                      :aria-label="resolveText('cabinet.payments.details.actions.openMenu', 'Open menu')">
                    <UiIconDotsVertical class="h-4 w-4"/>
                    <div
                        v-if="cardMenuOpenId === paymentDetail.id"
                        class="card-menu">
                      <button
                          class="flex w-full items-center justify-start gap-2 rounded px-2 py-1 hover:bg-[var(--color-stroke-ui-light)]"
                          type="button"
                          :title="resolveText('cabinet.payments.details.view', 'View')"
                          @click="handleClickViewPaymentDetail(paymentDetail.id)">
                        <UiIconEye class="!h-4 !w-4 shrink-0"/>
                        <UiTextSmall class="whitespace-nowrap">{{
                            resolveText("cabinet.payments.details.view", "View")
                          }}
                        </UiTextSmall>
                      </button>
                      <button
                          v-if="!paymentDetail.is_archived"
                          class="flex w-full items-center justify-start gap-2 rounded px-2 py-1 hover:bg-[var(--color-stroke-ui-light)]"
                          type="button"
                          :title="resolveText('cabinet.payments.details.actions.edit', 'Edit')"
                          @click="handleEditPaymentDetail(paymentDetail)">
                        <UiIconUpdate class="!h-4 !w-4 shrink-0"/>
                        <UiTextSmall class="whitespace-nowrap">{{
                            resolveText("cabinet.payments.details.actions.edit", "Edit")
                          }}
                        </UiTextSmall>
                      </button>
                      <button
                          class="flex w-full items-center justify-start gap-2 rounded px-2 py-1 hover:bg-[var(--color-stroke-ui-light)]"
                          type="button"
                          :title="
                          paymentDetail.is_archived
                            ? resolveText('cabinet.payments.details.actions.restore', 'Restore')
                            : resolveText('cabinet.payments.details.actions.archive', 'Archive')
                        "
                          @click="
                          paymentDetail.is_archived
                            ? handleRestorePaymentDetail(paymentDetail.id)
                            : handleDeletePaymentDetail(paymentDetail.id)
                        ">
                        <UiIconTrash
                            v-if="!paymentDetail.is_archived"
                            class="!h-4 !w-4 shrink-0 stroke-[var(--ui-sticker-danger)]"/>
                        <UiIconUpdate
                            v-else
                            class="!h-4 !w-4 shrink-0"/>
                        <UiTextSmall class="whitespace-nowrap">{{
                            paymentDetail.is_archived
                                ? resolveText("cabinet.payments.details.actions.restore", "Restore")
                                : resolveText("cabinet.payments.details.actions.archive", "Archive")
                          }}
                        </UiTextSmall>
                      </button>
                    </div>
                  </button>
                </div>

                <div class="cabinet-card__header">
                  <div class="cabinet-card__head-main">
                    <UiTextSmall class="cabinet-card__eyebrow">
                      {{ resolveText("cabinet.payments.details.cardLabel", "Payment detail") }}
                    </UiTextSmall>
                    <div class="cabinet-card__title">{{ paymentDetail.name }}</div>
                    <div class="cabinet-card__subtitle">{{ paymentDetail.payment_system_name }}</div>
                    <div
                        v-if="paymentDetail.is_archived"
                        class="payment-row-name__archive-pill mt-2">
                      {{ resolveText("cabinet.payments.details.archivedBadge", "Archived") }}
                    </div>
                  </div>

                  <div class="cabinet-card__head-side">
                    <div class="status-inline">
                      <span
                          class="status-inline__dot"
                          :class="statusDotClass(paymentDetail.status)"></span>
                      <span class="status-inline__text">{{ statusText(paymentDetail.status) }}</span>
                    </div>
                  </div>
                </div>

                <div
                    class="cabinet-card__grid"
                    :class="viewMode === 'full' ? 'cabinet-card__grid--full' : ''">
                  <div class="cabinet-card__field">
                    <UiTextSmall class="cabinet-card__label">
                      {{ resolveText("cabinet.payments.details.columns.paymentSystem", "Payment system") }}
                    </UiTextSmall>
                    <div class="cabinet-card__value">{{ paymentDetail.payment_system_name }}</div>
                  </div>
                  <div class="cabinet-card__field">
                    <UiTextSmall class="cabinet-card__label">
                      {{ resolveText("cabinet.payments.details.columns.updatedAt", "Updated at") }}
                    </UiTextSmall>
                    <div class="updated-at-cell">
                      <span class="updated-at-cell__relative">{{ formatRelativeDate(paymentDetail.updated_at) }}</span>
                      <span class="updated-at-cell__absolute">{{ formatDateTime(paymentDetail.updated_at) }}</span>
                    </div>
                  </div>
                  <div class="cabinet-card__field">
                    <UiTextSmall class="cabinet-card__label">
                      {{ resolveText("cabinet.payments.details.documents.label", "Documents") }}
                    </UiTextSmall>
                    <div
                        v-if="resolvePaymentDetailDocuments(paymentDetail).length > 0"
                        class="payment-row-docs mt-1">
                      <span
                          v-for="(document, docIndex) in resolvePaymentDetailDocuments(paymentDetail).slice(0, 5)"
                          :key="paymentDetail.id + ':card-doc:' + docIndex"
                          class="payment-row-docs__thumb">
                        <img
                            v-if="
                            resolveDocumentPreviewMeta(document).type === 'image' &&
                            resolveDocumentPreviewMeta(document).src
                          "
                            :src="resolveDocumentPreviewMeta(document).src"
                            :alt="
                            interpolateText('cabinet.payments.details.documents.previewAlt', 'Preview #{count}', {
                              count: docIndex + 1,
                            })
                          "
                            class="payment-row-docs__thumb-img"/>
                        <span
                            v-else
                            class="payment-row-docs__thumb-fallback"
                            :class="`is-${resolveDocumentPreviewMeta(document).type}`"
                        >{{ resolveDocumentPreviewMeta(document).label }}</span
                        >
                      </span>
                      <span
                          v-if="resolvePaymentDetailDocuments(paymentDetail).length > 5"
                          class="payment-row-docs__more">
                        +{{ resolvePaymentDetailDocuments(paymentDetail).length - 5 }}
                      </span>
                    </div>
                    <div
                        v-else
                        class="cabinet-card__value">
                      -
                    </div>
                  </div>
                  <div
                      v-if="viewMode === 'full'"
                      class="cabinet-card__field">
                    <UiTextSmall class="cabinet-card__label">{{
                        resolveText("cabinet.payments.details.columns.id", "ID")
                      }}
                    </UiTextSmall>
                    <div
                        class="cabinet-card__value"
                        :title="String(paymentDetail.id)">
                      {{ String(paymentDetail.id) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </PageStructureContent>

      <template v-if="isInitialLoading">
        <div class="flex min-h-[55vh] w-full flex-col items-center justify-center">
          <UiIconLogo class="mb-4 h-[44px] w-[44px]"/>
          <UiIconSpinnerDefault class="h-[44px] w-[44px]"/>
        </div>
      </template>

      <template v-if="!isInitialLoading && paymentDetails.length === 0">
        <div class="payments-details-empty-state">
          <div class="payments-details-empty-state__icon-wrap">
            <UiIconCardCheck class="payments-details-empty-state__icon"/>
          </div>
          <div class="payments-details-empty-state__title">
            {{ emptyStateTitle }}
          </div>
          <UiTextSmall class="payments-details-empty-state__subtitle">
            {{ emptyStateSubtitle }}
          </UiTextSmall>
          <UiTextSmall
              v-if="isVerificationRequired"
              class="payments-details-empty-state__warning">
            {{ paymentDetailCreationBlockedReason }}
          </UiTextSmall>

          <UiButtonDefault
              v-if="canCreatePaymentDetail"
              state="success--outline"
              class="payments-details-empty-state__button"
              @click="handleClickCreateNewPaymentDetail">
            {{ createPaymentDetailLabel }}
          </UiButtonDefault>
          <UiButtonDefault
              v-else
              state="info--outline"
              class="payments-details-empty-state__button"
              @click="handleGoToVerification">
            {{ verifyActionLabel }}
          </UiButtonDefault>
        </div>
      </template>

      <PaginationMain
          v-if="!isInitialLoading && paymentDetails.length > 0"
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
          @set-per-page="handleSetPerPage"/>
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
import UiIconCardCheck from "~/components/ui/UiIconCardCheck.vue";
import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";
import UiIconEye from "~/components/ui/UiIconEye.vue";
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
import ViewModeToggle from "~/components/block/controls/ViewModeToggle.vue";

import useAppCore from "~/composables/useAppCore";
import useAccountCreationEligibility from "~/composables/useAccountCreationEligibility";
import useEventBus from "~/composables/useEventBus";
import {extractApiErrorMessage, resolveApiMessage} from "~/composables/useApiMessages";

import {definePageMeta, navigateTo, useLocalePath, useRoute, useRouter} from "~/.nuxt/imports";
import {useI18n} from "vue-i18n";
import {useToast} from "vue-toastification";
import {computed, h, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch} from "vue";

definePageMeta({
  layout: "cabinet",
  middleware: ["auth-client", "client-check-auth"],
});

const {t} = useI18n({useScope: "global"});
const {openModal} = inject("modalControl") as { openModal: Function };

const appCore = useAppCore();
const localePath = useLocalePath();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const {canCreateAccount, isEligibilityLoaded, refreshAccountCreationEligibility} = useAccountCreationEligibility();

const ORDER_DIRECTION_ASC = "asc";
const ORDER_DIRECTION_DESC = "desc";
const VIEW_MODE_STORAGE_KEY = "paymentDetailsViewMode";

const isLoading = ref(false);
const isInitialLoading = ref(true);
const viewMode = ref<"table" | "cards" | "full">("table");
const isMobileViewport = ref(false);
const cardMenuOpenId = ref<string | number | null>(null);

const search = ref("");
const total = ref(0);
const perPage = ref(7);
const currentPage = ref(1);
const orderBy = ref("created_at");
const orderDirection = ref<typeof ORDER_DIRECTION_ASC | typeof ORDER_DIRECTION_DESC>(ORDER_DIRECTION_DESC);
const archivedFilter = ref<"active" | "archived" | "all">("active");

const paymentDetails = reactive<any[]>([]);

const resolveText = (key: string, fallback: string): string => {
  const translated = t(key);
  return translated === key ? fallback : translated;
};

const interpolateText = (key: string, fallback: string, values: Record<string, string | number>): string => {
  const base = resolveText(key, fallback);

  return Object.entries(values).reduce((result, [token, value]) => {
    return result.split(`{${token}}`).join(String(value));
  }, base);
};

const statusTextMap = computed<Record<string, string>>(() => ({
  approved: resolveText("cabinet.payments.details.statuses.approved", "Approved"),
  pending: resolveText("cabinet.payments.details.statuses.pending", "Pending"),
  rejected: resolveText("cabinet.payments.details.statuses.rejected", "Rejected"),
}));

const canCreatePaymentDetail = computed(() => canCreateAccount.value);
const isVerificationRequired = computed(() => isEligibilityLoaded.value && !canCreatePaymentDetail.value);
const createPaymentDetailLabel = computed(() =>
    resolveText("cabinet.payments.details.createNew.title", "Создать новый платёж")
);
const verifyActionLabel = computed(() =>
    resolveText("cabinet.dashboard.accountVerification.goToVerification", "Перейти к верификации")
);
const paymentDetailCreationBlockedReason = computed(() =>
    resolveText(
        "cabinet.accounts.openBlocked",
        "Открытие счета будет доступно после верификации данных профиля и документов."
    )
);
const emptyStateTitle = computed(() =>
    archivedFilter.value === "archived"
        ? resolveText("cabinet.payments.details.emptyArchivedTitle", "No archived payment details yet")
        : archivedFilter.value === "all"
            ? resolveText("cabinet.payments.details.emptyFilteredTitle", "Payment details were not found")
            : isVerificationRequired.value
                ? resolveText("cabinet.dashboard.mt4.verifyTitle", "Complete verification to add a payment detail")
                : resolveText("cabinet.payments.details.emptyTitle", "No payment details yet")
);
const emptyStateSubtitle = computed(() =>
    archivedFilter.value === "archived"
        ? resolveText(
            "cabinet.payments.details.emptyArchivedSubtitle",
            "Archived payment details will appear here, and you will be able to restore them."
        )
        : archivedFilter.value === "all"
            ? resolveText("cabinet.payments.details.emptyFilteredSubtitle", "Try changing the search query or filters.")
            : isVerificationRequired.value
                ? resolveText(
                    "cabinet.dashboard.mt4.verifySubtitle",
                    "Verify your profile details and documents, then you will be able to add a payment detail."
                )
                : resolveText("cabinet.payments.details.emptySubtitle", "Add your first payment detail to receive payouts.")
);

const tableRef = ref<any>(null);

const currentRowActiveOptions = ref<number | null>(null);
const triggerRefs = ref<(HTMLElement | null)[]>([]);
const menuRefs = ref<(HTMLElement | null)[]>([]);
const menuReady = reactive<Record<number, boolean>>({});
const dropUp = reactive<Record<number, boolean>>({});
const menuPosition = reactive<Record<number, { top: number; left: number }>>({});

const getMenuStyle = (index: number) => {
  const pos = menuPosition[index];
  if (!pos) return {top: "0px", left: "0px"};
  return {top: `${pos.top}px`, left: `${pos.left}px`};
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

  menuPosition[index] = {top, left};
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

const sortByFilterData = computed(() => [
  {id: "name", value: "name", text: resolveText("cabinet.payments.details.sort.name", "Name")},
  {id: "status", value: "status", text: resolveText("cabinet.payments.details.sort.status", "Status")},
  {
    id: "created_at",
    value: "created_at",
    text: resolveText("cabinet.payments.details.sort.createdAt", "Created at"),
  },
  {
    id: "updated_at",
    value: "updated_at",
    text: resolveText("cabinet.payments.details.sort.updatedAt", "Updated at"),
  },
]);

const archivedFilterOptions = computed(() => [
  {id: "active", value: "active", text: resolveText("cabinet.payments.details.filters.active", "Active")},
  {
    id: "archived",
    value: "archived",
    text: resolveText("cabinet.payments.details.filters.archived", "Archived"),
  },
  {id: "all", value: "all", text: resolveText("cabinet.payments.details.filters.all", "All")},
]);

const viewOptions = computed(() => [
  {
    value: "table" as const,
    label: resolveText("cabinet.payments.details.views.table", "List"),
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
              h("line", {x1: "8", y1: "6", x2: "21", y2: "6"}),
              h("line", {x1: "3", y1: "6", x2: "4", y2: "6"}),
              h("line", {x1: "8", y1: "12", x2: "21", y2: "12"}),
              h("line", {x1: "3", y1: "12", x2: "4", y2: "12"}),
              h("line", {x1: "8", y1: "18", x2: "21", y2: "18"}),
              h("line", {x1: "3", y1: "18", x2: "4", y2: "18"}),
            ]
        );
      },
    },
  },
  {
    value: "cards" as const,
    label: resolveText("cabinet.payments.details.views.cards", "Cards"),
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
              h("rect", {x: "3", y: "3", width: "7", height: "7", rx: "1"}),
              h("rect", {x: "14", y: "3", width: "7", height: "7", rx: "1"}),
              h("rect", {x: "3", y: "14", width: "7", height: "7", rx: "1"}),
              h("rect", {x: "14", y: "14", width: "7", height: "7", rx: "1"}),
            ]
        );
      },
    },
  },
  {
    value: "full" as const,
    label: resolveText("cabinet.payments.details.views.full", "Full width"),
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
              h("rect", {x: "3", y: "6", width: "18", height: "4", rx: "1"}),
              h("rect", {x: "3", y: "14", width: "18", height: "4", rx: "1"}),
            ]
        );
      },
    },
  },
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

const normalizeStatus = (value: unknown): "approved" | "pending" | "rejected" => {
  const normalized = String(value ?? "")
      .trim()
      .toLowerCase();
  if (normalized === "approved" || normalized === "rejected") {
    return normalized;
  }

  return "pending";
};

const resolvePaymentDetailDocuments = (paymentDetail: any): any[] => {
  const rawDocuments = paymentDetail?.documents;
  if (Array.isArray(rawDocuments)) {
    return rawDocuments;
  }

  if (rawDocuments && typeof rawDocuments === "object") {
    return Object.values(rawDocuments);
  }

  return [];
};

const textExtensions = ["txt", "text", "md", "csv", "json", "xml", "log"];
const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "avif"];

const extractFileExtension = (value: string): string => {
  const normalized = String(value || "")
      .split("?")[0]
      .split("#")[0]
      .trim()
      .toLowerCase();
  const segments = normalized.split(".");

  return segments.length > 1 ? segments.pop() || "" : "";
};

const resolveDocumentPreviewMeta = (
    document: any
): { type: "image" | "pdf" | "text" | "file"; src: string; label: string } => {
  const mimeType = String(document?.mime_type ?? document?.mimeType ?? "")
      .trim()
      .toLowerCase();
  const previewUrl = String(document?.preview_url ?? document?.previewUrl ?? "").trim();
  const path = String(document?.path ?? "").trim();
  const name = String(document?.name ?? "").trim();

  let type: "image" | "pdf" | "text" | "file" = "file";
  if (mimeType.startsWith("image/")) {
    type = "image";
  } else if (mimeType.includes("pdf")) {
    type = "pdf";
  } else if (mimeType.startsWith("text/") || mimeType.includes("json") || mimeType.includes("xml")) {
    type = "text";
  } else {
    const extension = extractFileExtension(previewUrl || path || name);
    if (imageExtensions.includes(extension)) {
      type = "image";
    } else if (extension === "pdf") {
      type = "pdf";
    } else if (textExtensions.includes(extension)) {
      type = "text";
    }
  }

  return {
    type,
    src: type === "image" ? previewUrl || path : "",
    label: type === "pdf" ? "PDF" : type === "text" ? "TXT" : type === "file" ? "FILE" : "IMG",
  };
};

const statusDotClass = (value: unknown): string => {
  const normalized = normalizeStatus(value);
  if (normalized === "approved") return "status-inline__dot--approved";
  if (normalized === "rejected") return "status-inline__dot--rejected";
  return "status-inline__dot--pending";
};

const statusText = (value: unknown): string => {
  const normalized = normalizeStatus(value);
  return statusTextMap.value[normalized] ?? normalized;
};

const formatDateTime = (value: unknown): string => {
  const date = new Date(String(value ?? ""));
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
};

const formatRelativeDate = (value: unknown): string => {
  const date = new Date(String(value ?? ""));
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 1) return resolveText("cabinet.payments.details.relative.justNow", "just now");
  if (diffMinutes < 60) {
    return interpolateText("cabinet.payments.details.relative.minutesAgo", "{count} min ago", {count: diffMinutes});
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return interpolateText("cabinet.payments.details.relative.hoursAgo", "{count} h ago", {count: diffHours});
  }

  const diffDays = Math.round(diffHours / 24);
  return interpolateText("cabinet.payments.details.relative.daysAgo", "{count} d ago", {count: diffDays});
};

const closeAllMenus = () => {
  cardMenuOpenId.value = null;
  currentRowActiveOptions.value = null;
};

const handleClickViewPaymentDetail = async (id: string | number) => {
  closeAllMenus();
  await navigateTo(localePath(`/payments/details/${String(id)}`));
};

const handleDeletePaymentDetail = async (id: string | number) => {
  closeAllMenus();

  const confirmed = window.confirm(
      resolveText("cabinet.payments.details.actions.archiveConfirm", "Archive this payment detail?")
  );
  if (!confirmed) {
    return;
  }

  try {
    const response = await appCore.paymentDetails.delete(id);
    const fallback = resolveText(
        "cabinet.payments.details.actions.archiveSuccess",
        "Payment detail moved to the archive."
    );
    toast.success(resolveApiMessage(response?.data?.message, fallback) ?? fallback);
    await loadData();
  } catch (error: any) {
    const fallback = resolveText(
        "cabinet.payments.details.actions.archiveError",
        "Failed to archive the payment detail."
    );
    toast.error(extractApiErrorMessage(error, fallback) ?? fallback);
  }
};

const handleRestorePaymentDetail = async (id: string | number) => {
  closeAllMenus();

  try {
    const response = await appCore.paymentDetails.restore(id);
    const fallback = resolveText("cabinet.payments.details.actions.restoreSuccess", "Payment detail restored.");
    toast.success(
        resolveApiMessage(response?.data?.message ?? "payment detail restored successfully", fallback) ?? fallback
    );
    await loadData();
  } catch (error: any) {
    const fallback = resolveText(
        "cabinet.payments.details.actions.restoreError",
        "Failed to restore the payment detail."
    );
    toast.error(extractApiErrorMessage(error, fallback) ?? fallback);
  }
};

const handleEditPaymentDetail = async (paymentDetail: any) => {
  closeAllMenus();

  openModal(PaymentDetailsCreateNew, {
    title: resolveText("cabinet.payments.details.createNew.editTitle", "Edit payment detail"),
    mode: "edit",
    paymentDetail,
  });
};

const toggleCardMenu = (id: string | number) => {
  cardMenuOpenId.value = cardMenuOpenId.value === id ? null : id;
};

const handleOutsideCardMenu = (event: MouseEvent) => {
  if (!cardMenuOpenId.value) return;
  const target = event.target as HTMLElement | null;
  if (!target) return;
  if (!target.closest(".card-actions")) {
    cardMenuOpenId.value = null;
  }
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

const handleChangeArchivedFilter = async (value: string) => {
  if (value === "active" || value === "archived" || value === "all") {
    archivedFilter.value = value;
    currentPage.value = 1;
    await loadData();
  }
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
      archived: archivedFilter.value,
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

const handleReloadDataByEvent = async () => {
  await loadData();
};

const isViewModeValue = (value: string | null): value is "table" | "cards" | "full" =>
    value === "table" || value === "cards" || value === "full";

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
  recalcActiveMenu();
};

const initViewMode = () => {
  if (typeof window === "undefined") return;
  syncViewModeWithViewport(true);
};

watch(viewMode, mode => {
  if (typeof window === "undefined") return;
  if (isMobileViewport.value) return;
  localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
});

const handleChangeViewMode = (nextViewMode: string) => {
  if (isMobileViewport.value) return;
  if (nextViewMode === "table" || nextViewMode === "cards" || nextViewMode === "full") {
    viewMode.value = nextViewMode;
  }
};

const queryValueToBoolean = (value: unknown): boolean => {
  const normalized = String(value ?? "")
      .trim()
      .toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
};

const clearOpenCreateQuery = async () => {
  if (route.query?.openCreate === undefined) return;
  const nextQuery = {...route.query};
  delete nextQuery.openCreate;
  await router.replace({query: nextQuery});
};

const handleGoToVerification = async () => {
  await navigateTo(localePath({path: "/profile", query: {tab: "verification"}}));
};

const handleClickCreateNewPaymentDetail = async () => {
  if (!canCreatePaymentDetail.value) {
    await handleGoToVerification();
    return;
  }

  openModal(PaymentDetailsCreateNew, {
    title: t("cabinet.payments.details.createNew.title"),
  });
};

const maybeOpenCreateFromQuery = async () => {
  if (!queryValueToBoolean(route.query?.openCreate)) return;

  await handleClickCreateNewPaymentDetail();
  await clearOpenCreateQuery();
};

onMounted(async () => {
  initViewMode();
  await Promise.all([loadData(), refreshAccountCreationEligibility()]);
  await nextTick();
  await maybeOpenCreateFromQuery();
  useEventBus.on("loadDataForPaymentDetails", handleReloadDataByEvent);

  window.addEventListener("resize", handleViewportResize, {passive: true});
  window.addEventListener("scroll", recalcActiveMenu, {passive: true, capture: true});

  const el = (tableRef.value?.$el ?? null) as HTMLElement | null;
  el?.addEventListener("scroll", recalcActiveMenu, {passive: true});

  window.addEventListener("mousedown", onClickOutside, true);
  window.addEventListener("keydown", onKeydown, true);
  window.addEventListener("click", handleOutsideCardMenu, true);
});

onBeforeUnmount(() => {
  useEventBus.off("loadDataForPaymentDetails", handleReloadDataByEvent);

  window.removeEventListener("resize", handleViewportResize);
  window.removeEventListener("scroll", recalcActiveMenu, true);

  const el = (tableRef.value?.$el ?? null) as HTMLElement | null;
  el?.removeEventListener("scroll", recalcActiveMenu);

  window.removeEventListener("mousedown", onClickOutside, true);
  window.removeEventListener("keydown", onKeydown, true);
  window.removeEventListener("click", handleOutsideCardMenu, true);
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

.payments-details-header {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
}

.payments-details-header__notice {
  margin-top: 8px;
  color: var(--color-warning);
  font-size: 13px;
  line-height: 1.35;
}

.payments-details-empty-state {
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

.payments-details-empty-state__icon-wrap {
  height: 64px;
  width: 64px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--ui-primary-main) 16%, transparent);
  border: 1px solid color-mix(in srgb, var(--ui-primary-main) 36%, transparent);
}

.payments-details-empty-state__icon {
  width: 28px;
  height: 28px;
  color: var(--ui-primary-main);
}

.payments-details-empty-state__title {
  color: var(--ui-text-main);
  font-size: 18px;
  font-weight: 700;
}

.payments-details-empty-state__subtitle {
  color: var(--ui-text-secondary);
  max-width: 420px;
}

.payments-details-empty-state__warning {
  color: var(--color-warning);
  max-width: 460px;
}

.payments-details-empty-state__button {
  min-width: 240px;
  justify-content: center;
}

@media (max-width: 767px) {
  .payments-details-header {
    flex-direction: column;
    align-items: stretch;
  }

  .payments-details-empty-state__button {
    width: 100%;
    min-width: 0;
  }
}

.cabinet-card {
  background: var(--ui-background-panel);
  border: 1px solid var(--color-stroke-ui-dark);
  border-radius: 12px;
  padding: 12px 14px;
  position: relative;
  transition: border-color 0.2s ease,
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
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
  height: 32px;
  width: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--ui-text-secondary);
  transition: color 0.2s ease,
  border-color 0.2s ease,
  background-color 0.2s ease,
  transform 0.15s ease;
  position: relative;
}

.copy-btn:hover,
.action-btn:hover {
  color: var(--ui-text-main);
  border-color: var(--color-stroke-ui-light);
  background: color-mix(in srgb, var(--color-stroke-ui-light) 40%, transparent);
  transform: translateY(-1px);
}

.cabinet-card--full-row {
  display: grid;
  grid-template-columns: minmax(280px, 1.3fr) minmax(380px, 1.7fr);
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

.card-menu {
  position: absolute;
  right: 0;
  top: 32px;
  z-index: 20;
  min-width: 160px;
  border-radius: 10px;
  border: 1px solid var(--color-stroke-ui-light);
  background: var(--color-stroke-ui-dark);
  padding: 8px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

.card-menu button {
  height: 34px;
}

.status-inline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.status-inline__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.status-inline__dot--approved {
  background: #22c55e;
}

.status-inline__dot--pending {
  background: #f59e0b;
}

.status-inline__dot--rejected {
  background: #ef4444;
}

.status-inline__text {
  color: var(--ui-text-main);
  font-weight: 600;
  text-transform: capitalize;
}

.updated-at-cell {
  display: inline-flex;
  flex-direction: column;
  line-height: 1.2;
  gap: 2px;
}

.updated-at-cell__relative {
  color: var(--ui-text-secondary);
  font-size: 11px;
}

.updated-at-cell__absolute {
  color: var(--ui-text-main);
  font-size: 12px;
}

.payment-row-name {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.payment-row-name__title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.payment-row-name__archive-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
  padding: 0 9px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(148, 163, 184, 0.12);
  color: var(--ui-text-secondary);
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.payment-row-docs {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.payment-row-docs__thumb {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  overflow: hidden;
  border: 1px solid var(--color-stroke-ui-light);
  background: var(--ui-background);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 28px;
}

.payment-row-docs__thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.payment-row-docs__thumb-fallback {
  color: var(--ui-text-secondary);
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
}

.payment-row-docs__thumb-fallback.is-pdf {
  color: #fca5a5;
}

.payment-row-docs__thumb-fallback.is-text {
  color: #93c5fd;
}

.payment-row-docs__thumb-fallback.is-file {
  color: #cbd5e1;
}

.payment-row-docs__more {
  color: var(--ui-text-secondary);
  font-size: 11px;
  font-weight: 700;
  padding-left: 2px;
}
</style>
