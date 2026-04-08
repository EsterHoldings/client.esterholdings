<script setup lang="ts">
  import { onMounted } from "vue";
  import { useRouter } from "vue-router";
  import { useLocalePath } from "#imports";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import { useAuthStore } from "~/stores/authStore";

  const router = useRouter();
  const localePath = useLocalePath();
  const authStore = useAuthStore();

  onMounted(async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.slice(1));

    const code = queryParams.get("code");
    const idToken = hashParams.get("id_token");
    const impersonationToken = hashParams.get("impersonation_token") || queryParams.get("impersonation_token");
    const redirect = hashParams.get("redirect") || queryParams.get("redirect");
    const error = queryParams.get("error") || hashParams.get("error");
    const loginType = localStorage.getItem("social_login_type");

    if (error) {
      console.error("Login error:", error);

      if (window.opener) {
        window.opener.postMessage({ error }, window.location.origin);
        window.close();
      }

      return;
    }

    if (impersonationToken) {
      try {
        authStore.setAccessToken(impersonationToken);
        await authStore.initAuth(true);
        localStorage.removeItem("social_login_type");

        const nextPath = typeof redirect === "string" && redirect.startsWith("/") ? redirect : localePath("/");
        await router.replace(nextPath);
      } catch (e) {
        authStore.setAccessToken("");
        console.error("Impersonation login failed:", e);
        await router.replace(localePath("/auth/login"));
      }

      return;
    }

    if (loginType === "google") {
      window.opener?.postMessage({ id_token: idToken, type: "google" }, window.location.origin);
      window.close();
      return;
    }

    if (code && loginType) {
      try {
        const response = await $fetch("/api/login-via-social", {
          method: "POST",
          body: {
            type: loginType,
            token: code,
          },
        });

        localStorage.removeItem("social_login_type");
        await router.push(localePath("/"));
      } catch (e) {
        console.error("Login failed:", e);
      }
    }
  });
</script>

<template>
  <div class="loader">
    <UiIconSpinnerDefault />
  </div>
</template>

<style scoped lang="scss">
  .loader {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 500px;

    svg {
      width: 75px;
      height: 75px;
    }
  }
</style>
