<template>
  <div class="profile__tab--general space-y-6">
    <div class="profile__tab--general__profile-data__photo">
      <div class="profile__tab--general__profile-data__photo-uploader">
        <UserPhotoUploader />
      </div>
    </div>

    <div class="grid gap-3 lg:grid-cols-2">
      <button
        type="button"
        class="flex min-w-0 items-start justify-between gap-4 rounded-2xl border p-4 text-left transition"
        :class="
          currentStep === 'profile'
            ? 'border-[var(--ui-primary-main)] bg-[color-mix(in_srgb,var(--ui-primary-main)_10%,var(--ui-background-panel))]'
            : 'border-[var(--color-stroke-ui-dark)] bg-[var(--ui-background-panel)] hover:border-[var(--ui-primary-main)]/50'
        "
        @click="goToProfileStep">
        <div class="flex min-w-0 items-start gap-3">
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            :class="
              currentStep === 'profile'
                ? 'bg-[var(--ui-primary-main)] text-white'
                : 'bg-[color-mix(in_srgb,var(--ui-primary-main)_14%,transparent)] text-[var(--ui-primary-main)]'
            ">
            1
          </div>
          <div class="min-w-0">
            <div class="font-semibold text-[var(--ui-text-main)]">
              {{ t("cabinet.profile.index.tabs.general") }}
            </div>
            <div class="mt-1 text-sm text-[var(--ui-text-secondary)]">
              {{ profileStepDescription }}
            </div>
          </div>
        </div>
        <div class="shrink-0 text-xs font-medium" :class="stepStateClass(profileInfoVerificationState)">
          {{ profileStepStatusLabel }}
        </div>
      </button>

      <button
        type="button"
        class="flex min-w-0 items-start justify-between gap-4 rounded-2xl border p-4 text-left transition"
        :class="
          currentStep === 'documents'
            ? 'border-[var(--ui-primary-main)] bg-[color-mix(in_srgb,var(--ui-primary-main)_10%,var(--ui-background-panel))]'
            : 'border-[var(--color-stroke-ui-dark)] bg-[var(--ui-background-panel)] hover:border-[var(--ui-primary-main)]/50'
        "
        @click="goToDocumentsStep">
        <div class="flex min-w-0 items-start gap-3">
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            :class="
              currentStep === 'documents'
                ? 'bg-[var(--ui-primary-main)] text-white'
                : 'bg-[color-mix(in_srgb,var(--ui-primary-main)_14%,transparent)] text-[var(--ui-primary-main)]'
            ">
            2
          </div>
          <div class="min-w-0">
            <div class="font-semibold text-[var(--ui-text-main)]">
              {{ t("cabinet.profile.index.tabs.documents") }}
            </div>
            <div class="mt-1 text-sm text-[var(--ui-text-secondary)]">
              {{ documentsStepDescription }}
            </div>
          </div>
        </div>
        <div class="shrink-0 text-xs font-medium" :class="stepStateClass(documentsStepState)">
          {{ documentsStepStatusLabel }}
        </div>
      </button>
    </div>

    <Transition
      enter-active-class="transition ease-linear duration-150"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-linear duration-100"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
      mode="out-in">
      <div
        v-if="currentStep === 'profile'"
        key="profile-step"
        class="space-y-6">
        <div class="profile__tab--general_wrapper">
          <div class="profile__tab--general__profile-data">
            <div class="profile__tab--general__profile-data__form">
              <UiFormControl
                class="profile__tab--general__profile-data__form__field"
                required
                :label="t('cabinet.profile.components.tab-general.labels.email')"
                :errors="validatorUserDataForm.errorsFormData.email.errors">
                <div class="profile-email-field">
                  <UiInput
                    :isLoading="isLoadingAllComponentData"
                    type="text"
                    :placeholder="t('cabinet.profile.components.tab-general.placeholders.email')"
                    :value="formData.email"
                    :disabled="true"
                    :isDirty="validatorUserDataForm.errorsFormData.email.isDirty"
                    :isInvalid="validatorUserDataForm.errorsFormData.email.errors.length > 0"
                    @blur="validatorUserDataForm.doValidateField('email', formData.email)" />

                  <div class="profile-email-field__status">
                    <UiInfoHint
                      :label="emailVerificationTitle"
                      :content="emailVerificationTooltip">
                      <template #trigger="{ isOpen, toggle, open, close }">
                        <button
                          type="button"
                          class="profile-email-field__status-trigger"
                          :class="isEmailVerified ? 'is-approved' : 'is-pending'"
                          :aria-label="emailVerificationTitle"
                          :aria-expanded="isOpen"
                          @click.stop="toggle"
                          @focus="open"
                          @blur="close">
                          <UiIconSuccessFull
                            v-if="isEmailVerified"
                            class="h-[16px] w-[16px]" />
                          <UiIconWarningFull
                            v-else
                            class="h-[16px] w-[16px]" />
                        </button>
                      </template>
                    </UiInfoHint>
                  </div>
                </div>

                <div class="profile-email-field__meta">
                  <span
                    class="profile-email-field__meta-status"
                    :class="isEmailVerified ? 'is-approved' : 'is-pending'">
                    {{ emailVerificationStatusText }}
                  </span>

                  <button
                    v-if="canResendEmail"
                    type="button"
                    class="profile-email-field__meta-action"
                    :disabled="isResendingEmail"
                    @click="handleResendEmailVerification">
                    {{
                      isResendingEmail
                        ? t("cabinet.profile.components.tab-user-verification.resendingEmail")
                        : t("cabinet.profile.components.tab-user-verification.resendEmail")
                    }}
                  </button>
                </div>
              </UiFormControl>

              <UiFormControl
                class="profile__tab--general__profile-data__form__field"
                required
                :label="t('cabinet.profile.components.tab-general.labels.first_name')"
                :errors="validatorUserDataForm.errorsFormData.first_name.errors">
                <UiInput
                  :isLoading="isLoadingAllComponentData"
                  type="text"
                  :placeholder="t('cabinet.profile.components.tab-general.placeholders.first_name')"
                  :value="formData.first_name"
                  :disabled="isProfileFormReadonly"
                  :isDirty="validatorUserDataForm.errorsFormData.first_name.isDirty"
                  :isInvalid="validatorUserDataForm.errorsFormData.first_name.errors.length > 0"
                  @input="validatorUserDataForm.doValidateField('first_name', $event)"
                  @blur="validatorUserDataForm.doValidateField('first_name', $event.target.value)" />
              </UiFormControl>

              <UiFormControl
                class="profile__tab--general__profile-data__form__field"
                required
                :label="t('cabinet.profile.components.tab-general.labels.last_name')"
                :errors="validatorUserDataForm.errorsFormData.last_name.errors">
                <UiInput
                  :isLoading="isLoadingAllComponentData"
                  type="text"
                  :placeholder="t('cabinet.profile.components.tab-general.placeholders.last_name')"
                  :value="formData.last_name"
                  :disabled="isProfileFormReadonly"
                  :isDirty="validatorUserDataForm.errorsFormData.last_name.isDirty"
                  :isInvalid="validatorUserDataForm.errorsFormData.last_name.errors.length > 0"
                  @input="validatorUserDataForm.doValidateField('last_name', $event)"
                  @blur="validatorUserDataForm.doValidateField('last_name', $event.target.value)" />
              </UiFormControl>

              <UiFormControl
                class="profile__tab--general__profile-data__form__field"
                required
                :label="t('cabinet.profile.components.tab-general.labels.mid_name')"
                :errors="validatorUserDataForm.errorsFormData.mid_name.errors">
                <UiInput
                  :isLoading="isLoadingAllComponentData"
                  type="text"
                  :placeholder="t('cabinet.profile.components.tab-general.placeholders.mid_name')"
                  :value="formData.mid_name"
                  :disabled="isProfileFormReadonly"
                  :isDirty="validatorUserDataForm.errorsFormData.mid_name.isDirty"
                  :isInvalid="validatorUserDataForm.errorsFormData.mid_name.errors.length > 0"
                  @input="validatorUserDataForm.doValidateField('mid_name', $event)"
                  @blur="validatorUserDataForm.doValidateField('mid_name', $event.target.value)" />
              </UiFormControl>

              <UiFormControl
                class="profile__tab--general__profile-data__form__field"
                required
                :label="t('cabinet.profile.components.tab-general.labels.birthdate')"
                :errors="validatorUserDataForm.errorsFormData.birthdate.errors">
                <UiInputDate
                  :isLoading="isLoadingAllComponentData"
                  :placeholder="t('cabinet.profile.components.tab-general.placeholders.birthdate')"
                  :value="formData.birthdate"
                  :disabled="isProfileFormReadonly"
                  :isDirty="validatorUserDataForm.errorsFormData.birthdate.isDirty"
                  :isInvalid="validatorUserDataForm.errorsFormData.birthdate.errors.length > 0"
                  @input="handleInputBirthday"
                  @blur="handleInputBirthday" />
              </UiFormControl>

              <UiFormControl
                class="profile__tab--general__profile-data__form__field"
                required
                :label="t('cabinet.profile.components.tab-general.labels.phone')"
                :errors="validatorUserDataForm.errorsFormData.phone.errors">
                <UiInputPhone
                  type="number"
                  :isLoading="isLoadingAllComponentData"
                  :placeholder="t('cabinet.profile.components.tab-general.placeholders.phone')"
                  v-model="formData.phone"
                  :disabled="isProfileFormReadonly"
                  :isDirty="validatorUserDataForm.errorsFormData.phone.isDirty"
                  :isInvalid="validatorUserDataForm.errorsFormData.phone.errors.length > 0"
                  @input="validatorUserDataForm.doValidateField('phone', $event)"
                  @blur="validatorUserDataForm.doValidateField('phone', formData.phone)" />
              </UiFormControl>
            </div>
          </div>

          <div class="profile__tab--general__profile-data--additional">
            <div class="profile__tab--general__profile-data--additional__form">
              <UiFormControl
                class="profile__tab--general__profile-data--additional__form__field"
                required
                :label="t('cabinet.profile.components.tab-general.labels.country')"
                :errors="validatorUserDataForm.errorsFormData.country.errors">
                <UiSelect
                  :data="countryOptions"
                  :value="selectedCountryId"
                  :disabled="isProfileFormReadonly"
                  :isLoading="isLoadingAllComponentData || countriesMeta.loading"
                  :isDirty="validatorUserDataForm.errorsFormData.country.isDirty"
                  :isInvalid="validatorUserDataForm.errorsFormData.country.errors.length > 0"
                  searchable
                  :searchValue="countrySearch"
                  :searchPlaceholder="t('cabinet.profile.components.tab-general.placeholders.country')"
                  @change="handleCountryChange"
                  @blur="handleCountryBlur"
                  @search="handleCountrySearch"
                  @loadMore="loadMoreCountries" />
              </UiFormControl>

              <UiFormControl
                class="profile__tab--general__profile-data--additional__form__field"
                required
                :label="t('cabinet.profile.components.tab-general.labels.state')"
                :errors="validatorUserDataForm.errorsFormData.state.errors">
                <UiSelect
                  :data="stateOptions"
                  :value="selectedStateId"
                  :disabled="isProfileFormReadonly || !selectedCountryId"
                  :isLoading="isLoadingAllComponentData || statesMeta.loading"
                  :isDirty="validatorUserDataForm.errorsFormData.state.isDirty"
                  :isInvalid="validatorUserDataForm.errorsFormData.state.errors.length > 0"
                  searchable
                  :searchValue="stateSearch"
                  :searchPlaceholder="t('cabinet.profile.components.tab-general.placeholders.state')"
                  @change="handleStateChange"
                  @blur="handleStateBlur"
                  @search="handleStateSearch"
                  @loadMore="loadMoreStates" />
              </UiFormControl>

              <UiFormControl
                class="profile__tab--general__profile-data--additional__form__field"
                required
                :label="t('cabinet.profile.components.tab-general.labels.city')"
                :errors="validatorUserDataForm.errorsFormData.city.errors">
                <UiSelect
                  :data="cityOptions"
                  :value="selectedCityId"
                  :disabled="isProfileFormReadonly || !selectedStateId"
                  :isLoading="isLoadingAllComponentData || citiesMeta.loading"
                  :isDirty="validatorUserDataForm.errorsFormData.city.isDirty"
                  :isInvalid="validatorUserDataForm.errorsFormData.city.errors.length > 0"
                  searchable
                  :searchValue="citySearch"
                  :searchPlaceholder="t('cabinet.profile.components.tab-general.placeholders.city')"
                  @change="handleCityChange"
                  @blur="handleCityBlur"
                  @search="handleCitySearch"
                  @loadMore="loadMoreCities" />
              </UiFormControl>

              <UiFormControl
                class="profile__tab--general__profile-data--additional__form__field"
                required
                :label="t('cabinet.profile.components.tab-general.labels.address')"
                :errors="validatorUserDataForm.errorsFormData.address.errors">
                <UiInput
                  :isLoading="isLoadingAllComponentData"
                  type="text"
                  :placeholder="t('cabinet.profile.components.tab-general.placeholders.address')"
                  :value="formData.address"
                  :disabled="isProfileFormReadonly"
                  :isDirty="validatorUserDataForm.errorsFormData.address.isDirty"
                  :isInvalid="validatorUserDataForm.errorsFormData.address.errors.length > 0"
                  @input="validatorUserDataForm.doValidateField('address', $event)"
                  @blur="validatorUserDataForm.doValidateField('address', $event.target.value)" />
              </UiFormControl>

              <UiFormControl
                class="profile__tab--general__profile-data--additional__form__field"
                required
                :label="t('cabinet.profile.components.tab-general.labels.postal_code')"
                :errors="validatorUserDataForm.errorsFormData.postal_code.errors">
                <UiInput
                  :isLoading="isLoadingAllComponentData"
                  type="text"
                  :placeholder="t('cabinet.profile.components.tab-general.placeholders.postal_code')"
                  :value="formData.postal_code"
                  :disabled="isProfileFormReadonly"
                  :isDirty="validatorUserDataForm.errorsFormData.postal_code.isDirty"
                  :isInvalid="validatorUserDataForm.errorsFormData.postal_code.errors.length > 0"
                  @input="validatorUserDataForm.doValidateField('postal_code', $event)"
                  @blur="validatorUserDataForm.doValidateField('postal_code', $event.target.value)" />
              </UiFormControl>

              <div class="profile__tab--general__profile-data--additional__form__field__save_btn">
                <UiButtonDefault
                  state="info--outline"
                  :isLoading="isLoading"
                  @click="handleProfileFormAction">
                  <UiIconSpinnerDefault v-if="isLoading" />
                  <span v-if="!isLoading">{{ profileActionButtonText }}</span>
                </UiButtonDefault>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="!hasUploadedDocuments"
          class="profile-documents-reminder">
          <div>
            <div class="profile-documents-reminder__title">
              {{ t("cabinet.profile.components.tab-general.documentsReminder.title") }}
            </div>
            <div class="profile-documents-reminder__text">
              {{ t("cabinet.profile.components.tab-general.documentsReminder.text") }}
            </div>
          </div>
          <UiButtonDefault
            state="info--small"
            class="profile-documents-reminder__button"
            @click="goToDocumentsStep">
            {{ t("cabinet.profile.components.tab-general.documentsReminder.button") }}
          </UiButtonDefault>
        </div>
      </div>

      <div
        v-else
        key="documents-step"
        class="space-y-4">
        <div class="profile-documents-reminder !m-0">
          <div>
            <div class="profile-documents-reminder__title">
              {{ t("cabinet.profile.components.tab-user-documents.info.title") }}
            </div>
            <div class="profile-documents-reminder__text">
              {{ t("cabinet.profile.components.tab-user-documents.info.text") }}
            </div>
          </div>
          <UiButtonDefault
            state="info--outline"
            class="profile-documents-reminder__button"
            @click="goToProfileStep">
            {{ t("cabinet.profile.index.tabs.general") }}
          </UiButtonDefault>
        </div>

        <TabUserDocuments
          :showTitle="false"
          @documents-state-change="handleDocumentsStateChange" />
      </div>
    </Transition>

    <div class="px-5 pb-5">
      <TabUserVerification history-only />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
  import { useRoute } from "#imports";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import { localizeApiErrorsWithTranslator } from "~/composables/useApiMessages";
  import { useAuthStore } from "~/stores/authStore";
  import { useNotificationsStore } from "~/stores/notificationsStore";
  import { formData } from "~/pages/profile/composables";
  import { validatorUserDataForm } from "~/pages/profile/composables/validation";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiInfoHint from "~/components/ui/UiInfoHint.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconSuccessFull from "~/components/ui/UiIconSuccessFull.vue";
  import UiIconWarningFull from "~/components/ui/UiIconWarningFull.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiInputDate from "~/components/ui/UiInputDate.vue";
  import UiInputPhone from "~/components/ui/UiInputPhone.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import UserPhotoUploader from "~/components/block/uploaders/UserPhotoUploader.vue";
  import TabUserDocuments from "~/pages/profile/components/TabUserDocuments.vue";
  import TabUserVerification from "~/pages/profile/components/TabUserVerification.vue";

  interface SelectOption {
    id: string;
    value: string;
    text: string;
    originalText: string;
  }

  interface LocationApiItem {
    id: number | string;
    name: string;
    name_original?: string;
  }

  interface FetchOptions {
    query?: string;
    page?: number;
    append?: boolean;
  }

  interface FetchCitiesOptions extends FetchOptions {
    countryId?: string | null;
    stateId?: string | null;
  }

  type ProfileInfoVerificationState = "initial" | "pending" | "approved" | "rejected";
  type DocumentsVerificationStatus = "" | "pending" | "approved" | "rejected";
  type ProfileWizardStep = "profile" | "documents";

  const emit = defineEmits<{
    (
      e: "profile-info-status-change",
      payload: {
        state: ProfileInfoVerificationState;
        label: string;
      }
    ): void;
  }>();

  const { t, locale } = useI18n();
  const toast = useToast();
  const appCore = useAppCore();
  const authStore = useAuthStore();
  const notificationsStore = useNotificationsStore();
  const route = useRoute();
  const CLIENT_NOTIFICATION_RECEIVED_EVENT = "client-notification-received";
  const VERIFICATION_NOTIFICATION_TYPE = "verification.status-updated";

  const isLoading = ref(false);
  const isLoadingAllComponentData = ref(false);
  const isResendingEmail = ref(false);
  const hasUploadedDocuments = ref(false);
  const verificationDocumentsStatus = ref<DocumentsVerificationStatus>("");
  const currentStep = ref<ProfileWizardStep>("profile");

  const selectedCountryId = ref<string | null>(null);
  const selectedStateId = ref<string | null>(null);
  const selectedCityId = ref<string | null>(null);

  const countrySearch = ref("");
  const stateSearch = ref("");
  const citySearch = ref("");

  const countryOptions = ref<SelectOption[]>([]);
  const stateOptions = ref<SelectOption[]>([]);
  const cityOptions = ref<SelectOption[]>([]);

  const countriesMeta = reactive({ page: 1, lastPage: 1, loading: false });
  const statesMeta = reactive({ page: 1, lastPage: 1, loading: false });
  const citiesMeta = reactive({ page: 1, lastPage: 1, loading: false });

  let countrySearchTimer: ReturnType<typeof setTimeout> | null = null;
  let stateSearchTimer: ReturnType<typeof setTimeout> | null = null;
  let citySearchTimer: ReturnType<typeof setTimeout> | null = null;
  const profileInfoVerificationState = ref<ProfileInfoVerificationState>("initial");
  const profileInfoReviewState = ref<"" | "pending" | "approved" | "rejected">("");
  const isEditingSubmittedProfile = ref(false);
  const lastSeenVerificationUnreadCount = ref(0);
  const isRealtimeProfileReloading = ref(false);
  const lastHandledVerificationNotificationId = ref("");

  const resolveText = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };
  const isEmailVerified = computed(() => Boolean(authStore.user?.email_verified_at));
  const canResendEmail = computed(() => !isEmailVerified.value);
  const emailVerificationTitle = computed(() =>
    t("cabinet.profile.components.tab-user-verification.items.email.title")
  );
  const emailVerificationStatusText = computed(() =>
    isEmailVerified.value
      ? t("cabinet.profile.components.tab-user-verification.statuses.approved")
      : t("cabinet.profile.components.tab-user-verification.statuses.pending")
  );
  const emailVerificationTooltip = computed(() =>
    isEmailVerified.value
      ? `${emailVerificationTitle.value}: ${t("cabinet.profile.components.tab-user-verification.statuses.approved")}`
      : t("cabinet.profile.components.tab-user-verification.items.email.subtitle")
  );

  const profileInfoVerificationLabel = computed(() => {
    const title = resolveText("cabinet.dashboard.accountVerification.steps.profile", "Profile data verification");
    if (profileInfoVerificationState.value === "initial") {
      return `${title}: ${resolveText("cabinet.profile.generalVerification.notStarted", "Not started")}`;
    }
    if (profileInfoVerificationState.value === "approved") {
      return `${title}: ${resolveText("cabinet.dashboard.accountVerification.statuses.done", "Done")}`;
    }
    if (profileInfoVerificationState.value === "rejected") {
      return `${title}: ${resolveText("cabinet.dashboard.accountVerification.statuses.required", "Required")}`;
    }
    return `${title}: ${resolveText("cabinet.dashboard.accountVerification.statuses.inProgress", "In progress")}`;
  });
  const profileStepDescription = computed(() =>
    resolveText(
      "cabinet.profile.components.tab-general.documentsReminder.text",
      "Fill in and save your profile data before moving to document verification."
    )
  );
  const documentsStepState = computed<ProfileInfoVerificationState>(() => {
    if (verificationDocumentsStatus.value === "approved" || verificationDocumentsStatus.value === "rejected") {
      return verificationDocumentsStatus.value;
    }

    return hasUploadedDocuments.value ? "pending" : "initial";
  });
  const documentsStepDescription = computed(() =>
    resolveText(
      "cabinet.profile.components.tab-user-documents.info.text",
      "Upload documents to confirm the profile data entered on the previous step."
    )
  );
  const resolveStepStatusLabel = (state: ProfileInfoVerificationState): string => {
    if (state === "approved") {
      return resolveText("cabinet.dashboard.accountVerification.statuses.done", "Done");
    }
    if (state === "rejected") {
      return resolveText("cabinet.dashboard.accountVerification.statuses.required", "Required");
    }
    if (state === "pending") {
      return resolveText("cabinet.dashboard.accountVerification.statuses.inProgress", "In progress");
    }

    return resolveText("cabinet.profile.generalVerification.notStarted", "Not started");
  };
  const profileStepStatusLabel = computed(() => resolveStepStatusLabel(profileInfoVerificationState.value));
  const documentsStepStatusLabel = computed(() => resolveStepStatusLabel(documentsStepState.value));
  const isProfileReviewPending = computed(
    () => profileInfoVerificationState.value !== "initial" && profileInfoReviewState.value === "pending"
  );
  const isProfileFormReadonly = computed(() => isProfileReviewPending.value && !isEditingSubmittedProfile.value);
  const profileActionButtonText = computed(() => {
    if (!isProfileReviewPending.value) {
      return t("cabinet.profile.components.tab-general.button");
    }

    return isEditingSubmittedProfile.value
      ? t("cabinet.profile.components.tab-general.buttons.update")
      : t("cabinet.profile.components.tab-general.buttons.edit");
  });

  const normalizeText = (value: string): string => value.trim().toLowerCase();
  const activeLocale = computed(() => String(locale.value || "").trim() || undefined);
  const stepStateClass = (state: ProfileInfoVerificationState): string => {
    if (state === "approved") return "text-[var(--color-success)]";
    if (state === "rejected") return "text-[var(--color-danger)]";
    if (state === "pending") return "text-[var(--color-warning)]";
    return "text-[var(--ui-text-secondary)]";
  };
  const goToProfileStep = (): void => {
    currentStep.value = "profile";
  };
  const goToDocumentsStep = (): void => {
    currentStep.value = "documents";
  };
  const syncStepFromRoute = (value: unknown): void => {
    const nextStep = String(value ?? "")
      .trim()
      .toLowerCase();
    currentStep.value = nextStep === "documents" ? "documents" : "profile";
  };
  const handleDocumentsStateChange = (payload: {
    hasDocuments: boolean;
    verificationStatus: DocumentsVerificationStatus;
  }): void => {
    hasUploadedDocuments.value = payload.hasDocuments;
    verificationDocumentsStatus.value = payload.verificationStatus;
  };
  const refreshAuthUser = async (): Promise<void> => {
    const response = await appCore.auth.getAuthUser();
    authStore.setUser(response.data);
  };

  const syncFormDataWithAuthUser = async (data: Record<string, any> | null | undefined): Promise<void> => {
    formData.email = data?.email || "";
    formData.first_name = data?.first_name || "";
    formData.mid_name = data?.mid_name || "";
    formData.last_name = data?.last_name || "";
    formData.birthdate = normalizeBirthdateValue(data?.birthdate);
    formData.phone = data?.phone || "";
    formData.country = data?.country || "";
    formData.state = data?.state || "";
    formData.city = data?.city || "";
    formData.address = data?.address || "";
    formData.postal_code = data?.postal_code || "";

    formData.country_id = null;
    formData.state_id = null;
    formData.city_id = null;

    await initializeLocationSelections(formData.country, formData.state, formData.city);
  };

  const reloadProfileFormState = async (): Promise<void> => {
    const { data } = await appCore.auth.getAuthUser();
    authStore.setUser(data);
    validatorUserDataForm.clearFieldsErrors();
    await syncFormDataWithAuthUser(data);
    await Promise.all([loadProfileInfoVerificationStatus(), loadDocumentsReminderState()]);
  };

  const triggerRealtimeProfileReload = async (options: { forceProfileStep?: boolean } = {}): Promise<void> => {
    if (isRealtimeProfileReloading.value) {
      return;
    }

    isRealtimeProfileReloading.value = true;

    try {
      isEditingSubmittedProfile.value = false;
      await reloadProfileFormState();

      if (options.forceProfileStep) {
        currentStep.value = "profile";
      }
    } finally {
      isRealtimeProfileReloading.value = false;
    }
  };

  const handleResendEmailVerification = async (): Promise<void> => {
    if (isResendingEmail.value) {
      return;
    }

    isResendingEmail.value = true;

    try {
      await appCore.auth.resendEmailVerification();
      toast.success(t("cabinet.profile.components.tab-user-verification.resendEmailSent"));
      await refreshAuthUser();
    } catch {
      toast.error(t("cabinet.profile.components.tab-user-verification.resendEmailError"));
    } finally {
      isResendingEmail.value = false;
    }
  };

  const normalizeBirthdateValue = (value: unknown): string => {
    const rawValue = String(value ?? "").trim();
    if (rawValue === "") {
      return "";
    }

    const isoLikeDateMatch = rawValue.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoLikeDateMatch) {
      return isoLikeDateMatch[1];
    }

    const dottedDateMatch = rawValue.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (dottedDateMatch) {
      const [, day, month, year] = dottedDateMatch;
      return `${year}-${month}-${day}`;
    }

    const parsedDate = new Date(rawValue);
    if (Number.isNaN(parsedDate.getTime())) {
      return rawValue;
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const toSelectOptions = (items: LocationApiItem[]): SelectOption[] =>
    items.map(item => ({
      id: String(item.id),
      value: String(item.id),
      text: item.name,
      originalText: item.name_original || item.name,
    }));

  const mergeUniqueOptions = (base: SelectOption[], incoming: SelectOption[]): SelectOption[] => {
    if (incoming.length === 0) {
      return base;
    }

    const existingValues = new Set(base.map(option => option.value));
    const additions = incoming.filter(option => !existingValues.has(option.value));

    return additions.length > 0 ? [...base, ...additions] : base;
  };

  const findOptionByValue = (options: SelectOption[], value: string | null): SelectOption | null => {
    if (!value) {
      return null;
    }

    return options.find(option => option.value === value) || null;
  };

  const findOptionByLabel = (options: SelectOption[], label: string): SelectOption | null => {
    const normalizedLabel = normalizeText(label || "");
    if (normalizedLabel === "") {
      return null;
    }

    return (
      options.find(
        option =>
          normalizeText(option.text) === normalizedLabel || normalizeText(option.originalText) === normalizedLabel
      ) || null
    );
  };

  const fetchCountries = async ({ query = countrySearch.value, page = 1, append = false }: FetchOptions = {}) => {
    if (countriesMeta.loading) {
      return;
    }

    countriesMeta.loading = true;
    try {
      const { data } = await appCore.locations.countries({
        q: query || undefined,
        lang: activeLocale.value,
        per_page: 25,
        page,
      });

      const items = Array.isArray(data?.data) ? data.data : [];
      const mapped = toSelectOptions(items);

      countryOptions.value = append ? [...countryOptions.value, ...mapped] : mapped;
      countriesMeta.page = Number(data?.current_page || page);
      countriesMeta.lastPage = Number(data?.last_page || page);
    } finally {
      countriesMeta.loading = false;
    }
  };

  const fetchStates = async (
    countryId: string,
    { query = stateSearch.value, page = 1, append = false }: FetchOptions = {}
  ) => {
    if (!countryId || statesMeta.loading) {
      return;
    }

    statesMeta.loading = true;
    try {
      const { data } = await appCore.locations.states({
        country_id: countryId,
        q: query || undefined,
        lang: activeLocale.value,
        per_page: 25,
        page,
      });

      const items = Array.isArray(data?.data) ? data.data : [];
      const mapped = toSelectOptions(items);

      stateOptions.value = append ? [...stateOptions.value, ...mapped] : mapped;
      statesMeta.page = Number(data?.current_page || page);
      statesMeta.lastPage = Number(data?.last_page || page);
    } finally {
      statesMeta.loading = false;
    }
  };

  const fetchCities = async ({
    countryId = selectedCountryId.value,
    stateId = selectedStateId.value,
    query = citySearch.value,
    page = 1,
    append = false,
  }: FetchCitiesOptions = {}) => {
    if (!countryId || !stateId || citiesMeta.loading) {
      return;
    }

    citiesMeta.loading = true;
    try {
      const { data } = await appCore.locations.cities({
        country_id: countryId,
        state_id: stateId,
        q: query || undefined,
        lang: activeLocale.value,
        per_page: 25,
        page,
      });

      const items = Array.isArray(data?.data) ? data.data : [];
      const mapped = toSelectOptions(items);

      cityOptions.value = append ? [...cityOptions.value, ...mapped] : mapped;
      citiesMeta.page = Number(data?.current_page || page);
      citiesMeta.lastPage = Number(data?.last_page || page);
    } finally {
      citiesMeta.loading = false;
    }
  };

  const applyCitySelection = (nextValue: string | null, validate = true): void => {
    selectedCityId.value = nextValue;
    formData.city_id = nextValue;

    const selected = findOptionByValue(cityOptions.value, nextValue);
    formData.city = selected?.text || "";

    if (validate) {
      validatorUserDataForm.doValidateField("city", formData.city);
    }
  };

  const applyStateSelection = async (nextValue: string | null, validate = true): Promise<void> => {
    selectedStateId.value = nextValue;
    formData.state_id = nextValue;

    const selected = findOptionByValue(stateOptions.value, nextValue);
    formData.state = selected?.text || "";

    if (validate) {
      validatorUserDataForm.doValidateField("state", formData.state);
    }

    selectedCityId.value = null;
    formData.city_id = null;
    formData.city = "";
    citySearch.value = "";
    cityOptions.value = [];
    citiesMeta.page = 1;
    citiesMeta.lastPage = 1;

    if (nextValue) {
      await fetchCities({
        countryId: selectedCountryId.value,
        stateId: nextValue,
        query: "",
        page: 1,
        append: false,
      });
    }
  };

  const applyCountrySelection = async (nextValue: string | null, validate = true): Promise<void> => {
    selectedCountryId.value = nextValue;
    formData.country_id = nextValue;

    const selected = findOptionByValue(countryOptions.value, nextValue);
    formData.country = selected?.text || "";

    if (validate) {
      validatorUserDataForm.doValidateField("country", formData.country);
    }

    selectedStateId.value = null;
    formData.state_id = null;
    formData.state = "";
    stateSearch.value = "";
    stateOptions.value = [];
    statesMeta.page = 1;
    statesMeta.lastPage = 1;

    selectedCityId.value = null;
    formData.city_id = null;
    formData.city = "";
    citySearch.value = "";
    cityOptions.value = [];
    citiesMeta.page = 1;
    citiesMeta.lastPage = 1;

    if (nextValue) {
      await fetchStates(nextValue, { query: "", page: 1, append: false });
    }
  };

  const handleInputBirthday = (value: string) => {
    validatorUserDataForm.doValidateField("birthdate", value);
  };

  const handleCountryChange = async (value: string | null) => {
    await applyCountrySelection(value, true);
  };

  const handleStateChange = async (value: string | null) => {
    await applyStateSelection(value, true);
  };

  const handleCityChange = (value: string | null) => {
    applyCitySelection(value, true);
  };

  const handleCountryBlur = () => validatorUserDataForm.doValidateField("country", formData.country);
  const handleStateBlur = () => validatorUserDataForm.doValidateField("state", formData.state);
  const handleCityBlur = () => validatorUserDataForm.doValidateField("city", formData.city);

  const handleCountrySearch = (value: string) => {
    countrySearch.value = value;
    if (countrySearchTimer) {
      clearTimeout(countrySearchTimer);
    }
    countrySearchTimer = setTimeout(() => {
      void fetchCountries({ query: countrySearch.value, page: 1, append: false });
    }, 250);
  };

  const handleStateSearch = (value: string) => {
    stateSearch.value = value;
    if (stateSearchTimer) {
      clearTimeout(stateSearchTimer);
    }
    stateSearchTimer = setTimeout(() => {
      if (!selectedCountryId.value) {
        return;
      }
      void fetchStates(selectedCountryId.value, { query: stateSearch.value, page: 1, append: false });
    }, 250);
  };

  const handleCitySearch = (value: string) => {
    citySearch.value = value;
    if (citySearchTimer) {
      clearTimeout(citySearchTimer);
    }
    citySearchTimer = setTimeout(() => {
      if (!selectedCountryId.value || !selectedStateId.value) {
        return;
      }
      void fetchCities({
        countryId: selectedCountryId.value,
        stateId: selectedStateId.value,
        query: citySearch.value,
        page: 1,
        append: false,
      });
    }, 250);
  };

  const loadMoreCountries = () => {
    if (countriesMeta.loading || countriesMeta.page >= countriesMeta.lastPage) {
      return;
    }
    void fetchCountries({ query: countrySearch.value, page: countriesMeta.page + 1, append: true });
  };

  const loadMoreStates = () => {
    if (!selectedCountryId.value || statesMeta.loading || statesMeta.page >= statesMeta.lastPage) {
      return;
    }
    void fetchStates(selectedCountryId.value, { query: stateSearch.value, page: statesMeta.page + 1, append: true });
  };

  const loadMoreCities = () => {
    if (
      !selectedCountryId.value ||
      !selectedStateId.value ||
      citiesMeta.loading ||
      citiesMeta.page >= citiesMeta.lastPage
    ) {
      return;
    }
    void fetchCities({
      countryId: selectedCountryId.value,
      stateId: selectedStateId.value,
      query: citySearch.value,
      page: citiesMeta.page + 1,
      append: true,
    });
  };

  const initializeLocationSelections = async (
    countryName: string,
    stateName: string,
    cityName: string
  ): Promise<void> => {
    await fetchCountries({ query: "", page: 1, append: false });

    let matchedCountry = findOptionByLabel(countryOptions.value, countryName || "");
    if (!matchedCountry && countryName.trim() !== "") {
      const { data } = await appCore.locations.countries({
        q: countryName,
        lang: activeLocale.value,
        per_page: 25,
        page: 1,
      });

      const extraItems = Array.isArray(data?.data) ? data.data : [];
      const extraOptions = toSelectOptions(extraItems);
      countryOptions.value = mergeUniqueOptions(countryOptions.value, extraOptions);
      matchedCountry = findOptionByLabel(countryOptions.value, countryName || "");
    }

    if (!matchedCountry) {
      formData.country = countryName || "";
      formData.state = stateName || "";
      formData.city = cityName || "";
      return;
    }

    await applyCountrySelection(matchedCountry.value, false);

    const resolvedCountryId = selectedCountryId.value;
    if (!resolvedCountryId) {
      formData.state = stateName || "";
      formData.city = cityName || "";
      return;
    }

    let matchedState = findOptionByLabel(stateOptions.value, stateName || "");
    if (!matchedState && stateName.trim() !== "") {
      const { data } = await appCore.locations.states({
        country_id: resolvedCountryId,
        q: stateName,
        lang: activeLocale.value,
        per_page: 25,
        page: 1,
      });

      const extraItems = Array.isArray(data?.data) ? data.data : [];
      const extraOptions = toSelectOptions(extraItems);
      stateOptions.value = mergeUniqueOptions(stateOptions.value, extraOptions);
      matchedState = findOptionByLabel(stateOptions.value, stateName || "");
    }
    if (!matchedState) {
      formData.state = stateName || "";
      formData.city = cityName || "";
      return;
    }

    await applyStateSelection(matchedState.value, false);

    const resolvedStateId = selectedStateId.value;
    if (!resolvedStateId) {
      formData.city = cityName || "";
      return;
    }

    let matchedCity = findOptionByLabel(cityOptions.value, cityName || "");
    if (!matchedCity && cityName.trim() !== "") {
      const { data } = await appCore.locations.cities({
        country_id: resolvedCountryId,
        state_id: resolvedStateId,
        q: cityName,
        lang: activeLocale.value,
        per_page: 25,
        page: 1,
      });

      const extraItems = Array.isArray(data?.data) ? data.data : [];
      const extraOptions = toSelectOptions(extraItems);
      cityOptions.value = mergeUniqueOptions(cityOptions.value, extraOptions);
      matchedCity = findOptionByLabel(cityOptions.value, cityName || "");
    }
    if (!matchedCity) {
      formData.city = cityName || "";
      return;
    }

    applyCitySelection(matchedCity.value, false);
  };

  const handleSubmit = async () => {
    try {
      isLoading.value = true;
      const shouldMoveToDocumentsStep = currentStep.value === "profile" && !hasUploadedDocuments.value;

      const toNullableInt = (value: string | null): number | null => {
        if (!value) {
          return null;
        }
        const parsed = Number.parseInt(value, 10);
        return Number.isFinite(parsed) ? parsed : null;
      };

      await appCore.users.patch({
        ...formData,
        birthdate: normalizeBirthdateValue(formData.birthdate),
        country_id: toNullableInt(formData.country_id),
        state_id: toNullableInt(formData.state_id),
        city_id: toNullableInt(formData.city_id),
      });

      validatorUserDataForm.clearFieldsErrors();
      await loadProfileInfoVerificationStatus();
      isEditingSubmittedProfile.value = false;
      if (shouldMoveToDocumentsStep) {
        currentStep.value = "documents";
      }
      toast.success(t("cabinet.profile.components.tab-general.success"));
    } catch (e: any) {
      const responseStatus = e?.response?.status;
      const serverErrors = e?.response?.data?.errors;

      if (responseStatus === 422 && serverErrors && typeof serverErrors === "object") {
        const localizedErrors = localizeApiErrorsWithTranslator(serverErrors, resolveText);
        const mapFieldName = (fieldName: string): string =>
          ({
            country_id: "country",
            state_id: "state",
            city_id: "city",
          })[fieldName] || fieldName;

        Object.entries(localizedErrors).forEach(([field, errors]) => {
          const targetField = mapFieldName(field);
          const target = validatorUserDataForm.errorsFormData[targetField];
          if (!target) {
            return;
          }
          target.isDirty = true;
          target.errors = Array.isArray(errors) ? errors : [String(errors)];
        });

        toast.error(resolveText("cabinet.profile.components.tab-general.validationError", "Please check form fields."));
        return;
      }

      toast.error(resolveText("cabinet.profile.components.tab-general.serverError", "Unable to save profile data."));
    } finally {
      isLoading.value = false;
    }
  };

  const handleValidateAndSubmit = async () => {
    const isValid = validatorUserDataForm.doValidate();
    if (!isValid) {
      toast.error(resolveText("cabinet.profile.components.tab-general.validationError", "Please check form fields."));
      return;
    }

    await handleSubmit();
  };

  const handleProfileFormAction = async () => {
    if (isProfileReviewPending.value && !isEditingSubmittedProfile.value) {
      isEditingSubmittedProfile.value = true;
      return;
    }

    await handleValidateAndSubmit();
  };

  const normalizeVerificationStatus = (value: unknown): "pending" | "approved" | "rejected" => {
    if (typeof value !== "string") return "pending";
    const normalized = value.trim().toLowerCase();
    if (["approved", "done", "success", "verified"].includes(normalized)) return "approved";
    if (["rejected", "failed", "declined", "required"].includes(normalized)) return "rejected";
    return "pending";
  };
  const normalizeOptionalVerificationStatus = (value: unknown): DocumentsVerificationStatus => {
    if (typeof value !== "string") return "";
    const normalized = value.trim().toLowerCase();
    if (normalized === "") return "";
    if (["approved", "done", "success", "verified"].includes(normalized)) return "approved";
    if (["rejected", "failed", "declined", "required"].includes(normalized)) return "rejected";
    if (["pending", "new", "unprocessed", "viewed", "seen"].includes(normalized)) return "pending";
    return "";
  };

  const normalizeProfileReviewState = (value: unknown): "" | "pending" | "approved" | "rejected" => {
    if (typeof value !== "string") return "";
    const normalized = value.trim().toLowerCase();
    if (normalized === "") return "";
    if (["approved", "done", "success", "verified"].includes(normalized)) return "approved";
    if (["rejected", "failed", "declined", "required"].includes(normalized)) return "rejected";
    if (["pending", "new", "unprocessed", "viewed", "seen"].includes(normalized)) return "pending";
    return "";
  };

  const hasProfileInfoInput = (): boolean => {
    const fields = [
      formData.birthdate,
      formData.phone,
      formData.country,
      formData.state,
      formData.city,
      formData.address,
      formData.postal_code,
    ];

    return fields.some(value => String(value ?? "").trim() !== "");
  };

  const hasVerificationActivity = (verificationRecord: Record<string, any>): boolean => {
    const historyRows = verificationRecord?.data?.history;
    if (Array.isArray(historyRows) && historyRows.length > 0) {
      return true;
    }

    const createdAt = typeof verificationRecord?.created_at === "string" ? verificationRecord.created_at : "";
    const updatedAt = typeof verificationRecord?.updated_at === "string" ? verificationRecord.updated_at : "";

    return createdAt !== "" && updatedAt !== "" && createdAt !== updatedAt;
  };

  const resolveProfileInfoVerificationState = (
    rawStatus: unknown,
    hasRequestActivity = false
  ): ProfileInfoVerificationState => {
    const status = normalizeVerificationStatus(rawStatus);
    if (status === "approved" || status === "rejected") {
      return status;
    }

    return hasRequestActivity || hasProfileInfoInput() ? "pending" : "initial";
  };

  const loadProfileInfoVerificationStatus = async (): Promise<void> => {
    try {
      const response = await appCore.verifications.get();
      const verificationRecord = response?.data && typeof response.data === "object" ? response.data : {};
      const rawStatus = verificationRecord?.data?.info?.verification_status;
      const rawDocumentsStatus = verificationRecord?.data?.documents?.verification_status;
      const rawReviewStatus =
        verificationRecord?.data?.info?.review_status ?? verificationRecord?.data?.request_review_state ?? "";
      const hasRequestActivity = hasVerificationActivity(verificationRecord);
      const hasReviewActivity =
        hasRequestActivity ||
        Boolean(verificationRecord?.data?.request_viewed_at || verificationRecord?.data?.request_reviewed_at);
      const normalizedReviewStatus = normalizeProfileReviewState(rawReviewStatus);
      profileInfoVerificationState.value = resolveProfileInfoVerificationState(rawStatus, hasRequestActivity);
      verificationDocumentsStatus.value = normalizeOptionalVerificationStatus(rawDocumentsStatus);
      profileInfoReviewState.value =
        normalizedReviewStatus === "pending" && !hasReviewActivity ? "" : normalizedReviewStatus;
      if (!isProfileReviewPending.value) {
        isEditingSubmittedProfile.value = false;
      }
    } catch {
      profileInfoVerificationState.value = hasProfileInfoInput() ? "pending" : "initial";
      verificationDocumentsStatus.value = "";
      profileInfoReviewState.value = "";
    }
  };

  const loadDocumentsReminderState = async (): Promise<void> => {
    try {
      const response = await appCore.documents.get();
      const rows = Array.isArray(response?.data?.data?.data) ? response.data.data.data : [];
      hasUploadedDocuments.value = rows.length > 0;
    } catch {
      hasUploadedDocuments.value = false;
    }
  };

  const handleClientNotificationReceived = (payload?: { notification?: any }): void => {
    const notification = payload?.notification;
    const notificationId = String(notification?.id ?? "").trim();
    const type = String(notification?.type ?? "").trim();
    if (type !== VERIFICATION_NOTIFICATION_TYPE || notificationId === "") {
      return;
    }

    if (lastHandledVerificationNotificationId.value === notificationId) {
      return;
    }

    lastHandledVerificationNotificationId.value = notificationId;

    const step = String(notification?.payload?.step ?? "").trim().toLowerCase();
    void triggerRealtimeProfileReload({
      forceProfileStep: step === "info",
    });
  };

  watch(
    () => notificationsStore.unreadVerificationNotificationsCount,
    (nextValue, previousValue) => {
      const normalizedNext = Number(nextValue ?? 0);
      const normalizedPrevious =
        previousValue === undefined ? lastSeenVerificationUnreadCount.value : Number(previousValue ?? 0);

      lastSeenVerificationUnreadCount.value = normalizedNext;

      if (normalizedNext <= normalizedPrevious) {
        return;
      }

      void triggerRealtimeProfileReload();
    }
  );

  watch(
    [profileInfoVerificationState, profileInfoVerificationLabel],
    ([state, label]) => {
      emit("profile-info-status-change", { state, label });
    },
    { immediate: true }
  );
  watch(
    () => route.query?.step ?? route.query?.tab,
    value => {
      syncStepFromRoute(value);
    },
    { immediate: true }
  );

  onMounted(async () => {
    useEventBus.on(CLIENT_NOTIFICATION_RECEIVED_EVENT, handleClientNotificationReceived);
    lastSeenVerificationUnreadCount.value = Number(notificationsStore.unreadVerificationNotificationsCount ?? 0);
    validatorUserDataForm.clearFieldsErrors();
    isLoadingAllComponentData.value = true;
    try {
      await reloadProfileFormState();
    } finally {
      isLoadingAllComponentData.value = false;
    }
  });

  onBeforeUnmount(() => {
    useEventBus.off(CLIENT_NOTIFICATION_RECEIVED_EVENT, handleClientNotificationReceived);
  });
</script>

<style lang="scss" scoped>
  .title {
    margin-bottom: 20px;
  }

  .profile__tab--general {
    min-height: 400px;
    width: 100%;
    border-radius: 10px;

    &__profile-data__photo {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      padding: 4px 20px 0;
    }

    &__profile-data__photo-uploader {
      flex: 1 1 auto;
      min-width: 0;
    }

    &_wrapper {
      display: flex;
      gap: 20px;
    }

    &__profile-data {
      width: 50%;
      height: 100%;

      &__title {
        padding: 0 20px;
        height: 40px;
        display: flex;
        align-items: center;
      }

      &__form {
        padding: 20px;

        &__field {
          margin-bottom: 10px;
        }
      }
    }

    &__profile-data--additional {
      width: 50%;
      height: 100%;

      &__title {
        padding: 0 20px;
        height: 40px;
        display: flex;
        align-items: center;
      }

      &__form {
        padding: 20px;

        &__field {
          margin-bottom: 10px;

          &__save_btn {
            margin-top: 35px;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }
    }
  }

  .profile-documents-reminder {
    margin: 0 20px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 35%, var(--color-stroke-ui-light));
    border-radius: 16px;
    background: color-mix(in srgb, var(--ui-primary-main) 8%, var(--ui-background-panel));
    padding: 14px 16px;
  }

  .profile-documents-reminder__title {
    color: var(--ui-text-main);
    font-weight: 700;
    margin-bottom: 4px;
  }

  .profile-documents-reminder__text {
    color: var(--ui-text-secondary);
    font-size: 13px;
    line-height: 1.5;
  }

  .profile-documents-reminder__button {
    flex-shrink: 0;
    width: auto;
    white-space: nowrap;
  }

  .profile-email-field {
    position: relative;
  }

  .profile-email-field__status {
    position: absolute;
    top: 50%;
    right: 12px;
    transform: translateY(-50%);
    z-index: 2;
  }

  .profile-email-field__status-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: 0;
    background: transparent;
    padding: 0;
    transition: opacity 0.2s ease;

    &.is-approved {
      color: var(--color-success);
    }

    &.is-pending {
      color: var(--color-warning);
    }

    &:hover,
    &:focus-visible {
      opacity: 0.9;
      outline: none;
    }
  }

  .profile-email-field__meta {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
    padding: 0 2px;
  }

  .profile-email-field__meta-status {
    font-size: 12px;
    font-weight: 600;

    &.is-approved {
      color: var(--color-success);
    }

    &.is-pending {
      color: var(--color-warning);
    }
  }

  .profile-email-field__meta-action {
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 28%, transparent);
    background: color-mix(in srgb, var(--ui-primary-main) 10%, transparent);
    padding: 6px 10px;
    border-radius: 999px;
    color: var(--ui-primary-main);
    font-size: 12px;
    font-weight: 700;
    transition:
      opacity 0.2s ease,
      background-color 0.2s ease,
      border-color 0.2s ease;

    &:not(:disabled):hover {
      background: color-mix(in srgb, var(--ui-primary-main) 16%, transparent);
      border-color: color-mix(in srgb, var(--ui-primary-main) 38%, transparent);
    }

    &:disabled {
      cursor: wait;
      opacity: 0.6;
    }
  }

  .profile-email-field :deep(input) {
    padding-right: 40px;
  }

  @media (max-width: 1043px) {
    .profile__tab--general {
      &_wrapper {
        flex-direction: column;
        gap: 10px;
      }

      &__profile-data {
        width: 100%;

        &__form {
          padding: 15px;
        }
      }

      &__profile-data--additional {
        width: 100%;

        &__form {
          padding: 15px;
        }
      }

      &__profile-data__photo {
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
        padding: 4px 15px 0;
      }
    }

    .profile-documents-reminder {
      margin: 0 15px 15px;
      flex-direction: column;
      align-items: flex-start;
    }

    .profile-email-field__meta {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>
