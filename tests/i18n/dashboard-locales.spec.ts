import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT_DIR = process.cwd();
const LOCALES_DIR = path.join(ROOT_DIR, "i18n", "locales");

const DASHBOARD_SOURCE_FILES = [
  "components/pages/CabinetDashboardPage.vue",
  "components/block/widgets/TransactionsWidget.vue",
  "components/block/widgets/Mt4AccountsWidget.vue",
  "components/block/widgets/AccountVerificationWidget.vue",
  "components/block/widgets/TotalAmountWidget.vue",
  "components/block/widgets/ReferralTotalAmount.vue",
];

const SOURCE_KEY_PATTERN = /["'`](cabinet\.(?:dashboard|accounts|common)\.[^"'`]+)["'`]/g;

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

const dashboardTranslationKeys = Array.from(
  new Set(
    DASHBOARD_SOURCE_FILES.flatMap(file => {
      const absolutePath = path.join(ROOT_DIR, file);
      const source = fs.readFileSync(absolutePath, "utf8");
      return Array.from(source.matchAll(SOURCE_KEY_PATTERN), match => match[1]);
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

describe("dashboard locale coverage", () => {
  it("contains every dashboard-related translation key in all locales", () => {
    const missingEntries: string[] = [];

    for (const key of dashboardTranslationKeys) {
      for (const localeCode of localeCodes) {
        if (getByPath(localeDictionaries[localeCode], key) === undefined) {
          missingEntries.push(`${localeCode}:${key}`);
        }
      }
    }

    expect(missingEntries).toEqual([]);
  });

  it("uses translated Ukrainian labels for MT4 account actions", () => {
    expect(getByPath(localeDictionaries.uk, "cabinet.accounts.actions.deposit")).toBe("Поповнити");
    expect(getByPath(localeDictionaries.uk, "cabinet.accounts.actions.withdraw")).toBe("Вивести");
    expect(getByPath(localeDictionaries.uk, "cabinet.accounts.actions.transfer")).toBe("Переказ");
    expect(getByPath(localeDictionaries.uk, "cabinet.accounts.actions.changeType")).toBe("Змінити тип");
    expect(getByPath(localeDictionaries.uk, "cabinet.accounts.actions.remove")).toBe("Видалити");
  });

  it("contains localized MT4 empty-state and verification CTA copy", () => {
    for (const localeCode of localeCodes) {
      expect(getByPath(localeDictionaries[localeCode], "cabinet.dashboard.mt4.emptyTitle")).toBeTypeOf("string");
      expect(getByPath(localeDictionaries[localeCode], "cabinet.dashboard.mt4.emptySubtitle")).toBeTypeOf("string");
      expect(getByPath(localeDictionaries[localeCode], "cabinet.dashboard.mt4.verifyTitle")).toBeTypeOf("string");
      expect(getByPath(localeDictionaries[localeCode], "cabinet.dashboard.mt4.verifySubtitle")).toBeTypeOf("string");
      expect(
        getByPath(localeDictionaries[localeCode], "cabinet.dashboard.accountVerification.goToVerification")
      ).toBeTypeOf("string");
      expect(getByPath(localeDictionaries[localeCode], "cabinet.dashboard.summary.totalAmount")).toBeTypeOf("string");
      expect(getByPath(localeDictionaries[localeCode], "cabinet.dashboard.summary.referralTotalAmount")).toBeTypeOf(
        "string"
      );
    }
  });
});
