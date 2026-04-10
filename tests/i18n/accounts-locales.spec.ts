import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT_DIR = process.cwd();
const LOCALES_DIR = path.join(ROOT_DIR, "i18n", "locales");

const ACCOUNT_SOURCE_FILES = [
  "pages/accounts/index.vue",
  "pages/accounts/components/AccountsPanel.vue",
  "pages/accounts/components/AccountsCreateNew.vue",
  "pages/accounts/[id]/index.vue",
  "pages/accounts/[id]/components/TabGeneral.vue",
  "pages/accounts/[id]/components/TabHistory.vue",
  "pages/accounts/[id]/components/TabTradeHistory.vue",
  "components/block/modals/AccountsTransferModal.vue",
];

const SOURCE_KEY_PATTERN = /["'`](cabinet\.(?:accounts|common|dashboard|billing)\.[^"'`]+)["'`]/g;

const localeCodes = ["ru", "uk", "en"] as const;

const localeDictionaries = Object.fromEntries(
  localeCodes.map(code => {
    const filePath = path.join(LOCALES_DIR, `${code}.json`);
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return [code, parsed];
  })
) as Record<(typeof localeCodes)[number], Record<string, unknown>>;

const accountTranslationKeys = Array.from(
  new Set(
    ACCOUNT_SOURCE_FILES.flatMap(file => {
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

describe("accounts locale coverage", () => {
  it("contains every accounts-related translation key in all locales", () => {
    const missingEntries: string[] = [];

    for (const key of accountTranslationKeys) {
      for (const localeCode of localeCodes) {
        if (getByPath(localeDictionaries[localeCode], key) === undefined) {
          missingEntries.push(`${localeCode}:${key}`);
        }
      }
    }

    expect(missingEntries).toEqual([]);
  });

  it("contains localized error-state copy for account flows", () => {
    const requiredKeys = [
      "cabinet.accounts.loadError",
      "cabinet.accounts.account.subtitle",
      "cabinet.accounts.account.loadError",
      "cabinet.accounts.emptyTitle",
      "cabinet.accounts.emptySubtitle",
      "cabinet.accounts.favoriteToggleError",
      "cabinet.accounts.accounts-form.loadTypesError",
      "cabinet.accounts.accounts-form.submitError",
      "cabinet.accounts.tradeHistory.error",
      "cabinet.accounts.tradeHistory.syncError",
      "cabinet.common.id",
    ];

    for (const localeCode of localeCodes) {
      for (const key of requiredKeys) {
        expect(getByPath(localeDictionaries[localeCode], key)).toBeTypeOf("string");
      }
    }
  });
});
