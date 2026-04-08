<script lang="ts" setup>
  import CabinetDashboardPage from "~/components/pages/CabinetDashboardPage.vue";

  definePageMeta({
    layout: "cabinet",
    middleware: ["auth-client", "client-check-auth"],
  });
</script>

<template>
  <CabinetDashboardPage />
</template>
