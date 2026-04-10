import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT_DIR = process.cwd();
const LOCALES_DIR = path.join(ROOT_DIR, "i18n", "locales");

const REFERRAL_SOURCE_FILES = [
  "pages/referrals/index.vue",
  "pages/referrals/components/TabGeneral.vue",
  "pages/referrals/components/TabTerms.vue",
  "pages/referrals/components/TabSettings.vue",
  "pages/referrals/components/YourLevelProgress.vue",
];

const SOURCE_KEY_PATTERN = /["'`](cabinet\.referrals\.[^"'`]+)["'`]/g;

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

const referralTranslationKeys = Array.from(
  new Set(
    REFERRAL_SOURCE_FILES.flatMap(file => {
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

describe("referrals locale coverage", () => {
  it("contains every referrals-related translation key in all locales", () => {
    const missingEntries: string[] = [];

    for (const key of referralTranslationKeys) {
      for (const localeCode of localeCodes) {
        if (getByPath(localeDictionaries[localeCode], key) === undefined) {
          missingEntries.push(`${localeCode}:${key}`);
        }
      }
    }

    expect(missingEntries).toEqual([]);
  });

  it("contains localized copy for referrals placeholder, general and terms flows", () => {
    const requiredKeys = [
      "cabinet.referrals.placeholder.label",
      "cabinet.referrals.placeholder.title",
      "cabinet.referrals.placeholder.description",
      "cabinet.referrals.general.shareMailSubject",
      "cabinet.referrals.general.yourLevel",
      "cabinet.referrals.general.pointsProgress",
      "cabinet.referrals.general.account.title",
      "cabinet.referrals.general.levelsTitle",
      "cabinet.referrals.general.earningsChartTitle",
      "cabinet.referrals.settings.title",
      "cabinet.referrals.terms.gamification.title",
      "cabinet.referrals.terms.coreElementsTitle",
      "cabinet.referrals.terms.careerTitle",
      "cabinet.referrals.terms.network.title",
      "cabinet.referrals.terms.xpActionsTitle",
      "cabinet.referrals.terms.missionsTitle",
      "cabinet.referrals.terms.badgesTitle",
      "cabinet.referrals.terms.ratingsTitle",
      "cabinet.referrals.terms.seasonalTitle",
      "cabinet.referrals.terms.summary.title",
    ];

    for (const localeCode of localeCodes) {
      for (const key of requiredKeys) {
        expect(getByPath(localeDictionaries[localeCode], key)).toBeTypeOf("string");
      }
    }
  });
});
