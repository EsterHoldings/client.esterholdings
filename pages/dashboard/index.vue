<template>
  <UiContainer>
    <template v-if="isInitialLoading">
      <div class="flex min-h-[55vh] w-full flex-col items-center justify-center text-[var(--ui-text-main)]">
        <UiIconLogo class="mb-4 h-[44px] w-[44px]" />
        <UiIconSpinnerDefault class="h-[44px] w-[44px]" />
      </div>
    </template>
    <template v-else>
      <div class="text-[var(--ui-text-main)]">
        <div class="mb-6">
          <UiTextH4 class="text-[var(--ui-text-main)]">
            {{ t("cabinet.dashboard.title") }}
          </UiTextH4>
        </div>

        <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <!-- LEFT COLUMN: widgets + MT4 -->
        <div class="col-span-1 flex flex-col gap-5 text-[var(--ui-text-main)]">
          <!-- 4 widgets -->
          <div class="grid grid-cols-2 items-stretch gap-2">
            <NuxtLink :to="localePath('/accounts')" class="dashboard-widget-link">
              <TotalAmountWidget class="dashboard-widget-card" />
            </NuxtLink>
            <NuxtLink :to="localePath('/payments')" class="dashboard-widget-link">
              <PendingTransactionsWidget class="dashboard-widget-card" />
            </NuxtLink>
            <button
              type="button"
              class="dashboard-widget-link"
              @click="handleOpenNotifications"
            >
              <MissedNotificationsWidget class="dashboard-widget-card" />
            </button>
            <NuxtLink :to="localePath('/referrals')" class="dashboard-widget-link">
              <ReferralTotalAmount class="dashboard-widget-card" />
            </NuxtLink>
          </div>

          <Mt4AccountsWidget
            :accounts="mt4Accounts"
            :is-loading="isMt4Refreshing"
            @toggle-favorite="toggleFavorite"
            class="mt-4"
          />
        </div>

        <!-- RIGHT COLUMN: verification -->
        <div class="col-span-1 flex flex-col gap-3 text-[var(--ui-text-main)] mt-5 lg:mt-0">
          <AccountVerificationWidget />
        </div>

          <!-- FULL WIDTH: transactions -->
          <div class="col-span-1 lg:col-span-2">
            <TransactionsWidget />
          </div>
        </div>
      </div>
    </template>
  </UiContainer>
</template>

<script lang="ts" setup>
import { definePageMeta, useLocalePath } from "~/.nuxt/imports";
import { useI18n } from "vue-i18n";
import { onBeforeUnmount, onMounted, ref, nextTick } from "vue";
import { useNuxtApp } from "nuxt/app";

import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";

import TransactionsWidget from "~/components/block/widgets/TransactionsWidget.vue";
import TotalAmountWidget from "~/components/block/widgets/TotalAmountWidget.vue";
import PendingTransactionsWidget from "~/components/block/widgets/PendingTransactionsWidget.vue";
import MissedNotificationsWidget from "~/components/block/widgets/MissedNotificationsWidget.vue";
import ReferralTotalAmount from "~/components/block/widgets/ReferralTotalAmount.vue";
import AccountVerificationWidget from "~/components/block/widgets/AccountVerificationWidget.vue";
import Mt4AccountsWidget from "~/components/block/widgets/Mt4AccountsWidget.vue";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import { useUiStore } from "~/stores/uiStore";
import useAppCore from "~/composables/useAppCore";

definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });

const { t } = useI18n({ useScope: "global" });
const { $echo } = useNuxtApp();
const isInitialLoading = ref(true);
const localePath = useLocalePath();
const uiStore = useUiStore();
const appCore = useAppCore();
const refreshIntervalMs = 10000;
let mt4RefreshTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  // @ts-ignore
  const sub = (window as any).Echo?.channel("test") ?? $echo.channel("test");
  sub.listen(".Ping", (e: any) => {
    console.log("[TEST] Ping received:", e);
  });

  handleRefreshMt4();
  mt4RefreshTimer = setInterval(handleRefreshMt4, refreshIntervalMs);

  nextTick(() => {
    isInitialLoading.value = false;
  });
});

onBeforeUnmount(() => {
  try {
    // @ts-ignore
    $echo.leave("test");
  } catch {}
  if (mt4RefreshTimer) {
    clearInterval(mt4RefreshTimer);
  }
});

type Mt4Status = "active" | "inactive";

type Mt4Account = {
  id: string;
  type: string;
  leverage: string;
  currency: string;
  balance: number;
  status: Mt4Status;
  is_favorite: boolean;
  favorite_at?: string | null;
};

const mt4Accounts = ref<Mt4Account[]>([]);

const MAX_FAVORITES = 3;

const sortAccounts = (items: Mt4Account[]) =>
  [...items].sort((a, b) => {
    if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
    return (b.balance ?? 0) - (a.balance ?? 0);
  });

const applyFavoriteLimit = (items: Mt4Account[], selectedId: string) => {
  const favorites = items
    .filter((account) => account.is_favorite)
    .sort((a, b) => {
      const aTime = a.favorite_at ? new Date(a.favorite_at).getTime() : 0;
      const bTime = b.favorite_at ? new Date(b.favorite_at).getTime() : 0;
      return aTime - bTime;
    });
  if (favorites.length <= MAX_FAVORITES) return items;
  const toRemove = favorites.find((fav) => fav.id !== selectedId) ?? favorites[0];
  return items.map((account) =>
    account.id === toRemove.id ? { ...account, is_favorite: false, favorite_at: null } : account,
  );
};

const toggleFavorite = async (id: string) => {
  const current = mt4Accounts.value.find((account) => account.id === id);
  if (!current) return;
  const isAdding = !current.is_favorite;
  const now = new Date().toISOString();
  let optimistic = mt4Accounts.value.map((account) =>
    account.id === id
      ? { ...account, is_favorite: isAdding, favorite_at: isAdding ? now : null }
      : account,
  );
  if (isAdding) {
    optimistic = applyFavoriteLimit(optimistic, id);
  }
  mt4Accounts.value = sortAccounts(optimistic);

  try {
    const response = await appCore.accounts.toggleFavorite(id);
    const payload = response?.data?.data ?? {};
    const updated = payload.account;
    const removedId = payload.removed_favorite_id;
    if (updated?.id) {
      mt4Accounts.value = mt4Accounts.value.map((account) =>
        account.id === updated.id
          ? { ...account, is_favorite: !!updated.is_favorite, favorite_at: updated.favorite_at ?? null }
          : account,
      );
    }
    if (removedId) {
      mt4Accounts.value = mt4Accounts.value.map((account) =>
        account.id === removedId ? { ...account, is_favorite: false, favorite_at: null } : account,
      );
    }
    mt4Accounts.value = sortAccounts(mt4Accounts.value);
  } catch {
    handleRefreshMt4();
  }
};
const isMt4Refreshing = ref(false);

const handleRefreshMt4 = async () => {
  if (isMt4Refreshing.value) return;
  isMt4Refreshing.value = true;
  try {
    const response = await appCore.accounts.get({
      page: 1,
      perPage: 100,
      orderBy: "balance",
      orderDirection: "desc",
    });
    const items = response?.data?.data?.data ?? [];
    const mapped = items.map((account: any) => ({
      id: account.id,
      type: account.account_type?.name ?? account.accountType?.name ?? "-",
      leverage: account.leverage ?? "1:50",
      currency: account.currency ?? "USD",
      balance: Number(account.balance ?? 0),
      status: account.status ?? "active",
      is_favorite: !!account.is_favorite,
      favorite_at: account.favorite_at ?? null,
    }));
    mt4Accounts.value = sortAccounts(mapped);
  } finally {
    setTimeout(() => {
      isMt4Refreshing.value = false;
    }, 400);
  }
};

const handleOpenNotifications = () => {
  uiStore.openNotifications();
};

</script>

<style scoped>
.row-item {
  background: var(--color-stroke-ui-dark);
  border-bottom: 1px solid var(--color-stroke-ui-light);
  border-radius: 6px;
  padding: 12px;
  transition: opacity 0.2s ease;
}

.row-item:hover {
  opacity: 0.85;
}

.dashboard-widget-link {
  display: block;
  background: transparent;
  border: 0;
  padding: 0;
  text-align: left;
  width: 100%;
}

.dashboard-widget-link :deep(.dashboard-widget-card) {
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
}

.dashboard-widget-link:hover :deep(.dashboard-widget-card) {
  background: var(--ui-background-card);
  border-color: var(--color-stroke-ui-light);
  opacity: 0.95;
}

/* MT4 and verification styles moved into widgets */
</style>
