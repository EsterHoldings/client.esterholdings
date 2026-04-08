<script lang="ts" setup>
  import { navigateTo } from "nuxt/app";
  import { useLocalePath } from "#imports";

  const localePath = useLocalePath();

  await navigateTo(localePath("/"), { replace: true });
</script>

<template>
  <div />
</template>
