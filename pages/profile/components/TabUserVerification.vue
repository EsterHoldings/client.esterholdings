<template>
  <div class="tab-user-verification text-[var(--ui-text-main)]">
    <div
      v-if="!props.historyOnly"
      class="w-full mb-10">
      <div class="mb-5 flex items-start justify-between gap-3">
        <UiTextH5>{{ t("cabinet.profile.components.tab-user-verification.titles.clientStatus") }}</UiTextH5>

        <button
          type="button"
          @click="handleRefreshVerification"
          class="inline-flex items-center justify-center w-10 h-10 rounded-lg ring-1 ring-[var(--ui-primary-main)] text-[var(--ui-primary-main)] hover:bg-[var(--ui-primary-main)]/10 transition"
          :aria-label="t('cabinet.profile.components.tab-user-verification.refreshAria')">
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
              class="verification-item">
              <div class="verification-item__content">
                <div class="font-medium truncate">{{ item.title }}</div>

                <div
                  v-if="item.subtitle"
                  class="verification-status-info">
                  {{ item.subtitle }}
                </div>

                <div
                  v-if="hasAdminComment(item.comment.value)"
                  class="verification-admin-comment">
                  <div class="text-xs font-semibold mb-1 opacity-80">
                    {{ t("cabinet.profile.components.tab-user-verification.adminCommentLabel") }}
                  </div>
                  <UiTextSmall>{{ formatAdminComment(item.comment.value) }}</UiTextSmall>
                </div>
              </div>

              <div class="verification-item__side">
                <div class="verification-item__status">
                  <component
                    :is="iconByStatus(item.status.value)"
                    class="shrink-0" />
                  <span
                    class="rounded-md text-xs font-medium"
                    :class="pillClass(item.status.value)">
                    {{ textByStatus(item.status.value) }}
                  </span>
                </div>

                <button
                  v-if="item.key === 'email' && canResendEmail"
                  type="button"
                  class="verification-resend"
                  :disabled="isResendingEmail"
                  @click="handleResendEmailVerification">
                  {{
                    isResendingEmail
                      ? t("cabinet.profile.components.tab-user-verification.resendingEmail")
                      : t("cabinet.profile.components.tab-user-verification.resendEmail")
                  }}
                </button>
              </div>
            </li>
          </ul>
        </div>
      </PanelDefault>
    </div>

    <div class="w-full">
      <div class="mb-5 flex items-start justify-between gap-3">
        <UiTextH5>{{ t("cabinet.profile.components.tab-user-verification.titles.history") }}</UiTextH5>

        <button
          type="button"
          @click="handleRefreshVerification"
          class="inline-flex items-center justify-center w-10 h-10 rounded-lg ring-1 ring-[var(--ui-primary-main)] text-[var(--ui-primary-main)] hover:bg-[var(--ui-primary-main)]/10 transition"
          :aria-label="t('cabinet.profile.components.tab-user-verification.refreshAria')">
          <UiIconUpdate :class="{ 'animate-spin': isLoading }" />
        </button>
      </div>

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
                <th class="px-4 py-3 font-semibold">
                  {{ t("cabinet.profile.components.tab-user-verification.columns.name") }}
                </th>
                <th class="px-4 py-3 font-semibold">
                  {{ t("cabinet.profile.components.tab-user-verification.columns.date") }}
                </th>
                <th class="px-4 py-3 font-semibold">
                  {{ t("cabinet.profile.components.tab-user-verification.columns.status") }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-stroke-ui-light)]">
              <tr v-if="historyRows.length === 0">
                <td
                  class="px-4 py-6 text-center text-[var(--ui-text-secondary)]"
                  colspan="3">
                  {{ t("cabinet.profile.components.tab-user-verification.historyEmpty") }}
                </td>
              </tr>
              <tr
                v-for="row in visibleHistoryRows"
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

        <button
          v-if="hasMoreHistoryRows"
          type="button"
          class="verification-history__load-more"
          @click="loadMoreHistoryRows">
          {{ t("cabinet.profile.components.tab-user-verification.loadMore") }}
        </button>
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

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
  import { useAuthStore } from "~/stores/authStore";

  const props = withDefaults(
    defineProps<{
      historyOnly?: boolean;
    }>(),
    {
      historyOnly: false,
    }
  );

  type VerificationStatus = "approved" | "pending" | "rejected";

  interface ClientVerificationUnreadNotification {
    id: string;
  }

  const { t } = useI18n({ useScope: "global" });
  const toast = useToast();

  const appCore = useAppCore();
  const authStore = useAuthStore();
  const notificationsStore = useNotificationsStore();
  const isLoading = ref(false);
  const isResendingEmail = ref(false);
  const HISTORY_CHUNK_SIZE = 5;
  const CLIENT_NOTIFICATION_RECEIVED_EVENT = "client-notification-received";
  const CLIENT_NOTIFICATIONS_MARKED_EVENT = "client-notifications-marked";
  const VERIFICATION_NOTIFICATION_TYPE = "verification.status-updated";

  const verificationRequestData = reactive<Record<string, any>>({});
  const unreadVerificationNotifications = ref<ClientVerificationUnreadNotification[]>([]);
  const visibleHistoryCount = ref(HISTORY_CHUNK_SIZE);
  const lastSeenVerificationUnreadCount = ref(0);
  const isRealtimeVerificationReloading = ref(false);
  const lastHandledVerificationNotificationId = ref("");

  const documentsStatus = ref<VerificationStatus>("pending");
  const emailStatus = ref<VerificationStatus>("pending");
  const infoStatus = ref<VerificationStatus>("pending");
  const documentsComment = ref<string>("");
  const emailComment = ref<string>("");
  const infoComment = ref<string>("");

  const items = computed(() => [
    {
      key: "email",
      title: t("cabinet.profile.components.tab-user-verification.items.email.title"),
      subtitle: t("cabinet.profile.components.tab-user-verification.items.email.subtitle"),
      status: emailStatus,
      comment: emailComment,
    },
    {
      key: "documents",
      title: t("cabinet.profile.components.tab-user-verification.items.documents.title"),
      subtitle: t("cabinet.profile.components.tab-user-verification.items.documents.subtitle"),
      status: documentsStatus,
      comment: documentsComment,
    },
    {
      key: "profile",
      title: t("cabinet.profile.components.tab-user-verification.items.profile.title"),
      subtitle: t("cabinet.profile.components.tab-user-verification.items.profile.subtitle"),
      status: infoStatus,
      comment: infoComment,
    },
  ]);

  const canResendEmail = computed(() => emailStatus.value !== "approved" && !authStore.user?.email_verified_at);

  const historyRows = computed(() => {
    const apiRows = verificationRequestData?.history as Array<any> | undefined;
    if (!Array.isArray(apiRows) || apiRows.length === 0) {
      return [];
    }

    return apiRows.map((row, index) => ({
      id: row.id ?? index,
      name: row.name ?? row.message ?? "",
      date: row.date ?? row.created_at ?? "",
      status: normalizeStatus(row.status),
    }));
  });

  const visibleHistoryRows = computed(() => historyRows.value.slice(0, visibleHistoryCount.value));
  const hasMoreHistoryRows = computed(() => visibleHistoryRows.value.length < historyRows.value.length);

  const loadMoreHistoryRows = () => {
    visibleHistoryCount.value += HISTORY_CHUNK_SIZE;
  };

  const iconByStatus = (status: VerificationStatus) =>
    status === "approved" ? UiIconSuccessFull : status === "pending" ? UiIconWarningFull : UiIconDangerFull;

  const textByStatus = (status: VerificationStatus) =>
    status === "approved"
      ? t("cabinet.profile.components.tab-user-verification.statuses.approved")
      : status === "pending"
        ? t("cabinet.profile.components.tab-user-verification.statuses.pending")
        : t("cabinet.profile.components.tab-user-verification.statuses.rejected");

  const pillClass = (status: VerificationStatus) => ({
    "border-[var(--color-success)]/30 text-[var(--color-success)] bg-[var(--color-success)]/10":
      status === "approved",
    "border-[var(--color-warning)]/30 text-[var(--color-warning)] bg-[var(--color-warning)]/10":
      status === "pending",
    "border-[var(--color-danger)]/30 text-[var(--color-danger)] bg-[var(--color-danger)]/10":
      status === "rejected",
  });

  const formatAdminComment = (value: unknown): string => String(value ?? "").trim();
  const hasAdminComment = (value: unknown): boolean => formatAdminComment(value) !== "";

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

  const normalizeUnreadVerificationNotification = (raw: any): ClientVerificationUnreadNotification | null => {
    const id = String(raw?.id ?? "").trim();
    const type = String(raw?.type ?? "").trim();
    const readAt = raw?.read_at ? String(raw.read_at).trim() : "";
    const isUnread = raw?.is_unread ?? readAt === "";

    if (id === "" || type !== VERIFICATION_NOTIFICATION_TYPE || !isUnread) {
      return null;
    }

    return { id };
  };

  const upsertUnreadVerificationNotification = (notification: ClientVerificationUnreadNotification): void => {
    const index = unreadVerificationNotifications.value.findIndex(item => item.id === notification.id);
    if (index === -1) {
      unreadVerificationNotifications.value.unshift(notification);
      return;
    }

    unreadVerificationNotifications.value.splice(index, 1, notification);
  };

  const removeUnreadVerificationNotifications = (ids: string[]): void => {
    if (ids.length === 0) {
      return;
    }

    const idSet = new Set(ids);
    unreadVerificationNotifications.value = unreadVerificationNotifications.value.filter(item => !idSet.has(item.id));
  };

  const loadUnreadVerificationNotifications = async (): Promise<void> => {
    try {
      const response = await appCore.notifications.get({
        page: 1,
        perPage: 100,
      });

      const rows = Array.isArray(response?.data?.data?.data) ? response.data.data.data : [];
      unreadVerificationNotifications.value = rows
        .map(normalizeUnreadVerificationNotification)
        .filter((item: ClientVerificationUnreadNotification | null): item is ClientVerificationUnreadNotification =>
          Boolean(item)
        );
    } catch {
      unreadVerificationNotifications.value = [];
    }
  };

  const loadVerificationData = async (): Promise<void> => {
    isLoading.value = true;

    try {
      const response = await appCore.verifications.get();
      Object.assign(verificationRequestData, response.data.data);

      emailStatus.value = normalizeStatus(verificationRequestData["email"]?.["verification_status"]);
      infoStatus.value = normalizeStatus(verificationRequestData["info"]?.["verification_status"]);
      documentsStatus.value = normalizeStatus(verificationRequestData["documents"]?.["verification_status"]);

      emailComment.value = verificationRequestData["email"]?.["comment"] ?? "";
      infoComment.value = verificationRequestData["info"]?.["comment"] ?? "";
      documentsComment.value = verificationRequestData["documents"]?.["comment"] ?? "";
      visibleHistoryCount.value = HISTORY_CHUNK_SIZE;
    } finally {
      setTimeout(() => (isLoading.value = false), 400);
    }
  };

  const triggerRealtimeVerificationReload = async (): Promise<void> => {
    if (isRealtimeVerificationReloading.value) {
      return;
    }

    isRealtimeVerificationReloading.value = true;

    try {
      await loadVerificationData();
      await nextTick();
      await markUnreadVerificationNotificationsSeen();
    } finally {
      isRealtimeVerificationReloading.value = false;
    }
  };

  const markUnreadVerificationNotificationsSeen = async (): Promise<void> => {
    const targetIds = unreadVerificationNotifications.value.map(item => item.id);
    if (targetIds.length === 0) {
      return;
    }

    let latestSummary: Record<string, unknown> | null = null;

    for (const notificationId of targetIds) {
      try {
        const response = await appCore.notifications.markRead(notificationId);
        latestSummary = response?.data?.data ?? latestSummary;
      } catch {
        // no-op
      }
    }

    removeUnreadVerificationNotifications(targetIds);

    if (latestSummary) {
      notificationsStore.applySummary(latestSummary);
    }

    useEventBus.emit(CLIENT_NOTIFICATIONS_MARKED_EVENT, {
      ids: targetIds,
      summary: latestSummary ?? undefined,
    });
  };

  const handleRefreshVerification = async (): Promise<void> => {
    await loadVerificationData();
    await markUnreadVerificationNotificationsSeen();
  };

  const handleResendEmailVerification = async (): Promise<void> => {
    if (isResendingEmail.value) {
      return;
    }

    isResendingEmail.value = true;

    try {
      await appCore.auth.resendEmailVerification();
      toast.success(t("cabinet.profile.components.tab-user-verification.resendEmailSent"));
      const response = await appCore.auth.getAuthUser();
      authStore.setUser(response.data);
    } catch {
      toast.error(t("cabinet.profile.components.tab-user-verification.resendEmailError"));
    } finally {
      isResendingEmail.value = false;
    }
  };

  const handleClientNotificationReceived = (payload?: { notification?: any }): void => {
    const rawNotification = payload?.notification ?? null;
    const notificationId = String(rawNotification?.id ?? "").trim();
    if (notificationId === "") {
      return;
    }

    if (lastHandledVerificationNotificationId.value === notificationId) {
      return;
    }

    lastHandledVerificationNotificationId.value = notificationId;

    const notification = normalizeUnreadVerificationNotification(rawNotification);
    if (!notification) {
      return;
    }

    upsertUnreadVerificationNotification(notification);

    void triggerRealtimeVerificationReload();
  };

  const handleMarkedNotifications = (payload?: { ids?: string[] }) => {
    const ids = Array.isArray(payload?.ids) ? payload.ids.map(item => String(item ?? "").trim()).filter(Boolean) : [];
    removeUnreadVerificationNotifications(ids);
  };

  watch(
    () => notificationsStore.unreadVerificationNotificationsCount,
    (nextValue, previousValue) => {
      const normalizedNext = Number(nextValue ?? 0);
      const normalizedPrevious =
        previousValue === undefined ? lastSeenVerificationUnreadCount.value : Number(previousValue ?? 0);

      lastSeenVerificationUnreadCount.value = normalizedNext;

      if (normalizedNext <= normalizedPrevious) {
        return;
      }

      void triggerRealtimeVerificationReload();
    }
  );

  onMounted(async () => {
    useEventBus.on(CLIENT_NOTIFICATION_RECEIVED_EVENT, handleClientNotificationReceived);
    useEventBus.on(CLIENT_NOTIFICATIONS_MARKED_EVENT, handleMarkedNotifications);
    lastSeenVerificationUnreadCount.value = Number(notificationsStore.unreadVerificationNotificationsCount ?? 0);

    await Promise.all([loadVerificationData(), loadUnreadVerificationNotifications()]);
    await markUnreadVerificationNotificationsSeen();
  });

  onBeforeUnmount(() => {
    useEventBus.off(CLIENT_NOTIFICATION_RECEIVED_EVENT, handleClientNotificationReceived);
    useEventBus.off(CLIENT_NOTIFICATIONS_MARKED_EVENT, handleMarkedNotifications);
  });
</script>

<style scoped>
  .verification-item {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 16px;
    align-items: start;
    padding: 14px 0;
  }

  .verification-item__content {
    min-width: 0;
  }

  .verification-item__side {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
    align-self: start;
  }

  .verification-item__status {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
  }

  .verification-status-info {
    margin-top: 6px;
    display: inline-flex;
    width: fit-content;
    max-width: 100%;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 35%, var(--color-stroke-ui-light));
    border-radius: 10px;
    background: color-mix(in srgb, var(--ui-primary-main) 9%, var(--ui-background-panel));
    color: var(--ui-text-secondary);
    padding: 7px 10px;
    font-size: 12px;
    line-height: 1.4;
  }

  .verification-admin-comment {
    margin-top: 8px;
    color: var(--ui-text-secondary);
  }

  .verification-resend {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 999px;
    background: color-mix(in srgb, var(--ui-primary-main) 16%, transparent);
    color: var(--ui-primary-main);
    padding: 7px 12px;
    font-size: 12px;
    font-weight: 700;
    transition:
      background-color 0.2s ease,
      opacity 0.2s ease;
  }

  .verification-resend:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ui-primary-main) 24%, transparent);
  }

  .verification-resend:disabled {
    cursor: wait;
    opacity: 0.65;
  }

  .verification-history__load-more {
    display: block;
    margin: 14px auto 0;
    border: 0;
    background: transparent;
    color: var(--ui-text-secondary);
    font-size: 13px;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 4px;
  }

  @media (max-width: 767px) {
    .verification-item {
      grid-template-columns: 1fr;
    }

    .verification-item__side {
      align-items: flex-start;
    }

    .verification-item__status {
      justify-content: flex-start;
    }
  }
</style>
