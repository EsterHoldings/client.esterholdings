export const serverSideErrorsHandler = (
  errorsFormData: any,
  serverValidationErrors: Array<string>
): any => {
  console.log(
    "serverSideErrorsHandler",
    errorsFormData,
    serverValidationErrors
  );
};
