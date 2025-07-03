import useValidation from "../../../../../composables/useValidation";

import { formData } from "./index";

export const validatorAccountForm: any = useValidation(formData, {
    // name: ["required", "min:3", "max:20"],
    // permissions: ["required"],
});

export const validateAccountForm: any = (doSendFormCallback: any): void =>
    validatorAccountForm.doValidate() && doSendFormCallback();
export const resetValidationAccountForm: any = (): void =>
    validatorAccountForm.clearFieldsErrors() && resetFormData();

export const resetFormData: any = (): void => {
    // formData.name = "";
    // formData.permissions = [];
};
