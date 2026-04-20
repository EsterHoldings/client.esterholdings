import useValidation from "../../../../../composables/useValidation";

import { formData } from "./index";

export const validatorCoinsbuyDepositForm: any = useValidation(formData, {
  accountId: ["required"],
  amount: ["required", "isDecimal"],
  comment: ["max:254"],
});

export const resetValidationCoinsbuyDepositForm = (): void => {
  validatorCoinsbuyDepositForm.clearFieldsErrors();
  resetFormData();
};

export const resetFormData = (): void => {
  formData.accountId = "";
  formData.paymentSystemId = "";
  formData.amount = "";
  formData.comment = "";
};
