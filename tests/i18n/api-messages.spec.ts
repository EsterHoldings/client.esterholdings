import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import {
  extractApiErrorMessageWithTranslator,
  localizeApiErrorsWithTranslator,
  resolveApiMessageWithTranslator,
} from "~/composables/useApiMessages";

const ROOT_DIR = process.cwd();
const RU_LOCALE = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "i18n", "locales", "ru.json"), "utf8")) as Record<
  string,
  unknown
>;

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
