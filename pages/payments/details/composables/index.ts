import {reactive, Reactive} from "vue";

export interface IFormDataDto {
  paymentSystemId: String;
  name: String,
  data: Object,
  documents: Object,
}

export const formData: Reactive<IFormDataDto> = reactive({
    paymentSystemId: "",
    name: "",
    data: {},
    documents: {},
});
