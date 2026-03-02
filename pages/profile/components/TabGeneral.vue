<template>
  <div class="profile__tab--general">
    <div class="profile__tab--general__profile-data__photo">
      <div class="profile__tab--general__profile-data__photo-uploader">
        <UserPhotoUploader />
      </div>
      <div
        class="profile__verification-status"
        :class="`profile__verification-status--${profileInfoVerificationState}`">
        <span class="profile__verification-status__dot" />
        <span class="profile__verification-status__label">
          {{ profileInfoVerificationLabel }}
        </span>
      </div>
    </div>

    <div class="profile__tab--general_wrapper">
      <div class="profile__tab--general__profile-data">
        <div class="profile__tab--general__profile-data__form">
          <UiFormControl
            class="profile__tab--general__profile-data__form__field"
            :label="t('cabinet.profile.components.tab-general.labels.email')"
            :errors="validatorUserDataForm.errorsFormData.email.errors">
            <UiInput
              :isLoading="isLoadingAllComponentData"
              type="text"
              :placeholder="t('cabinet.profile.components.tab-general.placeholders.email')"
              :value="formData.email"
              :disabled="true"
              :isDirty="validatorUserDataForm.errorsFormData.email.isDirty"
              :isInvalid="validatorUserDataForm.errorsFormData.email.errors.length > 0"
              @blur="validatorUserDataForm.doValidateField('email', formData.email)" />
          </UiFormControl>

          <UiFormControl
            class="profile__tab--general__profile-data__form__field"
            :label="t('cabinet.profile.components.tab-general.labels.first_name')"
            :errors="validatorUserDataForm.errorsFormData.first_name.errors">
            <UiInput
              :isLoading="isLoadingAllComponentData"
              type="text"
              :placeholder="t('cabinet.profile.components.tab-general.placeholders.first_name')"
              :value="formData.first_name"
              :isDirty="validatorUserDataForm.errorsFormData.first_name.isDirty"
              :isInvalid="validatorUserDataForm.errorsFormData.first_name.errors.length > 0"
              @input="validatorUserDataForm.doValidateField('first_name', $event)"
              @blur="validatorUserDataForm.doValidateField('first_name', $event.target.value)" />
          </UiFormControl>

          <UiFormControl
            class="profile__tab--general__profile-data__form__field"
            :label="t('cabinet.profile.components.tab-general.labels.last_name')"
            :errors="validatorUserDataForm.errorsFormData.last_name.errors">
            <UiInput
              :isLoading="isLoadingAllComponentData"
              type="text"
              :placeholder="t('cabinet.profile.components.tab-general.placeholders.last_name')"
              :value="formData.last_name"
              :isDirty="validatorUserDataForm.errorsFormData.last_name.isDirty"
              :isInvalid="validatorUserDataForm.errorsFormData.last_name.errors.length > 0"
              @input="validatorUserDataForm.doValidateField('last_name', $event)"
              @blur="validatorUserDataForm.doValidateField('last_name', $event.target.value)" />
          </UiFormControl>

          <UiFormControl
            class="profile__tab--general__profile-data__form__field"
            :label="t('cabinet.profile.components.tab-general.labels.mid_name')"
            :errors="validatorUserDataForm.errorsFormData.mid_name.errors">
            <UiInput
              :isLoading="isLoadingAllComponentData"
              type="text"
              :placeholder="t('cabinet.profile.components.tab-general.placeholders.mid_name')"
              :value="formData.mid_name"
              :isDirty="validatorUserDataForm.errorsFormData.mid_name.isDirty"
              :isInvalid="validatorUserDataForm.errorsFormData.mid_name.errors.length > 0"
              @input="validatorUserDataForm.doValidateField('mid_name', $event)"
              @blur="validatorUserDataForm.doValidateField('mid_name', $event.target.value)" />
          </UiFormControl>

          <UiFormControl
            class="profile__tab--general__profile-data__form__field"
            :label="t('cabinet.profile.components.tab-general.labels.birthdate')"
            :errors="validatorUserDataForm.errorsFormData.birthdate.errors">
            <UiInputDate
              :isLoading="isLoadingAllComponentData"
              :value="formData.birthdate"
              :isDirty="validatorUserDataForm.errorsFormData.birthdate.isDirty"
              :isInvalid="validatorUserDataForm.errorsFormData.birthdate.errors.length > 0"
              @input="handleInputBirthday"
              @blur="handleInputBirthday" />
          </UiFormControl>

          <UiFormControl
            class="profile__tab--general__profile-data__form__field"
            :label="t('cabinet.profile.components.tab-general.labels.phone')"
            :errors="validatorUserDataForm.errorsFormData.phone.errors">
            <UiInputPhone
              type="number"
              :isLoading="isLoadingAllComponentData"
              :placeholder="t('cabinet.profile.components.tab-general.placeholders.phone')"
              v-model="formData.phone"
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
            :label="t('cabinet.profile.components.tab-general.labels.country')"
            :errors="validatorUserDataForm.errorsFormData.country.errors">
            <UiSelect
              :data="countryOptions"
              :value="selectedCountryId"
              :isDirty="validatorUserDataForm.errorsFormData.country.isDirty"
              :isInvalid="validatorUserDataForm.errorsFormData.country.errors.length > 0"
              searchable
              :searchValue="countrySearch"
              :searchPlaceholder="t('cabinet.profile.components.tab-general.labels.country')"
              @change="handleCountryChange"
              @blur="handleCountryBlur"
              @search="handleCountrySearch"
              @loadMore="loadMoreCountries" />
          </UiFormControl>

          <UiFormControl
            class="profile__tab--general__profile-data--additional__form__field"
            :label="t('cabinet.profile.components.tab-general.labels.state')"
            :errors="validatorUserDataForm.errorsFormData.state.errors">
            <UiSelect
              :data="stateOptions"
              :value="selectedStateId"
              :disabled="!selectedCountryId"
              :isDirty="validatorUserDataForm.errorsFormData.state.isDirty"
              :isInvalid="validatorUserDataForm.errorsFormData.state.errors.length > 0"
              searchable
              :searchValue="stateSearch"
              :searchPlaceholder="t('cabinet.profile.components.tab-general.labels.state')"
              @change="handleStateChange"
              @blur="handleStateBlur"
              @search="handleStateSearch"
              @loadMore="loadMoreStates" />
          </UiFormControl>

          <UiFormControl
            class="profile__tab--general__profile-data--additional__form__field"
            :label="t('cabinet.profile.components.tab-general.labels.city')"
            :errors="validatorUserDataForm.errorsFormData.city.errors">
            <UiSelect
              :data="cityOptions"
              :value="selectedCityId"
              :disabled="!selectedStateId"
              :isDirty="validatorUserDataForm.errorsFormData.city.isDirty"
              :isInvalid="validatorUserDataForm.errorsFormData.city.errors.length > 0"
              searchable
              :searchValue="citySearch"
              :searchPlaceholder="t('cabinet.profile.components.tab-general.labels.city')"
              @change="handleCityChange"
              @blur="handleCityBlur"
              @search="handleCitySearch"
              @loadMore="loadMoreCities" />
          </UiFormControl>

          <UiFormControl
            class="profile__tab--general__profile-data--additional__form__field"
            :label="t('cabinet.profile.components.tab-general.labels.address')"
            :errors="validatorUserDataForm.errorsFormData.address.errors">
            <UiInput
              :isLoading="isLoadingAllComponentData"
              type="text"
              :placeholder="t('cabinet.profile.components.tab-general.placeholders.address')"
              :value="formData.address"
              :isDirty="validatorUserDataForm.errorsFormData.address.isDirty"
              :isInvalid="validatorUserDataForm.errorsFormData.address.errors.length > 0"
              @input="validatorUserDataForm.doValidateField('address', $event)"
              @blur="validatorUserDataForm.doValidateField('address', $event.target.value)" />
          </UiFormControl>

          <UiFormControl
            class="profile__tab--general__profile-data--additional__form__field"
            :label="t('cabinet.profile.components.tab-general.labels.postal_code')"
            :errors="validatorUserDataForm.errorsFormData.postal_code.errors">
            <UiInput
              :isLoading="isLoadingAllComponentData"
              type="text"
              :placeholder="t('cabinet.profile.components.tab-general.placeholders.postal_code')"
              :value="formData.postal_code"
              :isDirty="validatorUserDataForm.errorsFormData.postal_code.isDirty"
              :isInvalid="validatorUserDataForm.errorsFormData.postal_code.errors.length > 0"
              @input="validatorUserDataForm.doValidateField('postal_code', $event)"
              @blur="validatorUserDataForm.doValidateField('postal_code', $event.target.value)" />
          </UiFormControl>

          <div class="profile__tab--general__profile-data--additional__form__field__save_btn">
            <UiButtonDefault
              state="info--outline"
              :isLoading="isLoading"
              @click="handleValidateAndSubmit">
              <UiIconSpinnerDefault v-if="isLoading" />
              <span v-if="!isLoading">{{ t("cabinet.profile.components.tab-general.button") }}</span>
            </UiButtonDefault>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import useAppCore from "~/composables/useAppCore";
  import { formData } from "~/pages/profile/composables";
  import { validatorUserDataForm } from "~/pages/profile/composables/validation";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiInputDate from "~/components/ui/UiInputDate.vue";
  import UiInputPhone from "~/components/ui/UiInputPhone.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import UserPhotoUploader from "~/components/block/uploaders/UserPhotoUploader.vue";

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

  const { t, locale } = useI18n();
  const toast = useToast();
  const appCore = useAppCore();

  const isLoading = ref(false);
  const isLoadingAllComponentData = ref(false);

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
  const profileInfoVerificationState = ref<"initial" | "pending" | "approved" | "rejected">("initial");

  const resolveText = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

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

  const normalizeText = (value: string): string => value.trim().toLowerCase();
  const activeLocale = computed(() => String(locale.value || "").trim() || undefined);

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
          normalizeText(option.text) === normalizedLabel ||
          normalizeText(option.originalText) === normalizedLabel
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

      const toNullableInt = (value: string | null): number | null => {
        if (!value) {
          return null;
        }
        const parsed = Number.parseInt(value, 10);
        return Number.isFinite(parsed) ? parsed : null;
      };

      await appCore.users.patch({
        ...formData,
        country_id: toNullableInt(formData.country_id),
        state_id: toNullableInt(formData.state_id),
        city_id: toNullableInt(formData.city_id),
      });

      validatorUserDataForm.clearFieldsErrors();
      await loadProfileInfoVerificationStatus();
      toast.success(t("cabinet.profile.components.tab-general.success"));
    } catch (e: any) {
      const responseStatus = e?.response?.status;
      const serverErrors = e?.response?.data?.errors;

      if (responseStatus === 422 && serverErrors && typeof serverErrors === "object") {
        const mapFieldName = (fieldName: string): string =>
          ({
            country_id: "country",
            state_id: "state",
            city_id: "city",
          })[fieldName] || fieldName;

        Object.entries(serverErrors as Record<string, string[]>).forEach(([field, errors]) => {
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

  const normalizeVerificationStatus = (value: unknown): "pending" | "approved" | "rejected" => {
    if (typeof value !== "string") return "pending";
    const normalized = value.trim().toLowerCase();
    if (["approved", "done", "success", "verified"].includes(normalized)) return "approved";
    if (["rejected", "failed", "declined", "required"].includes(normalized)) return "rejected";
    return "pending";
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
  ): "initial" | "pending" | "approved" | "rejected" => {
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
      const hasRequestActivity = hasVerificationActivity(verificationRecord);
      profileInfoVerificationState.value = resolveProfileInfoVerificationState(rawStatus, hasRequestActivity);
    } catch {
      profileInfoVerificationState.value = hasProfileInfoInput() ? "pending" : "initial";
    }
  };

  onMounted(async () => {
    isLoadingAllComponentData.value = true;
    try {
      const { data } = await appCore.auth.getAuthUser();

      formData.email = data?.email || "";
      formData.first_name = data?.first_name || "";
      formData.mid_name = data?.mid_name || "";
      formData.last_name = data?.last_name || "";
      formData.birthdate = data?.birthdate || "";
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
      await loadProfileInfoVerificationStatus();
    } finally {
      isLoadingAllComponentData.value = false;
    }
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

        .profile__verification-status {
          margin-left: auto;
        }
      }
    }
  }

  .profile__verification-status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 999px;
    padding: 6px 12px;
    background: color-mix(in srgb, var(--ui-background-panel) 70%, transparent);
    flex-shrink: 0;

    &__dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--ui-text-secondary);
    }

    &__label {
      font-size: 12px;
      font-weight: 600;
      color: var(--ui-text-main);
      line-height: 1;
    }

    &--initial {
      .profile__verification-status__dot {
        background: var(--ui-text-secondary);
      }
    }

    &--approved {
      .profile__verification-status__dot {
        background: var(--color-success);
      }
    }

    &--pending {
      .profile__verification-status__dot {
        background: var(--color-warning);
      }
    }

    &--rejected {
      .profile__verification-status__dot {
        background: var(--color-danger);
      }
    }
  }
</style>
