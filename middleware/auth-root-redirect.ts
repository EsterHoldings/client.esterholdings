import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useLocalePath } from "#imports";

export default defineNuxtRouteMiddleware(() => {
  const localePath = useLocalePath();

  return navigateTo(localePath("/auth/login"), { replace: true });
});
