import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT_DIR = process.cwd();
const LOCALES_DIR = path.join(ROOT_DIR, "i18n", "locales");
const SOURCE_FILE = path.join(ROOT_DIR, "pages/aml/index.vue");
const SOURCE_KEY_PATTERN = /["'`](cabinet\.aml\.[^"'`]+)["'`]/g;

const localeCodes = fs
  .readdirSync(LOCALES_DIR)
  .filter(fileName => fileName.endsWith(".json"))
  .map(fileName => path.basename(fileName, ".json"))
  .sort();

const localeDictionaries = Object.fromEntries(
  localeCodes.map(code => [code, JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, `${code}.json`), "utf8"))])
) as Record<string, Record<string, unknown>>;

const amlTranslationKeys = Array.from(
  new Set(
    Array.from(fs.readFileSync(SOURCE_FILE, "utf8").matchAll(SOURCE_KEY_PATTERN), match => match[1]).filter(
      key => !key.includes("${")
    )
  )
).sort();

const getByPath = (object: Record<string, unknown>, key: string): unknown =>
  key.split(".").reduce<unknown>((value, segment) => {
    if (!value || typeof value !== "object") {
      return undefined;
    }

    return (value as Record<string, unknown>)[segment];
  }, object);

describe("AML locale coverage", () => {
  it("contains every AML translation key in all locales", () => {
    const missingEntries: string[] = [];

    for (const key of amlTranslationKeys) {
      for (const localeCode of localeCodes) {
        if (getByPath(localeDictionaries[localeCode], key) === undefined) {
          missingEntries.push(`${localeCode}:${key}`);
        }
      }
    }

    expect(missingEntries).toEqual([]);
  });
});
