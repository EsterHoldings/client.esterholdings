import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT_DIR = process.cwd();
const LOCALES_DIR = path.join(ROOT_DIR, "i18n", "locales");
const EN_LOCALE = JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, "en.json"), "utf8")) as Record<string, unknown>;

const localeCodes = fs
  .readdirSync(LOCALES_DIR)
  .filter(fileName => fileName.endsWith(".json"))
  .map(fileName => path.basename(fileName, ".json"))
  .filter(code => code !== "en")
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

describe("cabinet non-english locale quality", () => {
  it("keeps high-visibility cabinet shell strings translated in non-english locales", () => {
    const keys = [
      "cabinet.menu.payment_details",
      "cabinet.menu.billing",
      "cabinet.menu.settings",
      "cabinet.header.markAllRead",
      "cabinet.header.emptyNotifications",
      "cabinet.header.accountSettings",
      "cabinet.header.helpCenter",
      "cabinet.header.logout",
      "cabinet.dashboard.summary.totalAmount",
      "cabinet.dashboard.summary.referralTotalAmount",
      "cabinet.dashboard.mt4.title",
      "cabinet.dashboard.transactions.title",
      "cabinet.dashboard.transactions.searchPlaceholder",
      "cabinet.profile.components.tab-user-photo.buttons.delete_aria",
    ];

    for (const key of keys) {
      const enValue = getByPath(EN_LOCALE, key);
      expect(enValue).toBeTypeOf("string");

      for (const localeCode of localeCodes) {
        const localValue = getByPath(localeDictionaries[localeCode], key);
        expect(localValue).toBeTypeOf("string");
        expect(localValue).not.toEqual(enValue);
      }
    }
  });
});
