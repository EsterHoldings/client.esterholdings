<template>
  <div class="roles-panel__add-new">
    <div class="roles-panel__add-new__top" v-if="props.title">
      <UiTextH2>{{ props.title }}</UiTextH2>
    </div>

    <div
      class="roles-panel__add-new__content"
      :class="{ 'without-top': !props.title }"
    >
      <div class="roles-panel__add-new__content__fields">
        <UiFormControl
          :label="
            t('admin.accounts.components.accounts-panel-add-new.labels.email')
          "
          :errors="validatorClientForm?.errorsFormData?.email?.errors"
        >
          <UiInput
            :placeholder="
              t(
                'admin.accounts.components.accounts-panel-add-new.placeholders.email'
              )
            "
            :value="formData.email"
            :isDirty="validatorClientForm?.errorsFormData?.email?.isDirty"
            :isInvalid="
              validatorClientForm?.errorsFormData?.email?.errors?.length > 0
            "
            @blur="
              validatorClientForm?.doValidateField('email', $event.target.value)
            "
            @input="
              validatorClientForm?.doValidateField('email', $event.target.value)
            "
          />
        </UiFormControl>

        <UiFormControl
          :label="
            t(
              'admin.accounts.components.accounts-panel-add-new.labels.first_name'
            )
          "
          :errors="validatorClientForm?.errorsFormData?.first_name?.errors"
        >
          <UiInput
            :placeholder="
              t(
                'admin.accounts.components.accounts-panel-add-new.placeholders.first_name'
              )
            "
            :value="formData.first_name"
            :isDirty="validatorClientForm?.errorsFormData?.first_name?.isDirty"
            :isInvalid="
              validatorClientForm?.errorsFormData?.first_name?.errors?.length >
              0
            "
            @blur="
              validatorClientForm?.doValidateField(
                'first_name',
                $event.target.value
              )
            "
            @input="
              validatorClientForm?.doValidateField(
                'first_name',
                $event.target.value
              )
            "
          />
        </UiFormControl>

        <UiFormControl
          :label="
            t(
              'admin.accounts.components.accounts-panel-add-new.labels.password_confirmation'
            )
          "
          :errors="validatorClientForm?.errorsFormData?.last_name?.errors"
        >
          <UiInput
            :placeholder="
              t(
                'admin.accounts.components.accounts-panel-add-new.placeholders.password_confirmation'
              )
            "
            :value="formData.last_name"
            :isDirty="validatorClientForm?.errorsFormData?.last_name?.isDirty"
            :isInvalid="
              validatorClientForm?.errorsFormData?.last_name?.errors?.length > 0
            "
            @blur="
              validatorClientForm?.doValidateField(
                'last_name',
                $event.target.value
              )
            "
            @input="
              validatorClientForm?.doValidateField(
                'last_name',
                $event.target.value
              )
            "
          />
        </UiFormControl>

        <UiFormControl
          :label="
            t(
              'admin.accounts.components.accounts-panel-add-new.labels.mid_name'
            )
          "
          :errors="validatorClientForm?.errorsFormData?.mid_name?.errors"
        >
          <UiInput
            :placeholder="
              t(
                'admin.accounts.components.accounts-panel-add-new.placeholders.mid_name'
              )
            "
            :value="formData.mid_name"
            :isDirty="validatorClientForm?.errorsFormData?.mid_name?.isDirty"
            :isInvalid="
              validatorClientForm?.errorsFormData?.mid_name?.errors?.length > 0
            "
            @blur="
              validatorClientForm?.doValidateField(
                'mid_name',
                $event.target.value
              )
            "
            @input="
              validatorClientForm?.doValidateField(
                'mid_name',
                $event.target.value
              )
            "
          />
        </UiFormControl>

        <UiFormControl
          :label="
            t(
              'admin.accounts.components.accounts-panel-add-new.labels.birthdate'
            )
          "
          :errors="validatorClientForm?.errorsFormData?.birthdate?.errors"
        >
          <UiDatePicker />
        </UiFormControl>

        <UiFormControl
          :label="
            t('admin.accounts.components.accounts-panel-add-new.labels.phone')
          "
          :errors="validatorClientForm?.errorsFormData?.phone?.errors"
        >
          <UiInput
            :placeholder="
              t(
                'admin.accounts.components.accounts-panel-add-new.placeholders.phone'
              )
            "
            :value="formData.phone"
            :isDirty="validatorClientForm?.errorsFormData?.phone?.isDirty"
            :isInvalid="
              validatorClientForm?.errorsFormData?.phone?.errors?.length > 0
            "
            @blur="
              validatorClientForm?.doValidateField('phone', $event.target.value)
            "
            @input="
              validatorClientForm?.doValidateField('phone', $event.target.value)
            "
          />
        </UiFormControl>

        <UiFormControl
          :label="
            t('admin.accounts.components.accounts-panel-add-new.labels.country')
          "
          :errors="validatorClientForm?.errorsFormData?.country?.errors"
        >
          <UiSelect
            :data="countriesList"
            :value="formData.country"
            @change="handleChangeSelectCountry"
          />
        </UiFormControl>

        <UiFormControl
          :label="
            t('admin.accounts.components.accounts-panel-add-new.labels.city')
          "
          :errors="validatorClientForm?.errorsFormData?.city?.errors"
        >
          <UiSelect
            :data="cityList"
            :value="formData.city"
            @change="handleChangeSelectCity"
          />
        </UiFormControl>

        <UiFormControl
          :label="
            t('admin.accounts.components.accounts-panel-add-new.labels.address')
          "
          :errors="validatorClientForm?.errorsFormData?.address?.errors"
        >
          <UiInput
            :placeholder="
              t(
                'admin.accounts.components.accounts-panel-add-new.placeholders.address'
              )
            "
            :value="formData.address"
            :isDirty="validatorClientForm?.errorsFormData?.address?.isDirty"
            :isInvalid="
              validatorClientForm?.errorsFormData?.address?.errors?.length > 0
            "
            @blur="
              validatorClientForm?.doValidateField(
                'address',
                $event.target.value
              )
            "
            @input="
              validatorClientForm?.doValidateField(
                'address',
                $event.target.value
              )
            "
          />
        </UiFormControl>

        <UiFormControl
          :label="
            t(
              'admin.accounts.components.accounts-panel-add-new.labels.postal_code'
            )
          "
          :errors="validatorClientForm?.errorsFormData?.postal_code?.errors"
        >
          <UiInput
            :placeholder="
              t(
                'admin.accounts.components.accounts-panel-add-new.placeholders.postal_code'
              )
            "
            :value="formData.postal_code"
            :isDirty="validatorClientForm?.errorsFormData?.postal_code?.isDirty"
            :isInvalid="
              validatorClientForm?.errorsFormData?.postal_code?.errors?.length >
              0
            "
            @blur="
              validatorClientForm?.doValidateField(
                'postal_code',
                $event.target.value
              )
            "
            @input="
              validatorClientForm?.doValidateField(
                'postal_code',
                $event.target.value
              )
            "
          />
        </UiFormControl>

        <UiFormControl
          :label="
            t(
              'admin.accounts.components.accounts-panel-add-new.labels.password'
            )
          "
          :errors="validatorClientForm?.errorsFormData?.password?.errors"
        >
          <UiInput
            :placeholder="
              t(
                'admin.accounts.components.accounts-panel-add-new.placeholders.password'
              )
            "
            :value="formData.password"
            :isDirty="validatorClientForm?.errorsFormData?.password?.isDirty"
            :isInvalid="
              validatorClientForm?.errorsFormData?.password?.errors?.length > 0
            "
            @blur="
              validatorClientForm?.doValidateField(
                'password',
                $event.target.value
              )
            "
            @input="
              validatorClientForm?.doValidateField(
                'password',
                $event.target.value
              )
            "
          />
        </UiFormControl>

        <UiFormControl
          :label="
            t(
              'admin.accounts.components.accounts-panel-add-new.labels.password_confirmation'
            )
          "
          :errors="
            validatorClientForm?.errorsFormData?.password_confirmation?.errors
          "
        >
          <UiInput
            :placeholder="
              t(
                'admin.accounts.components.accounts-panel-add-new.placeholders.password_confirmation'
              )
            "
            :value="formData.password_confirmation"
            :isDirty="
              validatorClientForm?.errorsFormData?.password_confirmation
                ?.isDirty
            "
            :isInvalid="
              validatorClientForm?.errorsFormData?.password_confirmation?.errors
                ?.length > 0
            "
            @blur="
              validatorClientForm?.doValidateField(
                'password_confirmation',
                $event.target.value
              )
            "
            @input="
              validatorClientForm?.doValidateField(
                'password_confirmation',
                $event.target.value
              )
            "
          />
        </UiFormControl>
      </div>
    </div>
  </div>

  <div class="roles-panel__add-new__bottom">
    <UiButtonDefault
      class="roles-panel__add-new__bottom__save-btn"
      state="secondary"
      @click="handleSubmitForm"
    >
      {{
        t("admin.accounts.components.accounts-panel-add-new.submit")
      }}</UiButtonDefault
    >
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { inject } from "vue";
import { onMounted } from "vue";

import {
  formData,
  cityList,
  countriesList,
} from "~/pages/admin/clients/composables/ClientsPabelAddNew";
import { validatorClientForm } from "~/pages/admin/clients/composables/ClientsPabelAddNew/validation";

import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiTextH2 from "~/components/ui/UiTextH2.vue";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import UiSelect from "~/components/ui/UiSelect.vue";
import UiDatePicker from "~/components/ui/UiDatePicker.vue";

const { t } = useI18n({ useScope: "global" });
const app = useAppCore();
const props = defineProps({
  title: {
    type: String,
    default: "",
  },
});

const { closeModal } = inject("modalControl") as { closeModal: Function };

const validateThisField = () => {
  validatorClientForm?.doValidateField("permissions", formData.permissions);
};

const handleUpdateMultiSelectPermissions = (selectedId: string) => {
  const index = formData.permissions.indexOf(selectedId);
  if (index !== -1) {
    formData.permissions.splice(index, 1);
  } else {
    formData.permissions.push(selectedId);
  }
  validateThisField();
};

const handleRemoveMultiSelectPermission = (id: string) => {
  const index = formData.permissions.indexOf(id);
  if (index !== -1) formData.permissions.splice(index, 1);
  validateThisField();
};

const handleChangeSelectCountry = (value: string | null) => {
  console.log("handleChangeSelectCountry", value);
  formData.country = value;
};

const handleChangeSelectCity = (value: string | null) => {
  console.log("handleChangeSelectCity", value);
  formData.city = value;
};

const handleSubmitForm = async () => {
  try {
    const result = validatorClientForm.doValidate();
    console.log("result");
    console.log(result);
    console.log("result");
    await app.clients.post(formData);

    // closeModal();
    useEventBus.emit("loadDataForUsers");
  } catch (errorResponse) {
    console.log("----------");
    console.log(errorResponse);
    console.log("----------");
  }
};

onMounted(async () => {});
</script>

<style lang="scss" scoped>
.roles-panel__add-new {
  &__top {
    height: 50px;

    padding-left: 40px;
    padding-right: 20px;

    display: flex;
    align-items: center;
    justify-content: flex-start;

    border-bottom: 1px solid gainsboro;
  }

  &__content {
    height: calc(100vh - 120px);
    overflow-x: scroll;

    &.without-top {
      height: calc(100vh - 50px);
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

  &__bottom {
    height: 70px;

    padding-left: 40px;
    padding-right: 40px;

    display: flex;
    align-items: center;
    justify-content: flex-start;

    border-top: 1px solid gainsboro;

    .btn {
      height: 40px;
    }
  }
}
</style>
