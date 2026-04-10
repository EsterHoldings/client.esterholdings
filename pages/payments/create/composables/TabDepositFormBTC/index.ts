import { reactive, Reactive } from "vue";

export interface IFormDataDto {
  amount: string;
  comment: string;
}

export const formData: Reactive<IFormDataDto> = reactive({
  amount: "",
  comment: "",
});
