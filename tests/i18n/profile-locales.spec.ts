import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT_DIR = process.cwd();
const LOCALES_DIR = path.join(ROOT_DIR, "i18n", "locales");

const PROFILE_SOURCE_FILES = [
  "pages/profile/index.vue",
  "pages/profile/components/TabGeneral.vue",
  "pages/profile/components/TabChangePassword.vue",
  "pages/profile/components/TabUserDocuments.vue",
  "pages/profile/components/TabUserDocumentsDocument.vue",
  "pages/profile/components/TabUserPhoto.vue",
  "pages/profile/components/TabUserVerification.vue",
  "components/block/uploaders/UserPhotoUploader.vue",
];

const SOURCE_KEY_PATTERN = /["'`](cabinet\.profile\.[^"'`]+)["'`]/g;

const localeCodes = fs
  .readdirSync(LOCALES_DIR)
  .filter(fileName => fileName.endsWith(".json"))
  .map(fileName => path.basename(fileName, ".json"))
  .sort();

const localeDictionaries = Object.fromEntries(
  localeCodes.map(code => [code, JSON.parse(fs.readFileSync(path.join(LOCALES_DIR, `${code}.json`), "utf8"))])
) as Record<string, Record<string, unknown>>;

const profileTranslationKeys = Array.from(
  new Set(
    PROFILE_SOURCE_FILES.flatMap(file => {
      const source = fs.readFileSync(path.join(ROOT_DIR, file), "utf8");
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

describe("profile locale coverage", () => {
  it("contains every profile translation key in all locales", () => {
    const missingEntries: string[] = [];

    for (const key of profileTranslationKeys) {
      for (const localeCode of localeCodes) {
        if (getByPath(localeDictionaries[localeCode], key) === undefined) {
          missingEntries.push(`${localeCode}:${key}`);
        }
      }
    }

    expect(missingEntries).toEqual([]);
  });

  it("contains localized copy for profile documents, security, photo and verification flows", () => {
    const requiredKeys = [
      "cabinet.profile.components.tab-general.validationError",
      "cabinet.profile.components.tab-general.serverError",
      "cabinet.profile.components.tab-user-photo.buttons.delete_aria",
      "cabinet.profile.components.tab-user-photo.hints.formats",
      "cabinet.profile.components.tab-user-photo.hints.maxSize",
      "cabinet.profile.components.tab-user-photo.verification.title",
      "cabinet.profile.components.tab-user-photo.verification.approved",
      "cabinet.profile.components.tab-user-documents.title",
      "cabinet.profile.components.tab-user-documents.allDocuments",
      "cabinet.profile.components.tab-user-documents.empty",
      "cabinet.profile.components.tab-user-documents.documentLabel",
      "cabinet.profile.components.tab-user-documents.refreshAria",
      "cabinet.profile.components.tab-user-documents.commentLabel",
      "cabinet.profile.components.tab-user-documents.fields.documentNamePlaceholder",
      "cabinet.profile.components.tab-user-documents.validation.maxLength",
      "cabinet.profile.components.tab-user-documents.progress.label",
      "cabinet.profile.components.tab-user-documents.verificationStatus.title",
      "cabinet.profile.components.tab-user-documents.columns.name",
      "cabinet.profile.components.tab-user-documents.columns.status",
      "cabinet.profile.components.tab-user-documents.columns.date",
      "cabinet.profile.components.tab-user-documents.actions.delete",
      "cabinet.profile.components.tab-user-documents.statuses.pending",
      "cabinet.profile.components.tab-user-documents.statuses.approved",
      "cabinet.profile.components.tab-user-documents.statuses.rejected",
      "cabinet.profile.components.tab-user-documents.buttons.uploading",
      "cabinet.profile.components.tab-user-documents.buttons.uploadAndSend",
      "cabinet.profile.components.tab-user-documents.messages.saveSuccess",
      "cabinet.profile.components.tab-user-documents.messages.saveError",
      "cabinet.profile.components.tab-user-documents.errors.invalidFormat",
      "cabinet.profile.components.tab-user-documents.errors.noFiles",
      "cabinet.profile.components.tab-user-documents.errors.uploadOneFailed",
      "cabinet.profile.components.tab-user-verification.sections.client",
      "cabinet.profile.components.tab-user-verification.sections.payout",
      "cabinet.profile.components.tab-user-verification.titles.clientStatus",
      "cabinet.profile.components.tab-user-verification.titles.payoutStatus",
      "cabinet.profile.components.tab-user-verification.titles.history",
      "cabinet.profile.components.tab-user-verification.refreshAria",
      "cabinet.profile.components.tab-user-verification.commentLabel",
      "cabinet.profile.components.tab-user-verification.emptyPayout",
      "cabinet.profile.components.tab-user-verification.unnamedPaymentDetail",
      "cabinet.profile.components.tab-user-verification.paymentSystemFallback",
      "cabinet.profile.components.tab-user-verification.documentsCount",
      "cabinet.profile.components.tab-user-verification.historyEmpty",
      "cabinet.profile.components.tab-user-verification.columns.name",
      "cabinet.profile.components.tab-user-verification.columns.date",
      "cabinet.profile.components.tab-user-verification.columns.status",
      "cabinet.profile.components.tab-user-verification.items.email.title",
      "cabinet.profile.components.tab-user-verification.items.email.subtitle",
      "cabinet.profile.components.tab-user-verification.items.documents.title",
      "cabinet.profile.components.tab-user-verification.items.deposit.title",
      "cabinet.profile.components.tab-user-verification.items.deposit.subtitle",
      "cabinet.profile.components.tab-user-verification.items.profile.title",
      "cabinet.profile.components.tab-user-verification.statuses.approved",
      "cabinet.profile.components.tab-user-verification.statuses.pending",
      "cabinet.profile.components.tab-user-verification.statuses.rejected",
    ];

    for (const localeCode of localeCodes) {
      for (const key of requiredKeys) {
        expect(getByPath(localeDictionaries[localeCode], key)).toBeTypeOf("string");
      }
    }
  });
});
