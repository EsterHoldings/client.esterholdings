import { defineNuxtPlugin } from "#app";
import type { RouteLocationNormalizedLoaded } from "vue-router";

const CABINET_ROUTE_RE =
  /^\/(?:[a-z]{2}(?:\/(?:accounts|payments|profile|support|referrals|settings|admin)(?:\/|$)|\/?$)|(?:accounts|payments|profile|support|referrals|settings|admin)(?:\/|$))/i;

const resolveLayoutMeta = (route: RouteLocationNormalizedLoaded): string => {
  const layoutMeta = route.meta?.layout;
  if (typeof layoutMeta === "string") {
    return layoutMeta;
  }

  if (typeof layoutMeta === "function") {
    try {
      const resolved = layoutMeta(route);
      return typeof resolved === "string" ? resolved : "";
    } catch {
      return "";
    }
  }

  return "";
};

const isCabinetRoute = (route: RouteLocationNormalizedLoaded): boolean => {
  const layoutMeta = resolveLayoutMeta(route);
  return layoutMeta === "cabinet" || CABINET_ROUTE_RE.test(route.path);
};

export default defineNuxtPlugin(nuxtApp => {
  if (!process.client) {
    return;
  }

  const applyScrollState = (to: RouteLocationNormalizedLoaded) => {
    const body = document.body;
    const html = document.documentElement;

    if (isCabinetRoute(to)) {
      body.classList.remove("scroll-unlocked", "overflow-hidden", "fixed");
      body.classList.add("cabinet-scroll-lock");
      body.style.setProperty("overflow", "hidden", "important");
      body.style.setProperty("overflow-y", "hidden", "important");
      body.style.position = "";
      body.style.width = "";
      body.style.height = "100dvh";

      html.classList.remove("scroll-unlocked", "overflow-hidden", "fixed");
      html.classList.add("cabinet-scroll-lock");
      html.style.setProperty("overflow", "hidden", "important");
      html.style.setProperty("overflow-y", "hidden", "important");
      html.style.height = "100dvh";
      return;
    }

    body.classList.remove("cabinet-scroll-lock", "overflow-hidden", "fixed");
    html.classList.remove("cabinet-scroll-lock", "overflow-hidden", "fixed");

    body.style.overflow = "auto";
    body.style.setProperty("overflow", "auto", "important");
    body.style.setProperty("overflow-y", "auto", "important");
    body.style.overflowY = "auto";
    body.style.position = "";
    body.style.width = "";
    body.style.height = "auto";

    html.style.overflow = "auto";
    html.style.setProperty("overflow", "auto", "important");
    html.style.setProperty("overflow-y", "auto", "important");
    html.style.overflowY = "auto";
    html.style.height = "auto";

    body.classList.add("scroll-unlocked");
    html.classList.add("scroll-unlocked");
  };

  // Ensure correct state even on direct landing open without route transition.
  applyScrollState(nuxtApp.$router.currentRoute.value);

  nuxtApp.$router.afterEach(to => {
    requestAnimationFrame(() => applyScrollState(to));
  });
});
