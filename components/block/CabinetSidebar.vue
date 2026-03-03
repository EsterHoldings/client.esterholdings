<template>
  <aside
    class="hidden lg:flex fixed inset-y-0 left-0 w-[240px] flex-col items-center justify-between bg-[var(--ui-background-sidebar)]/82 backdrop-blur-md text-[var(--ui-text-main)] z-40 shadow-[0_0_5px_-1px_rgba(255,249,249,.1)] border-r border-r-[var(--color-stroke-ui-light)]">
    <div class="w-full flex flex-col items-start">
      <div class="h-[60px] flex items-center justify-center pl-5 mb-8">
        <NuxtLink :to="addCurrentLocaleToPath('dashboard')">
          <UiIconLogoLight v-if="isThemeLight" />
          <UiIconLogo v-else />
        </NuxtLink>
      </div>
    </div>

    <div class="flex-1 w-full flex items-start justify-center p-2">
      <CabinetSidebarMenu :supportUnreadCount="supportUnreadCount" />
    </div>
  </aside>

  <nav
    class="cabinet-mobile-nav lg:hidden fixed bottom-0 inset-x-0 z-50 h-[74px] pb-[max(env(safe-area-inset-bottom,0px),8px)] bg-[var(--ui-background-sidebar)]/78 backdrop-blur-xl text-[var(--ui-text-main)] shadow-[0_-8px_24px_-16px_rgba(0,0,0,.6)]">
    <div class="h-full px-2 flex items-center justify-evenly gap-1 overflow-hidden">
      <CabinetSidebarMenu
        class="mobile-bottom-menu flex-1"
        :supportUnreadCount="supportUnreadCount" />
    </div>
  </nav>
</template>

<script lang="ts" setup>
  import { useRoute } from "vue-router";
  import { navigateTo, useNuxtApp } from "nuxt/app";
  import { computed, h, onBeforeUnmount, onMounted, reactive, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";

  import { useThemeStore } from "~/stores/themeStore.js";
  import { useAuthStore } from "~/stores/authStore";

  import LanguageSwitcher from "~/components/block/LandingHeader/components/LanguageSwitcher.vue";
  import CabinetSidebarMenu from "~/components/block/CabinetSidebarMenu.vue";
  import UiIconLogo from "~/components/ui/UiIconLogo.vue";
  import UiIconLogout from "~/components/ui/UiIconLogout.vue";
  import UiIconMoon from "~/components/ui/UiIconMoon.vue";
  import UiIconSun from "~/components/ui/UiIconSun.vue";
  import UiIconUser from "~/components/ui/UiIconUser.vue";
  import UiIconBell from "~/components/ui/UiIconBell.vue";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconDelete from "~/components/ui/UiIconDelete.vue";
  import UiIconLogoLight from "~/components/ui/UiIconLogoLight.vue";

  const authStore = useAuthStore();
  const themeStore = useThemeStore();
  const appCore = useAppCore();
  const { locale } = useI18n({ useScope: "global" });
  const addCurrentLocaleToPath = (path = "") => `/${locale.value}/${path}`;
  const SUPPORT_BADGE_REFRESH_MS = 10000;
  const SUPPORT_UNREAD_UPDATED_EVENT = "support-unread-updated";
  const SUPPORT_ACTIVE_TICKET_CHANGED_EVENT = "support-active-ticket-changed";
  const toast = useToast();
  const { $echo } = useNuxtApp() as { $echo?: any };

  const isOpen = ref(false);
  const isLoading = ref(false);
  const supportUnreadCount = ref(0);
  const activeSupportTicketId = ref("");
  let supportBadgeTimer: ReturnType<typeof setInterval> | null = null;
  let supportUnreadRafId: number | null = null;
  let supportRealtimeChannel: any = null;
  const notifications = reactive([
    { type: "info", message: "Test info notification message", wasRead: false },
    { type: "warning", message: "Test warning notification message", wasRead: false },
    { type: "success", message: "Test success notification message", wasRead: false },
    { type: "danger", message: "Test danger notification message", wasRead: true },
    { type: "info", message: "Test info notification message", wasRead: true },
    { type: "info", message: "Test info notification message", wasRead: true },
    { type: "info", message: "Test info notification message", wasRead: true },
    { type: "info", message: "Test info notification message", wasRead: true },
    { type: "info", message: "Test info notification message", wasRead: true },
    { type: "info", message: "Test info notification message", wasRead: true },
  ]);

  if (!authStore.user) authStore.initAuth();

  const handleClickLogout = () => {
    authStore.setAccessToken("");
    navigateTo("/auth/login");
  };

  const isThemeLight = computed(() => themeStore.currentTheme !== "dark");

  const route = useRoute();
  const isProfileRoute = computed(() => route.path.split("/").pop() === "profile");

  const handleClickNotifications = () => (isOpen.value = !isOpen.value);

  const loadSupportUnreadCount = async () => {
    try {
      const response = await appCore.tickets.getUnreadSummary();
      const count = Number(response?.data?.data?.unread_messages_count ?? response?.data?.unread_messages_count ?? 0);
      supportUnreadCount.value = Number.isFinite(count) ? Math.max(0, count) : 0;
    } catch {}
  };

  const startSupportBadgeRefresh = () => {
    if (supportBadgeTimer) return;

    supportBadgeTimer = setInterval(() => {
      loadSupportUnreadCount().catch(() => {});
    }, SUPPORT_BADGE_REFRESH_MS);
  };

  const stopSupportBadgeRefresh = () => {
    if (!supportBadgeTimer) return;

    clearInterval(supportBadgeTimer);
    supportBadgeTimer = null;
  };

  const handleSupportUnreadUpdated = () => {
    if (supportUnreadRafId !== null) return;

    supportUnreadRafId = window.requestAnimationFrame(() => {
      supportUnreadRafId = null;
      loadSupportUnreadCount().catch(() => {});
    });
  };

  const normalizeText = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

  const getRouteSupportTicketId = (): string => {
    const match = String(route.path ?? "").match(/\/support\/([^/?#]+)/);
    return normalizeText(match?.[1] ?? "");
  };

  const resolveSenderName = (payload: any): string => {
    const firstName = normalizeText(payload?.author_first_name);
    const lastName = normalizeText(payload?.author_last_name);
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) return fullName;

    const author = normalizeText(payload?.author);
    if (author) return author;

    const email = normalizeText(payload?.author_email);
    if (email) return email;

    return "Support";
  };

  const resolveAvatarFallback = (senderName: string, payload: any): string => {
    const initials = normalizeText(payload?.author_initials)
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 2)
      .toUpperCase();
    if (initials.length === 2) return initials;

    const nameParts = senderName.split(/\s+/).filter(Boolean);
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    if (nameParts.length === 1) {
      return nameParts[0].slice(0, 2).toUpperCase();
    }

    const email = normalizeText(payload?.author_email);
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }

    return "SU";
  };

  const truncate = (text: string, max = 120): string => {
    if (text.length <= max) return text;
    return `${text.slice(0, max)}...`;
  };

  const handleSupportActiveTicketChanged = (payload?: any) => {
    activeSupportTicketId.value = normalizeText(payload?.ticketId ?? payload?.ticket_id);
  };

  const handleSupportMessageToast = (payload?: any) => {
    const ticketId = normalizeText(payload?.ticket_id ?? payload?.ticketId);
    if (!ticketId) return;

    const routeTicketId = getRouteSupportTicketId();
    if (ticketId === activeSupportTicketId.value || ticketId === routeTicketId) return;

    const senderName = resolveSenderName(payload);
    const preview = truncate(normalizeText(payload?.body) || "New message");
    const avatarUrl = normalizeText(payload?.author_photo_url);
    const avatarFallback = resolveAvatarFallback(senderName, payload);

    toast.info(
      h(
        "div",
        { style: { display: "flex", alignItems: "center", gap: "10px", minWidth: "0", cursor: "pointer" } },
        [
          h(
            "div",
            {
              style: {
                width: "34px",
                height: "34px",
                borderRadius: "999px",
                overflow: "hidden",
                flexShrink: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--ui-primary-main)",
                color: "var(--ui-text-main)",
                fontSize: "12px",
                fontWeight: "700",
                textTransform: "uppercase",
              },
            },
            avatarUrl
              ? h("img", { src: avatarUrl, alt: senderName, style: { width: "100%", height: "100%", objectFit: "cover" } })
              : avatarFallback
          ),
          h("div", { style: { minWidth: "0", display: "flex", flexDirection: "column", gap: "2px" } }, [
            h(
              "div",
              {
                style: {
                  fontSize: "13px",
                  lineHeight: "1.2",
                  fontWeight: "700",
                  color: "var(--ui-text-main)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              },
              senderName
            ),
            h(
              "div",
              {
                style: {
                  fontSize: "12px",
                  lineHeight: "1.2",
                  color: "var(--ui-text-secondary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                },
              },
              preview
            ),
          ]),
        ]
      ),
      {
        id: `support-message-${normalizeText(payload?.id) || ticketId}-${normalizeText(payload?.created_at)}`,
        timeout: 8000,
        closeOnClick: true,
        pauseOnHover: true,
        onClick: () => {
          navigateTo(addCurrentLocaleToPath(`support/${ticketId}`));
        },
      }
    );
  };

  const handleSupportGlobalMessage = (payload?: any) => {
    handleSupportUnreadUpdated();
    handleSupportMessageToast(payload);
  };

  const connectSupportRealtime = () => {
    if (!$echo || supportRealtimeChannel) return;

    supportRealtimeChannel = $echo.private("support.global").listen(".MessageSent", handleSupportGlobalMessage);
  };

  const disconnectSupportRealtime = () => {
    if (!$echo || !supportRealtimeChannel) return;

    supportRealtimeChannel.stopListening(".MessageSent");
    $echo.leave("support.global");
    supportRealtimeChannel = null;
  };

  onMounted(async () => {
    await loadSupportUnreadCount();
    useEventBus.on(SUPPORT_UNREAD_UPDATED_EVENT, handleSupportUnreadUpdated);
    useEventBus.on(SUPPORT_ACTIVE_TICKET_CHANGED_EVENT, handleSupportActiveTicketChanged);
    startSupportBadgeRefresh();
    connectSupportRealtime();
  });

  onBeforeUnmount(() => {
    useEventBus.off(SUPPORT_UNREAD_UPDATED_EVENT, handleSupportUnreadUpdated);
    useEventBus.off(SUPPORT_ACTIVE_TICKET_CHANGED_EVENT, handleSupportActiveTicketChanged);
    stopSupportBadgeRefresh();
    disconnectSupportRealtime();
    if (supportUnreadRafId !== null) {
      window.cancelAnimationFrame(supportUnreadRafId);
      supportUnreadRafId = null;
    }
  });
</script>

<style scoped>
  .logo :deep(svg),
  .logo :deep(img) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .mobile-bottom-menu :deep(nav),
  .mobile-bottom-menu :deep(ul),
  .mobile-bottom-menu :deep(.menu),
  .mobile-bottom-menu :deep(.cabinet-menu) {
    display: flex !important;
    align-items: center;
    justify-content: space-evenly;
    gap: 0.25rem;
    width: 100%;
    height: 100%;
  }

  .mobile-bottom-menu :deep(a),
  .mobile-bottom-menu :deep(button),
  .mobile-bottom-menu :deep(.cabinet-menu__item) {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    flex: 0 0 56px;
    width: 56px;
    height: 48px;
    border-radius: 14px;
    background: color-mix(in oklab, var(--color-stroke-ui-dark) 60%, transparent);
    font-size: 0;
    white-space: nowrap;
  }

  .mobile-bottom-menu :deep(a.router-link-active),
  .mobile-bottom-menu :deep(.active) {
    background: var(--color-stroke-ui-dark);
  }

  .mobile-bottom-menu :deep(svg) {
    width: 22px;
    height: 22px;
  }

  .mobile-bottom-menu :deep(.w-full.flex.items-center.justify-center.h-\[40px\]),
  .mobile-bottom-menu :deep(.w-full.flex.items-center.justify-center.h-\[4px\]) {
    display: none !important;
  }

  .mobile-bottom-menu :deep(span),
  .mobile-bottom-menu :deep(.label),
  .mobile-bottom-menu :deep(.title),
  .mobile-bottom-menu :deep(.text),
  .mobile-bottom-menu :deep(p),
  .mobile-bottom-menu :deep(small),
  .mobile-bottom-menu :deep(em),
  .mobile-bottom-menu :deep(strong) {
    display: none !important;
  }

  .mobile-bottom-menu :deep(.menu-notification-badge) {
    display: inline-flex !important;
  }
</style>
