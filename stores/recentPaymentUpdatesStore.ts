import { defineStore } from "pinia";
import { ref } from "vue";

type RecentPaymentUpdate = {
  paymentId: string;
  status: string;
  amount: string;
  updatedAt: string;
  timestamp: number;
  consumedScopes: string[];
};

type RegisterPaymentUpdateInput = {
  paymentId: string | number | null | undefined;
  status?: string | null | undefined;
  amount?: string | number | null | undefined;
  updatedAt?: string | null | undefined;
};

const STORAGE_KEY = "recent-payment-updates:v1";
const UPDATE_TTL_MS = 30 * 60 * 1000;
const DUPLICATE_WINDOW_MS = 15 * 1000;
const MAX_STORED_UPDATES = 50;

const normalizeString = (value: unknown): string => String(value ?? "").trim();

const normalizeTimestamp = (value: unknown): number => {
  const timestamp = new Date(normalizeString(value)).getTime();
  return Number.isFinite(timestamp) ? timestamp : Date.now();
};

const normalizeConsumedScopes = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(new Set(value.map(item => normalizeString(item)).filter(Boolean)));
};

const normalizeUpdateRecord = (paymentId: string, value: any): RecentPaymentUpdate => ({
  paymentId,
  status: normalizeString(value?.status),
  amount: normalizeString(value?.amount),
  updatedAt: normalizeString(value?.updatedAt),
  timestamp: normalizeTimestamp(value?.updatedAt || value?.timestamp),
  consumedScopes: normalizeConsumedScopes(value?.consumedScopes),
});

export const useRecentPaymentUpdatesStore = defineStore("recentPaymentUpdates", () => {
  const updates = ref<Record<string, RecentPaymentUpdate>>({});
  const isHydrated = ref(false);

  const persist = () => {
    if (!process.client) {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updates.value));
  };

  const pruneExpired = () => {
    const now = Date.now();
    const nextEntries = Object.entries(updates.value).filter(([, item]) => now - item.timestamp <= UPDATE_TTL_MS);

    if (nextEntries.length <= MAX_STORED_UPDATES) {
      updates.value = Object.fromEntries(nextEntries);
      return;
    }

    const trimmed = nextEntries
      .sort(([, left], [, right]) => right.timestamp - left.timestamp)
      .slice(0, MAX_STORED_UPDATES);

    updates.value = Object.fromEntries(trimmed);
  };

  const ensureHydrated = () => {
    if (!process.client || isHydrated.value) {
      pruneExpired();
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        updates.value = {};
      } else {
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const nextUpdates: Record<string, RecentPaymentUpdate> = {};

        Object.entries(parsed ?? {}).forEach(([paymentId, value]) => {
          const normalizedPaymentId = normalizeString(paymentId);
          if (normalizedPaymentId === "") {
            return;
          }

          nextUpdates[normalizedPaymentId] = normalizeUpdateRecord(normalizedPaymentId, value);
        });

        updates.value = nextUpdates;
      }
    } catch {
      updates.value = {};
    } finally {
      isHydrated.value = true;
      pruneExpired();
      persist();
    }
  };

  const registerUpdate = (input: RegisterPaymentUpdateInput) => {
    ensureHydrated();

    const paymentId = normalizeString(input.paymentId);
    if (paymentId === "") {
      return;
    }

    const status = normalizeString(input.status);
    const amount = normalizeString(input.amount);
    const updatedAt = normalizeString(input.updatedAt);
    const timestamp = normalizeTimestamp(updatedAt);
    const existing = updates.value[paymentId];
    const isDuplicateUpdate =
      !!existing &&
      existing.status === status &&
      existing.amount === amount &&
      Math.abs(existing.timestamp - timestamp) <= DUPLICATE_WINDOW_MS;

    updates.value = {
      ...updates.value,
      [paymentId]: {
        paymentId,
        status,
        amount,
        updatedAt,
        timestamp: existing ? Math.max(existing.timestamp, timestamp) : timestamp,
        consumedScopes: isDuplicateUpdate ? existing.consumedScopes : [],
      },
    };

    pruneExpired();
    persist();
  };

  const takeMatchesForScope = (scope: string, paymentIds: Array<string | number | null | undefined>): string[] => {
    ensureHydrated();

    const normalizedScope = normalizeString(scope);
    if (normalizedScope === "") {
      return [];
    }

    const matches = Array.from(new Set(paymentIds.map(item => normalizeString(item)).filter(Boolean))).filter(
      paymentId => {
        const item = updates.value[paymentId];
        return !!item && !item.consumedScopes.includes(normalizedScope);
      }
    );

    if (matches.length === 0) {
      return [];
    }

    matches.forEach(paymentId => {
      const item = updates.value[paymentId];
      if (!item) {
        return;
      }

      updates.value[paymentId] = {
        ...item,
        consumedScopes: Array.from(new Set([...item.consumedScopes, normalizedScope])),
      };
    });

    persist();

    return matches;
  };

  const getPendingTimestampForScope = (scope: string, paymentId: string | number | null | undefined): number | null => {
    ensureHydrated();

    const normalizedScope = normalizeString(scope);
    const normalizedPaymentId = normalizeString(paymentId);
    if (normalizedScope === "" || normalizedPaymentId === "") {
      return null;
    }

    const item = updates.value[normalizedPaymentId];
    if (!item || item.consumedScopes.includes(normalizedScope)) {
      return null;
    }

    return item.timestamp;
  };

  const clear = () => {
    updates.value = {};
    isHydrated.value = true;

    if (!process.client) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    clear,
    getPendingTimestampForScope,
    registerUpdate,
    takeMatchesForScope,
    updates,
  };
});

export default useRecentPaymentUpdatesStore;
