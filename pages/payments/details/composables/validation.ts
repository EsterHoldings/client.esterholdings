import useValidation from "~/composables/useValidation";

import {formData} from "./index";

export const validatorPaymentDetailForm: any = useValidation(formData, {
    paymentSystemId: ["required"],
    name: ["required", "max:50"],
});

export const validatePaymentDetailForm = (doSendFormCallback: any): void =>
    validatorPaymentDetailForm.doValidate() && doSendFormCallback();
export const resetValidationUPaymentDetailForm = (): void =>
    validatorPaymentDetailForm.clearFieldsErrors() && resetFormData();

export const resetFormData = (): void => {
    formData.paymentSystemId = "";
    formData.name = "";
    formData.data = {};
    formData.documents = {};
};
