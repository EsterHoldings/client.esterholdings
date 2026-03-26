<template>
  <div class="tab-user-verification text-[var(--ui-text-main)]">
    <div class="verification-switch">
      <button
        type="button"
        class="verification-switch__btn"
        :class="{ 'verification-switch__btn--active': activeSection === 'client' }"
        @click="activeSection = 'client'">
        Верификация клиента
      </button>
      <button
        type="button"
        class="verification-switch__btn"
        :class="{ 'verification-switch__btn--active': activeSection === 'payout' }"
        @click="activeSection = 'payout'">
        Реквизиты для выплат
      </button>
    </div>

    <div
      v-if="activeSection === 'client'"
      class="w-full mb-10">
      <div class="mb-5 flex items-start justify-between">
        <UiTextH5># Verification Status</UiTextH5>

        <button
          type="button"
          @click="handleRefreshActiveSection"
          class="inline-flex items-center justify-center w-10 h-10 rounded-lg ring-1 ring-[var(--ui-primary-main)] text-[var(--ui-primary-main)] hover:bg-[var(--ui-primary-main)]/10 transition"
          :aria-label="t('Refresh')">
          <UiIconUpdate :class="{ 'animate-spin': isLoading }" />
        </button>
      </div>

      <PanelDefault class="p-5 relative">
        <div
          v-if="isLoading"
          class="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[var(--ui-background)]/40 backdrop-blur-sm">
          <UiIconSpinnerDefault />
        </div>

        <div class="relative">
          <ul class="divide-y divide-[var(--color-stroke-ui-light)]">
            <li
              v-for="item in items"
              :key="item.key"
              class="grid grid-cols-[1fr,auto] items-center gap-3 py-3">
              <div class="min-w-0 w-full">
                <div class="flex flex-col w-full">
                  <div class="font-medium truncate">{{ item.title }}</div>
                  <div
                    class="text-sm text-[var(--ui-text-secondary)] truncate"
                    v-if="item.subtitle">
                    ({{ item.subtitle }})
                  </div>
                </div>

                <div
                  v-if="item.comment?.value"
                  class="col-span-2 mt-2">
                  <div class="text-xs font-semibold mb-1 opacity-80">Comment</div>
                  <UiTextSmall class="!text-[var(--ui-primary-accent)]">{{ item.comment.value }}</UiTextSmall>
                </div>
              </div>

              <div class="flex items-center justify-end gap-1">
                <component
                  :is="iconByStatus(item.status.value)"
                  class="shrink-0" />
                <span
                  class="rounded-md text-xs font-medium"
                  :class="pillClass(item.status.value)">
                  {{ textByStatus(item.status.value) }}
                </span>
              </div>
            </li>
          </ul>
        </div>
      </PanelDefault>
    </div>

    <div
      v-else
      class="w-full mb-10">
      <div class="mb-5 flex items-start justify-between">
        <UiTextH5># Payout details verification</UiTextH5>

        <button
          type="button"
          @click="handleRefreshActiveSection"
          class="inline-flex items-center justify-center w-10 h-10 rounded-lg ring-1 ring-[var(--ui-primary-main)] text-[var(--ui-primary-main)] hover:bg-[var(--ui-primary-main)]/10 transition"
          :aria-label="t('Refresh')">
          <UiIconUpdate :class="{ 'animate-spin': isPaymentDetailsLoading }" />
        </button>
      </div>

      <PanelDefault class="p-5 relative">
        <div
          v-if="isPaymentDetailsLoading"
          class="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[var(--ui-background)]/40 backdrop-blur-sm">
          <UiIconSpinnerDefault />
        </div>

        <div
          v-if="paymentDetailsRows.length === 0 && !isPaymentDetailsLoading"
          class="payout-empty">
          Реквизитов для выплат пока нет.
        </div>

        <ul
          v-else
          class="payout-list">
          <li
            v-for="row in paymentDetailsRows"
            :key="row.id"
            class="payout-list__item">
            <div class="payout-list__main">
              <div class="payout-list__name">{{ row.name || "Реквизит без названия" }}</div>
              <div class="payout-list__meta">
                {{ row.paymentSystemName || "Payment system" }} · {{ row.updatedAt || "-" }}
              </div>
              <div class="payout-list__meta">Документы: {{ row.documentsCount }}</div>
              <div
                v-if="row.adminComment"
                class="payout-list__comment">
                {{ row.adminComment }}
              </div>
            </div>
            <div class="payout-list__status">
              <component :is="iconByStatus(row.status)" />
              <span
                class="rounded-md text-xs font-medium"
                :class="pillClass(row.status)">
                {{ textByStatus(row.status) }}
              </span>
            </div>
          </li>
        </ul>
      </PanelDefault>
    </div>

    <div class="w-full">
      <UiTextH5 class="mb-5"># Verification History</UiTextH5>

      <PanelDefault class="relative">
        <div
          v-if="isLoading"
          class="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[var(--ui-background)]/40 backdrop-blur-sm">
          <UiIconSpinnerDefault />
        </div>

        <div class="overflow-hidden rounded-lg">
          <table class="w-full text-sm">
            <thead class="bg-[var(--ui-primary-main)]">
              <tr class="text-left">
                <th class="px-4 py-3 font-semibold">Name</th>
                <th class="px-4 py-3 font-semibold">Date</th>
                <th class="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-stroke-ui-light)]">
              <tr v-if="historyRows.length === 0">
                <td
                  class="px-4 py-6 text-center text-[var(--ui-text-secondary)]"
                  colspan="3">
                  No verification history yet.
                </td>
              </tr>
              <tr
                v-for="row in historyRows"
                :key="row.id"
                class="hover:bg-[var(--color-stroke-ui-light)]/20">
                <td class="px-4 py-3">{{ row.name }}</td>
                <td class="px-4 py-3 whitespace-nowrap">{{ row.date }}</td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center justify-start gap-1 rounded-md text-xs font-medium"
                    :class="pillClass(row.status)">
                    <component :is="iconByStatus(row.status)" />
                    <span class="whitespace-nowrap">{{ textByStatus(row.status) }}</span>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, reactive, ref, computed } from "vue";
  import { useI18n } from "vue-i18n";

  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiTextH5 from "~/components/ui/UiTextH5.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";

  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";

  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import UiIconSuccessFull from "~/components/ui/UiIconSuccessFull.vue";
  import UiIconWarningFull from "~/components/ui/UiIconWarningFull.vue";
  import UiIconDangerFull from "~/components/ui/UiIconDangerFull.vue";
  import { useNotificationsStore } from "~/stores/notificationsStore";

  type VerificationStatus = "approved" | "pending" | "rejected";
  type VerificationSectionTab = "client" | "payout";

  interface PaymentDetailsRow {
    id: string;
    name: string;
    paymentSystemName: string;
    status: VerificationStatus;
    updatedAt: string;
    documentsCount: number;
    adminComment: string;
  }

  const { t } = useI18n({ useScope: "global" });

  const appCore = useAppCore();
  const notificationsStore = useNotificationsStore();
  const isLoading = ref(false);
  const isPaymentDetailsLoading = ref(false);
  const activeSection = ref<VerificationSectionTab>("client");
  const CLIENT_NOTIFICATIONS_MARKED_BY_TYPES_EVENT = "client-notifications-marked-by-types";

  let verificationRequestData = reactive<Record<string, any>>({});
  const paymentDetailsRows = ref<PaymentDetailsRow[]>([]);

  const documentsStatus = ref<VerificationStatus>("pending");
  const depositStatus = ref<VerificationStatus>("pending");
  const emailStatus = ref<VerificationStatus>("pending");
  const infoStatus = ref<VerificationStatus>("pending");
  const documentsComment = ref<string>("");
  const depositComment = ref<string>("");
  const emailComment = ref<string>("");
  const infoComment = ref<string>("");

  const items = computed(() => [
    { key: "email", title: "Email", subtitle: "Confirm your email", status: emailStatus, comment: emailComment },
    { key: "documents", title: "Document", subtitle: "", status: documentsStatus, comment: documentsComment },
    {
      key: "deposit",
      title: "1st Deposit",
      subtitle: "Make a payment to verify the 1st deposit",
      status: depositStatus,
      comment: depositComment,
    },
    { key: "profile", title: "Profile", subtitle: "", status: infoStatus, comment: infoComment },
  ]);

  const historyRows = computed(() => {
    const apiRows = verificationRequestData?.history as Array<any> | undefined;
    if (!Array.isArray(apiRows) || apiRows.length === 0) {
      return [];
    }

    return apiRows.map((r, i) => ({
      id: r.id ?? i,
      name: r.name ?? r.message ?? "",
      date: r.date ?? r.created_at ?? "",
      status: normalizeStatus(r.status),
    }));
  });

  const iconByStatus = (s: VerificationStatus) =>
    s === "approved" ? UiIconSuccessFull : s === "pending" ? UiIconWarningFull : UiIconDangerFull;

  const textByStatus = (s: VerificationStatus) =>
    s === "approved" ? "Confirmed" : s === "pending" ? "In progress" : "Canceled";

  const pillClass = (s: VerificationStatus) => ({
    "border-[var(--color-success)]/30 text-[var(--color-success)] bg-[var(--color-success)]/10": s === "approved",
    "border-[var(--color-warning)]/30 text-[var(--color-warning)] bg-[var(--color-warning)]/10": s === "pending",
    "border-[var(--color-danger)]/30 text-[var(--color-danger)] bg-[var(--color-danger)]/10": s === "rejected",
  });

  const normalizeStatus = (value: unknown): VerificationStatus => {
    if (typeof value !== "string") {
      return "pending";
    }

    const normalized = value.trim().toLowerCase();
    if (normalized === "approved") {
      return "approved";
    }

    if (normalized === "rejected") {
      return "rejected";
    }

    return "pending";
  };

  const loadVerificationData = async () => {
    isLoading.value = true;
    try {
      const response = await appCore.verifications.get();
      Object.assign(verificationRequestData, response.data.data);

      emailStatus.value = normalizeStatus(verificationRequestData["email"]?.["verification_status"]);
      infoStatus.value = normalizeStatus(verificationRequestData["info"]?.["verification_status"]);
      documentsStatus.value = normalizeStatus(verificationRequestData["documents"]?.["verification_status"]);
      depositStatus.value = normalizeStatus(verificationRequestData["deposit"]?.["verification_status"]);

      emailComment.value = verificationRequestData["email"]?.["comment"] ?? "";
      infoComment.value = verificationRequestData["info"]?.["comment"] ?? "";
      documentsComment.value = verificationRequestData["documents"]?.["comment"] ?? "";
      depositComment.value = verificationRequestData["deposit"]?.["comment"] ?? "";
    } finally {
      setTimeout(() => (isLoading.value = false), 400);
    }
  };

  const loadPayoutVerificationData = async () => {
    isPaymentDetailsLoading.value = true;

    try {
      const response = await appCore.paymentDetails.get({
        page: 1,
        perPage: 100,
        orderBy: "updated_at",
        orderDirection: "desc",
      });

      const rows = Array.isArray(response?.data?.data?.data) ? response.data.data.data : [];
      paymentDetailsRows.value = rows.map((row: any) => ({
        id: String(row.id),
        name: String(row.name ?? ""),
        paymentSystemName: String(
          row.payment_system_name ?? row?.payment_system?.name ?? row?.paymentSystem?.name ?? ""
        ),
        status: normalizeStatus(row.status),
        updatedAt: String(row.updated_at ?? ""),
        documentsCount: Array.isArray(row.documents)
          ? row.documents.length
          : row.documents && typeof row.documents === "object"
            ? Object.keys(row.documents).length
            : 0,
        adminComment: String(row.admin_comment ?? ""),
      }));
    } finally {
      setTimeout(() => (isPaymentDetailsLoading.value = false), 250);
    }
  };

  const handleRefreshActiveSection = async () => {
    if (activeSection.value === "payout") {
      await loadPayoutVerificationData();
      return;
    }

    await loadVerificationData();
  };

  const markVerificationNotificationsSeen = async () => {
    if (notificationsStore.unreadVerificationNotificationsCount <= 0) {
      return;
    }

    try {
      const response = await appCore.notifications.markReadByTypes(["verification.status-updated"]);
      const summaryPayload = response?.data?.data ?? {};
      notificationsStore.applySummary(summaryPayload);
      useEventBus.emit(CLIENT_NOTIFICATIONS_MARKED_BY_TYPES_EVENT, {
        types: ["verification.status-updated"],
        summary: summaryPayload,
      });
    } catch {
      // no-op
    }
  };

  onMounted(async () => {
    await Promise.all([loadVerificationData(), loadPayoutVerificationData()]);
    await markVerificationNotificationsSeen();
  });
</script>

<style scoped>
  .verification-switch {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .verification-switch__btn {
    height: 34px;
    border-radius: 999px;
    padding: 0 14px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-panel);
    color: var(--ui-text-secondary);
    font-size: 13px;
    font-weight: 600;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease;
  }

  .verification-switch__btn:hover {
    border-color: var(--ui-primary-main);
    color: var(--ui-text-main);
  }

  .verification-switch__btn--active {
    border-color: var(--ui-primary-main);
    color: var(--ui-text-main);
    background: color-mix(in srgb, var(--ui-primary-main) 22%, transparent);
  }

  .payout-empty {
    border: 1px dashed var(--color-stroke-ui-light);
    border-radius: 10px;
    padding: 12px;
    color: var(--ui-text-secondary);
  }

  .payout-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .payout-list__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 50px;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 10px;
    padding: 10px 12px;
    background: var(--ui-background-panel);
  }

  .payout-list__main {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .payout-list__name {
    font-weight: 600;
    color: var(--ui-text-main);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .payout-list__meta {
    color: var(--ui-text-secondary);
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .payout-list__status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .payout-list__comment {
    margin-top: 4px;
    padding: 6px 8px;
    border-radius: 8px;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 50%, var(--color-stroke-ui-light));
    background: color-mix(in srgb, var(--ui-primary-main) 9%, var(--ui-background-panel));
    color: var(--ui-text-main);
    font-size: 12px;
    line-height: 1.4;
    white-space: pre-wrap;
  }

  @media (max-width: 768px) {
    .payout-list__item {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
