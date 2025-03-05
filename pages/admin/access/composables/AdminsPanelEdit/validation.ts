import useValidation from "~/composables/useValidation";

import { formData } from ".";

export const validatorAdminForm: any = useValidation(formData, {
    roles: ["required"],
});

export const validateAdminForm: any = (doSendFormCallback: any): void =>
    validatorAdminForm.doValidate() && doSendFormCallback();
export const resetValidationAdminForm: any = (): void =>
    validatorAdminForm.clearFieldsErrors() && resetFormData();

export const resetFormData: any = (): void => {
    formData.roles = [];
};
