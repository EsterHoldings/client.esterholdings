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
          <UiSelect
            :without-no-select="true"
            :data="accountTypes"
            :value="formData.accountType"
            @change="handleChangeSelectAccountType"
            :isDirty="validatorAccountForm?.errorsFormData?.accountType?.isDirty"
            :isInvalid="validatorAccountForm?.errorsFormData?.accountType?.errors?.length > 0"
            @blur="validatorAccountForm?.doValidateField('accountType', $event)" />
        </UiFormControl>

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
  import UiFormControl from "~/components/ui/UiFormControl.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import { validateAccountForm, validatorAccountForm } from "~/pages/accounts/composables/validation";
  import { formData } from "~/pages/accounts/composables";
  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
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
  });

  const toast = useToast();
  let accountTypes = reactive([]);

  const app = useAppCore();

  const { closeModal } = inject("modalControl") as { closeModal: Function };

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
  };

  const handleSubmitForm = async () => {
    syncDefaultAccountType();

    validateAccountForm(async () => {
      try {
        isLoading.value = true;
        const response = await app.accounts.post(formData);
        closeModal();
        useEventBus.emit("loadDataForAccounts");
        toast.success(response.data.message);
      } catch (errorResponse) {
        console.log("handleSubmitForm -> errorResponse", errorResponse);
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

  @media (max-width: 768px) {
    .accounts__edit {
      &__top {
        padding-left: 20px;
        padding-right: 20px;
      }

      &__content {
        &__fields {
          padding: 20px;
        }
      }

      &__actions {
        margin-top: 12px;
      }

      &__save-btn {
        width: 100%;
      }
    }
  }
</style>
