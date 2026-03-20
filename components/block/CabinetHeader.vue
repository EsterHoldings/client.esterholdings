<script setup lang="ts">
  import type Echo from "laravel-echo";
  import { useRoute } from "vue-router";
  import { navigateTo, useNuxtApp } from "nuxt/app";
  import { computed, ref, onMounted, onUnmounted, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import useAppCore from "~/composables/useAppCore";

  import { useThemeStore } from "~/stores/themeStore.js";
  import { useAuthStore } from "~/stores/authStore";
  import { useUiStore } from "~/stores/uiStore";

  import LanguageSwitcher from "~/components/block/LandingHeader/components/LanguageSwitcher.vue";
  import UiIconArrowDown from "~/components/ui/UiIconArrowDown.vue";
  import UiIconBell from "~/components/ui/UiIconBell.vue";
  import UiIconDelete from "~/components/ui/UiIconDelete.vue";
  import UiIconLogout from "~/components/ui/UiIconLogout.vue";
  import UiIconMoon from "~/components/ui/UiIconMoon.vue";
  import UiIconSetting from "~/components/ui/UiIconSetting.vue";
  import UiIconSun from "~/components/ui/UiIconSun.vue";
  import UiIconUser from "~/components/ui/UiIconUser.vue";
  import UiSpacer from "~/components/ui/UiSpacer.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import UiIconSuccessFull from "~/components/ui/UiIconSuccessFull.vue";
  import UiIconWarningFull from "~/components/ui/UiIconWarningFull.vue";
  import UiIconDangerFull from "~/components/ui/UiIconDangerFull.vue";
  import UiIconInfoFull from "~/components/ui/UiIconInfoFull.vue";
  import UiIconSupport from "~/components/ui/UiIconSupport.vue";
  import UiIconLogo from "~/components/ui/UiIconLogo.vue";
  import UiIconLogoLight from "~/components/ui/UiIconLogoLight.vue";
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
  const appCore = useAppCore();
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
  const unreadCount = ref(0);
  const notificationsLoaded = ref(false);
  const activeNotificationsChannel = ref<any>(null);
  const currentNotificationsChannelName = ref("");
  const isMarkAllInProgress = ref(false);
  const unreadBadgeLabel = computed(() => (unreadCount.value > 99 ? "99+" : String(unreadCount.value)));
  const hasAccessToken = () => Boolean(String(authStore.accessToken ?? "").trim());

  const handleClickLogout = () => {
    authStore.setAccessToken("");
    navigateTo("/auth/login");
  };

  const isThemeLight = computed(() => themeStore.currentTheme !== "dark");
  const handleToggleTheme = () => {
    themeStore.toggleTheme();
  };

  const route = useRoute();
  const isProfileRoute = computed(() => route.path.split("/").pop() === "profile");
  const profileMenuIsOpen = ref(false);
  const profileMenuRef = ref(null);
  const profileContainerRef = ref(null);

  const handleClickNotifications = () => uiStore.toggleNotifications();

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
    const source = `${raw?.type ?? ""} ${raw?.title ?? ""} ${raw?.message ?? ""}`.toLowerCase();
    if (source.includes("success")) return "success";
    if (source.includes("warning")) return "warning";
    if (source.includes("error") || source.includes("danger") || source.includes("failed")) return "danger";
    return "info";
  };

  const normalizeNotification = (raw: any): CabinetNotification | null => {
    const id = String(raw?.id ?? "").trim();
    if (id === "") return null;

    const readAt = raw?.read_at ? String(raw.read_at) : null;
    const isUnread = raw?.is_unread ?? raw?.unread ?? readAt === null;
    const payload = raw?.payload && typeof raw.payload === "object" ? raw.payload : null;
    const message = String(raw?.message ?? "").trim();
    const title = String(raw?.title ?? "").trim();

    return {
      id,
      type: String(raw?.type ?? "system"),
      title: title !== "" ? title : t("cabinet.header.notifications"),
      message: message !== "" ? message : t("cabinet.header.emptyNotifications"),
      payload,
      wasRead: !isUnread,
      createdAt: raw?.created_at ? String(raw.created_at) : null,
      route: typeof payload?.route === "string" && payload.route.trim() !== "" ? payload.route.trim() : null,
      tone: resolveNotificationTone(raw),
    };
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
    unreadCount.value = 0;
  };

  const loadNotifications = async () => {
    if (!hasAccessToken()) {
      notifications.value = [];
      notificationsLoaded.value = false;
      return;
    }

    isLoading.value = true;
    try {
      const response = await appCore.notifications.get({ page: 1, perPage: 30 });
      const payload = response?.data?.data ?? {};
      const incomingItems = Array.isArray(payload?.data) ? payload.data : [];

      notifications.value = incomingItems
        .map(normalizeNotification)
        .filter((item: CabinetNotification | null): item is CabinetNotification => Boolean(item));

      const unreadFromApi = Number(payload?.unread_count ?? NaN);
      unreadCount.value = Number.isFinite(unreadFromApi)
        ? unreadFromApi
        : notifications.value.filter(item => !item.wasRead).length;
      notificationsLoaded.value = true;
    } catch (error) {
      notificationsLoaded.value = false;
    } finally {
      isLoading.value = false;
    }
  };

  const loadUnreadSummary = async () => {
    if (!hasAccessToken()) {
      unreadCount.value = 0;
      return;
    }

    try {
      const response = await appCore.notifications.getUnreadSummary();
      const unread = Number(response?.data?.data?.unread_count ?? NaN);
      unreadCount.value = Number.isFinite(unread) ? unread : 0;
    } catch (error) {
      unreadCount.value = 0;
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
      const unread = Number(response?.data?.data?.unread_count ?? NaN);
      if (Number.isFinite(unread)) {
        unreadCount.value = unread;
      }
    } catch (error) {
      notifications.value = snapshot;
      unreadCount.value = notifications.value.filter(item => !item.wasRead).length;
    } finally {
      isMarkAllInProgress.value = false;
    }
  };

  const markNotificationRead = async (notificationId: string, syncWithApi = true) => {
    const index = notifications.value.findIndex(item => item.id === notificationId);
    if (index === -1 || notifications.value[index].wasRead) return;

    const prevItem = notifications.value[index];
    notifications.value.splice(index, 1, { ...prevItem, wasRead: true });
    unreadCount.value = Math.max(0, unreadCount.value - 1);

    if (!syncWithApi) return;

    try {
      const response = await appCore.notifications.markRead(notificationId);
      const unread = Number(response?.data?.data?.unread_count ?? NaN);
      if (Number.isFinite(unread)) {
        unreadCount.value = unread;
      }
    } catch (error) {
      notifications.value.splice(index, 1, prevItem);
      unreadCount.value += 1;
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

    currentNotificationsChannelName.value = channelName;
    activeNotificationsChannel.value = echoClient.private(channelName);
    activeNotificationsChannel.value.listen(".UserNotificationCreated", async (payload: any) => {
      const normalized = normalizeNotification(payload?.notification ?? null);
      if (!normalized) return;

      const previous = notifications.value.find(item => item.id === normalized.id) ?? null;
      upsertNotification(normalized, true);
      if (!normalized.wasRead && (!previous || previous.wasRead)) {
        unreadCount.value += 1;
      }

      if (isOpen.value) {
        await markNotificationRead(normalized.id, true);
      }
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

  watch(
    () => isOpen.value,
    async (opened) => {
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
    () => authStore.user?.id,
    (userId) => {
      const normalized = String(userId || "").trim();
      if (normalized === "") {
        unsubscribeFromNotifications();
        return;
      }

      subscribeToNotifications(normalized);
    }
  );

  onMounted(() => {
    document.addEventListener("click", handleClickOutside);
    void (async () => {
      if (!hasAccessToken()) return;

      try {
        await authStore.initAuth();
      } catch {
        return;
      }

      await loadUnreadSummary();
      const userId = String(authStore.user?.id ?? "").trim();
      if (userId !== "") {
        subscribeToNotifications(userId);
      }
    })();
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
    unsubscribeFromNotifications();
  });
</script>

<template>
  <header
    class="h-[60px] flex items-center justify-between lg:justify-start border-b border-[--color-stroke-ui-light] lg:ml-[240px] pl-5 pr-5 lg:gap-4">
    <div class="lg:absolute lg:top-[-100px]">
      <NuxtLink :to="addCurrentLocaleToPath('dashboard')">
        <UiIconLogo v-if="!isThemeLight" />
        <UiIconLogoLight v-else />
      </NuxtLink>
    </div>

    <div class="hidden lg:flex min-w-0 flex-1 pr-4 items-center text-[var(--ui-text-secondary)]">
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
          <UiIconUser
            v-if="!authStore.photoUrl"
            class="text-[--ui-text-main]" />
          <img
            v-else
            :src="authStore.photoUrl"
            alt="User Photo"
            class="h-[32px] w-[32px] object-cover rounded-full" />
        </div>

        <div class="text-[var(--ui-text-main)] flex items-center justify-center gap-2 relative">
          <span class="hidden sm:inline">Родіон Максименко</span>
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
  .menu-icon {
    width: 18px;
    height: 18px;
    flex: 0 0 18px;
  }
</style>
