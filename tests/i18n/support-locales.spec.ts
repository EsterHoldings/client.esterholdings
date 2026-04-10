import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT_DIR = process.cwd();
const LOCALES_DIR = path.join(ROOT_DIR, "i18n", "locales");

const SUPPORT_SOURCE_FILES = [
  "pages/support/index.vue",
  "pages/support/[id]/index.vue",
  "pages/support/components/TicketsCreateNew.vue",
  "pages/support/components/SupportSimpleRequestForm.vue",
  "pages/support/composables/i18n.ts",
  "components/block/chats/ChatDefault.vue",
];

const SOURCE_KEY_PATTERN = /["'`](support\.[^"'`]+|cabinet\.(?:accounts|billing)\.[^"'`]+)["'`]/g;

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

const supportTranslationKeys = Array.from(
  new Set(
    SUPPORT_SOURCE_FILES.flatMap(file => {
      const absolutePath = path.join(ROOT_DIR, file);
      const source = fs.readFileSync(absolutePath, "utf8");

      return Array.from(source.matchAll(SOURCE_KEY_PATTERN), match => match[1]).filter(
        key => !key.includes("${") && key !== "support.global"
      );
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

describe("support locale coverage", () => {
  it("contains every support-related translation key in all locales", () => {
    const missingEntries: string[] = [];

    for (const key of supportTranslationKeys) {
      for (const localeCode of localeCodes) {
        if (getByPath(localeDictionaries[localeCode], key) === undefined) {
          missingEntries.push(`${localeCode}:${key}`);
        }
      }
    }

    expect(missingEntries).toEqual([]);
  });

  it("contains localized support copy for list, detail, simple support and chat flows", () => {
    const requiredKeys = [
      "support.page.title",
      "support.page.newTicket",
      "support.page.counterparty",
      "support.page.online",
      "support.page.offline",
      "support.page.lastCreated",
      "support.page.lastUpdate",
      "support.page.copyIdAria",
      "support.page.openChatAria",
      "support.page.moreAria",
      "support.page.noMessagesYet",
      "support.page.attachment",
      "support.page.attachments",
      "support.page.systemEvent",
      "support.page.newMessage",
      "support.page.newTicketModalTitle",
      "support.chat.expandDetailsAria",
      "support.chat.today",
      "support.chat.yesterday",
      "support.chat.authorAvatarAlt",
      "support.chat.myAvatarAlt",
      "support.chat.close",
      "support.simple.historyTitle",
      "support.simple.emptyHistory",
      "support.simple.emptyMessages",
      "support.simple.authorSupport",
      "support.simple.attachmentFallbackTitle",
      "support.simple.historyRefreshAria",
      "support.simple.loadingHistory",
      "support.simple.loadingMessages",
      "support.simple.noLastUpdate",
      "support.simple.noSubject",
      "support.simple.statusUnknown",
      "support.tickets.createFailed",
      "support.statuses.open",
      "support.statuses.inProgress",
      "support.statuses.pending",
      "support.statuses.active",
      "support.statuses.closed",
      "support.statuses.resolved",
      "support.statuses.cancelled",
      "support.statuses.rejected",
      "support.statuses.archived",
      "cabinet.accounts.pagination.prev",
      "cabinet.accounts.pagination.next",
      "cabinet.billing.view.list",
      "cabinet.billing.view.cards",
      "cabinet.billing.view.full",
    ];

    for (const localeCode of localeCodes) {
      for (const key of requiredKeys) {
        expect(getByPath(localeDictionaries[localeCode], key)).toBeTypeOf("string");
      }
    }
  });
});
