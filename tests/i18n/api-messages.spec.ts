import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import {
  extractApiErrorMessageWithTranslator,
  localizeApiErrorsWithTranslator,
  resolveApiMessageWithTranslator,
} from "~/composables/useApiMessages";

const ROOT_DIR = process.cwd();
const LOCALES_DIR = path.join(ROOT_DIR, "i18n", "locales");
const RU_LOCALE = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "i18n", "locales", "ru.json"), "utf8")) as Record<
  string,
  unknown
>;
const localeCodes = fs
  .readdirSync(LOCALES_DIR)
  .filter(fileName => fileName.endsWith(".json"))
  .map(fileName => path.basename(fileName, ".json"))
  .sort();
const localeDictionaries = Object.fromEntries(
  localeCodes.map(code => [code, JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, `${code}.json`), "utf8"))])
) as Record<string, Record<string, unknown>>;

const getByPath = (object: Record<string, unknown>, key: string): unknown =>
  key.split(".").reduce<unknown>((value, segment) => {
    if (!value || typeof value !== "object") {
      return undefined;
    }

    return (value as Record<string, unknown>)[segment];
  }, object);

const translateFromRu = (key: string, fallback: string): string => {
  const translated = getByPath(RU_LOCALE, key);
  return typeof translated === "string" ? translated : fallback;
};

describe("useApiMessages translator helpers", () => {
  it("contains required api message translations in all locales", () => {
    const requiredKeys = [
      "apiMessages.invalidField",
      "apiMessages.numericField",
      "apiMessages.positiveNumberField",
      "apiMessages.invalidSelection",
      "apiMessages.maxLengthField",
      "apiMessages.minLengthField",
      "apiMessages.paymentSystemNotFound",
      "apiMessages.accountNotFound",
      "apiMessages.depositAccountNotFound",
      "apiMessages.paymentDetailCreated",
      "apiMessages.paymentDetailUpdated",
      "apiMessages.paymentDetailDeleted",
      "apiMessages.paymentDetailRestored",
      "apiMessages.paymentDetailNotFound",
      "apiMessages.documentUploaded",
      "apiMessages.documentsSaved",
      "apiMessages.documentDeleted",
      "apiMessages.photoDeleted",
      "apiMessages.supportReplyEmailRequired",
      "apiMessages.supportFilesConflict",
      "apiMessages.supportMessageOrFilesRequired",
      "apiMessages.supportMessageBodyOrFilesRequired",
      "apiMessages.emailAlreadyVerified",
      "apiMessages.twoFaEnabled",
      "apiMessages.twoFaDisabled",
      "apiMessages.twoFaWrongCode",
    ];

    for (const localeCode of localeCodes) {
      for (const key of requiredKeys) {
        expect(getByPath(localeDictionaries[localeCode], key)).toBeTypeOf("string");
      }
    }
  });

  it("maps normalized backend messages to localized text", () => {
    expect(resolveApiMessageWithTranslator("Unauthorized", translateFromRu)).toBe("Требуется авторизация.");
    expect(resolveApiMessageWithTranslator("Payment was successfully created.", translateFromRu)).toBe(
      "Депозит успешно создан."
    );
    expect(resolveApiMessageWithTranslator("payment synchronized successfully", translateFromRu)).toBe(
      "Платёж успешно синхронизирован."
    );
    expect(resolveApiMessageWithTranslator("Account payments synchronized successfully.", translateFromRu)).toBe(
      "Платежи по счёту успешно синхронизированы."
    );
    expect(
      resolveApiMessageWithTranslator(
        "Account creation is unavailable until Profile data and Documents are verified.",
        translateFromRu
      )
    ).toBe("Открытие счёта будет доступно после верификации данных профиля и документов.");
    expect(resolveApiMessageWithTranslator("Client account is blocked.", translateFromRu)).toBe(
      "Клиентский аккаунт заблокирован."
    );
    expect(resolveApiMessageWithTranslator("Payment system not found.", translateFromRu)).toBe(
      "Платёжная система не найдена."
    );
    expect(resolveApiMessageWithTranslator("Account not found.", translateFromRu)).toBe("Счёт не найден.");
    expect(resolveApiMessageWithTranslator("Deposit account not found.", translateFromRu)).toBe(
      "Счёт для пополнения не найден."
    );
    expect(resolveApiMessageWithTranslator("Payment detail created successfully.", translateFromRu)).toBe(
      "Платёжные реквизиты успешно созданы."
    );
    expect(resolveApiMessageWithTranslator("Payment detail updated successfully.", translateFromRu)).toBe(
      "Платёжные реквизиты успешно обновлены."
    );
    expect(resolveApiMessageWithTranslator("Payment detail deleted successfully.", translateFromRu)).toBe(
      "Платёжные реквизиты успешно архивированы."
    );
    expect(resolveApiMessageWithTranslator("Payment detail restored successfully.", translateFromRu)).toBe(
      "Платёжные реквизиты успешно восстановлены."
    );
    expect(resolveApiMessageWithTranslator("Payment detail not found.", translateFromRu)).toBe(
      "Платёжный реквизит не найден."
    );
    expect(resolveApiMessageWithTranslator("Document uploaded successfully.", translateFromRu)).toBe(
      "Документ успешно загружен."
    );
    expect(resolveApiMessageWithTranslator("Documents saved successfully.", translateFromRu)).toBe(
      "Документы успешно сохранены."
    );
    expect(resolveApiMessageWithTranslator("Document deleted successfully.", translateFromRu)).toBe(
      "Документ успешно удален."
    );
    expect(resolveApiMessageWithTranslator("Photo deleted successfully.", translateFromRu)).toBe(
      "Фото успешно удалено."
    );
    expect(resolveApiMessageWithTranslator("Reply email is required for email support channel.", translateFromRu)).toBe(
      "Email для ответа обязателен для email-канала поддержки."
    );
    expect(resolveApiMessageWithTranslator("Email already verified.", translateFromRu)).toBe("Email уже подтвержден.");
    expect(resolveApiMessageWithTranslator("2FA enabled!", translateFromRu)).toBe("2FA включена!");
    expect(resolveApiMessageWithTranslator("2FA disabled!", translateFromRu)).toBe("2FA отключена!");
    expect(resolveApiMessageWithTranslator("Wrong code!", translateFromRu)).toBe("Неверный код!");
    expect(
      resolveApiMessageWithTranslator("Use either files or uploaded_attachments, not both.", translateFromRu)
    ).toBe("Используйте либо файлы, либо uploaded_attachments, но не оба варианта одновременно.");
    expect(resolveApiMessageWithTranslator("Message or files are required.", translateFromRu)).toBe(
      "Нужно добавить сообщение или файлы."
    );
    expect(resolveApiMessageWithTranslator("Message body or files are required.", translateFromRu)).toBe(
      "Нужно добавить текст сообщения или файлы."
    );
  });

  it("returns the original message when no mapping exists", () => {
    expect(resolveApiMessageWithTranslator("Custom upstream error", translateFromRu)).toBe("Custom upstream error");
  });

  it("localizes validation error bags", () => {
    expect(
      localizeApiErrorsWithTranslator(
        {
          name: ["The name field is required."],
          documents: ["The documents field is required."],
        },
        translateFromRu
      )
    ).toEqual({
      name: ["Поле обязательно для заполнения."],
      documents: ["Поле обязательно для заполнения."],
    });
  });

  it("extracts the first localized validation error before generic backend messages", () => {
    const message = extractApiErrorMessageWithTranslator(
      {
        response: {
          data: {
            message: "Validation error.",
            errors: {
              payment_system_id: ["The payment system id field is required."],
            },
          },
        },
      },
      translateFromRu
    );

    expect(message).toBe("Поле обязательно для заполнения.");
  });

  it("falls back to localized backend message when validation bag is absent", () => {
    const message = extractApiErrorMessageWithTranslator(
      {
        response: {
          data: {
            message: "Invalid callback signature",
          },
        },
      },
      translateFromRu
    );

    expect(message).toBe("Некорректная подпись callback.");
  });

  it("localizes dynamic MT4 profile-field errors", () => {
    const message = resolveApiMessageWithTranslator(
      "Cannot create MT4 account. Fill required profile fields: firstname, secondname, postal_code.",
      translateFromRu
    );

    expect(message).toBe(
      "Заполните обязательные поля профиля перед открытием MT4 счёта: имя, фамилия, почтовый индекс"
    );
  });

  it("localizes validator-like field messages used in cabinet forms", () => {
    expect(resolveApiMessageWithTranslator("Field amount is required!", translateFromRu)).toBe(
      "Поле обязательно для заполнения."
    );
    expect(resolveApiMessageWithTranslator("Field amount is incorrect! (Example: 15.25)", translateFromRu)).toBe(
      "Введите корректное значение."
    );
    expect(resolveApiMessageWithTranslator("Field comment length should be less than 254!", translateFromRu)).toBe(
      "Значение слишком длинное. Максимум: 254."
    );
  });

  it("localizes Laravel validation bag messages used in billing flows", () => {
    expect(resolveApiMessageWithTranslator("The selected payment detail id is invalid.", translateFromRu)).toBe(
      "Выбранное значение недоступно."
    );
    expect(resolveApiMessageWithTranslator("The amount field must be greater than 0.", translateFromRu)).toBe(
      "Введите сумму больше 0."
    );
    expect(
      resolveApiMessageWithTranslator("The comment field may not be greater than 5000 characters.", translateFromRu)
    ).toBe("Значение слишком длинное. Максимум: 5000.");
  });
});
