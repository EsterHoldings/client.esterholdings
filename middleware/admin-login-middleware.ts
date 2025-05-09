import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useAdminAuthStore } from "../stores/adminAuthStore";

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.server) {
    console.log("Skip logic");
    return;
  }

  const adminAuthStore = useAdminAuthStore();

  if (!!adminAuthStore.accessToken) {
    return navigateTo("/admin/access");
  }
});
