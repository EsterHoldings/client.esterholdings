export interface IFormDataDto {
  email: String;
  password?: String;
}

export const formData: IFormDataDto = reactive({
  email: "",
  password: "",
});
