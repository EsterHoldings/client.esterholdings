<template>
  <UiIconLinkedIn @click="loginWithLinkedIn" />
</template>

<script setup lang="ts">
  import { useSocialAuth } from "~/composables/useSocialAuth";
  import UiIconLinkedIn from "~/components/ui/UiIconLinkedIn.vue";

  const { startSocialLogin } = useSocialAuth();

  async function loginWithLinkedIn() {
    await startSocialLogin("linkedin");
  }
</script>
