import useValidation from "~/composables/useValidation";

import { formData } from "./index";

export const validatorUserDataForm: any = useValidation(formData, {
  oldPassword: ["required"],
  newPassword: ["required"],
  newPasswordConfirmation: ["required"],
});

export const validateUserDataForm = (doSendFormCallback: any): void =>
  validatorUserDataForm.doValidate() && doSendFormCallback();
export const resetValidationUserDataForm = (): void =>
  validatorUserDataForm.clearFieldsErrors() && resetFormData();

export const resetFormData = (): void => {
  formData.oldPassword = "";
  formData.newPassword = "";
  formData.newPasswordConfirmation = "";
};
