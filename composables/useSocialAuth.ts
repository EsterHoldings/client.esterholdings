import { navigateTo, useRoute, useRuntimeConfig } from "nuxt/app";
import { useLocalePath } from "#imports";
import { useToast } from "vue-toastification";
import { useAppCore } from "~/composables/useAppCore";
import { useAuthStore } from "~/stores/authStore";

type SocialProvider = "google" | "facebook" | "linkedin";

type SocialLoginMessage = {
  type?: "social-login:success" | "social-login:error";
  provider?: SocialProvider;
  access_token?: string;
  message?: string;
};

const SOCIAL_RETURN_TO_KEY = "social_login_return_to";

export function useSocialAuth() {
  const appCore = useAppCore();
  const authStore = useAuthStore();
  const localePath = useLocalePath();
  const route = useRoute();
  const toast = useToast();
  const { public: pub } = useRuntimeConfig();

  const resolvePostLoginTarget = (): string => {
    if (process.client) {
      const saved = localStorage.getItem(SOCIAL_RETURN_TO_KEY);
      if (saved?.startsWith("/")) {
        return saved;
      }
    }

    const raw = Array.isArray(route.query?.return_to) ? route.query.return_to[0] : route.query?.return_to;
    return typeof raw === "string" && raw.startsWith("/") ? raw : localePath("/");
  };

  const rememberPostLoginTarget = (): void => {
    if (!process.client) {
      return;
    }

    localStorage.setItem(SOCIAL_RETURN_TO_KEY, resolvePostLoginTarget());
  };

  const clearPostLoginTarget = (): void => {
    if (process.client) {
      localStorage.removeItem(SOCIAL_RETURN_TO_KEY);
    }
  };

  const resolveAllowedOrigins = (): Set<string> => {
    const origins = new Set<string>();

    if (process.client) {
      origins.add(window.location.origin);
    }

    [pub.baseApi, pub.apiBase, pub.hostBase]
      .filter((url): url is string => typeof url === "string" && url.length > 0)
      .forEach((url) => {
        try {
          origins.add(new URL(url, window.location.origin).origin);
        } catch {
          // Invalid runtime URL should not break social auth listener setup.
        }
      });

    return origins;
  };

  const finishLogin = async (accessToken: string): Promise<void> => {
    authStore.setAccessToken(accessToken);
    await authStore.initAuth(true);

    const target = resolvePostLoginTarget();
    clearPostLoginTarget();
    await navigateTo(target);
  };

  const startSocialLogin = async (provider: SocialProvider): Promise<void> => {
    if (!process.client) {
      return;
    }

    rememberPostLoginTarget();

    try {
      const response = await appCore.auth.doSocialRedirect(provider, {
        origin: window.location.origin,
      });
      const redirectUrl = response?.data?.redirectUrl;

      if (typeof redirectUrl !== "string" || redirectUrl.length === 0) {
        throw new Error("Social login redirect URL is empty.");
      }

      const popup = window.open(
        redirectUrl,
        `${provider}Login`,
        "popup=yes,width=520,height=680,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes",
      );

      if (!popup) {
        throw new Error("Popup was blocked.");
      }

      const allowedOrigins = resolveAllowedOrigins();
      let popupWatcher: ReturnType<typeof window.setInterval> | null = null;

      const cleanup = () => {
        window.removeEventListener("message", popupListener);
        if (popupWatcher) {
          window.clearInterval(popupWatcher);
          popupWatcher = null;
        }
      };

      const popupListener = async (event: MessageEvent<SocialLoginMessage>) => {
        if (!allowedOrigins.has(event.origin)) {
          return;
        }

        const payload = event.data;
        if (!payload || !payload.type?.startsWith("social-login:")) {
          return;
        }

        cleanup();

        if (payload.type === "social-login:error") {
          clearPostLoginTarget();
          toast.error(payload.message || "Social login failed.");
          return;
        }

        if (!payload.access_token) {
          clearPostLoginTarget();
          toast.error("Social login did not return an access token.");
          return;
        }

        await finishLogin(payload.access_token);
      };

      window.addEventListener("message", popupListener);

      popupWatcher = window.setInterval(() => {
        if (popup.closed) {
          cleanup();
        }
      }, 500);
    } catch (error) {
      clearPostLoginTarget();
      console.error(`Social login failed for ${provider}:`, error);
      toast.error("Social login failed.");
    }
  };

  return {
    finishLogin,
    startSocialLogin,
  };
}
