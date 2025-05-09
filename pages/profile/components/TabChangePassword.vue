<template>
  <div class="change-password">
    <PanelDefault>
      <div class="change-password__form">
        <UiFormControl
          class="change-password__form__field"
          :label="
            t(
              'cabinet.profile.components.tab-change-password.labels.old_password'
            )
          "
          :errors="validatorUserDataForm.errorsFormData.oldPassword.errors"
        >
          <UiInput
            type="password"
            :placeholder="
              t(
                'cabinet.profile.components.tab-change-password.placeholders.old_password'
              )
            "
            :value="formData.oldPassword"
            :isDirty="validatorUserDataForm.errorsFormData.oldPassword.isDirty"
            :isInvalid="
              validatorUserDataForm.errorsFormData.oldPassword.errors.length > 0
            "
            @input="
              validatorUserDataForm.doValidateField(
                'oldPassword',
                $event.target.value
              )
            "
            @blur="
              validatorUserDataForm.doValidateField(
                'oldPassword',
                $event.target.value
              )
            "
          />
        </UiFormControl>

        <UiFormControl
          class="change-password__form__field"
          :label="
            t(
              'cabinet.profile.components.tab-change-password.labels.new_password'
            )
          "
          :errors="validatorUserDataForm.errorsFormData.newPassword.errors"
        >
          <UiInput
            type="password"
            :placeholder="
              t(
                'cabinet.profile.components.tab-change-password.placeholders.new_password'
              )
            "
            :value="formData.newPassword"
            :isDirty="validatorUserDataForm.errorsFormData.newPassword.isDirty"
            :isInvalid="
              validatorUserDataForm.errorsFormData.newPassword.errors.length > 0
            "
            @input="
              validatorUserDataForm.doValidateField(
                'newPassword',
                $event.target.value
              )
            "
            @blur="
              validatorUserDataForm.doValidateField(
                'newPassword',
                $event.target.value
              )
            "
          />
        </UiFormControl>

        <UiFormControl
          class="change-password__form__field"
          :label="
            t(
              'profile.components.tab-change-password.labels.new_password_confirmation'
            )
          "
          :errors="
            validatorUserDataForm.errorsFormData.newPasswordConfirmation.errors
          "
        >
          <UiInput
            type="password"
            :placeholder="
              t(
                'cabinet.profile.components.tab-change-password.placeholders.new_password_confirmation'
              )
            "
            :value="formData.newPasswordConfirmation"
            :isDirty="
              validatorUserDataForm.errorsFormData.newPasswordConfirmation
                .isDirty
            "
            :isInvalid="
              validatorUserDataForm.errorsFormData.newPasswordConfirmation
                .errors.length > 0
            "
            @input="
              validatorUserDataForm.doValidateField(
                'newPasswordConfirmation',
                $event.target.value
              )
            "
            @blur="
              validatorUserDataForm.doValidateField(
                'newPasswordConfirmation',
                $event.target.value
              )
            "
          />
        </UiFormControl>

        <div class="change-password__form__field__save_btn">
          <UiButtonDefault
            state="info--outline"
            @click="validateUserDataForm(handleSubmit)"
          >
            <UiIconSpinnerDefault v-if="isLoading" />
            <span v-if="!isLoading">{{
              t("cabinet.profile.components.tab-change-password.button")
            }}</span>
          </UiButtonDefault>
        </div>
      </div>
    </PanelDefault>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import {
  resetValidationUserDataForm,
  validateUserDataForm,
} from "~/pages/profile/composables/validation";
import { formData } from "~/pages/profile/composables/TheChangePassword";
import { validatorUserDataForm } from "~/pages/profile/composables/TheChangePassword/validation";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import { useAuthStore } from "~/stores/authStore";
import { useToast } from "vue-toastification";
import useAppCore from "~/composables/useAppCore";

const { t } = useI18n();
const toast = useToast();
const appCore = useAppCore();
const isLoading = ref(false);

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    const authStore = useAuthStore();
    await appCore.users.patch(formData);
    resetValidationUserDataForm();
    toast.success("Password was successfully updated!");
  } catch (e) {
    console.error(e);
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 1000);
  }
};
</script>

<style lang="scss" scoped>
.change-password {
  &__form {
    padding: 20px;

    &__field {
      margin-bottom: 10px;

      &__save_btn {
        margin-top: 20px;
      }
    }
  }
}
</style>
