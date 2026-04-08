<script setup lang="ts">
  import type Echo from "laravel-echo";
  import { useRoute } from "vue-router";
  import { navigateTo, useNuxtApp } from "nuxt/app";
  import { computed, ref, onMounted, onUnmounted, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";

  import { useThemeStore } from "~/stores/themeStore.js";
  import { useAuthStore } from "~/stores/authStore";
  import { useNotificationsStore } from "~/stores/notificationsStore";
  import { useRecentPaymentUpdatesStore } from "~/stores/recentPaymentUpdatesStore";
  import { useUiStore } from "~/stores/uiStore";

  import LanguageSwitcher from "~/components/block/LanguageSwitcher.vue";
  import UiIconArrowDown from "~/components/ui/UiIconArrowDown.vue";
  import UiIconBell from "~/components/ui/UiIconBell.vue";
  import UiIconDelete from "~/components/ui/UiIconDelete.vue";
  import UiIconLogout from "~/components/ui/UiIconLogout.vue";
  import UiIconMoon from "~/components/ui/UiIconMoon.vue";
  import UiIconSetting from "~/components/ui/UiIconSetting.vue";
  import UiIconSun from "~/components/ui/UiIconSun.vue";
  import UiSpacer from "~/components/ui/UiSpacer.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import UiIconSuccessFull from "~/components/ui/UiIconSuccessFull.vue";
  import UiIconWarningFull from "~/components/ui/UiIconWarningFull.vue";
  import UiIconDangerFull from "~/components/ui/UiIconDangerFull.vue";
  import UiIconInfoFull from "~/components/ui/UiIconInfoFull.vue";
  import UiIconSupport from "~/components/ui/UiIconSupport.vue";
  import UiIconLogo from "~/components/ui/UiIconLogo.vue";
  import UiIconLogoLight from "~/components/ui/UiIconLogoLight.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiSwitchToggle from "~/components/ui/UiSwitchToggle.vue";
  import UiBreadcrumb from "~/components/ui/UiBreadcrumb.vue";

  type BreadcrumbItem = {
    name: string;
    to?: string;
    icon?: any;
  };
  type NotificationTone = "info" | "success" | "warning" | "danger";
  type CabinetNotification = {
    id: string;
    type: string;
    title: string;
    message: string;
    payload: Record<string, any> | null;
    wasRead: boolean;
    createdAt: string | null;
    route: string | null;
    tone: NotificationTone;
  };

  const NOTIFICATIONS_POLL_MS = 10000;
  const NOTIFICATIONS_REALTIME_RETRY_MS = 5000;
  const CLIENT_NOTIFICATION_RECEIVED_EVENT = "client-notification-received";
  const CLIENT_NOTIFICATIONS_MARKED_EVENT = "client-notifications-marked";
  const NOTIFICATION_EVENT_NAMES = [
    ".UserNotificationCreated",
    "UserNotificationCreated",
    ".App\\Events\\UserNotificationCreated",
    "App\\Events\\UserNotificationCreated",
  ];
  const SUPPORT_USER_NOTIFICATION_TYPES = ["support.message"];
  const BILLING_USER_NOTIFICATION_TYPES = ["payments.withdrawal.status-updated", "payments.deposit.status-updated"];
  const CLIENT_NOTIFICATIONS_MARKED_BY_TYPES_EVENT = "client-notifications-marked-by-types";

  const props = withDefaults(
    defineProps<{
      breadcrumbs?: BreadcrumbItem[];
      showBreadcrumbs?: boolean;
    }>(),
    {
      breadcrumbs: () => [],
      showBreadcrumbs: false,
    }
  );

  const authStore = useAuthStore();
  const notificationsStore = useNotificationsStore();
  const recentPaymentUpdatesStore = useRecentPaymentUpdatesStore();
  const appCore = useAppCore();
  const toast = useToast();
  const { $echo } = useNuxtApp() as { $echo?: Echo<any> };
  const uiStore = useUiStore();
  const themeStore = useThemeStore();
  const { t, locale } = useI18n({ useScope: "global" });
  const addCurrentLocaleToPath = (path = "") => `/${locale.value}/${path}`;

  const isOpen = computed({
    get: () => uiStore.notificationsOpen,
    set: value => {
      uiStore.notificationsOpen = value;
    },
  });

  const isLoading = ref(false);
  const notificationsRef = ref<any>(null);
  const notifications = ref<CabinetNotification[]>([]);
  const unreadCount = computed(() => notificationsStore.unreadCount);
  const notificationsLoaded = ref(false);
  const activeNotificationsChannel = ref<any>(null);
  const currentNotificationsChannelName = ref("");
  const isMarkAllInProgress = ref(false);
  const knownNotificationIds = ref<Set<string>>(new Set());
  const unreadBadgeLabel = computed(() => (unreadCount.value > 99 ? "99+" : String(unreadCount.value)));
  const hasAccessToken = () => Boolean(String(authStore.accessToken ?? "").trim());
  let notificationsSocketStateHandler: ((states: any) => void) | null = null;
  let notificationsRealtimeRetryTimer: ReturnType<typeof setInterval> | null = null;
  let notificationsPollTimer: ReturnType<typeof setInterval> | null = null;
  let notificationsResumeListenersAttached = false;

  const handleClickLogout = () => {
    authStore.setAccessToken("");
    navigateTo("/auth/login");
  };

  const isThemeLight = computed(() => themeStore.currentTheme !== "dark");
  const handleToggleTheme = () => {
    themeStore.toggleTheme();
  };

  const route = useRoute();
  const isSupportRoute = computed(() => String(route.path ?? "").includes("/support"));
  const isPaymentsRoute = computed(() => String(route.path ?? "").includes("/payments"));
  const isProfileRoute = computed(() => route.path.split("/").pop() === "profile");
  const isDashboardRoute = computed(() => {
    const segments = route.path.split("/").filter(Boolean);
    const localeSegment = String(locale.value ?? "")
      .trim()
      .toLowerCase();

    if (segments.length === 0) {
      return true;
    }

    if (segments.length === 1 && segments[0]?.toLowerCase() === localeSegment) {
      return true;
    }

    return segments[segments.length - 1]?.toLowerCase() === "dashboard";
  });
  const newDepositLink = computed(() => `${addCurrentLocaleToPath("payments")}?openDeposit=1`);
  const profileMenuIsOpen = ref(false);
  const profileMenuRef = ref(null);
  const profileContainerRef = ref(null);
  const normalizeText = (value: unknown): string => String(value ?? "").trim();

  const profileDisplayName = computed(() => {
    const firstName = normalizeText(authStore.user?.first_name);
    const lastName = normalizeText(authStore.user?.last_name);
    const fallback = normalizeText(authStore.user?.email);
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

    return fullName !== "" ? fullName : fallback;
  });

  const profileInitials = computed(() => {
    const firstName = normalizeText(authStore.user?.first_name);
    const lastName = normalizeText(authStore.user?.last_name);
    const email = normalizeText(authStore.user?.email);

    const initialsFromName = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim().toUpperCase();
    if (initialsFromName !== "") {
      return initialsFromName.slice(0, 2);
    }

    if (email !== "") {
      return (
        email
          .replace(/[^a-zA-Z0-9]/g, "")
          .slice(0, 2)
          .toUpperCase() || "U"
      );
    }

    return "U";
  });

  const handleClickNotifications = () => uiStore.toggleNotifications();

  const registerRecentPaymentUpdate = (notification: CabinetNotification) => {
    if (!BILLING_USER_NOTIFICATION_TYPES.includes(String(notification.type ?? "").trim())) {
      return;
    }

    const paymentId = normalizeText(notification.payload?.payment_id);
    if (paymentId === "") {
      return;
    }

    recentPaymentUpdatesStore.registerUpdate({
      paymentId,
      status: normalizeText(notification.payload?.status),
      amount: notification.payload?.amount,
      updatedAt: notification.createdAt ?? new Date().toISOString(),
    });
  };

  const handleClickProfileMenu = () => {
    profileMenuIsOpen.value = !profileMenuIsOpen.value;
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (profileContainerRef.value && !profileContainerRef.value.contains(event.target as Node)) {
      profileMenuIsOpen.value = false;
    }
    if (notificationsRef.value && !notificationsRef.value.contains(event.target as Node)) {
      uiStore.closeNotifications();
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

  const resolveNotificationTone = (raw: any): NotificationTone => {
    const source =
      `${raw?.type ?? ""} ${raw?.title ?? ""} ${raw?.message ?? ""} ${raw?.payload?.status ?? raw?.status ?? ""}`.toLowerCase();
    if (source.includes("approved") || source.includes("successful")) return "success";
    if (source.includes("pending") || source.includes("processing") || source.includes("warning")) return "warning";
    if (
      source.includes("rejected") ||
      source.includes("cancelled") ||
      source.includes("error") ||
      source.includes("danger") ||
      source.includes("failed")
    )
      return "danger";
    if (source.includes("success")) return "success";
    return "info";
  };

  const resolveText = (key: string, fallback: string, params?: Record<string, unknown>): string => {
    const value = t(key, params ?? {});
    return value === key ? fallback : value;
  };

  const truncateText = (value: unknown, max = 100): string => {
    const normalized = String(value ?? "").trim();
    if (normalized.length <= max) {
      return normalized;
    }

    return `${normalized.slice(0, max)}...`;
  };

  const statusText = (value: string): string => {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase();
    const key = `cabinet.header.notificationTemplates.statuses.${normalized}`;

    switch (normalized) {
      case "pending":
        return resolveText(key, "Pending");
      case "processing":
        return resolveText(key, "Processing");
      case "successful":
        return resolveText(key, "Successful");
      case "failed":
        return resolveText(key, "Failed");
      case "cancelled":
        return resolveText(key, "Cancelled");
      default:
        return normalized || "-";
    }
  };

  const verificationStepText = (value: string, fallback = "-"): string => {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase();
    if (normalized === "") {
      return fallback;
    }

    return resolveText(`cabinet.header.notificationTemplates.verificationSteps.${normalized}`, fallback);
  };

  const verificationStatusText = (value: string): string => {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase();
    const key = `cabinet.header.notificationTemplates.statuses.${normalized}`;

    switch (normalized) {
      case "approved":
        return resolveText(key, "Approved");
      case "rejected":
        return resolveText(key, "Rejected");
      case "pending":
        return resolveText(key, "Pending");
      default:
        return normalized || "-";
    }
  };

  const buildWithdrawalStatusNotification = (
    raw: any,
    payload: Record<string, any> | null
  ): { title: string; message: string } => {
    const status = statusText(String(payload?.status ?? raw?.status ?? ""));
    const amount = Number(payload?.amount ?? 0);
    const currency = String(payload?.currency || "USD").trim();
    const accountNumber = String(payload?.account_number || "").trim();
    const defaultTitle = String(raw?.title ?? "").trim() || "Withdrawal request updated";
    const defaultMessage = String(raw?.message ?? "").trim();

    const title = resolveText("cabinet.header.notificationTemplates.withdrawalStatusUpdated.title", defaultTitle);
    const fallbackMessage =
      defaultMessage !== ""
        ? defaultMessage
        : `${status} • ${amount.toFixed(2)} ${currency}${accountNumber ? ` • ${accountNumber}` : ""}`;
    const message = resolveText(
      "cabinet.header.notificationTemplates.withdrawalStatusUpdated.message",
      fallbackMessage,
      {
        status,
        amount: amount.toFixed(2),
        currency,
        account: accountNumber || "-",
      }
    );

    return { title, message };
  };

  const buildDepositStatusNotification = (
    raw: any,
    payload: Record<string, any> | null
  ): { title: string; message: string } => {
    const status = statusText(String(payload?.status ?? raw?.status ?? ""));
    const amount = Number(payload?.amount ?? 0);
    const currency = String(payload?.currency || "USD").trim();
    const accountNumber = String(payload?.account_number || "").trim();
    const paymentSystemName = String(payload?.payment_system_name || "").trim();
    const defaultTitle = String(raw?.title ?? "").trim() || "Deposit status updated";
    const defaultMessage = String(raw?.message ?? "").trim();

    const title = resolveText("cabinet.header.notificationTemplates.depositStatusUpdated.title", defaultTitle);
    const fallbackMessage =
      defaultMessage !== ""
        ? defaultMessage
        : [
            status,
            paymentSystemName !== "" ? paymentSystemName : null,
            amount > 0 ? `${amount.toFixed(2)} ${currency}` : null,
            accountNumber !== "" ? accountNumber : null,
          ]
            .filter(Boolean)
            .join(" • ");
    const message = resolveText("cabinet.header.notificationTemplates.depositStatusUpdated.message", fallbackMessage, {
      status,
      method: paymentSystemName || "-",
      amount: amount.toFixed(2),
      currency,
      account: accountNumber || "-",
    });

    return { title, message };
  };

  const buildSupportNotification = (
    raw: any,
    payload: Record<string, any> | null
  ): { title: string; message: string } => {
    const preview = truncateText(payload?.preview || raw?.message || "");
    const messageType = String(payload?.message_type || "")
      .trim()
      .toLowerCase();
    const defaultTitle = String(raw?.title ?? "").trim() || "New support message";
    const defaultMessage = truncateText(raw?.message);

    if (messageType === "system") {
      const title = resolveText(
        "cabinet.header.notificationTemplates.supportTicketUpdated.title",
        "Support ticket updated"
      );
      const fallbackMessage = defaultMessage !== "" ? defaultMessage : preview || "Support ticket updated";
      const message = resolveText(
        "cabinet.header.notificationTemplates.supportTicketUpdated.message",
        fallbackMessage,
        { preview: preview || "-" }
      );

      return { title, message };
    }

    const title = resolveText("cabinet.header.notificationTemplates.supportMessage.title", defaultTitle);
    const fallbackMessage = defaultMessage !== "" ? defaultMessage : preview || "New support message";
    const message = resolveText("cabinet.header.notificationTemplates.supportMessage.message", fallbackMessage, {
      preview: preview || "-",
    });

    return { title, message };
  };

  const buildVerificationStatusNotification = (
    raw: any,
    payload: Record<string, any> | null
  ): { title: string; message: string } => {
    const step = verificationStepText(String(payload?.step || ""), String(payload?.step_label || "").trim() || "-");
    const status = verificationStatusText(String(payload?.status || raw?.status || ""));
    const comment = String(payload?.comment || "").trim();
    const defaultTitle = String(raw?.title ?? "").trim() || "Verification status updated";
    const defaultMessage = String(raw?.message ?? "").trim();

    const title = resolveText("cabinet.header.notificationTemplates.verificationStatusUpdated.title", defaultTitle);
    const fallbackMessage =
      defaultMessage !== ""
        ? defaultMessage
        : [step, status, comment !== "" ? comment : null].filter(Boolean).join(" • ");
    const message = resolveText(
      "cabinet.header.notificationTemplates.verificationStatusUpdated.message",
      fallbackMessage,
      {
        step,
        status,
        comment: comment !== "" ? ` • ${comment}` : "",
      }
    );

    return { title, message };
  };

  const shouldToastNotification = (notification: CabinetNotification): boolean => {
    const type = String(notification.type ?? "").trim();

    if (SUPPORT_USER_NOTIFICATION_TYPES.includes(type)) {
      return !isSupportRoute.value;
    }

    return true;
  };

  const normalizeNotification = (raw: any): CabinetNotification | null => {
    const id = String(raw?.id ?? "").trim();
    if (id === "") return null;

    const readAt = raw?.read_at ? String(raw.read_at) : null;
    const isUnread = raw?.is_unread ?? raw?.unread ?? readAt === null;
    const payload = raw?.payload && typeof raw.payload === "object" ? raw.payload : null;
    const type = String(raw?.type ?? "system");
    let message = String(raw?.message ?? "").trim();
    let title = String(raw?.title ?? "").trim();

    if (type === "payments.withdrawal.status-updated") {
      const localized = buildWithdrawalStatusNotification(raw, payload);
      title = localized.title;
      message = localized.message;
    }

    if (type === "payments.deposit.status-updated") {
      const localized = buildDepositStatusNotification(raw, payload);
      title = localized.title;
      message = localized.message;
    }

    if (type === "verification.status-updated") {
      const localized = buildVerificationStatusNotification(raw, payload);
      title = localized.title;
      message = localized.message;
    }

    if (type === "support.message") {
      const localized = buildSupportNotification(raw, payload);
      title = localized.title;
      message = localized.message;
    }

    return {
      id,
      type,
      title: title !== "" ? title : t("cabinet.header.notifications"),
      message: message !== "" ? message : t("cabinet.header.emptyNotifications"),
      payload,
      wasRead: !isUnread,
      createdAt: raw?.created_at ? String(raw.created_at) : null,
      route: typeof payload?.route === "string" && payload.route.trim() !== "" ? payload.route.trim() : null,
      tone: resolveNotificationTone(raw),
    };
  };

  const showNotificationToast = (notification: CabinetNotification) => {
    const content =
      notification.message && notification.message !== notification.title
        ? `${notification.title}: ${notification.message}`
        : notification.title;

    if (notification.tone === "success") {
      toast.success(content);
      return;
    }

    if (notification.tone === "warning") {
      toast.warning(content);
      return;
    }

    if (notification.tone === "danger") {
      toast.error(content);
      return;
    }

    toast.info(content);
  };

  const rememberNotifications = (items: CabinetNotification[]) => {
    const next = new Set(knownNotificationIds.value);
    items.forEach(item => next.add(item.id));
    knownNotificationIds.value = next;
  };

  const upsertNotification = (notification: CabinetNotification, prepend = true) => {
    const idx = notifications.value.findIndex(item => item.id === notification.id);
    if (idx === -1) {
      if (prepend) {
        notifications.value.unshift(notification);
      } else {
        notifications.value.push(notification);
      }
      return;
    }

    notifications.value.splice(idx, 1, notification);
  };

  const setAllLocalRead = () => {
    notifications.value = notifications.value.map(item => ({
      ...item,
      wasRead: true,
    }));
    notificationsStore.applySummary({
      unread_count: 0,
      unread_verification_notifications_count: 0,
      unread_withdrawal_notifications_count: 0,
      unread_support_notifications_count: 0,
    });
  };

  const loadNotifications = async (options: { showToastsForNew?: boolean } = {}): Promise<CabinetNotification[]> => {
    if (!hasAccessToken()) {
      notifications.value = [];
      notificationsLoaded.value = false;
      knownNotificationIds.value = new Set();
      notificationsStore.reset();
      return [];
    }

    isLoading.value = true;
    try {
      const response = await appCore.notifications.get({ page: 1, perPage: 30 });
      const payload = response?.data?.data ?? {};
      const incomingItems = Array.isArray(payload?.data) ? payload.data : [];
      const previousKnownIds = new Set(knownNotificationIds.value);
      const normalizedItems = incomingItems
        .map(normalizeNotification)
        .filter((item: CabinetNotification | null): item is CabinetNotification => Boolean(item));
      const newUnreadItems = normalizedItems.filter(item => !item.wasRead && !previousKnownIds.has(item.id));

      notifications.value = normalizedItems;
      rememberNotifications(normalizedItems);

      const unreadFromApi = Number(payload?.unread_count ?? NaN);
      notificationsStore.applySummary({
        ...payload,
        unread_count: Number.isFinite(unreadFromApi)
          ? unreadFromApi
          : notifications.value.filter(item => !item.wasRead).length,
      });
      notificationsLoaded.value = true;

      if (options.showToastsForNew) {
        newUnreadItems.slice().reverse().filter(shouldToastNotification).forEach(showNotificationToast);
      }

      newUnreadItems.forEach(item => {
        registerRecentPaymentUpdate(item);
        useEventBus.emit(CLIENT_NOTIFICATION_RECEIVED_EVENT, { notification: item });
      });

      return newUnreadItems;
    } catch (error) {
      notificationsLoaded.value = false;
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  const loadUnreadSummary = async () => {
    if (!hasAccessToken()) {
      notificationsStore.reset();
      return;
    }

    try {
      const response = await appCore.notifications.getUnreadSummary();
      notificationsStore.applySummary(response?.data?.data ?? {});
    } catch (error) {
      notificationsStore.reset();
    }
  };

  const markAllRead = async () => {
    if (isMarkAllInProgress.value) return;
    if (unreadCount.value <= 0) return;

    isMarkAllInProgress.value = true;
    const snapshot = [...notifications.value];
    setAllLocalRead();

    try {
      const response = await appCore.notifications.markAllRead();
      notificationsStore.applySummary(response?.data?.data ?? {});
    } catch (error) {
      notifications.value = snapshot;
      notificationsStore.applySummary({
        unread_count: notifications.value.filter(item => !item.wasRead).length,
        unread_verification_notifications_count: notifications.value.filter(
          item => !item.wasRead && item.type === "verification.status-updated"
        ).length,
        unread_withdrawal_notifications_count: notifications.value.filter(
          item => !item.wasRead && item.type === "payments.withdrawal.status-updated"
        ).length,
        unread_support_notifications_count: notifications.value.filter(
          item => !item.wasRead && item.type === "support.message"
        ).length,
      });
    } finally {
      isMarkAllInProgress.value = false;
    }
  };

  const markNotificationRead = async (notificationId: string, syncWithApi = true) => {
    const index = notifications.value.findIndex(item => item.id === notificationId);
    if (index === -1 || notifications.value[index].wasRead) return;

    const prevItem = notifications.value[index];
    notifications.value.splice(index, 1, { ...prevItem, wasRead: true });
    notificationsStore.decrementForNotification(prevItem.type);

    if (!syncWithApi) return;

    try {
      const response = await appCore.notifications.markRead(notificationId);
      notificationsStore.applySummary(response?.data?.data ?? {});
    } catch (error) {
      notifications.value.splice(index, 1, prevItem);
      notificationsStore.incrementForNotification(prevItem.type);
    }
  };

  const markNotificationsByTypes = async (types: string[]) => {
    const normalizedTypes = types.map(item => String(item ?? "").trim()).filter(Boolean);
    if (normalizedTypes.length === 0) return;

    notifications.value = notifications.value.map(item =>
      normalizedTypes.includes(item.type) ? { ...item, wasRead: true } : item
    );

    try {
      const response = await appCore.notifications.markReadByTypes(normalizedTypes);
      notificationsStore.applySummary(response?.data?.data ?? {});
    } catch {
      await loadNotifications();
    }
  };

  const markCurrentSectionNotificationsSeen = async () => {
    if (isSupportRoute.value && notificationsStore.unreadSupportNotificationsCount > 0) {
      await markNotificationsByTypes(SUPPORT_USER_NOTIFICATION_TYPES);
      return;
    }

    if (isPaymentsRoute.value && notificationsStore.unreadWithdrawalNotificationsCount > 0) {
      await markNotificationsByTypes(BILLING_USER_NOTIFICATION_TYPES);
    }
  };

  const reconnectNotificationsSocketTransport = () => {
    const echoClient = resolveEchoClient();
    const pusher = echoClient?.connector?.pusher;
    const state = String(pusher?.connection?.state ?? "");
    if (!pusher) return;

    if (state === "disconnected" || state === "failed" || state === "unavailable") {
      try {
        pusher.connect();
      } catch {
        // no-op
      }
    }
  };

  const handleRealtimeNotification = async (payload: any) => {
    const normalized = normalizeNotification(payload?.notification ?? null);
    if (!normalized) return;

    const wasKnown = knownNotificationIds.value.has(normalized.id);
    upsertNotification(normalized, true);
    rememberNotifications([normalized]);
    registerRecentPaymentUpdate(normalized);

    if (!normalized.wasRead && !wasKnown) {
      notificationsStore.incrementForNotification(normalized.type);
      if (shouldToastNotification(normalized)) {
        showNotificationToast(normalized);
      }

      useEventBus.emit(CLIENT_NOTIFICATION_RECEIVED_EVENT, { notification: normalized });
    }

    if (isOpen.value) {
      await markNotificationRead(normalized.id, true);
      return;
    }

    if (isSupportRoute.value && SUPPORT_USER_NOTIFICATION_TYPES.includes(normalized.type)) {
      await markNotificationRead(normalized.id, true);
      return;
    }

    if (isPaymentsRoute.value && BILLING_USER_NOTIFICATION_TYPES.includes(normalized.type)) {
      await markNotificationRead(normalized.id, true);
    }
  };

  const handleNotificationActionClick = async (notification: CabinetNotification, event?: MouseEvent) => {
    event?.stopPropagation();
    await markNotificationRead(notification.id, true);
  };

  const handleNotificationClick = async (notification: CabinetNotification) => {
    if (!notification.wasRead) {
      await markNotificationRead(notification.id, true);
    }

    if (!notification.route) return;
    uiStore.closeNotifications();
    await navigateTo(addCurrentLocaleToPath(notification.route.replace(/^\/+/, "")));
  };

  const subscribeToNotifications = (userId: string) => {
    const normalizedUserId = String(userId || "").trim();
    if (normalizedUserId === "") return;

    const channelName = `notifications.user.${normalizedUserId}`;
    if (currentNotificationsChannelName.value === channelName && activeNotificationsChannel.value) {
      return;
    }

    unsubscribeFromNotifications();
    const echoClient = resolveEchoClient();
    if (!echoClient) return;

    reconnectNotificationsSocketTransport();
    currentNotificationsChannelName.value = channelName;
    activeNotificationsChannel.value = echoClient.private(channelName);
    NOTIFICATION_EVENT_NAMES.forEach(eventName => {
      activeNotificationsChannel.value.stopListening(eventName, handleRealtimeNotification);
      activeNotificationsChannel.value.listen(eventName, handleRealtimeNotification);
    });
  };

  const unsubscribeFromNotifications = () => {
    const channelName = currentNotificationsChannelName.value;
    currentNotificationsChannelName.value = "";
    activeNotificationsChannel.value = null;

    if (channelName === "") return;
    const echoClient = resolveEchoClient();
    if (!echoClient) return;

    try {
      echoClient.leave(channelName);
    } catch (error) {
      // no-op
    }
  };

  const bindNotificationsSocketStateListener = () => {
    if (notificationsSocketStateHandler) return;

    const echoClient = resolveEchoClient();
    const connection = echoClient?.connector?.pusher?.connection;
    if (!connection || typeof connection.bind !== "function") return;

    notificationsSocketStateHandler = (states: any) => {
      const currentState = String(states?.current ?? connection?.state ?? "");
      if (currentState === "connected") {
        const userId = String(authStore.user?.id ?? "").trim();
        if (userId !== "") {
          subscribeToNotifications(userId);
        }
        return;
      }

      if (currentState === "failed" || currentState === "unavailable" || currentState === "disconnected") {
        reconnectNotificationsSocketTransport();
      }
    };

    connection.bind("state_change", notificationsSocketStateHandler);
  };

  const unbindNotificationsSocketStateListener = () => {
    if (!notificationsSocketStateHandler) return;

    const echoClient = resolveEchoClient();
    const connection = echoClient?.connector?.pusher?.connection;
    if (connection && typeof connection.unbind === "function") {
      connection.unbind("state_change", notificationsSocketStateHandler);
    }

    notificationsSocketStateHandler = null;
  };

  const startNotificationsRealtimeRetry = () => {
    if (notificationsRealtimeRetryTimer) return;

    notificationsRealtimeRetryTimer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

      reconnectNotificationsSocketTransport();
      const userId = String(authStore.user?.id ?? "").trim();
      if (userId !== "") {
        subscribeToNotifications(userId);
      }
    }, NOTIFICATIONS_REALTIME_RETRY_MS);
  };

  const stopNotificationsRealtimeRetry = () => {
    if (!notificationsRealtimeRetryTimer) return;

    clearInterval(notificationsRealtimeRetryTimer);
    notificationsRealtimeRetryTimer = null;
  };

  const startNotificationsPolling = () => {
    if (notificationsPollTimer) return;

    notificationsPollTimer = setInterval(async () => {
      if (!hasAccessToken()) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

      const newUnreadItems = await loadNotifications({ showToastsForNew: true });
      if (isOpen.value && newUnreadItems.length > 0) {
        await markAllRead();
        return;
      }

      if (
        isSupportRoute.value &&
        newUnreadItems.some(
          item => SUPPORT_USER_NOTIFICATION_TYPES.includes(String(item.type ?? "").trim()) && !item.wasRead
        )
      ) {
        await markNotificationsByTypes(SUPPORT_USER_NOTIFICATION_TYPES);
        return;
      }

      if (
        isPaymentsRoute.value &&
        newUnreadItems.some(
          item => BILLING_USER_NOTIFICATION_TYPES.includes(String(item.type ?? "").trim()) && !item.wasRead
        )
      ) {
        await markNotificationsByTypes(BILLING_USER_NOTIFICATION_TYPES);
      }
    }, NOTIFICATIONS_POLL_MS);
  };

  const stopNotificationsPolling = () => {
    if (!notificationsPollTimer) return;

    clearInterval(notificationsPollTimer);
    notificationsPollTimer = null;
  };

  const formatNotificationTime = (value: string | null): string => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat(locale.value, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleMarkedByTypes = (payload?: { types?: string[]; summary?: Record<string, unknown> }) => {
    const types = Array.isArray(payload?.types)
      ? payload.types.map(item => String(item ?? "").trim()).filter(Boolean)
      : [];

    if (types.length > 0) {
      notifications.value = notifications.value.map(item =>
        types.includes(item.type) ? { ...item, wasRead: true } : item
      );
    }

    notificationsStore.applySummary(payload?.summary ?? {});
  };

  const handleMarkedNotifications = (payload?: { ids?: string[]; summary?: Record<string, unknown> }) => {
    const ids = Array.isArray(payload?.ids) ? payload.ids.map(item => String(item ?? "").trim()).filter(Boolean) : [];

    if (ids.length > 0) {
      const idSet = new Set(ids);
      notifications.value = notifications.value.map(item => (idSet.has(item.id) ? { ...item, wasRead: true } : item));
    }

    notificationsStore.applySummary(payload?.summary ?? {});
  };

  const syncNotificationsState = async (showToastsForNew = false) => {
    if (!hasAccessToken()) {
      return;
    }

    await Promise.all([loadNotifications({ showToastsForNew }), loadUnreadSummary()]);

    if (isOpen.value && unreadCount.value > 0) {
      await markAllRead();
    }
  };

  const handleNotificationsResume = () => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      return;
    }

    reconnectNotificationsSocketTransport();
    const userId = String(authStore.user?.id ?? "").trim();
    if (userId !== "") {
      subscribeToNotifications(userId);
    }

    void syncNotificationsState(true);
  };

  const attachNotificationsResumeListeners = () => {
    if (notificationsResumeListenersAttached || typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    window.addEventListener("focus", handleNotificationsResume);
    document.addEventListener("visibilitychange", handleNotificationsResume);
    notificationsResumeListenersAttached = true;
  };

  const detachNotificationsResumeListeners = () => {
    if (!notificationsResumeListenersAttached || typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    window.removeEventListener("focus", handleNotificationsResume);
    document.removeEventListener("visibilitychange", handleNotificationsResume);
    notificationsResumeListenersAttached = false;
  };

  watch(
    () => isOpen.value,
    async opened => {
      if (!opened) return;

      if (!notificationsLoaded.value) {
        await loadNotifications();
      }

      if (unreadCount.value > 0) {
        await markAllRead();
      }
    }
  );

  watch(
    () => [route.path, route.query?.tab],
    () => {
      void markCurrentSectionNotificationsSeen();
    }
  );

  watch(
    () => authStore.user?.id,
    userId => {
      const normalized = String(userId || "").trim();
      if (normalized === "") {
        unsubscribeFromNotifications();
        knownNotificationIds.value = new Set();
        notificationsStore.reset();
        stopNotificationsPolling();
        return;
      }

      subscribeToNotifications(normalized);
      startNotificationsRealtimeRetry();
      startNotificationsPolling();
    }
  );

  onMounted(() => {
    document.addEventListener("click", handleClickOutside);
    useEventBus.on(CLIENT_NOTIFICATIONS_MARKED_BY_TYPES_EVENT, handleMarkedByTypes);
    useEventBus.on(CLIENT_NOTIFICATIONS_MARKED_EVENT, handleMarkedNotifications);
    attachNotificationsResumeListeners();
    void (async () => {
      if (!hasAccessToken()) return;

      try {
        await authStore.initAuth();
      } catch {
        return;
      }

      await loadNotifications();
      await loadUnreadSummary();
      await markCurrentSectionNotificationsSeen();
      const userId = String(authStore.user?.id ?? "").trim();
      if (userId !== "") {
        subscribeToNotifications(userId);
      }
      bindNotificationsSocketStateListener();
      startNotificationsRealtimeRetry();
      startNotificationsPolling();
    })();
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
    useEventBus.off(CLIENT_NOTIFICATIONS_MARKED_BY_TYPES_EVENT, handleMarkedByTypes);
    useEventBus.off(CLIENT_NOTIFICATIONS_MARKED_EVENT, handleMarkedNotifications);
    detachNotificationsResumeListeners();
    unsubscribeFromNotifications();
    unbindNotificationsSocketStateListener();
    stopNotificationsRealtimeRetry();
    stopNotificationsPolling();
  });
</script>

<template>
  <header
    class="h-[60px] flex items-center justify-between lg:justify-start border-b border-[--color-stroke-ui-light] lg:ml-[240px] pl-5 pr-5 lg:gap-4">
    <div class="lg:absolute lg:top-[-100px]">
      <NuxtLink :to="`/${locale}`">
        <UiIconLogo v-if="!isThemeLight" />
        <UiIconLogoLight v-else />
      </NuxtLink>
    </div>

    <div
      v-if="isDashboardRoute"
      class="flex min-w-0 flex-1 items-center">
      <NuxtLink
        :to="newDepositLink"
        class="shrink-0">
        <UiButtonDefault
          state="success--small"
          class="dashboard-header-deposit-button">
          {{ t("cabinet.dashboard.actions.newDeposit") }}
        </UiButtonDefault>
      </NuxtLink>
    </div>

    <div
      v-else
      class="hidden lg:flex min-w-0 flex-1 pr-4 items-center text-[var(--ui-text-secondary)]">
      <UiBreadcrumb
        v-if="props.showBreadcrumbs && props.breadcrumbs.length"
        :list="props.breadcrumbs" />
    </div>

    <div class="ml-auto flex items-center justify-end gap-2">
      <div class="h-[60px] flex items-center justify-center">
        <LanguageSwitcher
          isSidebar
          :isInvert="isThemeLight"
          class="icon" />
      </div>

      <div
        ref="notificationsRef"
        class="relative flex items-center justify-center">
        <button
          class="relative"
          @click="handleClickNotifications"
          :aria-label="t('cabinet.header.notifications')">
          <UiIconBell />
          <span
            v-if="unreadCount > 0"
            class="absolute -top-2 -right-2 h-5 w-5 text-[10px] font-bold rounded-full bg-[var(--color-warning)] text-[var(--ui-text-main)] flex items-center justify-center"
            >{{ unreadBadgeLabel }}</span
          >
        </button>

        <div
          v-if="isOpen"
          class="fixed sm:absolute top-[80px] sm:top-9 left-5 right-5 sm:left-auto sm:right-0 z-50 sm:w-[320px] md:w-[360px] lg:w-[400px] max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] rounded-xl !bg-[var(--ui-background)] border border-[var(--color-stroke-ui-light)] flex flex-col">
          <div class="flex items-center justify-between p-3 sm:p-4 lg:p-5 flex-shrink-0">
            <span class="text-[var(--ui-text-main)]">{{ t("cabinet.header.notifications") }}</span>
            <div>
              <UiTextSmall
                state="info--outline--small"
                @click="markAllRead"
                class="cursor-pointer"
                >{{ t("cabinet.header.markAllRead") }}</UiTextSmall
              >
            </div>
          </div>

          <UiSpacer :heightNone="true" />

          <div class="p-3 sm:p-4 lg:p-5 overflow-y-auto flex-1">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              :class="[
                'relative mb-2.5 p-2 sm:p-3 rounded-xl bg-[var(--color-stroke-ui-light)] border border-[var(--color-stroke-ui-light)] cursor-pointer',
                notification.tone === 'info' ? 'text-[var(--ui-text-main)]' : '',
                notification.tone === 'success' ? 'text-[var(--color-success)]' : '',
                notification.tone === 'warning' ? 'text-[var(--color-warning)]' : '',
                notification.tone === 'danger' ? 'text-[var(--color-danger)]' : '',
                notification.wasRead ? 'opacity-30 hover:opacity-100' : '',
              ]"
              @click="handleNotificationClick(notification)">
              <UiIconSuccessFull
                v-if="notification.tone === 'success'"
                class="absolute top-2 left-2 sm:top-3 sm:left-3" />
              <UiIconWarningFull
                v-if="notification.tone === 'warning'"
                class="absolute top-2 left-2 sm:top-3 sm:left-3" />
              <UiIconDangerFull
                v-if="notification.tone === 'danger'"
                class="absolute top-2 left-2 sm:top-3 sm:left-3" />
              <UiIconInfoFull
                v-if="notification.tone === 'info'"
                class="absolute top-2 left-2 sm:top-3 sm:left-3" />
              <div class="ml-8 sm:ml-10">
                <div>{{ notification.title }}</div>
                <div>{{ notification.message }}</div>
                <div
                  v-if="notification.createdAt"
                  class="text-[11px] opacity-60 mt-1">
                  {{ formatNotificationTime(notification.createdAt) }}
                </div>
              </div>
              <UiIconDelete
                class="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-50 hover:opacity-100"
                style="width: 14px; height: 14px"
                @click="handleNotificationActionClick(notification, $event)" />
            </div>

            <div
              v-if="!isLoading && notifications.length === 0"
              class="h-[150px] sm:h-[200px] rounded-xl flex flex-col items-center justify-center gap-4">
              <UiIconBell />
              <span>{{ t("cabinet.header.emptyNotifications") }}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        ref="profileContainerRef"
        class="flex items-center justify-end gap-4 cursor-pointer ml-5"
        @click="handleClickProfileMenu">
        <div
          :class="[
            'mx-auto h-[32px] w-[32px] rounded-full flex items-center justify-center overflow-hidden',
            isProfileRoute ? 'ring-2 ring-[var(--ui-primary-main)]' : 'ring-2 ring-[var(--ui-text-main)]',
          ]">
          <span
            v-if="!authStore.photoUrl"
            class="profile-avatar-fallback">
            {{ profileInitials }}
          </span>
          <img
            v-else
            :src="authStore.photoUrl"
            alt="User Photo"
            class="h-[32px] w-[32px] object-cover rounded-full" />
        </div>

        <div class="text-[var(--ui-text-main)] flex items-center justify-center gap-2 relative">
          <span class="hidden sm:inline">{{ profileDisplayName || "User" }}</span>
          <UiIconArrowDown
            :class="{ 'rotate-180': profileMenuIsOpen, 'sm:block': true }"
            class="hidden" />

          <div
            ref="profileMenuRef"
            class="fixed sm:absolute top-[80px] sm:top-9 left-5 right-5 sm:left-auto sm:right-0 sm:w-fit bg-[var(--ui-background)] border border-[var(--color-stroke-ui-light)] rounded-md z-10"
            v-if="profileMenuIsOpen">
            <NuxtLink
              :to="addCurrentLocaleToPath('profile')"
              :aria-label="t('cabinet.header.profile')">
              <div
                class="flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-1 rounded-md">
                <UiIconSetting class="menu-icon" />
                <UiTextSmall class="w-full whitespace-nowrap">{{ t("cabinet.header.accountSettings") }}</UiTextSmall>
              </div>
            </NuxtLink>

            <div
              aria-label="Toggle theme"
              @click.stop="handleToggleTheme"
              class="flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-1 rounded-md cursor-pointer">
              <transition
                name="fade"
                mode="out-in">
                <UiIconSun
                  v-if="themeStore.currentTheme === 'dark'"
                  :key="'sun'"
                  class="menu-icon" />
                <UiIconMoon
                  v-else
                  :key="'moon'"
                  class="menu-icon" />
              </transition>
              <UiTextSmall class="w-full whitespace-nowrap">
                {{
                  themeStore.currentTheme === "dark"
                    ? t("cabinet.header.switchToLight")
                    : t("cabinet.header.switchToDark")
                }}
              </UiTextSmall>
              <div
                class="shrink-0"
                @click.stop>
                <UiSwitchToggle
                  :model-value="isThemeLight"
                  @update:modelValue="handleToggleTheme" />
              </div>
            </div>

            <UiSpacer :heightNone="true" />

            <NuxtLink
              :to="addCurrentLocaleToPath('support')"
              :aria-label="t('cabinet.header.helpCenter')">
              <div
                class="flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-1 rounded-md">
                <UiIconSupport class="menu-icon" />
                <UiTextSmall class="w-full whitespace-nowrap">{{ t("cabinet.header.helpCenter") }}</UiTextSmall>
              </div>
            </NuxtLink>

            <UiSpacer :heightNone="true" />

            <NuxtLink
              @click="handleClickLogout()"
              :aria-label="t('cabinet.header.logout')">
              <div
                class="flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-1 rounded-md">
                <UiIconLogout class="menu-icon" />
                <UiTextSmall class="w-full whitespace-nowrap">{{ t("cabinet.header.logout") }}</UiTextSmall>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
  :deep(.dashboard-header-deposit-button) {
    min-height: 42px;
    border-radius: 999px !important;
    padding-inline: 18px;
    font-weight: 700;
    color: white !important;
  }

  .menu-icon {
    width: 18px;
    height: 18px;
    flex: 0 0 18px;
  }

  .profile-avatar-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ui-primary-main);
    color: var(--ui-text-main);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
</style>
