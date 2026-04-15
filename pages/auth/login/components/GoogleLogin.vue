<template>
  <UiIconGoogleOauth @click="loginWithGoogle" />
</template>

<script setup lang="ts">
  import { useSocialAuth } from "~/composables/useSocialAuth";
  import UiIconGoogleOauth from "~/components/ui/UiIconGoogleOauth.vue";

  const { startSocialLogin } = useSocialAuth();

  async function loginWithGoogle() {
    await startSocialLogin("google");
  }
</script>
