import { reactive, Reactive } from "vue";

export interface IFormDataDto {
  accountId: string;
  paymentSystemId: string;
  amount: string;
  comment: string;
}

export const formData: Reactive<IFormDataDto> = reactive({
  accountId: "",
  paymentSystemId: "",
  amount: "",
  comment: "",
});
