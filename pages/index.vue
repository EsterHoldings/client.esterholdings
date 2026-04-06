<script lang="ts" setup>
  import { navigateTo } from "nuxt/app";
  import { useLocalePath } from "#imports";
  import { USER_ACCESS_TOKEN } from "~/constants/auth";

  const localePath = useLocalePath();

  if (import.meta.client) {
    const hasToken = !!localStorage.getItem(USER_ACCESS_TOKEN);
    const redirectPath = hasToken ? "/dashboard" : "/auth/login";

    await navigateTo(localePath(redirectPath), { replace: true });
  }
</script>

<template>
  <div />
</template>
