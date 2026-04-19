<template>
  <section class="reset-page">
    <div
      class="reset-card"
      :class="{ 'reset-card--success': isSuccess }">
      <div class="reset-card__visual">
        <span class="reset-card__pulse"></span>
        <svg
          v-if="isSuccess"
          viewBox="0 0 24 24"
          aria-hidden="true">
          <path d="M9.2 16.8 4.9 12.5l1.4-1.4 2.9 2.9 8.5-8.5 1.4 1.4-9.9 9.9Z" />
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          aria-hidden="true">
          <path
            d="M17 8h-1V6.8A3.8 3.8 0 0 0 12.2 3h-.4A3.8 3.8 0 0 0 8 6.8V8H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-1.2A1.8 1.8 0 0 1 11.8 5h.4A1.8 1.8 0 0 1 14 6.8V8h-4V6.8Zm3 8.94V17h-2v-1.26a2 2 0 1 1 2 0Z" />
        </svg>
      </div>

      <template v-if="isSuccess">
        <p class="reset-card__eyebrow">{{ t("authFlow.reset.successEyebrow") }}</p>
        <h1>{{ t("authFlow.reset.successTitle") }}</h1>
        <p class="reset-card__message">{{ t("authFlow.reset.successMessage") }}</p>
        <NuxtLink
          class="reset-card__button"
          :to="localePath('/')">
          {{ t("authFlow.actions.goDashboard") }}
        </NuxtLink>
      </template>

      <template v-else>
        <p class="reset-card__eyebrow">{{ t("authFlow.reset.eyebrow") }}</p>
        <h1>{{ t("authFlow.reset.title") }}</h1>
        <p class="reset-card__message">{{ t("authFlow.reset.subtitle") }}</p>

        <form
          class="reset-card__form"
          @submit.prevent="submit">
          <UiFormControl
            :label="t('authFlow.fields.email')"
            :errors="fieldErrors.email">
            <UiInput
              type="text"
              placeholder="client@example.com"
              :value="form.email"
              :isDirty="fieldErrors.email.length > 0"
              :isInvalid="fieldErrors.email.length > 0"
              @input="setField('email', $event)" />
          </UiFormControl>

          <UiFormControl
            :label="t('authFlow.fields.newPassword')"
            :errors="fieldErrors.password">
            <UiInput
              type="password"
              placeholder="********"
              :value="form.password"
              :isDirty="fieldErrors.password.length > 0"
              :isInvalid="fieldErrors.password.length > 0"
              @input="setField('password', $event)" />
          </UiFormControl>

          <UiFormControl
            :label="t('authFlow.fields.confirmPassword')"
            :errors="fieldErrors.password_confirmation">
            <UiInput
              type="password"
              placeholder="********"
              :value="form.password_confirmation"
              :isDirty="fieldErrors.password_confirmation.length > 0"
              :isInvalid="fieldErrors.password_confirmation.length > 0"
              @input="setField('password_confirmation', $event)" />
          </UiFormControl>

          <p
            v-if="formError"
            class="reset-card__error">
            {{ formError }}
          </p>

          <UiButtonDefault
            class="reset-card__submit"
            state="primary"
            type="submit"
            :isLoading="isLoading">
            {{ t("authFlow.reset.submit") }}
          </UiButtonDefault>
        </form>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { reactive, ref } from "vue";
  import { useI18n, useLocalePath } from "#imports";
  import { useRoute } from "nuxt/app";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import { useAppCore } from "~/composables/useAppCore";

  definePageMeta({
    layout: "guest",
  });

  type ResetField = "email" | "password" | "password_confirmation";

  const route = useRoute();
  const { t } = useI18n();
  const localePath = useLocalePath();
  const appCore = useAppCore();

  const readQuery = (key: string): string => {
    const raw = route.query[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    return String(value ?? "").trim();
  };

  const form = reactive({
    token: readQuery("token"),
    email: readQuery("email"),
    password: "",
    password_confirmation: "",
  });

  const fieldErrors = reactive<Record<ResetField, string[]>>({
    email: [],
    password: [],
    password_confirmation: [],
  });
  const isLoading = ref(false);
  const isSuccess = ref(false);
  const formError = ref("");

  const setField = (field: ResetField, value: string) => {
    form[field] = value;
    fieldErrors[field] = [];
    formError.value = "";
  };

  const validate = (): boolean => {
    fieldErrors.email = [];
    fieldErrors.password = [];
    fieldErrors.password_confirmation = [];
    formError.value = "";

    if (!form.token) {
      formError.value = t("authFlow.reset.invalidLink");
      return false;
    }

    if (!form.email) {
      fieldErrors.email = [t("authFlow.validation.emailRequired")];
    }

    if (form.password.length < 8) {
      fieldErrors.password = [t("authFlow.validation.passwordMin")];
    }

    if (form.password_confirmation !== form.password) {
      fieldErrors.password_confirmation = [t("authFlow.validation.passwordMismatch")];
    }

    return !fieldErrors.email.length && !fieldErrors.password.length && !fieldErrors.password_confirmation.length;
  };

  const applyApiErrors = (errors: Record<string, unknown>) => {
    for (const [key, value] of Object.entries(errors || {})) {
      if (key in fieldErrors) {
        fieldErrors[key as ResetField] = Array.isArray(value) ? value.map(String) : [String(value)];
      }
    }
  };

  const submit = async () => {
    if (!validate()) return;

    try {
      isLoading.value = true;
      await appCore.auth.resetPassword({
        token: form.token,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      isSuccess.value = true;
    } catch (e: any) {
      applyApiErrors(e?.response?.data?.errors ?? {});
      formError.value = e?.response?.data?.message ? t("authFlow.reset.error") : t("authFlow.reset.error");
    } finally {
      isLoading.value = false;
    }
  };
</script>

<style scoped lang="scss">
  .reset-page {
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: 24px;
    color: var(--ui-text-main);
    background:
      radial-gradient(circle at 16% 20%, color-mix(in srgb, var(--ui-primary-main) 18%, transparent), transparent 34%),
      radial-gradient(
        circle at 84% 76%,
        color-mix(in srgb, var(--ui-primary-accent) 13%, transparent),
        transparent 32%
      ),
      var(--ui-background);
  }

  .reset-card {
    width: min(620px, 100%);
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 30px;
    padding: 38px;
    background: color-mix(in srgb, var(--ui-background-panel) 86%, transparent);
    box-shadow: 0 26px 70px rgba(0, 0, 0, 0.18);
    backdrop-filter: blur(18px);
    animation: resetCardIn 0.45s ease both;

    h1 {
      margin: 0 0 12px;
      font-size: clamp(30px, 5vw, 44px);
      line-height: 1.05;
      text-align: center;
    }

    &__visual {
      position: relative;
      display: grid;
      width: 84px;
      height: 84px;
      margin: 0 auto 22px;
      place-items: center;
      border-radius: 26px;
      color: white;
      background: var(--ui-primary-main);
      box-shadow: 0 18px 34px color-mix(in srgb, var(--ui-primary-main) 30%, transparent);

      svg {
        position: relative;
        width: 45px;
        height: 45px;
        fill: currentColor;
      }
    }

    &--success &__visual {
      background: var(--ui-sticker-success);
      animation: successPop 0.55s cubic-bezier(0.2, 1.4, 0.4, 1) both;
    }

    &__pulse {
      position: absolute;
      inset: -10px;
      border-radius: 32px;
      border: 1px solid color-mix(in srgb, var(--ui-primary-main) 40%, transparent);
      animation: pulse 1.9s ease-in-out infinite;
    }

    &__eyebrow {
      margin: 0 0 10px;
      color: var(--ui-primary-accent);
      font-weight: 800;
      letter-spacing: 0.08em;
      text-align: center;
      text-transform: uppercase;
    }

    &__message {
      max-width: 460px;
      margin: 0 auto 28px;
      color: var(--ui-text-secondary);
      line-height: 1.55;
      text-align: center;
    }

    &__form {
      display: grid;
      gap: 18px;
    }

    &__submit,
    &__button {
      width: 100%;
      margin-top: 8px;
    }

    &__button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      border-radius: 999px;
      color: white;
      background: var(--ui-primary-main);
      font-weight: 800;
      text-decoration: none;
    }

    &__error {
      margin: 0;
      padding: 12px 14px;
      border: 1px solid color-mix(in srgb, var(--ui-sticker-danger) 34%, transparent);
      border-radius: 14px;
      color: var(--ui-sticker-danger);
      background: color-mix(in srgb, var(--ui-sticker-danger) 10%, transparent);
    }
  }

  @media (max-width: 640px) {
    .reset-card {
      padding: 28px 20px;
      border-radius: 24px;
    }
  }

  @keyframes resetCardIn {
    from {
      opacity: 0;
      transform: translateY(12px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes successPop {
    from {
      transform: scale(0.78);
    }
    to {
      transform: scale(1);
    }
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.55;
      transform: scale(0.96);
    }
    50% {
      opacity: 0.12;
      transform: scale(1.08);
    }
  }
</style>
