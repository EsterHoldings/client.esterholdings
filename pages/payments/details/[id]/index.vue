<template>
  <PageStructureDefault>
    <template #header>
      <UiTextH4 class="text-[var(--ui-text-main)] mr-5">
        {{ pageTitle }}
      </UiTextH4>

      <NuxtLink
        :to="backLink"
        class="w-full md:w-auto">
        <UiButtonDefault
          state="info--outline"
          class="w-full md:w-auto">
          {{ backLabel }}
        </UiButtonDefault>
      </NuxtLink>
    </template>

    <template #content>
      <div
        v-if="isLoading"
        class="flex min-h-[40vh] items-center justify-center">
        <UiIconSpinnerDefault />
      </div>

      <div
        v-else-if="errorMessage"
        class="rounded-xl border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] p-4 text-[var(--ui-sticker-danger)]">
        {{ errorMessage }}
      </div>

      <div
        v-else-if="paymentDetail"
        class="payment-detail-grid">
        <section class="payment-detail-card payment-detail-card--main">
          <div class="payment-detail-card__header">
            <div>
              <UiTextSmall class="payment-detail-card__label">Название</UiTextSmall>
              <h3 class="payment-detail-card__title">{{ paymentDetail.name || "-" }}</h3>
            </div>
            <div class="status-inline">
              <span
                class="status-inline__dot"
                :class="statusDotClass(paymentDetail.status)"></span>
              <span class="status-inline__text">{{ statusText(paymentDetail.status) }}</span>
            </div>
          </div>

          <div class="payment-detail-card__meta-grid">
            <div class="meta-item">
              <UiTextSmall class="meta-item__label">Платежная система</UiTextSmall>
              <div class="meta-item__value">{{ paymentSystemName }}</div>
            </div>

            <div class="meta-item">
              <UiTextSmall class="meta-item__label">Обновлено</UiTextSmall>
              <div class="updated-at-cell">
                <span class="updated-at-cell__relative">{{ formatRelativeDate(paymentDetail.updated_at) }}</span>
                <span class="updated-at-cell__absolute">{{ formatDateTime(paymentDetail.updated_at) }}</span>
              </div>
            </div>

            <div class="meta-item">
              <UiTextSmall class="meta-item__label">Создано</UiTextSmall>
              <div class="meta-item__value">{{ formatDateTime(paymentDetail.created_at) }}</div>
            </div>

            <div class="meta-item">
              <UiTextSmall class="meta-item__label">ID</UiTextSmall>
              <div class="meta-item__value break-all">{{ paymentDetail.id || "-" }}</div>
            </div>
          </div>
        </section>

        <section class="payment-detail-card">
          <UiTextSmall class="payment-detail-card__label">Поля реквизита</UiTextSmall>
          <div
            v-if="dataRows.length === 0"
            class="payment-detail-card__empty">
            Нет данных.
          </div>
          <div
            v-else
            class="details-fields-grid">
            <div
              v-for="row in dataRows"
              :key="row.key"
              class="details-field">
              <div class="details-field__key">{{ row.key }}</div>
              <div class="details-field__value">{{ row.value }}</div>
            </div>
          </div>
        </section>

        <section class="payment-detail-card">
          <UiTextSmall class="payment-detail-card__label">Комментарий администратора</UiTextSmall>
          <div class="payment-detail-card__comment">
            {{ paymentDetail.admin_comment || "Комментарий отсутствует." }}
          </div>
        </section>

        <section class="payment-detail-card payment-detail-card--full">
          <div class="payment-detail-card__documents-header">
            <UiTextSmall class="payment-detail-card__label">Скриншоты реквизитов</UiTextSmall>
            <UiTextSmall class="payment-detail-card__counter">Всего: {{ documents.length }}</UiTextSmall>
          </div>

          <div
            v-if="documents.length === 0"
            class="payment-detail-card__empty">
            Документы не загружены.
          </div>
          <div
            v-else
            class="documents-grid">
            <button
              v-for="(document, index) in documents"
              :key="document.path + ':' + index"
              type="button"
              class="document-card"
              @click="openDocument(document)">
              <img
                v-if="document.preview_url"
                :src="document.preview_url"
                :alt="`Документ #${index + 1}`"
                class="document-card__image" />
              <div
                v-else
                class="document-card__fallback">
                FILE
              </div>

              <div class="document-card__meta">
                <span class="document-card__index">#{{ index + 1 }}</span>
                <span
                  class="document-card__name"
                  :title="document.name"
                  >{{ document.name || "Документ" }}</span
                >
              </div>
            </button>
          </div>
        </section>
      </div>
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from "vue";
  import { useRoute } from "vue-router";
  import { definePageMeta, useLocalePath } from "~/.nuxt/imports";

  import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import useAppCore from "~/composables/useAppCore";

  definePageMeta({
    layout: "cabinet",
    middleware: ["auth-client", "client-check-auth"],
  });

  type PaymentDetailDocument = {
    name: string;
    path: string;
    preview_url?: string;
    mime_type?: string;
    size?: number | null;
    uploaded_at?: string | null;
  };

  const appCore = useAppCore();
  const route = useRoute();
  const localePath = useLocalePath();

  const paymentDetail = ref<any | null>(null);
  const isLoading = ref(true);
  const errorMessage = ref("");

  const paymentDetailId = computed(() => String(route.params.id ?? "").trim());
  const backLink = computed(() => localePath("/payments/details"));
  const backLabel = computed(() => "К списку реквизитов");
  const pageTitle = computed(() => `Реквизит #${paymentDetailId.value}`);

  const paymentSystemName = computed(() => {
    const direct = String(paymentDetail.value?.payment_system_name ?? "").trim();
    if (direct) return direct;
    return String(paymentDetail.value?.payment_system?.name ?? "-");
  });

  const documents = computed<PaymentDetailDocument[]>(() => {
    const raw = paymentDetail.value?.documents;
    if (!Array.isArray(raw)) return [];
    return raw;
  });

  const dataRows = computed(() => {
    const data = paymentDetail.value?.data;
    if (!data || typeof data !== "object") return [];

    return Object.entries(data)
      .map(([key, value]) => ({
        key: String(key),
        value: String(value ?? "-"),
      }))
      .filter(row => row.key.trim().length > 0);
  });

  const normalizeStatus = (value: unknown): "approved" | "pending" | "rejected" => {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase();
    if (normalized === "approved" || normalized === "rejected") {
      return normalized;
    }

    return "pending";
  };

  const statusDotClass = (value: unknown): string => {
    const normalized = normalizeStatus(value);
    if (normalized === "approved") return "status-inline__dot--approved";
    if (normalized === "rejected") return "status-inline__dot--rejected";
    return "status-inline__dot--pending";
  };

  const statusText = (value: unknown): string => {
    const normalized = normalizeStatus(value);
    if (normalized === "approved") return "Approved";
    if (normalized === "rejected") return "Rejected";
    return "Pending";
  };

  const formatDateTime = (value: unknown): string => {
    const date = new Date(String(value ?? ""));
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  const formatRelativeDate = (value: unknown): string => {
    const date = new Date(String(value ?? ""));
    if (Number.isNaN(date.getTime())) return "-";

    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} h ago`;

    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} d ago`;
  };

  const openDocument = (document: PaymentDetailDocument) => {
    const target = String(document.preview_url || document.path || "");
    if (!target) return;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  const loadPaymentDetail = async () => {
    if (!paymentDetailId.value) {
      errorMessage.value = "Реквизит не найден.";
      isLoading.value = false;
      return;
    }

    isLoading.value = true;
    errorMessage.value = "";

    try {
      const response = await appCore.paymentDetails.getById(paymentDetailId.value);
      paymentDetail.value = response?.data?.data ?? null;
      if (!paymentDetail.value) {
        errorMessage.value = "Реквизит не найден.";
      }
    } catch (error: any) {
      errorMessage.value = error?.response?.data?.message || "Не удалось загрузить реквизит.";
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(loadPaymentDetail);
</script>

<style scoped>
  .payment-detail-grid {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 12px;
  }

  .payment-detail-card {
    grid-column: span 12;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 14px;
    background: var(--ui-background-panel);
    padding: 14px;
  }

  .payment-detail-card--main {
    grid-column: span 12;
  }

  .payment-detail-card--full {
    grid-column: span 12;
  }

  .payment-detail-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }

  .payment-detail-card__label {
    color: var(--ui-text-secondary);
  }

  .payment-detail-card__title {
    color: var(--ui-text-main);
    font-size: 20px;
    font-weight: 700;
    line-height: 1.3;
  }

  .payment-detail-card__meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .meta-item {
    min-width: 0;
  }

  .meta-item__label {
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .meta-item__value {
    color: var(--ui-text-main);
    font-weight: 600;
    margin-top: 2px;
  }

  .payment-detail-card__empty {
    margin-top: 8px;
    color: var(--ui-text-secondary);
  }

  .payment-detail-card__comment {
    margin-top: 8px;
    color: var(--ui-text-main);
    white-space: pre-wrap;
  }

  .payment-detail-card__documents-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .payment-detail-card__counter {
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .details-fields-grid {
    margin-top: 8px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .details-field {
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 10px;
    padding: 8px 10px;
    background: var(--ui-background);
  }

  .details-field__key {
    color: var(--ui-text-secondary);
    font-size: 11px;
    margin-bottom: 2px;
  }

  .details-field__value {
    color: var(--ui-text-main);
    font-weight: 600;
    word-break: break-word;
  }

  .documents-grid {
    margin-top: 8px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }

  .document-card {
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 10px;
    overflow: hidden;
    background: var(--ui-background);
    text-align: left;
  }

  .document-card__image {
    width: 100%;
    height: 110px;
    object-fit: cover;
    display: block;
  }

  .document-card__fallback {
    width: 100%;
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ui-text-secondary);
    font-size: 12px;
    font-weight: 700;
  }

  .document-card__meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px;
  }

  .document-card__index {
    color: var(--ui-text-secondary);
    font-size: 11px;
  }

  .document-card__name {
    color: var(--ui-text-main);
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status-inline {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .status-inline__dot {
    width: 10px;
    height: 10px;
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
    font-weight: 700;
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

  @media (min-width: 1024px) {
    .payment-detail-card--main {
      grid-column: span 8;
    }

    .payment-detail-grid > .payment-detail-card:nth-child(2),
    .payment-detail-grid > .payment-detail-card:nth-child(3) {
      grid-column: span 4;
    }
  }

  @media (max-width: 767px) {
    .payment-detail-card__meta-grid {
      grid-template-columns: 1fr;
    }

    .details-fields-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
