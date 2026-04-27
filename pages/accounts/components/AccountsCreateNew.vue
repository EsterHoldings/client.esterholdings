<template>
  <div class="accounts__edit">
    <div
      class="accounts__edit__top"
      v-if="props.title">
      <UiTextH4>{{ props.title }}</UiTextH4>
    </div>

    <div
      class="accounts__edit__content"
      :class="{ 'without-top': !props.title }">
      <div class="accounts__edit__content__fields">
        <UiFormControl
          :label="t('cabinet.accounts.accounts-form.fields.accountType')"
          :errors="validatorAccountForm?.errorsFormData?.accountType?.errors">
          <div class="account-type-grid">
            <button
              v-for="accountType in accountTypes"
              :key="accountType.value"
              type="button"
              class="account-type-card"
              :class="{ 'account-type-card--active': formData.accountType === accountType.value }"
              @click="handleChangeSelectAccountType(accountType.value)">
              <span class="account-type-card__label">{{ accountType.text }}</span>
              <span class="account-type-card__meta">
                {{ t("cabinet.accounts.accounts-form.accountTypeCardHint") }}
              </span>
            </button>
          </div>
        </UiFormControl>

        <div class="accounts__edit__notice">
          {{ t("cabinet.accounts.accounts-form.investorPasswordNotice") }}
        </div>

        <div class="accounts__edit__actions">
          <UiButtonDefault
            class="accounts__edit__save-btn"
            state="info"
            @click="handleSubmitForm">
            <span v-if="!isLoading">{{ t("cabinet.accounts.accounts-form.actions.submit") }}</span>
            <UiIconSpinnerDefault v-if="isLoading" />
          </UiButtonDefault>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useI18n } from "vue-i18n";
  import { reactive, inject, onMounted, ref } from "vue";
  import { navigateTo, useLocalePath } from "~/.nuxt/imports";
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import { validateAccountForm, validatorAccountForm } from "~/pages/accounts/composables/validation";
  import { formData } from "~/pages/accounts/composables";
  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import { extractApiErrorMessage, resolveApiMessage } from "~/composables/useApiMessages";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import { useToast } from "vue-toastification";

  const isLoading = ref(false);
  const { t } = useI18n({ useScope: "global" });
  const CLIENT_ALLOWED_ACCOUNT_TYPE = "standard";
  const props = defineProps({
    title: {
      type: String,
      default: "",
    },
    redirectToAccountsOnSuccess: {
      type: Boolean,
      default: false,
    },
  });

  const toast = useToast();
  const localePath = useLocalePath();
  let accountTypes = reactive<Array<{ id: string; value: string; text: string }>>([]);

  const app = useAppCore();

  const { closeModal } = inject("modalControl") as { closeModal: Function };

  const resolveText = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const loadTypesErrorLabel = () =>
    resolveText("cabinet.accounts.accounts-form.loadTypesError", "Failed to load account types.");

  const submitErrorLabel = () => resolveText("cabinet.accounts.accounts-form.submitError", "Failed to create account.");

  const createSuccessLabel = () => resolveText("apiMessages.accountCreated", "Account created successfully.");

  const handleChangeSelectAccountType = val => {
    validatorAccountForm.doValidateField("accountType", val);
    formData.accountType = val;
  };

  const syncDefaultAccountType = () => {
    if (accountTypes.length !== 1) return;

    const standardAccountTypeId = String(accountTypes[0]?.value ?? "");
    if (standardAccountTypeId === "") return;

    formData.accountType = standardAccountTypeId;
    validatorAccountForm?.clearFieldsErrors?.();
  };

  const getAccountTypes = async () => {
    try {
      const response = await app.accountTypes.get({ perPage: 20 });
      const rows = Array.isArray(response?.data?.data?.data) ? response.data.data.data : [];
      const standardRows = rows.filter(
        ({ name }) =>
          String(name ?? "")
            .trim()
            .toLowerCase() === CLIENT_ALLOWED_ACCOUNT_TYPE
      );

      accountTypes.splice(
        0,
        accountTypes.length,
        ...standardRows.map(({ id, name }) => ({
          id: String(id),
          value: String(id),
          text: String(name),
        }))
      );

      syncDefaultAccountType();
    } catch (error: any) {
      toast.error(extractApiErrorMessage(error, loadTypesErrorLabel()) ?? loadTypesErrorLabel());
    }
  };

  const handleSubmitForm = async () => {
    syncDefaultAccountType();

    validateAccountForm(async () => {
      try {
        isLoading.value = true;
        const response = await app.accounts.post(formData);
        closeModal();
        useEventBus.emit("loadDataForAccounts");
        toast.success(resolveApiMessage(response?.data?.message, createSuccessLabel()) ?? createSuccessLabel());

        if (props.redirectToAccountsOnSuccess) {
          await navigateTo(localePath({ path: "/accounts" }));
        }
      } catch (error: any) {
        toast.error(extractApiErrorMessage(error, submitErrorLabel()) ?? submitErrorLabel());
      } finally {
        isLoading.value = false;
      }
    });
  };

  onMounted(async () => {
    await getAccountTypes();
  });
</script>

<style lang="scss" scoped>
  .accounts__edit {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;

    &__top {
      min-height: 50px;

      padding-left: 40px;
      padding-right: 20px;

      display: flex;
      align-items: center;
      justify-content: flex-start;

      border-bottom: 1px solid var(--color-stroke-ui-dark);
    }

    &__content {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;

      &.without-top {
        border-top: none;
      }

      &__fields {
        padding: 40px;

        .ui-form-control {
          margin-bottom: 20px;

          &:last-child {
            margin-right: 0;
          }
        }
      }
    }

    &__actions {
      margin-top: 12px;
      padding-bottom: max(8px, calc(env(safe-area-inset-bottom, 0px) + 6px));
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

    &__save-btn {
      min-height: 40px;
    }
  }

  .account-type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 10px;
  }

  .account-type-card {
    min-height: 92px;
    border-radius: 16px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-panel);
    padding: 14px;
    text-align: left;
    color: var(--ui-text-main);
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .account-type-card:hover {
    border-color: var(--ui-primary-main);
    transform: translateY(-1px);
  }

  .account-type-card--active {
    border-color: var(--ui-primary-main);
    background: color-mix(in srgb, var(--ui-primary-main) 16%, var(--ui-background-panel));
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--ui-primary-main) 16%, transparent);
  }

  .account-type-card__label {
    display: block;
    font-size: 15px;
    font-weight: 700;
    line-height: 1.2;
  }

  .account-type-card__meta {
    display: block;
    margin-top: 8px;
    color: var(--ui-text-secondary);
    font-size: 12px;
    line-height: 1.4;
  }

  .accounts__edit__notice {
    margin-top: -4px;
    border-radius: 14px;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 44%, var(--color-stroke-ui-light));
    background: color-mix(in srgb, var(--ui-primary-main) 9%, var(--ui-background-panel));
    padding: 12px 14px;
    color: var(--ui-text-main);
    font-size: 13px;
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    .accounts__edit {
      &__top {
        min-height: 52px;
        padding-left: max(18px, env(safe-area-inset-left, 0px));
        padding-right: max(54px, calc(env(safe-area-inset-right, 0px) + 54px));
      }

      &__content {
        &__fields {
          padding: 20px max(16px, env(safe-area-inset-right, 0px)) 24px
            max(16px, env(safe-area-inset-left, 0px));
        }
      }

      &__actions {
        margin-top: 12px;
      }

      &__save-btn {
        width: 100%;
      }
    }

    .account-type-grid {
      grid-template-columns: 1fr;
    }

    .account-type-card {
      min-height: 82px;
      padding: 13px 14px;
    }

    .accounts__edit__notice {
      margin-top: 0;
      padding: 12px;
      font-size: 12px;
    }
  }
</style>
