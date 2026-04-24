<template>
  <button
    type="button"
    class="google-login"
    :disabled="isLoading"
    @click="loginWithGoogle">
    <UiIconSpinnerDefault v-if="isLoading" />
    <UiIconGoogleOauth v-else />
  </button>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useSocialAuth } from "~/composables/useSocialAuth";
  import UiIconGoogleOauth from "~/components/ui/UiIconGoogleOauth.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";

  const { activeProvider, isLoading: isSocialAuthLoading, startSocialLogin } = useSocialAuth();

  const isLoading = computed(
    () => isSocialAuthLoading.value && activeProvider.value === "google"
  );

  async function loginWithGoogle() {
    await startSocialLogin("google");
  }
</script>

<style scoped lang="scss">
  .google-login {
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 999px;
    background: white;
    color: var(--ui-primary-main);
    transition:
      transform 0.2s ease,
      opacity 0.2s ease,
      box-shadow 0.2s ease;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 22px color-mix(in srgb, var(--ui-primary-main) 16%, transparent);
    }

    &:disabled {
      opacity: 0.7;
      cursor: wait;
    }

    :deep(svg) {
      width: 18px;
      height: 18px;
    }
  }
</style>
