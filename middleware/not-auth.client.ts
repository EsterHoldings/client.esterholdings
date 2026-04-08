import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useLocalePath } from "#imports";

export default defineNuxtRouteMiddleware(() => {
  if (!!localStorage.getItem("user_access_token")) {
    const localePath = useLocalePath();
    return navigateTo(localePath("/"));
  }
});
