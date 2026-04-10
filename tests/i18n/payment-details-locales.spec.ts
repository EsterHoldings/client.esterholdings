import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT_DIR = process.cwd();
const LOCALES_DIR = path.join(ROOT_DIR, "i18n", "locales");

const PAYMENT_DETAILS_SOURCE_FILES = [
  "pages/payments/details/index.vue",
  "pages/payments/details/[id]/index.vue",
  "pages/payments/details/components/PaymentDetailsCreateNew.vue",
];

const SOURCE_KEY_PATTERN = /["'`](cabinet\.(?:payments|dashboard|accounts|common|header)\.[^"'`]+)["'`]/g;

const localeCodes = fs
  .readdirSync(LOCALES_DIR)
  .filter(fileName => fileName.endsWith(".json"))
  .map(fileName => path.basename(fileName, ".json"))
  .sort();

const localeDictionaries = Object.fromEntries(
  localeCodes.map(code => {
    const filePath = path.join(LOCALES_DIR, `${code}.json`);
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return [code, parsed];
  })
) as Record<string, Record<string, unknown>>;

const paymentDetailsTranslationKeys = Array.from(
  new Set(
    PAYMENT_DETAILS_SOURCE_FILES.flatMap(file => {
      const absolutePath = path.join(ROOT_DIR, file);
      const source = fs.readFileSync(absolutePath, "utf8");
      return Array.from(source.matchAll(SOURCE_KEY_PATTERN), match => match[1]).filter(key => !key.includes("${"));
    })
  )
).sort();

const getByPath = (object: Record<string, unknown>, key: string): unknown =>
  key.split(".").reduce<unknown>((value, segment) => {
    if (!value || typeof value !== "object") {
      return undefined;
    }

    return (value as Record<string, unknown>)[segment];
  }, object);

describe("payment details locale coverage", () => {
  it("contains every payment-details-related translation key in all locales", () => {
    const missingEntries: string[] = [];

    for (const key of paymentDetailsTranslationKeys) {
      for (const localeCode of localeCodes) {
        if (getByPath(localeDictionaries[localeCode], key) === undefined) {
          missingEntries.push(`${localeCode}:${key}`);
        }
      }
    }

    expect(missingEntries).toEqual([]);
  });

  it("contains localized copy for payment detail list, detail and create flows", () => {
    const requiredKeys = [
      "cabinet.payments.title",
      "cabinet.payments.details.columns.name",
      "cabinet.payments.details.columns.paymentSystem",
      "cabinet.payments.details.columns.status",
      "cabinet.payments.details.columns.updatedAt",
      "cabinet.payments.details.createNew.title",
      "cabinet.payments.details.createNew.paymentMethod",
      "cabinet.payments.details.createNew.documents.label",
      "cabinet.payments.details.createNew.documents.warningTitle",
      "cabinet.payments.details.createNew.documents.warningText",
      "cabinet.payments.details.createNew.documents.dropHint",
      "cabinet.payments.details.createNew.documents.uploadFailed",
      "cabinet.payments.details.createNew.createdSuccess",
      "cabinet.payments.details.createNew.updatedSuccess",
      "cabinet.payments.details.createNew.saveError",
      "cabinet.payments.details.detail.back",
      "cabinet.payments.details.detail.title",
      "cabinet.payments.details.detail.labels.paymentSystem",
      "cabinet.payments.details.detail.labels.adminComment",
      "cabinet.payments.details.detail.historyTitle",
      "cabinet.payments.details.detail.loadError",
      "cabinet.payments.details.detail.notFound",
      "cabinet.payments.details.documents.label",
      "cabinet.payments.details.relative.justNow",
      "cabinet.payments.details.statuses.pending",
    ];

    for (const localeCode of localeCodes) {
      for (const key of requiredKeys) {
        expect(getByPath(localeDictionaries[localeCode], key)).toBeTypeOf("string");
      }
    }
  });
});
