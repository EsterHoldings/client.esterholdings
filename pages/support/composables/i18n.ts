const normalizeSupportStatus = (status: unknown): string =>
  String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const SUPPORT_STATUS_TRANSLATION_MAP: Record<string, { key: string; fallback: string }> = {
  open: {
    key: "support.statuses.open",
    fallback: "Open",
  },
  in_progress: {
    key: "support.statuses.inProgress",
    fallback: "In progress",
  },
  pending: {
    key: "support.statuses.pending",
    fallback: "Pending",
  },
  active: {
    key: "support.statuses.active",
    fallback: "Active",
  },
  closed: {
    key: "support.statuses.closed",
    fallback: "Closed",
  },
  resolved: {
    key: "support.statuses.resolved",
    fallback: "Resolved",
  },
  cancelled: {
    key: "support.statuses.cancelled",
    fallback: "Cancelled",
  },
  rejected: {
    key: "support.statuses.rejected",
    fallback: "Rejected",
  },
  archived: {
    key: "support.statuses.archived",
    fallback: "Archived",
  },
};

type SupportTranslator = (key: string, fallback: string) => string;

export const translateSupportStatus = (status: unknown, translate: SupportTranslator): string => {
  const normalizedStatus = normalizeSupportStatus(status);
  if (!normalizedStatus) {
    return "";
  }

  const translation = SUPPORT_STATUS_TRANSLATION_MAP[normalizedStatus];
  if (!translation) {
    return String(status ?? "").trim();
  }

  return translate(translation.key, translation.fallback);
};

export const getSupportStatusDotClass = (status: unknown): string => {
  const normalizedStatus = normalizeSupportStatus(status);

  if (["open", "in_progress", "pending", "active"].includes(normalizedStatus)) {
    return "bg-[var(--ui-sticker-success)]";
  }

  if (["closed", "resolved", "cancelled", "rejected", "archived"].includes(normalizedStatus)) {
    return "bg-[var(--ui-sticker-danger)]";
  }

  return "bg-[var(--ui-text-secondary)]";
};
