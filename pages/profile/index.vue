<template>
  <UiContainer>
    <div>
      <div class="mb-5 flex items-center justify-between gap-3">
        <UiTextH4 class="text-[var(--ui-text-main)]">
          {{ t("cabinet.menu.profile_verification") }}
        </UiTextH4>

        <span
          v-if="profileInfoHeaderLabel"
          class="shrink-0 text-right text-[13px] font-medium"
          :class="{
            'text-[var(--ui-text-secondary)]': profileInfoHeaderState === 'initial',
            'text-[var(--color-warning)]': profileInfoHeaderState === 'pending',
            'text-[var(--color-success)]': profileInfoHeaderState === 'approved',
            'text-[var(--color-danger)]': profileInfoHeaderState === 'rejected',
          }">
          {{ profileInfoHeaderLabel }}
        </span>
      </div>

      <PanelDefault>
        <div class="p-5">
          <TabGeneral @profile-info-status-change="handleProfileInfoStatusChange" />
        </div>
      </PanelDefault>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
  import type Echo from "laravel-echo";
  import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
  import { definePageMeta, navigateTo, useLocalePath, useNuxtApp, useRoute } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";

  import UiContainer from "~/components/ui/UiContainer.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import TabGeneral from "~/pages/profile/components/TabGeneral.vue";
  import useEventBus from "~/composables/useEventBus";
  import { useAuthStore } from "~/stores/authStore";

  definePageMeta({
    layout: "cabinet",
    middleware: ["auth-client", "client-check-auth"],
  });

  type ProfileInfoVerificationState = "initial" | "pending" | "approved" | "rejected";
  const CLIENT_NOTIFICATION_RECEIVED_EVENT = "client-notification-received";
  const VERIFICATION_NOTIFICATION_TYPE = "verification.status-updated";
  const NOTIFICATION_EVENT_NAMES = [
    ".UserNotificationCreated",
    "UserNotificationCreated",
    ".App\\Events\\UserNotificationCreated",
    "App\\Events\\UserNotificationCreated",
  ];

  const { t } = useI18n();
  const route = useRoute();
  const localePath = useLocalePath();
  const authStore = useAuthStore();
  const { $echo } = useNuxtApp() as { $echo?: Echo<any> };
  const profileInfoHeaderState = ref<ProfileInfoVerificationState>("initial");
  const profileInfoHeaderLabel = ref("");
  const activeNotificationsChannel = ref<any>(null);
  const currentNotificationsChannelName = ref("");
  const lastEmittedVerificationNotificationId = ref("");

  const needsSettingsRedirect = computed(() => {
    const key = String(route.query?.tab ?? "")
      .trim()
      .toLowerCase();

    return ["security", "password", "change_password"].includes(key);
  });

  const redirectToSettings = async (): Promise<void> => {
    if (!needsSettingsRedirect.value) {
      return;
    }

    await navigateTo(localePath({ path: "/settings" }), { replace: true });
  };

  onMounted(async () => {
    await redirectToSettings();
  });

  watch(
    () => route.query?.tab,
    async () => {
      await redirectToSettings();
    }
  );

  const handleProfileInfoStatusChange = (payload: { state: ProfileInfoVerificationState; label: string }) => {
    profileInfoHeaderState.value = payload.state;
    profileInfoHeaderLabel.value = payload.label;
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

  const handleRealtimeProfileNotification = (payload: any) => {
    const notification = payload?.notification ?? null;
    const notificationId = String(notification?.id ?? "").trim();
    const notificationType = String(notification?.type ?? "").trim();

    if (notificationType !== VERIFICATION_NOTIFICATION_TYPE || notificationId === "") {
      return;
    }

    if (lastEmittedVerificationNotificationId.value === notificationId) {
      return;
    }

    lastEmittedVerificationNotificationId.value = notificationId;
    useEventBus.emit(CLIENT_NOTIFICATION_RECEIVED_EVENT, {
      notification,
    });
  };

  const unsubscribeFromProfileNotifications = () => {
    const channel = activeNotificationsChannel.value;
    if (!channel) {
      currentNotificationsChannelName.value = "";
      return;
    }

    NOTIFICATION_EVENT_NAMES.forEach(eventName => {
      try {
        channel.stopListening(eventName, handleRealtimeProfileNotification);
      } catch {
        // no-op
      }
    });

    activeNotificationsChannel.value = null;
    currentNotificationsChannelName.value = "";
  };

  const subscribeToProfileNotifications = (userId: string) => {
    const normalizedUserId = String(userId ?? "").trim();
    if (normalizedUserId === "") {
      unsubscribeFromProfileNotifications();
      return;
    }

    const channelName = `notifications.user.${normalizedUserId}`;
    if (currentNotificationsChannelName.value === channelName && activeNotificationsChannel.value) {
      return;
    }

    unsubscribeFromProfileNotifications();

    const echoClient = resolveEchoClient();
    if (!echoClient) {
      return;
    }

    const channel = echoClient.private(channelName);
    NOTIFICATION_EVENT_NAMES.forEach(eventName => {
      channel.stopListening(eventName, handleRealtimeProfileNotification);
      channel.listen(eventName, handleRealtimeProfileNotification);
    });

    activeNotificationsChannel.value = channel;
    currentNotificationsChannelName.value = channelName;
  };

  watch(
    () => authStore.user?.id,
    userId => {
      subscribeToProfileNotifications(String(userId ?? ""));
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    unsubscribeFromProfileNotifications();
  });
</script>
