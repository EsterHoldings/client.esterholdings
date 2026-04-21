import { useNuxtApp } from "nuxt/app";

type LocalizedApiErrors = Record<string, string[]>;
type ApiTranslator = (key: string, fallback: string) => string;

type ApiMessageTranslation = {
  key: string;
  fallback: string;
};

type ApiPatternTranslation = {
  pattern: RegExp;
  key: string;
  fallback: string;
  format?: (match: RegExpMatchArray, translate: ApiTranslator) => string;
};

export const API_MESSAGE_TRANSLATIONS: Record<string, ApiMessageTranslation> = {
  unauthorized: {
    key: "apiMessages.unauthorized",
    fallback: "Unauthorized",
  },
  unauthenticated: {
    key: "apiMessages.unauthorized",
    fallback: "Unauthorized",
  },
  forbidden: {
    key: "apiMessages.forbidden",
    fallback: "Forbidden",
  },
  "validation error": {
    key: "apiMessages.validationError",
    fallback: "Validation error.",
  },
  "method not allowed": {
    key: "apiMessages.methodNotAllowed",
    fallback: "Method not allowed.",
  },
  "not found": {
    key: "apiMessages.notFound",
    fallback: "Not found.",
  },
  "mt4 request failed": {
    key: "apiMessages.mt4RequestFailed",
    fallback: "MT4 request failed.",
  },
  "email verified": {
    key: "cabinet.dashboard.emailVerification.success",
    fallback: "Email verified.",
  },
  "email already verified": {
    key: "apiMessages.emailAlreadyVerified",
    fallback: "Email already verified.",
  },
  "payment synchronized successfully": {
    key: "cabinet.billing.syncPaymentSuccess",
    fallback: "Payment synchronized successfully.",
  },
  "2fa enabled": {
    key: "apiMessages.twoFaEnabled",
    fallback: "2FA enabled!",
  },
  "2fa disabled": {
    key: "apiMessages.twoFaDisabled",
    fallback: "2FA disabled!",
  },
  "2fa enabled!": {
    key: "apiMessages.twoFaEnabled",
    fallback: "2FA enabled!",
  },
  "2fa disabled!": {
    key: "apiMessages.twoFaDisabled",
    fallback: "2FA disabled!",
  },
  "wrong code": {
    key: "apiMessages.twoFaWrongCode",
    fallback: "Wrong code!",
  },
  "payment was successfully created": {
    key: "cabinet.billing.depositForm.created",
    fallback: "Deposit created successfully.",
  },
  "account payments synchronized successfully": {
    key: "cabinet.accounts.syncPaymentsSuccess",
    fallback: "Account payments synchronized successfully.",
  },
  "payment deleted successfully": {
    key: "cabinet.billing.deletePaymentSuccess",
    fallback: "Payment deleted.",
  },
  "withdrawal request created successfully": {
    key: "cabinet.billing.withdrawalForm.created",
    fallback: "Withdrawal request created successfully.",
  },
  "transfer request created successfully": {
    key: "cabinet.accounts.transfer.success",
    fallback: "Transfer request created successfully.",
  },
  "transfer request created": {
    key: "cabinet.accounts.transfer.success",
    fallback: "Transfer request created successfully.",
  },
  "failed to create withdrawal request": {
    key: "cabinet.billing.withdrawalForm.error",
    fallback: "Failed to create withdrawal request.",
  },
  "failed to create transfer request": {
    key: "cabinet.accounts.transfer.failed",
    fallback: "Failed to create transfer request.",
  },
  "payment detail created successfully": {
    key: "apiMessages.paymentDetailCreated",
    fallback: "Payment detail created successfully.",
  },
  "payment detail updated successfully": {
    key: "apiMessages.paymentDetailUpdated",
    fallback: "Payment detail updated successfully.",
  },
  "payment detail deleted successfully": {
    key: "apiMessages.paymentDetailDeleted",
    fallback: "Payment detail deleted successfully.",
  },
  "payment detail restored successfully": {
    key: "apiMessages.paymentDetailRestored",
    fallback: "Payment detail restored successfully.",
  },
  "document uploaded successfully": {
    key: "apiMessages.documentUploaded",
    fallback: "Document uploaded successfully.",
  },
  "documents saved successfully": {
    key: "apiMessages.documentsSaved",
    fallback: "Documents saved successfully.",
  },
  "document deleted successfully": {
    key: "apiMessages.documentDeleted",
    fallback: "Document deleted successfully.",
  },
  "photo deleted successfully": {
    key: "apiMessages.photoDeleted",
    fallback: "Photo deleted successfully.",
  },
  "payment not found": {
    key: "cabinet.billing.paymentNotFound",
    fallback: "Payment not found.",
  },
  "payment system not found": {
    key: "apiMessages.paymentSystemNotFound",
    fallback: "Payment system not found.",
  },
  "account not found": {
    key: "apiMessages.accountNotFound",
    fallback: "Account not found.",
  },
  "deposit account not found": {
    key: "apiMessages.depositAccountNotFound",
    fallback: "Deposit account not found.",
  },
  "withdrawal amount exceeds account balance": {
    key: "cabinet.billing.withdrawalForm.errors.balance",
    fallback: "Withdrawal amount exceeds the account balance.",
  },
  "invalid investor password": {
    key: "cabinet.billing.withdrawalForm.errors.invalidInvestorPassword",
    fallback: "Invalid investor password.",
  },
  "investor password is not configured for this account": {
    key: "cabinet.billing.withdrawalForm.errors.investorPasswordNotConfigured",
    fallback: "Investor password is not configured for this account.",
  },
  "two-factor authentication code is required": {
    key: "cabinet.billing.withdrawalForm.errors.otpRequired",
    fallback: "Two-factor authentication code is required.",
  },
  "invalid two-factor authentication code": {
    key: "cabinet.billing.withdrawalForm.errors.invalidOtp",
    fallback: "Invalid two-factor authentication code.",
  },
  "two-factor authentication is not configured": {
    key: "cabinet.billing.withdrawalForm.errors.otpNotConfigured",
    fallback: "Two-factor authentication is not configured.",
  },
  "the name field is required": {
    key: "apiMessages.requiredField",
    fallback: "This field is required.",
  },
  "the account id field is required": {
    key: "apiMessages.requiredField",
    fallback: "This field is required.",
  },
  "the payment detail id field is required": {
    key: "apiMessages.requiredField",
    fallback: "This field is required.",
  },
  "the payment system id field is required": {
    key: "apiMessages.requiredField",
    fallback: "This field is required.",
  },
  "the amount field is required": {
    key: "apiMessages.requiredField",
    fallback: "This field is required.",
  },
  "the data field is required": {
    key: "apiMessages.requiredField",
    fallback: "This field is required.",
  },
  "the documents field is required": {
    key: "apiMessages.requiredField",
    fallback: "This field is required.",
  },
  "payment detail not found": {
    key: "apiMessages.paymentDetailNotFound",
    fallback: "Payment detail not found.",
  },
  "account deleted successfully": {
    key: "cabinet.accounts.deleteSuccess",
    fallback: "Account archived!",
  },
  "account archived successfully": {
    key: "cabinet.accounts.deleteSuccess",
    fallback: "Account archived!",
  },
  "new account was successfully created": {
    key: "apiMessages.accountCreated",
    fallback: "Account created successfully.",
  },
  "account creation is unavailable until profile data and documents are verified": {
    key: "cabinet.accounts.openBlocked",
    fallback: "Account opening will be available after profile and document verification.",
  },
  "profile data and documents verification is required to open a new account": {
    key: "cabinet.accounts.openBlocked",
    fallback: "Account opening will be available after profile and document verification.",
  },
  "payout details are unavailable until profile data and documents are verified": {
    key: "cabinet.payments.details.verificationRequired",
    fallback: "Profile and document verification is required to create or update payout details.",
  },
  "profile data and documents verification is required to create or update payout details": {
    key: "cabinet.payments.details.verificationRequired",
    fallback: "Profile and document verification is required to create or update payout details.",
  },
  "client account is blocked": {
    key: "apiMessages.clientAccountBlocked",
    fallback: "Client account is blocked.",
  },
  "invalid callback signature": {
    key: "apiMessages.invalidCallbackSignature",
    fallback: "Invalid callback signature.",
  },
  "reply email is required for email support channel": {
    key: "apiMessages.supportReplyEmailRequired",
    fallback: "Reply email is required for email support channel.",
  },
  "use either files or uploaded_attachments, not both": {
    key: "apiMessages.supportFilesConflict",
    fallback: "Use either files or uploaded attachments, not both.",
  },
  "message or files are required": {
    key: "apiMessages.supportMessageOrFilesRequired",
    fallback: "Message or files are required.",
  },
  "message body or files are required": {
    key: "apiMessages.supportMessageBodyOrFilesRequired",
    fallback: "Message body or files are required.",
  },
};

const PROFILE_FIELD_TRANSLATIONS: Record<string, ApiMessageTranslation> = {
  firstname: {
    key: "apiMessages.profileFields.firstname",
    fallback: "first name",
  },
  secondname: {
    key: "apiMessages.profileFields.secondname",
    fallback: "last name",
  },
  email: {
    key: "apiMessages.profileFields.email",
    fallback: "email",
  },
  country: {
    key: "apiMessages.profileFields.country",
    fallback: "country",
  },
  state: {
    key: "apiMessages.profileFields.state",
    fallback: "state",
  },
  city: {
    key: "apiMessages.profileFields.city",
    fallback: "city",
  },
  address: {
    key: "apiMessages.profileFields.address",
    fallback: "address",
  },
  phone: {
    key: "apiMessages.profileFields.phone",
    fallback: "phone",
  },
  postal_code: {
    key: "apiMessages.profileFields.postalCode",
    fallback: "postal code",
  },
};

const translateProfileFieldList = (rawFields: string, translate: ApiTranslator): string => {
  return rawFields
    .split(",")
    .map(item => item.trim())
    .filter(Boolean)
    .map(field => {
      const translation = PROFILE_FIELD_TRANSLATIONS[normalizeApiMessage(field)];
      return translation ? translate(translation.key, translation.fallback) : field;
    })
    .join(", ");
};

const API_MESSAGE_PATTERN_TRANSLATIONS: ApiPatternTranslation[] = [
  {
    pattern: /^cannot create mt4 account\. fill required profile fields:\s*(.+?)[.!?]*$/i,
    key: "apiMessages.mt4ProfileFieldsRequired",
    fallback: "Fill in the required profile fields before opening an MT4 account:",
    format: (match, translate) => {
      const translatedPrefix = translate(
        "apiMessages.mt4ProfileFieldsRequired",
        "Fill in the required profile fields before opening an MT4 account:"
      );
      const translatedFields = translateProfileFieldList(match[1] ?? "", translate);

      return translatedFields ? `${translatedPrefix} ${translatedFields}` : translatedPrefix;
    },
  },
  {
    pattern: /^field\s+.+?\s+is required!?$/i,
    key: "apiMessages.requiredField",
    fallback: "This field is required.",
  },
  {
    pattern: /^field\s+.+?\s+is incorrect!?(?:\s+\(example:\s*.+\))?$/i,
    key: "apiMessages.invalidField",
    fallback: "Enter a valid value.",
  },
  {
    pattern: /^field\s+.+?\s+length should be less than\s+(\d+)!?$/i,
    key: "apiMessages.maxLengthField",
    fallback: "Value is too long.",
    format: (match, translate) =>
      translate("apiMessages.maxLengthField", `Value is too long. Maximum: ${match[1]}.`).replace(
        "{max}",
        String(match[1] ?? "")
      ),
  },
  {
    pattern: /^field\s+.+?\s+length should be more than\s+(\d+)!?$/i,
    key: "apiMessages.minLengthField",
    fallback: "Value is too short.",
    format: (match, translate) =>
      translate("apiMessages.minLengthField", `Value is too short. Minimum: ${match[1]}.`).replace(
        "{min}",
        String(match[1] ?? "")
      ),
  },
  {
    pattern: /^the .+ field is required[.!?]*$/i,
    key: "apiMessages.requiredField",
    fallback: "This field is required.",
  },
  {
    pattern: /^the .+ field must be a number[.!?]*$/i,
    key: "apiMessages.numericField",
    fallback: "Enter a numeric value.",
  },
  {
    pattern: /^the .+ field must be greater than 0[.!?]*$/i,
    key: "apiMessages.positiveNumberField",
    fallback: "Enter an amount greater than 0.",
  },
  {
    pattern: /^minimum deposit amount for .+ is ([0-9]+(?:\.[0-9]+)?) USD[.!?]*$/i,
    key: "apiMessages.minimumDepositAmount",
    fallback: "Minimum deposit amount is {amount} USD.",
    format: (match, translate) =>
      translate("apiMessages.minimumDepositAmount", "Minimum deposit amount is {amount} USD.").replace(
        "{amount}",
        String(match[1] ?? "")
      ),
  },
  {
    pattern: /^the selected .+ is invalid[.!?]*$/i,
    key: "apiMessages.invalidSelection",
    fallback: "Selected value is invalid.",
  },
  {
    pattern: /^the .+ field may not be greater than (\d+) characters[.!?]*$/i,
    key: "apiMessages.maxLengthField",
    fallback: "Value is too long.",
    format: (match, translate) =>
      translate("apiMessages.maxLengthField", `Value is too long. Maximum: ${match[1]}.`).replace(
        "{max}",
        String(match[1] ?? "")
      ),
  },
];

const toDisplayString = (value: unknown): string => String(value ?? "").trim();

const normalizeApiMessage = (value: unknown): string =>
  toDisplayString(value)
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/, "")
    .toLowerCase();

export const translateApiMessageKey = (key: string, fallback: string): string => {
  const nuxtApp = useNuxtApp();
  const i18n = (nuxtApp?.$i18n ?? null) as { t?: (key: string) => unknown } | null;
  const translated = i18n?.t?.(key);

  return typeof translated === "string" && translated !== key ? translated : fallback;
};

export const resolveApiMessageWithTranslator = (
  message: unknown,
  translate: ApiTranslator,
  fallbackText?: string | null
): string | null => {
  const rawMessage = toDisplayString(message);
  if (rawMessage === "") {
    return fallbackText ?? null;
  }

  const normalizedMessage = normalizeApiMessage(rawMessage);
  const mappedMessage = API_MESSAGE_TRANSLATIONS[normalizedMessage];
  if (!mappedMessage) {
    for (const translation of API_MESSAGE_PATTERN_TRANSLATIONS) {
      const match = rawMessage.match(translation.pattern);
      if (!match) continue;

      if (translation.format) {
        return translation.format(match, translate);
      }

      return translate(translation.key, fallbackText ?? translation.fallback);
    }

    return rawMessage;
  }

  return translate(mappedMessage.key, fallbackText ?? mappedMessage.fallback);
};

export const resolveApiMessage = (message: unknown, fallbackText?: string | null): string | null =>
  resolveApiMessageWithTranslator(message, translateApiMessageKey, fallbackText);

const toLocalizedErrorMessages = (value: unknown, translate: ApiTranslator): string[] => {
  if (Array.isArray(value)) {
    return value
      .map(item => resolveApiMessageWithTranslator(item, translate, toDisplayString(item)))
      .filter((item): item is string => typeof item === "string" && item.trim() !== "");
  }

  const localizedValue = resolveApiMessageWithTranslator(value, translate, toDisplayString(value));
  return localizedValue ? [localizedValue] : [];
};

export const localizeApiErrorsWithTranslator = (errors: unknown, translate: ApiTranslator): LocalizedApiErrors => {
  if (!errors || typeof errors !== "object") {
    return {};
  }

  return Object.entries(errors as Record<string, unknown>).reduce<LocalizedApiErrors>((result, [field, value]) => {
    const messages = toLocalizedErrorMessages(value, translate);
    if (messages.length > 0) {
      result[field] = messages;
    }

    return result;
  }, {});
};

export const localizeApiErrors = (errors: unknown): LocalizedApiErrors =>
  localizeApiErrorsWithTranslator(errors, translateApiMessageKey);

export const extractApiErrorMessageWithTranslator = (
  error: any,
  translate: ApiTranslator,
  fallbackText?: string | null
): string | null => {
  const errors = error?.response?.data?.errors ?? {};
  const localizedErrors = localizeApiErrorsWithTranslator(errors, translate);

  const mt4Error = localizedErrors.mt4?.[0];
  if (mt4Error) {
    return mt4Error;
  }

  const firstValidationError = Object.values(localizedErrors).find(
    value => Array.isArray(value) && typeof value[0] === "string" && value[0].trim() !== ""
  );
  if (firstValidationError?.[0]) {
    return firstValidationError[0];
  }

  return resolveApiMessageWithTranslator(error?.response?.data?.message, translate, fallbackText);
};

export const extractApiErrorMessage = (error: any, fallbackText?: string | null): string | null =>
  extractApiErrorMessageWithTranslator(error, translateApiMessageKey, fallbackText);
