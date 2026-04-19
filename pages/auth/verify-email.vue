<template>
  <section class="auth-result-page">
    <div
      class="auth-result-card"
      :class="resultClass">
      <div class="auth-result-card__orb auth-result-card__orb--one"></div>
      <div class="auth-result-card__orb auth-result-card__orb--two"></div>

      <div class="auth-result-card__icon">
        <svg
          v-if="state === 'success'"
          viewBox="0 0 24 24"
          aria-hidden="true">
          <path d="M9.2 16.8 4.9 12.5l1.4-1.4 2.9 2.9 8.5-8.5 1.4 1.4-9.9 9.9Z" />
        </svg>
        <svg
          v-else-if="state === 'error'"
          viewBox="0 0 24 24"
          aria-hidden="true">
          <path
            d="m12 13.4-4.9 4.9-1.4-1.4 4.9-4.9-4.9-4.9 1.4-1.4 4.9 4.9 4.9-4.9 1.4 1.4-4.9 4.9 4.9 4.9-1.4 1.4-4.9-4.9Z" />
        </svg>
        <span
          v-else
          class="auth-result-card__loader"></span>
      </div>

      <p class="auth-result-card__eyebrow">{{ t("authFlow.emailVerification.eyebrow") }}</p>
      <h1>{{ title }}</h1>
      <p class="auth-result-card__message">{{ message }}</p>

      <NuxtLink
        class="auth-result-card__button"
        :to="localePath('/')">
        {{ t("authFlow.actions.goDashboard") }}
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref } from "vue";
  import { useI18n, useLocalePath } from "#imports";
  import { useRoute } from "nuxt/app";
  import { useAppCore } from "~/composables/useAppCore";

  definePageMeta({
    layout: "guest",
  });

  const { t } = useI18n();
  const route = useRoute();
  const localePath = useLocalePath();
  const appCore = useAppCore();

  const state = ref<"loading" | "success" | "error">("loading");
  const message = ref(t("authFlow.emailVerification.loadingMessage"));

  const readQuery = (primary: string, legacy?: string): string => {
    const raw = route.query[primary] ?? (legacy ? route.query[legacy] : undefined);
    const value = Array.isArray(raw) ? raw[0] : raw;
    return String(value ?? "").trim();
  };

  const title = computed(() => {
    if (state.value === "success") return t("authFlow.emailVerification.successTitle");
    if (state.value === "error") return t("authFlow.emailVerification.errorTitle");
    return t("authFlow.emailVerification.loadingTitle");
  });

  const resultClass = computed(() => ({
    "auth-result-card--success": state.value === "success",
    "auth-result-card--error": state.value === "error",
    "auth-result-card--loading": state.value === "loading",
  }));

  onMounted(async () => {
    const id = readQuery("id", "verify_id");
    const hash = readQuery("hash", "verify_hash");
    const expires = readQuery("expires", "verify_expires");
    const signature = readQuery("signature", "verify_signature");

    if (!id || !hash || !expires || !signature) {
      state.value = "error";
      message.value = t("authFlow.emailVerification.missingParams");
      return;
    }

    try {
      const response = await appCore.auth.verifyEmail({ id, hash, expires, signature });
      state.value = "success";
      message.value = response?.data?.message
        ? t("authFlow.emailVerification.successMessage")
        : t("authFlow.emailVerification.successMessage");
    } catch {
      state.value = "error";
      message.value = t("authFlow.emailVerification.errorMessage");
    }
  });
</script>

<style scoped lang="scss">
  .auth-result-page {
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: 24px;
    color: var(--ui-text-main);
    background:
      radial-gradient(circle at 20% 15%, color-mix(in srgb, var(--ui-primary-main) 18%, transparent), transparent 32%),
      radial-gradient(
        circle at 80% 82%,
        color-mix(in srgb, var(--ui-primary-accent) 14%, transparent),
        transparent 30%
      ),
      var(--ui-background);
  }

  .auth-result-card {
    position: relative;
    width: min(560px, 100%);
    overflow: hidden;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 28px;
    padding: 42px 34px;
    text-align: center;
    background: color-mix(in srgb, var(--ui-background-panel) 84%, transparent);
    box-shadow: 0 26px 70px rgba(0, 0, 0, 0.18);
    backdrop-filter: blur(18px);
    animation: cardIn 0.5s ease both;

    h1 {
      position: relative;
      margin: 0 0 12px;
      font-size: clamp(28px, 5vw, 42px);
      line-height: 1.05;
    }

    &__eyebrow,
    &__message,
    &__button,
    &__icon {
      position: relative;
    }

    &__eyebrow {
      margin: 0 0 10px;
      color: var(--ui-primary-accent);
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    &__message {
      margin: 0 auto 28px;
      max-width: 420px;
      color: var(--ui-text-secondary);
      line-height: 1.55;
    }

    &__icon {
      display: inline-grid;
      width: 86px;
      height: 86px;
      margin-bottom: 24px;
      place-items: center;
      border-radius: 26px;
      color: white;
      background: var(--ui-primary-main);
      box-shadow: 0 16px 36px color-mix(in srgb, var(--ui-primary-main) 30%, transparent);

      svg {
        width: 46px;
        height: 46px;
        fill: currentColor;
      }
    }

    &--success &__icon {
      background: var(--ui-sticker-success);
      animation: iconPop 0.55s cubic-bezier(0.2, 1.4, 0.4, 1) both;
    }

    &--error &__icon {
      background: var(--ui-sticker-danger);
    }

    &__loader {
      width: 34px;
      height: 34px;
      border: 3px solid rgba(255, 255, 255, 0.36);
      border-top-color: white;
      border-radius: 999px;
      animation: spin 0.8s linear infinite;
    }

    &__button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      padding: 0 28px;
      border-radius: 999px;
      color: white;
      background: var(--ui-primary-main);
      font-weight: 800;
      text-decoration: none;
      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 32px color-mix(in srgb, var(--ui-primary-main) 30%, transparent);
      }
    }

    &__orb {
      position: absolute;
      width: 180px;
      height: 180px;
      border-radius: 999px;
      filter: blur(8px);
      opacity: 0.16;
    }

    &__orb--one {
      top: -80px;
      right: -70px;
      background: var(--ui-primary-main);
    }

    &__orb--two {
      bottom: -110px;
      left: -80px;
      background: var(--ui-primary-accent);
    }
  }

  @keyframes cardIn {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes iconPop {
    0% {
      transform: scale(0.72);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
