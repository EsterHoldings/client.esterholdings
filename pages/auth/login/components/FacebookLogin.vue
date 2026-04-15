<template>
  <UiIconFacebook @click="loginWithFacebook" />
</template>

<script setup lang="ts">
  import { useSocialAuth } from "~/composables/useSocialAuth";
  import UiIconFacebook from "~/components/ui/UiIconFacebook.vue";

  const { startSocialLogin } = useSocialAuth();

  async function loginWithFacebook() {
    await startSocialLogin("facebook");
  }
</script>
