import { useNuxtApp } from "nuxt/app";

type LocalizedApiErrors = Record<string, string[]>;

type ApiMessageTranslation = {
  key: string;
  fallback: string;
};

const API_MESSAGE_TRANSLATIONS: Record<string, ApiMessageTranslation> = {
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
  "payment synchronized successfully": {
    key: "cabinet.billing.syncPaymentSuccess",
    fallback: "Payment synchronized successfully.",
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
  "profile data and documents verification is required to open a new account": {
    key: "cabinet.accounts.openBlocked",
    fallback: "Account opening will be available after profile and document verification.",
  },
  "invalid callback signature": {
    key: "apiMessages.invalidCallbackSignature",
    fallback: "Invalid callback signature.",
  },
};

const toDisplayString = (value: unknown): string => String(value ?? "").trim();

const normalizeApiMessage = (value: unknown): string =>
  toDisplayString(value)
    .replace(/\s+/g, " ")
    .replace(/[.!?]+$/u, "")
    .toLowerCase();

const translateKey = (key: string, fallback: string): string => {
  const nuxtApp = useNuxtApp();
  const i18n = (nuxtApp?.$i18n ?? null) as { t?: (key: string) => unknown } | null;
  const translated = i18n?.t?.(key);

  return typeof translated === "string" && translated !== key ? translated : fallback;
};

export const resolveApiMessage = (message: unknown, fallbackText?: string | null): string | null => {
  const rawMessage = toDisplayString(message);
  if (rawMessage === "") {
    return fallbackText ?? null;
  }

  const mappedMessage = API_MESSAGE_TRANSLATIONS[normalizeApiMessage(rawMessage)];
  if (!mappedMessage) {
    return rawMessage;
  }

  return translateKey(mappedMessage.key, fallbackText ?? mappedMessage.fallback);
};

const toLocalizedErrorMessages = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map(item => resolveApiMessage(item, toDisplayString(item)))
      .filter((item): item is string => typeof item === "string" && item.trim() !== "");
  }

  const localizedValue = resolveApiMessage(value, toDisplayString(value));
  return localizedValue ? [localizedValue] : [];
};

export const localizeApiErrors = (errors: unknown): LocalizedApiErrors => {
  if (!errors || typeof errors !== "object") {
    return {};
  }

  return Object.entries(errors as Record<string, unknown>).reduce<LocalizedApiErrors>((result, [field, value]) => {
    const messages = toLocalizedErrorMessages(value);
    if (messages.length > 0) {
      result[field] = messages;
    }

    return result;
  }, {});
};

export const extractApiErrorMessage = (error: any, fallbackText?: string | null): string | null => {
  const errors = error?.response?.data?.errors ?? {};
  const localizedErrors = localizeApiErrors(errors);

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

  return resolveApiMessage(error?.response?.data?.message, fallbackText);
};
