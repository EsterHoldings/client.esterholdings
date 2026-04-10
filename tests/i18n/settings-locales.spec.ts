import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT_DIR = process.cwd();
const LOCALES_DIR = path.join(ROOT_DIR, "i18n", "locales");

const SETTINGS_SOURCE_FILES = ["pages/settings/index.vue"];
const SOURCE_KEY_PATTERN = /["'`](cabinet\.settings\.[^"'`]+)["'`]/g;

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

const settingsTranslationKeys = Array.from(
  new Set(
    SETTINGS_SOURCE_FILES.flatMap(file => {
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

describe("settings locale coverage", () => {
  it("contains every settings-related translation key in all locales", () => {
    const missingEntries: string[] = [];

    for (const key of settingsTranslationKeys) {
      for (const localeCode of localeCodes) {
        if (getByPath(localeDictionaries[localeCode], key) === undefined) {
          missingEntries.push(`${localeCode}:${key}`);
        }
      }
    }

    expect(missingEntries).toEqual([]);
  });

  it("contains localized placeholder copy for settings page", () => {
    const requiredKeys = [
      "cabinet.settings.title",
      "cabinet.settings.comingSoonTitle",
      "cabinet.settings.comingSoonDescription",
    ];

    for (const localeCode of localeCodes) {
      for (const key of requiredKeys) {
        expect(getByPath(localeDictionaries[localeCode], key)).toBeTypeOf("string");
      }
    }
  });
});
