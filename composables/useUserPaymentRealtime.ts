import type Echo from "laravel-echo";
import { useNuxtApp } from "nuxt/app";
import { onBeforeUnmount, onMounted, watch } from "vue";

import { useAuthStore } from "~/stores/authStore";

type UserPaymentRealtimeOptions = {
  onPaymentUpdated: (payload: any) => void | Promise<void>;
  onReconnectSync?: () => void | Promise<void>;
  eventNames?: string[];
  retryMs?: number;
  fallbackPollMs?: number;
  resumeSyncMinIntervalMs?: number;
};

const DEFAULT_PAYMENT_REALTIME_EVENT_NAMES = [
  ".user.payment.updated",
  "user.payment.updated",
  ".Modules\\Billing\\Events\\UserPaymentUpdated",
  "Modules\\Billing\\Events\\UserPaymentUpdated",
  ".UserPaymentUpdated",
  "UserPaymentUpdated",
];

const DEFAULT_PAYMENT_REALTIME_RETRY_MS = 3000;
const DEFAULT_PAYMENT_FALLBACK_POLL_MS = 5000;
const DEFAULT_PAYMENT_RESUME_SYNC_MIN_INTERVAL_MS = 5000;

export default function useUserPaymentRealtime(options: UserPaymentRealtimeOptions) {
  const authStore = useAuthStore();
  const { $echo } = useNuxtApp() as { $echo?: Echo<any> };

  const eventNames = options.eventNames ?? DEFAULT_PAYMENT_REALTIME_EVENT_NAMES;
  const retryMs = options.retryMs ?? DEFAULT_PAYMENT_REALTIME_RETRY_MS;
  const fallbackPollMs = options.fallbackPollMs ?? DEFAULT_PAYMENT_FALLBACK_POLL_MS;
  const resumeSyncMinIntervalMs =
    options.resumeSyncMinIntervalMs ?? DEFAULT_PAYMENT_RESUME_SYNC_MIN_INTERVAL_MS;

  let activePaymentChannel: any = null;
  let currentPaymentChannelName = "";
  let paymentSocketStateHandler: ((states: any) => void) | null = null;
  let paymentRealtimeRetryTimer: ReturnType<typeof setInterval> | null = null;
  let paymentFallbackPollTimer: ReturnType<typeof setInterval> | null = null;
  let paymentResumeListenersAttached = false;
  let lastPaymentResumeSyncAt = 0;

  const hasAccessToken = () => Boolean(String(authStore.accessToken ?? "").trim());

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

  const reconnectPaymentSocketTransport = () => {
    const echoClient = resolveEchoClient();
    const pusher = echoClient?.connector?.pusher;
    const state = String(pusher?.connection?.state ?? "");
    if (!pusher) {
      return;
    }

    if (state === "disconnected" || state === "failed" || state === "unavailable") {
      try {
        pusher.connect();
      } catch {
        // no-op
      }
    }
  };

  const isPaymentSocketConnected = () => {
    const echoClient = resolveEchoClient();
    const state = String(echoClient?.connector?.pusher?.connection?.state ?? "");

    return state === "connected";
  };

  const runReconnectSync = async (force = false) => {
    if (!options.onReconnectSync || !hasAccessToken()) {
      return;
    }

    const now = Date.now();
    if (!force && now - lastPaymentResumeSyncAt < resumeSyncMinIntervalMs) {
      return;
    }

    lastPaymentResumeSyncAt = now;

    try {
      await options.onReconnectSync();
    } catch {
      // no-op
    }
  };

  const unsubscribeFromPaymentRealtime = () => {
    const channelName = currentPaymentChannelName;
    currentPaymentChannelName = "";
    activePaymentChannel = null;

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
    if (currentPaymentChannelName === channelName && activePaymentChannel) {
      return;
    }

    unsubscribeFromPaymentRealtime();
    reconnectPaymentSocketTransport();
    currentPaymentChannelName = channelName;
    activePaymentChannel = echoClient.private(channelName);

    eventNames.forEach(eventName => {
      activePaymentChannel.stopListening(eventName, options.onPaymentUpdated);
      activePaymentChannel.listen(eventName, options.onPaymentUpdated);
    });
  };

  const bindPaymentSocketStateListener = () => {
    if (paymentSocketStateHandler) {
      return;
    }

    const echoClient = resolveEchoClient();
    const connection = echoClient?.connector?.pusher?.connection;
    if (!connection || typeof connection.bind !== "function") {
      return;
    }

    paymentSocketStateHandler = (states: any) => {
      const currentState = String(states?.current ?? connection?.state ?? "");
      if (currentState === "connected") {
        const userId = String(authStore.user?.id ?? "").trim();
        if (userId !== "") {
          subscribeToPaymentRealtime();
        }
        void runReconnectSync();
        return;
      }

      if (currentState === "failed" || currentState === "unavailable" || currentState === "disconnected") {
        reconnectPaymentSocketTransport();
      }
    };

    connection.bind("state_change", paymentSocketStateHandler);
  };

  const unbindPaymentSocketStateListener = () => {
    if (!paymentSocketStateHandler) {
      return;
    }

    const echoClient = resolveEchoClient();
    const connection = echoClient?.connector?.pusher?.connection;
    if (connection && typeof connection.unbind === "function") {
      connection.unbind("state_change", paymentSocketStateHandler);
    }

    paymentSocketStateHandler = null;
  };

  const startPaymentRealtimeRetry = () => {
    if (paymentRealtimeRetryTimer) {
      return;
    }

    paymentRealtimeRetryTimer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }

      reconnectPaymentSocketTransport();
      subscribeToPaymentRealtime();
    }, retryMs);
  };

  const stopPaymentRealtimeRetry = () => {
    if (!paymentRealtimeRetryTimer) {
      return;
    }

    clearInterval(paymentRealtimeRetryTimer);
    paymentRealtimeRetryTimer = null;
  };

  const startPaymentFallbackPolling = () => {
    if (paymentFallbackPollTimer || !options.onReconnectSync) {
      return;
    }

    paymentFallbackPollTimer = setInterval(() => {
      if (!hasAccessToken()) {
        return;
      }

      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }

      if (isPaymentSocketConnected()) {
        return;
      }

      void runReconnectSync();
    }, fallbackPollMs);
  };

  const stopPaymentFallbackPolling = () => {
    if (!paymentFallbackPollTimer) {
      return;
    }

    clearInterval(paymentFallbackPollTimer);
    paymentFallbackPollTimer = null;
  };

  const handlePaymentResume = () => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      return;
    }

    reconnectPaymentSocketTransport();
    subscribeToPaymentRealtime();
    void runReconnectSync();
  };

  const attachPaymentResumeListeners = () => {
    if (paymentResumeListenersAttached || typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    window.addEventListener("focus", handlePaymentResume);
    document.addEventListener("visibilitychange", handlePaymentResume);
    paymentResumeListenersAttached = true;
  };

  const detachPaymentResumeListeners = () => {
    if (!paymentResumeListenersAttached || typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    window.removeEventListener("focus", handlePaymentResume);
    document.removeEventListener("visibilitychange", handlePaymentResume);
    paymentResumeListenersAttached = false;
  };

  watch(
    () => authStore.user?.id,
    userId => {
      const normalizedUserId = String(userId ?? "").trim();
      if (normalizedUserId === "") {
        unsubscribeFromPaymentRealtime();
        stopPaymentRealtimeRetry();
        stopPaymentFallbackPolling();
        return;
      }

      bindPaymentSocketStateListener();
      attachPaymentResumeListeners();
      subscribeToPaymentRealtime();
      startPaymentRealtimeRetry();
      startPaymentFallbackPolling();
    }
  );

  onMounted(() => {
    bindPaymentSocketStateListener();
    attachPaymentResumeListeners();

    if (!hasAccessToken()) {
      return;
    }

    subscribeToPaymentRealtime();
    startPaymentRealtimeRetry();
    startPaymentFallbackPolling();
  });

  onBeforeUnmount(() => {
    unsubscribeFromPaymentRealtime();
    unbindPaymentSocketStateListener();
    detachPaymentResumeListeners();
    stopPaymentRealtimeRetry();
    stopPaymentFallbackPolling();
  });
}
