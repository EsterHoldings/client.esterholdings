import { defineNuxtRouteMiddleware, navigateTo, useCookie } from "nuxt/app";

import { useAuthStore } from "~/stores/authStore";

const SUPPORTED_LOCALES = ["en", "ru", "de", "es", "fr", "it", "pt", "tr", "uk", "he", "hi", "ja", "ko", "zh"];

const normalizeLocale = (value: unknown): string => String(value ?? "").trim().toLowerCase();

export default defineNuxtRouteMiddleware(async to => {
  const authStore = useAuthStore();

  if (!authStore.accessToken) {
    return;
  }

  try {
    await authStore.initAuth();
  } catch {
    return;
  }

  const preferredLocale = normalizeLocale(authStore.user?.preferred_locale);
  if (!SUPPORTED_LOCALES.includes(preferredLocale)) {
    return;
  }

  const localeCookie = useCookie<string>("locale");
  const i18nRedirected = useCookie<string>("i18n_redirected");
  localeCookie.value = preferredLocale;
  i18nRedirected.value = preferredLocale;

  const segments = to.path.split("/").filter(Boolean);
  const currentLocale = normalizeLocale(segments[0]);

  if (currentLocale === preferredLocale) {
    return;
  }

  const pathWithoutLocale =
    SUPPORTED_LOCALES.includes(currentLocale)
      ? `/${segments.slice(1).join("/")}`.replace(/\/{2,}/g, "/")
      : to.path || "/";

  const normalizedPathWithoutLocale = pathWithoutLocale === "/" ? "" : pathWithoutLocale;

  return navigateTo(
    {
      path: `/${preferredLocale}${normalizedPathWithoutLocale}` || `/${preferredLocale}`,
      query: to.query,
      hash: to.hash,
    },
    { replace: true }
  );
});
