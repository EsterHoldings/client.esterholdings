import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useAdminAuthStore } from "../stores/adminAuthStore";

export default defineNuxtRouteMiddleware(() => {
  if (process.server) return;

  const adminAuthStore = useAdminAuthStore();
  if (adminAuthStore.isAuthenticated) {
    return navigateTo("/admin/dashboard");
  }
  return navigateTo("/admin/auth/login");
});
