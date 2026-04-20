import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT_DIR = process.cwd();
const LOCALES_DIR = path.join(ROOT_DIR, "i18n", "locales");

const PAYMENT_SOURCE_FILES = [
  "pages/payments/index.vue",
  "pages/payments/[id]/index.vue",
  "pages/payments/create/index.vue",
  "pages/payments/create/components/TabDepositFormBTC.vue",
  "pages/payments/create/components/TabDepositFormUsdtErc20.vue",
  "pages/payments/create/components/TabDepositFormUsdtTrc20.vue",
  "pages/payments/create/components/TabWithdrawalForm.vue",
];

const SOURCE_KEY_PATTERN = /["'`](cabinet\.(?:billing|accounts|dashboard|common|header)\.[^"'`]+)["'`]/g;

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

const paymentTranslationKeys = Array.from(
  new Set(
    PAYMENT_SOURCE_FILES.flatMap(file => {
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

describe("payments locale coverage", () => {
  it("contains every payments-related translation key in all locales", () => {
    const missingEntries: string[] = [];

    for (const key of paymentTranslationKeys) {
      for (const localeCode of localeCodes) {
        if (getByPath(localeDictionaries[localeCode], key) === undefined) {
          missingEntries.push(`${localeCode}:${key}`);
        }
      }
    }

    expect(missingEntries).toEqual([]);
  });

  it("contains localized billing copy for list, detail and create-payment flows", () => {
    const requiredKeys = [
      "cabinet.billing.emptyTitle",
      "cabinet.billing.emptySubtitle",
      "cabinet.billing.listLoadError",
      "cabinet.billing.gateway",
      "cabinet.billing.transferFrom",
      "cabinet.billing.transferTo",
      "cabinet.billing.columns.accountNumberShort",
      "cabinet.billing.columns.paymentSystemShort",
      "cabinet.billing.createFlow.selectMethod",
      "cabinet.billing.createFlow.loadPaymentSystemsError",
      "cabinet.billing.depositForm.account",
      "cabinet.billing.depositForm.amount",
      "cabinet.billing.depositForm.amountPlaceholder",
      "cabinet.billing.depositForm.minimumAmount",
      "cabinet.billing.depositForm.comment",
      "cabinet.billing.depositForm.commentPlaceholder",
      "cabinet.billing.depositForm.submit",
      "cabinet.billing.depositForm.processing",
      "cabinet.billing.depositForm.created",
      "cabinet.billing.depositForm.error",
      "cabinet.billing.depositForm.loadAccountsError",
      "cabinet.billing.withdrawalForm.loadAccountsError",
      "cabinet.billing.withdrawalForm.loadPaymentDetailsError",
      "cabinet.common.id",
      "cabinet.common.close",
    ];

    for (const localeCode of localeCodes) {
      for (const key of requiredKeys) {
        expect(getByPath(localeDictionaries[localeCode], key)).toBeTypeOf("string");
      }
    }
  });
});
