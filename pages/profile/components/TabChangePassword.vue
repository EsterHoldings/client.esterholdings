<template>
  <div class="flex flex-col gap-6 text-[var(--ui-text-main)]">
    <!-- TOP ROW: Change password + Forgot password card -->
    <div class="grid gap-6 lg:grid-cols-[1fr,360px]">
      <!-- LEFT: Change Password -->
      <div>
        <div class="space-y-5">
          <!-- Old password -->
          <UiFormControl
            :label="t('cabinet.profile.components.tab-change-password.labels.old_password')"
            :errors="validatorChangePasswordDataForm.errorsFormData.oldPassword.errors">
            <UiInput
              type="password"
              :placeholder="t('cabinet.profile.components.tab-change-password.placeholders.old_password')"
              :value="formData.oldPassword"
              :isDirty="validatorChangePasswordDataForm.errorsFormData.oldPassword.isDirty"
              :isInvalid="validatorChangePasswordDataForm.errorsFormData.oldPassword.errors.length > 0"
              @input="validatorChangePasswordDataForm.doValidateField('oldPassword', $event.target.value)"
              @blur="validatorChangePasswordDataForm.doValidateField('oldPassword', $event.target.value)" />
          </UiFormControl>

          <!-- New password + rules hint -->
          <UiFormControl
            :label="t('cabinet.profile.components.tab-change-password.labels.new_password')"
            :errors="validatorChangePasswordDataForm.errorsFormData.newPassword.errors">
            <UiInput
              type="password"
              :placeholder="t('cabinet.profile.components.tab-change-password.placeholders.new_password')"
              :value="formData.newPassword"
              :isDirty="validatorChangePasswordDataForm.errorsFormData.newPassword.isDirty"
              :isInvalid="validatorChangePasswordDataForm.errorsFormData.newPassword.errors.length > 0"
              @input="validatorChangePasswordDataForm.doValidateField('newPassword', $event.target.value)"
              @blur="validatorChangePasswordDataForm.doValidateField('newPassword', $event.target.value)" />
          </UiFormControl>

          <UiFormControl
            :label="t('cabinet.profile.components.tab-change-password.labels.new_password_confirmation')"
            :errors="validatorChangePasswordDataForm.errorsFormData.newPasswordConfirmation.errors">
            <UiInput
              type="password"
              :placeholder="t('cabinet.profile.components.tab-change-password.placeholders.new_password_confirmation')"
              :value="formData.newPasswordConfirmation"
              :isDirty="validatorChangePasswordDataForm.errorsFormData.newPasswordConfirmation.isDirty"
              :isInvalid="validatorChangePasswordDataForm.errorsFormData.newPasswordConfirmation.errors.length > 0"
              @input="validatorChangePasswordDataForm.doValidateField('newPasswordConfirmation', $event.target.value)"
              @blur="validatorChangePasswordDataForm.doValidateField('newPasswordConfirmation', $event.target.value)" />
          </UiFormControl>

          <div>
            <UiButtonDefault
              class="min-w-[180px]"
              state="info--outline"
              @click="validateChangePasswordDataForm(handleSubmit)">
              <UiIconSpinnerDefault v-if="isLoading" />
              <span v-else>{{ t("cabinet.profile.components.tab-change-password.button") }}</span>
            </UiButtonDefault>
          </div>
        </div>
      </div>

      <div>
        <PanelDefault class="p-5 rounded-2xl border border-[var(--color-stroke-ui-dark)] bg-[var(--ui-background)]">
          <div class="space-y-3">
            <div class="text-sm font-semibold underline">
              {{ t("cabinet.profile.components.tab-change-password.forgot.title") }}
            </div>
            <div class="text-xs opacity-80">
              {{ t("cabinet.profile.components.tab-change-password.forgot.description") }}
            </div>
            <UiButtonDefault
              state="primary"
              class="mt-1"
              :disabled="isResetLoading"
              @click="handleClickSendResetPasswordEmail">
              <span class="flex items-center gap-2">
                <span>{{ t("cabinet.profile.components.tab-change-password.forgot.button") }}</span>
                <UiIconSpinnerDefault
                  v-if="isResetLoading"
                  class="h-4 w-4" />
              </span>
            </UiButtonDefault>
          </div>
        </PanelDefault>
      </div>
    </div>

    <div>
      <div class="mb-4 flex items-center justify-between">
        <div>
          <div class="text-base font-semibold">
            {{ t("cabinet.profile.components.tab-change-password.two_fa.title") }}
          </div>
          <div class="text-xs opacity-70">
            {{ t("cabinet.profile.components.tab-change-password.two_fa.subtitle") }}
          </div>
        </div>
        <UiSwitchToggle
          :model-value="twoFaSwitchOn"
          @update:modelValue="handleToggleTwoFa" />
      </div>

      <div
        v-if="twoFaSwitchOn"
        class="relative rounded-xl border border-[var(--color-stroke-ui-dark)] p-4 md:p-5">
        <div
          v-if="qrIsLoading && !twoFaEnabled"
          class="flex h-48 items-center justify-center">
          <UiIconSpinnerDefault />
        </div>

        <div
          v-else-if="!qrIsLoading && twoFaEnabled"
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div
            class="flex items-center gap-2 rounded-lg border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background)] px-3 py-2">
            <UiIconSuccess />
            <UiTextSmall class="!text-[var(--ui-text-main)]">{{ twoFaEnabledLabel }}</UiTextSmall>
          </div>
          <div class="flex items-center justify-center">
            <UiButtonDefault
              state="danger--outline"
              @click="handleClickTwoFaDisable">
              <span v-if="!loadingDisable">
                {{ t("cabinet.profile.components.tab-change-password.two_fa.disable") }}
              </span>
              <UiIconSpinnerDefault v-else />
            </UiButtonDefault>
          </div>
        </div>

        <div
          v-else
          class="grid gap-5 md:grid-cols-2">
          <div class="flex items-center justify-center">
            <div
              class="w-full max-w-[260px]"
              v-html="qrSvg"></div>
          </div>

          <div class="flex flex-col justify-center">
            <div
              v-if="twoFaSecret"
              class="mb-4 rounded-xl border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] p-3">
              <div class="mb-1 text-xs font-semibold text-[var(--ui-text-secondary)]">
                {{ t("cabinet.profile.components.tab-change-password.two_fa.manual_secret_label") }}
              </div>
              <button
                type="button"
                class="two-fa-secret"
                @click="handleCopyTwoFaSecret">
                <span>{{ twoFaSecret }}</span>
                <span class="two-fa-secret__copy">
                  {{ t("cabinet.profile.components.tab-change-password.two_fa.copy_secret") }}
                </span>
              </button>
              <div class="mt-2 text-xs leading-5 text-[var(--ui-text-secondary)]">
                {{ t("cabinet.profile.components.tab-change-password.two_fa.manual_secret_hint") }}
              </div>
            </div>

            <UiFormControl :label="t('cabinet.profile.components.tab-change-password.two_fa.code_label')">
              <UiOtpInput
                ref="twoFaOtpRef"
                :value="otp"
                :autofocus="twoFaSwitchOn && !twoFaEnabled && !qrIsLoading"
                @input="handleInputOtp" />
            </UiFormControl>

            <UiButtonDefault
              class="mt-4 w-[140px]"
              state="info--outline"
              @click="onEnable">
              <span v-if="!loading">
                {{ t("cabinet.profile.components.tab-change-password.two_fa.confirm") }}
              </span>
              <UiIconSpinnerDefault v-else />
            </UiButtonDefault>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, nextTick, onMounted, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import { extractApiErrorMessageWithTranslator, localizeApiErrorsWithTranslator } from "~/composables/useApiMessages";

  import { formData } from "~/pages/profile/composables/TheChangePassword";
  import { resetValidationUserDataForm } from "~/pages/profile/composables/validation";
  import {
    resetFormData,
    resetValidationChangePasswordDataForm,
    validateChangePasswordDataForm,
    validatorChangePasswordDataForm,
  } from "~/pages/profile/composables/TheChangePassword/validation";

  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiOtpInput from "~/components/ui/UiOtpInput.vue";
  import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";

  import useAppCore from "~/composables/useAppCore";
  import UiSwitchToggle from "~/components/ui/UiSwitchToggle.vue";

  const { t } = useI18n({ useScope: "global" });
  const toast = useToast();
  const appCore = useAppCore();

  const isLoading = ref(false);
  const isResetLoading = ref(false);

  const otp = ref("");
  const error = ref("");
  const success = ref(false);
  const loading = ref(false);

  const twoFaEnabled = ref(false);
  const twoFaUiEnabled = ref(false);
  const loadingDisable = ref(false);
  const errorDisable = ref<string | null>(null);
  const qrIsLoading = ref(false);
  const qrSvg = ref("");
  const twoFaSecret = ref("");
  const twoFaOtpRef = ref<InstanceType<typeof UiOtpInput> | null>(null);
  const resolveText = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };
  const twoFaEnabledLabel = computed(() => {
    const raw = String(qrSvg.value ?? "");
    const plain = raw.replace(/<[^>]*>/g, "").trim();
    return plain.length > 0 ? plain : t("cabinet.profile.components.tab-change-password.two_fa.enabled");
  });

  const handleInputOtp = (value: string) => {
    otp.value = value;
  };

  const handleCopyTwoFaSecret = async () => {
    if (!twoFaSecret.value || typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(twoFaSecret.value);
    toast.success(t("cabinet.profile.components.tab-change-password.two_fa.copy_secret_success"));
  };

  const handleSubmit = async () => {
    try {
      isLoading.value = true;
      await appCore.password.updatePassword(formData);
      resetValidationUserDataForm();
      toast.success(t("cabinet.profile.components.tab-change-password.success"));
    } catch (e: any) {
      console.error(e);
      if (e.status === 422) {
        const localizedErrors = localizeApiErrorsWithTranslator(e?.response?.data?.errors ?? {}, resolveText);
        const oldPasswordErrors = localizedErrors.oldPassword ?? localizedErrors.old_password;
        const newPasswordErrors = localizedErrors.newPassword ?? localizedErrors.new_password;
        const newPasswordConfirmationErrors =
          localizedErrors.newPasswordConfirmation ?? localizedErrors.new_password_confirmation;

        if (newPasswordErrors?.length) {
          validatorChangePasswordDataForm.errorsFormData.newPassword.errors = newPasswordErrors;
        }
        if (newPasswordConfirmationErrors?.length) {
          validatorChangePasswordDataForm.errorsFormData.newPasswordConfirmation.errors = newPasswordConfirmationErrors;
        }
        if (oldPasswordErrors?.length) {
          validatorChangePasswordDataForm.errorsFormData.oldPassword.errors = oldPasswordErrors;
        }
      }
    } finally {
      isLoading.value = false;
      resetFormData();
      resetValidationChangePasswordDataForm();
    }
  };

  const onEnable = async () => {
    error.value = "";
    success.value = false;
    loading.value = true;
    try {
      await appCore.auth2fa.doEnable2fa({ otp: otp.value });
      success.value = true;
      toast.success(t("cabinet.profile.components.tab-change-password.two_fa.enable_success"));
    } catch (e: any) {
      error.value =
        extractApiErrorMessageWithTranslator(
          e,
          resolveText,
          t("cabinet.profile.components.tab-change-password.two_fa.enable_error")
        ) || t("cabinet.profile.components.tab-change-password.two_fa.enable_error");
      toast.error(error.value);
    } finally {
      loading.value = false;
      await loadTwoFaQr();
    }
  };

  const handleClickTwoFaDisable = async () => {
    errorDisable.value = null;
    loadingDisable.value = true;
    error.value = "";
    success.value = false;
    loading.value = true;
    try {
      await appCore.auth2fa.doDisable2fa({});
      toast.success(t("cabinet.profile.components.tab-change-password.two_fa.disable_success"));
      qrSvg.value = "";
      twoFaSecret.value = "";
      otp.value = "";
      success.value = false;
    } catch (e: any) {
      errorDisable.value =
        extractApiErrorMessageWithTranslator(
          e,
          resolveText,
          t("cabinet.profile.components.tab-change-password.two_fa.disable_error")
        ) || t("cabinet.profile.components.tab-change-password.two_fa.disable_error");
      toast.error(errorDisable.value);
    } finally {
      await loadTwoFaQr();
      loadingDisable.value = false;
      twoFaEnabled.value = false;
      twoFaUiEnabled.value = false;
      loading.value = false;
    }
  };

  const handleClickSendResetPasswordEmail = async () => {
    if (isResetLoading.value) {
      toast.error(t("cabinet.profile.components.tab-change-password.reset.pending"));
      return;
    }
    isResetLoading.value = true;
    try {
      await appCore.password.resetPassword();
      toast.success(t("cabinet.profile.components.tab-change-password.reset.success"));
    } catch (e: any) {
      toast.error(
        extractApiErrorMessageWithTranslator(
          e,
          resolveText,
          t("cabinet.profile.components.tab-change-password.reset.error")
        ) || t("cabinet.profile.components.tab-change-password.reset.error")
      );
    } finally {
      isResetLoading.value = false;
    }
  };

  const loadTwoFaQr = async () => {
    qrIsLoading.value = true;
    const response = await appCore.auth2fa.doGenerate2fa({});
    if (response.data?.message?.length > 0) {
      twoFaEnabled.value = true;
      qrSvg.value = response.data?.message;
      twoFaSecret.value = "";
    } else {
      qrSvg.value = response.data.qr;
      twoFaSecret.value = String(response.data?.secret ?? "");
      twoFaEnabled.value = false;
    }
    qrIsLoading.value = false;
  };

  const handleToggleTwoFa = async (value: boolean) => {
    if (!value) {
      if (twoFaEnabled.value) {
        await handleClickTwoFaDisable();
        return;
      }
      twoFaUiEnabled.value = false;
      return;
    }

    twoFaUiEnabled.value = true;
    if (!qrSvg.value && !qrIsLoading.value) {
      await loadTwoFaQr();
    }
  };

  const twoFaSwitchOn = computed(() => twoFaEnabled.value || twoFaUiEnabled.value);

  onMounted(async () => {
    await loadTwoFaQr();
    twoFaUiEnabled.value = twoFaEnabled.value;
  });

  watch(
    () => [twoFaSwitchOn.value, twoFaEnabled.value, qrIsLoading.value],
    async ([switchOn, enabled, loadingQr]) => {
      if (!switchOn || enabled || loadingQr) {
        return;
      }

      await nextTick();
      twoFaOtpRef.value?.focus?.();
    },
    { immediate: false }
  );

  /* === Password rules highlighting (лише UI, логіку не змінює) === */
  const pwd = computed(() => (formData.newPassword ?? "") as string);
  const reqs = computed(() => ({
    min12: pwd.value.length >= 12,
    upper: /[A-Z]/.test(pwd.value),
    lower: /[a-z]/.test(pwd.value),
    num: /[0-9]/.test(pwd.value),
  }));
  const allReqsOk = computed(() => reqs.value.min12 && reqs.value.upper && reqs.value.lower && reqs.value.num);
  const reqClass = (ok: boolean) => (ok ? "text-[var(--color-success)]" : "text-[var(--color-danger)]");
</script>

<style scoped>
  .two-fa-secret {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-control-bg);
    padding: 9px 10px;
    color: var(--ui-text-main);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-size: 13px;
    line-height: 1.35;
    text-align: left;
    word-break: break-all;
  }

  .two-fa-secret:hover {
    border-color: var(--ui-primary-main);
  }

  .two-fa-secret__copy {
    flex-shrink: 0;
    color: var(--ui-primary-main);
    font-family: inherit;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
  }
</style>
