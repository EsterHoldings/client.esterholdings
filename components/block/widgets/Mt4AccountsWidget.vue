<template>
  <div class="mt4-widget flex flex-col gap-4 text-[var(--ui-text-main)]">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div class="text-[18px] font-semibold">
        {{ t("cabinet.dashboard.mt4.title") }}
      </div>
      <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        <NuxtLink :to="profileAccountsLink" class="w-full sm:w-auto">
          <UiButtonDefault state="primary" class="w-full sm:w-auto">
            {{ t("cabinet.dashboard.mt4.openNewAccount") }}
          </UiButtonDefault>
        </NuxtLink>
      </div>
    </div>

    <div class="relative">
      <div v-if="isLoading" class="grid grid-cols-1 gap-2">
        <div v-for="idx in 3" :key="idx" class="verification-item mt4-card mt4-grid animate-pulse">
          <div class="mt4-star h-8 w-8 rounded-md bg-[var(--color-stroke-ui-light)]"></div>
          <div class="mt4-type space-y-2">
            <div class="h-3 w-24 rounded bg-[var(--color-stroke-ui-light)]"></div>
            <div class="h-4 w-28 rounded bg-[var(--color-stroke-ui-light)]"></div>
            <div class="h-3 w-20 rounded bg-[var(--color-stroke-ui-light)]"></div>
          </div>
          <div class="mt4-account space-y-2">
            <div class="h-3 w-16 rounded bg-[var(--color-stroke-ui-light)]"></div>
            <div class="h-4 w-24 rounded bg-[var(--color-stroke-ui-light)]"></div>
          </div>
          <div class="mt4-balance space-y-2">
            <div class="h-3 w-16 rounded bg-[var(--color-stroke-ui-light)]"></div>
            <div class="h-4 w-28 rounded bg-[var(--color-stroke-ui-light)]"></div>
          </div>
          <div class="mt4-badge h-6 w-16 rounded bg-[var(--color-stroke-ui-light)]"></div>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 gap-2">
        <div
          v-for="account in visibleAccounts"
          :key="account.id"
          class="verification-item mt4-card mt4-grid"
        >
          <button
            class="mt4-star flex h-8 w-8 items-center justify-center rounded-md transition text-[var(--ui-text-secondary)]"
            type="button"
            :aria-pressed="account.is_favorite"
            :title="account.is_favorite ? 'Remove from favorites' : 'Add to favorites'"
            @click.stop="emit('toggle-favorite', account.id)"
          >
            <svg
              viewBox="0 0 24 24"
              class="h-4 w-4"
              :fill="account.is_favorite ? 'var(--ui-primary-accent)' : 'none'"
              :stroke="account.is_favorite ? 'var(--ui-primary-accent)' : 'var(--ui-text-secondary)'"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </button>
          <div class="mt4-type min-w-0 text-[var(--ui-text-main)]">
            <UiTextSmall class="text-[var(--ui-text-secondary)]">
              {{ t("cabinet.dashboard.mt4.table.type") }}
            </UiTextSmall>
            <div class="truncate font-semibold">{{ account.type }}</div>
            <UiTextSmall class="text-[var(--ui-text-secondary)] truncate">
              {{ t("cabinet.accounts.columns.leverage") }}: {{ account.leverage }}
            </UiTextSmall>
          </div>
          <div class="mt4-account min-w-0 text-[var(--ui-text-main)]">
            <UiTextSmall class="text-[var(--ui-text-secondary)]">
              {{ t("cabinet.dashboard.mt4.table.account") }}
            </UiTextSmall>
            <UiTextSmall class="text-[var(--ui-text-main)] font-semibold truncate">
              MT4 {{ account.id }}
            </UiTextSmall>
          </div>
          <div class="mt4-balance min-w-0 text-[var(--ui-text-main)]">
            <UiTextSmall class="text-[var(--ui-text-secondary)]">
              {{ t("cabinet.dashboard.mt4.table.balance") }}
            </UiTextSmall>
            <div class="truncate font-semibold">
              {{ account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
              {{ account.currency }}
            </div>
          </div>
          <UiBadge :state="mt4BadgeState(account.status)" outline class="mt4-badge border text-xs !px-3 !py-1 bg-[var(--color-stroke-ui-dark)]">
            {{ statusText[account.status]() }}
          </UiBadge>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import { useLocalePath } from "~/.nuxt/imports";

import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiBadge from "~/components/ui/UiBadge.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";

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

const props = defineProps<{
  accounts: Mt4Account[];
  isLoading?: boolean;
}>();

const { isLoading } = toRefs(props);

const emit = defineEmits<{
  (event: "toggle-favorite", id: string): void;
}>();

const { t } = useI18n({ useScope: "global" });
const localePath = useLocalePath();

const profileAccountsLink = computed(() => localePath("/accounts"));

const statusText = {
  active: () => t("cabinet.dashboard.mt4.table.active"),
  inactive: () => t("cabinet.dashboard.mt4.table.inactive"),
};

const mt4BadgeState = (status: Mt4Status) => {
  return status === "active" ? "success" : "warning";
};

const visibleAccounts = computed(() => {
  const accounts = Array.isArray(props.accounts) ? props.accounts : [];
  const favorites = accounts
    .filter((account) => account.is_favorite)
    .sort((a, b) => b.balance - a.balance);
  const remaining = accounts
    .filter((account) => !account.is_favorite)
    .sort((a, b) => b.balance - a.balance);

  return [...favorites, ...remaining].slice(0, 3);
});
</script>

<style scoped>
.mt4-card {
  background: transparent;
  border-radius: 8px;
  padding: 12px;
  transition: background-color 0.2s ease, opacity 0.2s ease;
}

.mt4-card:hover {
  background: var(--ui-background-card);
  opacity: 0.95;
}

.mt4-grid {
  display: grid;
  grid-template-columns: 44px repeat(3, minmax(0, 1fr)) minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  grid-template-areas: "star type account balance badge";
}

.mt4-grid > * {
  min-width: 0;
}

.mt4-star {
  grid-area: star;
}
.mt4-star:hover {
  background: var(--ui-background-card);
}
.mt4-type {
  grid-area: type;
}
.mt4-account {
  grid-area: account;
}
.mt4-balance {
  grid-area: balance;
}
.mt4-badge {
  grid-area: badge;
  justify-self: end;
}

.verification-item {
  border-radius: 12px;
  background: var(--ui-background-panel);
  border: 1px solid var(--color-stroke-ui-light);
  padding: 14px 16px;
  transition: background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
}

.verification-item:hover {
  background: var(--ui-background-card);
  border-color: var(--color-stroke-ui-light);
}

@media (max-width: 767px) {
  .mt4-grid {
    grid-template-columns: 44px 1fr 1fr;
    grid-template-areas:
      "star type badge"
      "star account badge"
      "star balance badge";
    gap: 10px 12px;
    align-items: start;
  }
}
</style>
