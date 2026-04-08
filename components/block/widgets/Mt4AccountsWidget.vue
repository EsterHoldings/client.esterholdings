<template>
  <div class="mt4-widget dashboard-side-widget text-[var(--ui-text-main)]">
    <div class="mt4-header-card">
      <div class="mt4-header-card__copy">
        <div class="mt4-header-card__title">
          {{ t("cabinet.dashboard.mt4.title") }}
        </div>
        <UiTextSmall class="mt4-header-card__description">
          {{ mt4Description }}
        </UiTextSmall>
      </div>
      <div class="mt4-header-card__actions">
        <NuxtLink
          v-if="canCreateAccount"
          :to="profileAccountsCreateLink"
          class="w-full sm:w-auto">
          <UiButtonDefault
            state="success--small"
            class="mt4-header-card__cta w-full sm:w-auto">
            {{ t("cabinet.dashboard.mt4.openNewAccount") }}
          </UiButtonDefault>
        </NuxtLink>
        <NuxtLink
          v-else
          :to="profileVerificationLink"
          class="w-full sm:w-auto">
          <UiButtonDefault
            state="info--outline"
            class="mt4-header-card__cta mt4-header-card__cta--outline w-full sm:w-auto">
            {{ verifyActionLabel }}
          </UiButtonDefault>
        </NuxtLink>
      </div>
    </div>

    <div class="mt4-list-wrap">
      <div
        v-if="isLoading"
        class="mt4-list">
        <div
          v-for="idx in 3"
          :key="idx"
          class="verification-item mt4-card mt4-grid animate-pulse">
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
          <div class="mt4-actions">
            <div class="h-8 w-8 rounded bg-[var(--color-stroke-ui-light)]"></div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="mt4-list">
        <div
          v-if="visibleAccounts.length === 0"
          class="mt4-empty-state">
          <div class="mt4-empty-state__icon-wrap">
            <UiIconCardCheck class="mt4-empty-state__icon" />
          </div>
          <div class="mt4-empty-state__title">
            {{ currentEmptyTitle }}
          </div>
          <UiTextSmall class="mt4-empty-state__subtitle">
            {{ currentEmptySubtitle }}
          </UiTextSmall>
          <UiTextSmall
            v-if="!canCreateAccount && blockedReasonText"
            class="mt4-empty-state__warning">
            {{ blockedReasonText }}
          </UiTextSmall>

          <NuxtLink
            v-if="canCreateAccount"
            :to="profileAccountsCreateLink"
            class="w-full sm:w-auto">
            <UiButtonDefault
              state="success--outline"
              class="w-full sm:w-auto">
              {{ openAccountLabel }}
            </UiButtonDefault>
          </NuxtLink>
          <NuxtLink
            v-else
            :to="profileVerificationLink"
            class="w-full sm:w-auto">
            <UiButtonDefault
              state="info--outline"
              class="w-full sm:w-auto">
              {{ verifyActionLabel }}
            </UiButtonDefault>
          </NuxtLink>
        </div>

        <div
          v-for="account in visibleAccounts"
          :key="account.id"
          class="verification-item mt4-card mt4-grid"
          role="button"
          tabindex="0"
          @click="handleOpenAccount(account.id)"
          @keydown.enter.prevent="handleOpenAccount(account.id)"
          @keydown.space.prevent="handleOpenAccount(account.id)">
          <button
            class="mt4-star flex h-8 w-8 items-center justify-center rounded-md transition text-[var(--ui-text-secondary)]"
            type="button"
            :aria-pressed="account.is_favorite"
            :title="account.is_favorite ? favoriteRemoveLabel : favoriteAddLabel"
            @click.stop="handleToggleFavorite(account.id)">
            <svg
              viewBox="0 0 24 24"
              class="h-4 w-4"
              :fill="account.is_favorite ? 'var(--ui-primary-accent)' : 'none'"
              :stroke="account.is_favorite ? 'var(--ui-primary-accent)' : 'var(--ui-text-secondary)'"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true">
              <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </button>
          <div class="mt4-type min-w-0 text-[var(--ui-text-main)]">
            <UiTextSmall class="text-[var(--ui-text-secondary)]">
              {{ t("cabinet.accounts.columns.number") }}
            </UiTextSmall>
            <div class="truncate font-semibold">{{ getAccountNumber(account) }}</div>
            <UiTextSmall class="text-[var(--ui-text-secondary)] truncate">
              {{ t("cabinet.accounts.columns.leverage") }}: {{ getLeverageDisplay(account) }}
            </UiTextSmall>
          </div>
          <div class="mt4-account min-w-0 text-[var(--ui-text-main)]">
            <UiTextSmall class="text-[var(--ui-text-secondary)]">
              {{ t("cabinet.dashboard.mt4.table.type") }}
            </UiTextSmall>
            <UiTextSmall class="mt4-account-number text-[var(--ui-text-main)] font-semibold truncate">
              {{ getAccountType(account) }}
            </UiTextSmall>
          </div>
          <div class="mt4-balance min-w-0 text-[var(--ui-text-main)]">
            <UiTextSmall class="text-[var(--ui-text-secondary)]">
              {{ t("cabinet.dashboard.mt4.table.balance") }}
            </UiTextSmall>
            <div class="mt4-balance-value">
              <span
                class="truncate font-semibold"
                :class="getBalanceHighlightClass(account.id)">
                {{ formatBalance(account) }}
              </span>
              <button
                type="button"
                class="refresh-balance-btn"
                :disabled="isBalanceRefreshing(account.id)"
                :title="refreshBalanceLabel"
                @click.stop="refreshAccountBalance(account)">
                <UiIconUpdate
                  class="h-[14px] w-[14px]"
                  :spinning="isBalanceRefreshing(account.id)" />
              </button>
            </div>
          </div>
          <div class="mt4-actions">
            <button
              type="button"
              class="mt4-menu-trigger"
              :aria-label="openMenuLabel"
              @click.stop="toggleAccountMenu(account.id)"
              :ref="el => setMenuTriggerRef(account.id, el as HTMLElement | null)">
              <UiIconDotsVertical class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div
      v-if="activeMenuAccount"
      ref="menuRef"
      class="card-menu"
      :style="menuStyle">
      <button
        class="card-menu__item"
        type="button"
        @click="handleClickDeposit(activeMenuAccount.id)">
        <UiIconPayment class="!h-4 !w-4 text-[var(--ui-text-main)] stroke-[var(--ui-sticker-success)]" />
        <UiTextSmall class="whitespace-nowrap">{{ t("cabinet.accounts.actions.deposit") || "Deposit" }}</UiTextSmall>
      </button>
      <button
        class="card-menu__item"
        type="button"
        @click="handleClickWithdraw(activeMenuAccount.id)">
        <UiIconWithdraw class="!h-4 !w-4 text-[var(--ui-text-main)]" />
        <UiTextSmall class="whitespace-nowrap">{{ t("cabinet.accounts.actions.withdraw") || "Withdraw" }}</UiTextSmall>
      </button>
      <button
        class="card-menu__item"
        type="button"
        @click="handleClickTransfer(activeMenuAccount.id)">
        <UiIconTransfer class="!h-4 !w-4 text-[var(--ui-text-main)]" />
        <UiTextSmall class="whitespace-nowrap">{{ t("cabinet.accounts.actions.transfer") || "Transfer" }}</UiTextSmall>
      </button>
      <button
        class="card-menu__item"
        type="button"
        @click="handleClickHistory(activeMenuAccount.id)">
        <UiIconHistory class="!h-4 !w-4 text-[var(--ui-text-main)]" />
        <UiTextSmall class="whitespace-nowrap">{{ t("cabinet.accounts.actions.history") || "History" }}</UiTextSmall>
      </button>
      <button
        class="card-menu__item"
        type="button"
        @click="handleClickChangeType(activeMenuAccount.id)">
        <UiIconUpdate class="!h-4 !w-4 text-[var(--ui-text-main)]" />
        <UiTextSmall class="whitespace-nowrap">{{
          t("cabinet.accounts.actions.changeType") || "Change type"
        }}</UiTextSmall>
      </button>
      <button
        class="card-menu__item"
        type="button"
        @click="handleClickDelete(activeMenuAccount.id)">
        <UiIconTrash class="!h-4 !w-4 text-[var(--ui-text-main)] stroke-[var(--ui-sticker-danger)]" />
        <UiTextSmall class="whitespace-nowrap">{{ t("cabinet.accounts.actions.remove") || "Remove" }}</UiTextSmall>
      </button>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
  import AccountsTransferModal from "~/components/block/modals/AccountsTransferModal.vue";
  import CreateNewDeposit from "~/pages/payments/create/index.vue";
  import { computed, inject, nextTick, onBeforeUnmount, onMounted, reactive, ref, toRefs, watch } from "vue";
  import { navigateTo, useLocalePath } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";

  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconCardCheck from "~/components/ui/UiIconCardCheck.vue";
  import UiIconDotsVertical from "~/components/ui/UiIconDotsVertical.vue";
  import UiIconPayment from "~/components/ui/UiIconPayment.vue";
  import UiIconWithdraw from "~/components/ui/UiIconWithdraw.vue";
  import UiIconTransfer from "~/components/ui/UiIconTransfer.vue";
  import UiIconHistory from "~/components/ui/UiIconHistory.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiIconTrash from "~/components/ui/UiIconTrash.vue";
  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";

  type Mt4Status = "active" | "inactive" | string;
  type Mt4Account = {
    id: string;
    number?: string;
    type?: string;
    leverage?: string;
    currency?: string;
    balance?: number;
    status?: Mt4Status;
    is_favorite: boolean;
    favorite_at?: string | null;
  };

  const props = withDefaults(
    defineProps<{
      accounts: Mt4Account[];
      isLoading?: boolean;
      canCreateAccount?: boolean;
      accountCreationBlockedReason?: string;
    }>(),
    {
      isLoading: false,
      canCreateAccount: true,
      accountCreationBlockedReason: "",
    }
  );

  const { isLoading } = toRefs(props);

  const emit = defineEmits<{
    (event: "toggle-favorite", id: string): void;
    (event: "refresh-requested"): void;
  }>();

  const { t } = useI18n({ useScope: "global" });
  const localePath = useLocalePath();
  const toast = useToast();
  const appCore = useAppCore();
  const modalControl = inject("modalControl") as { openModal?: Function } | undefined;

  const MENU_WIDTH = 180;
  const MENU_GAP = 8;
  const VIEWPORT_OFFSET = 8;
  const FALLBACK_MENU_HEIGHT = 260;
  const BALANCE_REFRESH_EVENT = "accountsBalanceRefreshRequested";
  const BALANCE_REFRESH_MAX_ATTEMPTS = 8;
  const BALANCE_REFRESH_INTERVAL_MS = 1000;

  const activeMenuAccountId = ref<string | null>(null);
  const menuStyle = ref<Record<string, string>>({});
  const menuRef = ref<HTMLElement | null>(null);
  const menuTriggerRefs = reactive<Record<string, HTMLElement | null>>({});
  const refreshingBalanceIds = reactive<Record<string, boolean>>({});
  const balanceOverrides = reactive<Record<string, number | undefined>>({});
  type BalanceChangeDirection = "up" | "down" | "same";
  const balanceHighlightById = reactive<Record<string, BalanceChangeDirection | undefined>>({});
  const balanceHighlightTimers = new Map<string, ReturnType<typeof setTimeout>>();

  const profileAccountsCreateLink = computed(() => localePath({ path: "/accounts", query: { openCreate: "1" } }));
  const profileVerificationLink = computed(() => localePath({ path: "/profile", query: { tab: "verification" } }));
  const canCreateAccount = computed(() => !!props.canCreateAccount);
  const openMenuLabel = computed(() => resolveText("cabinet.common.openMenu", "Open menu"));
  const favoriteAddLabel = computed(() => resolveText("cabinet.accounts.favoriteAdd", "Add to favorites"));
  const favoriteRemoveLabel = computed(() => resolveText("cabinet.accounts.favoriteRemove", "Remove from favorites"));
  const refreshBalanceLabel = computed(() => resolveText("cabinet.accounts.refreshBalance", "Refresh balance"));

  const resolveText = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const normalizeAccountId = (value: string | number | undefined | null): string => String(value ?? "");

  const normalizeBalance = (value: unknown): number => {
    const normalized = Number.parseFloat(String(value ?? "0").replace(",", "."));
    return Number.isFinite(normalized) ? normalized : 0;
  };
  const hasMeaningfulBalanceChange = (before: number, after: number): boolean => Math.abs(after - before) >= 0.005;
  const delay = (ms: number) =>
    new Promise(resolve => {
      setTimeout(resolve, ms);
    });

  const emptyTitle = computed(() => resolveText("cabinet.dashboard.mt4.emptyTitle", "Счетов пока нет"));
  const emptySubtitle = computed(() =>
    resolveText("cabinet.dashboard.mt4.emptySubtitle", "Откройте первый торговый счет, чтобы начать работу.")
  );
  const verifyTitle = computed(() =>
    resolveText("cabinet.dashboard.mt4.verifyTitle", "Завершите верификацию для открытия счёта")
  );
  const verifySubtitle = computed(() =>
    resolveText(
      "cabinet.dashboard.mt4.verifySubtitle",
      "Подтвердите данные профиля и документы, после этого сможете открыть MT4 счёт."
    )
  );
  const openAccountLabel = computed(() => resolveText("cabinet.accounts.openAccount", "Открыть счет"));
  const verifyActionLabel = computed(() =>
    resolveText("cabinet.dashboard.accountVerification.goToVerification", "Перейти к верификации")
  );
  const mt4Description = computed(() =>
    resolveText("cabinet.dashboard.mt4.description", "Быстрый доступ к избранным счетам и открытию нового MT4 счета.")
  );
  const currentEmptyTitle = computed(() => (canCreateAccount.value ? emptyTitle.value : verifyTitle.value));
  const currentEmptySubtitle = computed(() => (canCreateAccount.value ? emptySubtitle.value : verifySubtitle.value));
  const blockedReasonText = computed(() => String(props.accountCreationBlockedReason || "").trim());

  const getAccountType = (account: Mt4Account): string => {
    const type = String(account.type ?? "").trim();
    return type === "" ? "-" : type;
  };

  const getLeverageDisplay = (account: Mt4Account): string => {
    const leverage = String(account.leverage ?? "").trim();
    return leverage === "" ? "1:100" : leverage;
  };

  const getAccountNumber = (account: Mt4Account): string => {
    const number = String(account.number ?? "").trim();
    return number === "" ? normalizeAccountId(account.id) : number;
  };

  const formatBalance = (account: Mt4Account): string => {
    const balance = getDisplayedBalanceValue(account);
    const currency = String(account.currency ?? "").trim();

    if (currency !== "") {
      try {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(balance);
      } catch {}
    }

    return `$ ${balance.toFixed(2)}`;
  };

  const refreshKey = (id: string | number): string => normalizeAccountId(id);
  const isBalanceRefreshing = (id: string | number): boolean => !!refreshingBalanceIds[refreshKey(id)];

  const clearBalanceHighlightTimer = (key: string) => {
    const timer = balanceHighlightTimers.get(key);
    if (timer !== undefined) {
      clearTimeout(timer);
      balanceHighlightTimers.delete(key);
    }
  };

  const setBalanceHighlight = (id: string | number, direction: BalanceChangeDirection) => {
    const key = refreshKey(id);
    clearBalanceHighlightTimer(key);
    balanceHighlightById[key] = direction;
    const timer = setTimeout(() => {
      delete balanceHighlightById[key];
      balanceHighlightTimers.delete(key);
    }, 1000);
    balanceHighlightTimers.set(key, timer);
  };

  const getBalanceHighlightClass = (id: string | number): string => {
    const state = balanceHighlightById[refreshKey(id)];
    if (state === "up") return "balance-highlight-up";
    if (state === "down") return "balance-highlight-down";
    if (state === "same") return "balance-highlight-same";
    return "";
  };

  const getDisplayedBalanceValue = (account: Mt4Account): number => {
    const key = refreshKey(account.id);
    const override = balanceOverrides[key];
    if (typeof override === "number" && Number.isFinite(override)) return override;
    return normalizeBalance(account.balance);
  };

  const refreshAccountBalance = async (account: Mt4Account, options: { suppressErrorToast?: boolean } = {}) => {
    const key = refreshKey(account.id);
    if (refreshingBalanceIds[key]) return;

    const previousBalance = getDisplayedBalanceValue(account);
    refreshingBalanceIds[key] = true;
    try {
      const response = await appCore.accounts.refreshBalance(normalizeAccountId(account.id));
      const data = response?.data?.data ?? {};
      const updatedBalance = data.balance;

      if (updatedBalance !== undefined && updatedBalance !== null) {
        const nextBalance = normalizeBalance(updatedBalance);
        balanceOverrides[key] = nextBalance;

        if (nextBalance > previousBalance) {
          setBalanceHighlight(account.id, "up");
        } else if (nextBalance < previousBalance) {
          setBalanceHighlight(account.id, "down");
        } else {
          setBalanceHighlight(account.id, "same");
        }

        return;
      }

      if (!options.suppressErrorToast) {
        toast.error(resolveText("cabinet.accounts.refreshBalanceError", "Failed to refresh account balance."));
      }
    } catch {
      if (!options.suppressErrorToast) {
        toast.error(resolveText("cabinet.accounts.refreshBalanceError", "Failed to refresh account balance."));
      }
    } finally {
      refreshingBalanceIds[key] = false;
    }
  };

  const normalizeRefreshPayloadIds = (payload: any): string[] => {
    const rawIds = Array.isArray(payload) ? payload : Array.isArray(payload?.accountIds) ? payload.accountIds : [];
    const normalized = rawIds.map((id: unknown) => String(id ?? "").trim()).filter((id: string) => id !== "");
    return Array.from(new Set(normalized));
  };

  const findAccountById = (id: string): Mt4Account | null => {
    const list = Array.isArray(props.accounts) ? props.accounts : [];
    return list.find(account => normalizeAccountId(account.id) === id) ?? null;
  };

  const waitForAccountBalanceSettlement = async (id: string) => {
    const account = findAccountById(id);
    if (!account) return;

    const baseline = getDisplayedBalanceValue(account);

    for (let attempt = 1; attempt <= BALANCE_REFRESH_MAX_ATTEMPTS; attempt++) {
      const currentAccount = findAccountById(id);
      if (!currentAccount) return;

      await refreshAccountBalance(currentAccount, {
        suppressErrorToast: attempt < BALANCE_REFRESH_MAX_ATTEMPTS,
      });

      const refreshedAccount = findAccountById(id);
      if (!refreshedAccount) return;

      const currentBalance = getDisplayedBalanceValue(refreshedAccount);
      if (hasMeaningfulBalanceChange(baseline, currentBalance)) {
        return;
      }

      if (attempt < BALANCE_REFRESH_MAX_ATTEMPTS) {
        await delay(BALANCE_REFRESH_INTERVAL_MS);
      }
    }
  };

  const handleBalanceRefreshRequested = async (payload: any) => {
    const ids = normalizeRefreshPayloadIds(payload);
    if (ids.length === 0) return;

    const relatedAccounts = visibleAccounts.value.filter(account => ids.includes(normalizeAccountId(account.id)));
    if (relatedAccounts.length === 0) return;

    const relatedIds = relatedAccounts.map(account => normalizeAccountId(account.id));
    await Promise.allSettled(relatedIds.map(id => waitForAccountBalanceSettlement(id)));
  };

  const visibleAccounts = computed(() => {
    const accounts = Array.isArray(props.accounts) ? props.accounts : [];
    const favorites = accounts
      .filter(account => account.is_favorite)
      .sort((a, b) => normalizeBalance(b.balance) - normalizeBalance(a.balance));
    const remaining = accounts
      .filter(account => !account.is_favorite)
      .sort((a, b) => normalizeBalance(b.balance) - normalizeBalance(a.balance));

    return [...favorites, ...remaining].slice(0, 3);
  });

  const activeMenuAccount = computed(() => {
    if (!activeMenuAccountId.value) return null;
    return visibleAccounts.value.find(account => normalizeAccountId(account.id) === activeMenuAccountId.value) ?? null;
  });

  watch(
    visibleAccounts,
    items => {
      if (!activeMenuAccountId.value) return;
      const exists = items.some(account => normalizeAccountId(account.id) === activeMenuAccountId.value);
      if (!exists) closeMenu();
    },
    { deep: true }
  );

  const setMenuTriggerRef = (id: string | number, element: HTMLElement | null) => {
    menuTriggerRefs[normalizeAccountId(id)] = element;
  };

  const closeMenu = () => {
    activeMenuAccountId.value = null;
    menuStyle.value = {};
  };

  const buildFloatingMenuStyle = (trigger: HTMLElement, menuElement?: HTMLElement | null): Record<string, string> => {
    const rect = trigger.getBoundingClientRect();
    const menuHeight = menuElement?.offsetHeight ?? FALLBACK_MENU_HEIGHT;

    const maxLeft = Math.max(VIEWPORT_OFFSET, window.innerWidth - MENU_WIDTH - VIEWPORT_OFFSET);
    const left = Math.min(Math.max(rect.right - MENU_WIDTH, VIEWPORT_OFFSET), maxLeft);

    const fitsBottom = rect.bottom + MENU_GAP + menuHeight <= window.innerHeight - VIEWPORT_OFFSET;
    const top = fitsBottom ? rect.bottom + MENU_GAP : Math.max(VIEWPORT_OFFSET, rect.top - menuHeight - MENU_GAP);

    return {
      top: `${Math.round(top)}px`,
      left: `${Math.round(left)}px`,
      width: `${MENU_WIDTH}px`,
    };
  };

  const updateMenuPosition = (id: string) => {
    const trigger = menuTriggerRefs[id];
    if (!trigger) return;
    menuStyle.value = buildFloatingMenuStyle(trigger, menuRef.value);
  };

  const recalcMenuPosition = () => {
    if (!activeMenuAccountId.value) return;
    updateMenuPosition(activeMenuAccountId.value);
  };

  const toggleAccountMenu = async (id: string | number) => {
    const normalizedId = normalizeAccountId(id);
    const willOpen = activeMenuAccountId.value !== normalizedId;
    if (!willOpen) {
      closeMenu();
      return;
    }

    activeMenuAccountId.value = normalizedId;
    menuStyle.value = {};

    await nextTick();
    updateMenuPosition(normalizedId);
    await nextTick();
    updateMenuPosition(normalizedId);
  };

  const handleMenuOutside = (event: MouseEvent) => {
    if (!activeMenuAccountId.value) return;

    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest(".card-menu") || target.closest(".mt4-menu-trigger")) return;

    closeMenu();
  };

  const handleMenuEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  };

  onMounted(() => {
    useEventBus.on(BALANCE_REFRESH_EVENT, handleBalanceRefreshRequested);
    window.addEventListener("resize", recalcMenuPosition);
    window.addEventListener("scroll", recalcMenuPosition, true);
    window.addEventListener("mousedown", handleMenuOutside, true);
    window.addEventListener("keydown", handleMenuEscape, true);
  });

  onBeforeUnmount(() => {
    useEventBus.off(BALANCE_REFRESH_EVENT, handleBalanceRefreshRequested);

    balanceHighlightTimers.forEach(timer => clearTimeout(timer));
    balanceHighlightTimers.clear();

    window.removeEventListener("resize", recalcMenuPosition);
    window.removeEventListener("scroll", recalcMenuPosition, true);
    window.removeEventListener("mousedown", handleMenuOutside, true);
    window.removeEventListener("keydown", handleMenuEscape, true);
  });

  const tabSlugByIndex: Record<number, string> = {
    0: "general",
    1: "history",
    2: "trade-history",
  };

  const accountRoute = (accountId: string | number, tab?: number): string => {
    const path = `/accounts/${encodeURIComponent(normalizeAccountId(accountId))}`;
    if (typeof tab === "number") {
      return localePath({ path, query: { tab: tabSlugByIndex[tab] ?? "general" } });
    }
    return localePath({ path });
  };

  const handleToggleFavorite = (id: string | number) => {
    emit("toggle-favorite", normalizeAccountId(id));
  };

  const handleOpenAccount = async (accountId: string | number) => {
    closeMenu();
    await navigateTo(accountRoute(accountId));
  };

  const resolvePaymentModalTitle = (initialTab: "deposit" | "withdrawal"): string => {
    if (initialTab === "withdrawal") {
      return resolveText("cabinet.accounts.actions.withdraw", "Withdraw");
    }

    return resolveText("cabinet.accounts.actions.deposit", "Deposit");
  };

  const openPaymentModal = async (initialTab: "deposit" | "withdrawal", accountId: string | number): Promise<void> => {
    closeMenu();

    if (!canCreateAccount.value) {
      await navigateTo(profileVerificationLink.value);
      return;
    }

    const normalizedAccountId = normalizeAccountId(accountId);
    if (modalControl?.openModal) {
      modalControl.openModal(CreateNewDeposit, {
        title: resolvePaymentModalTitle(initialTab),
        initialTab,
        initialAccountId: normalizedAccountId,
      });
      return;
    }

    await navigateTo(
      localePath({
        path: "/payments",
        query: {
          [initialTab === "withdrawal" ? "openWithdrawal" : "openDeposit"]: "1",
          accountId: normalizedAccountId,
        },
      })
    );
  };

  const handleClickDeposit = async (accountId: string | number) => {
    await openPaymentModal("deposit", accountId);
  };

  const handleClickWithdraw = async (accountId: string | number) => {
    await openPaymentModal("withdrawal", accountId);
  };

  const handleClickTransfer = async (accountId: string | number) => {
    closeMenu();
    modalControl?.openModal?.(AccountsTransferModal, {
      title: resolveText("cabinet.accounts.transfer.title", "Transfer between my accounts"),
      fromAccountId: normalizeAccountId(accountId),
    });
  };

  const handleClickHistory = async (accountId: string | number) => {
    closeMenu();
    await navigateTo(accountRoute(accountId, 1));
  };

  const handleClickChangeType = async (accountId: string | number) => {
    closeMenu();
    await navigateTo(accountRoute(accountId, 0));
  };

  const handleClickDelete = async (accountId: string | number) => {
    const shouldDelete = confirm(resolveText("cabinet.accounts.deleteConfirm", "Archive this account?"));
    if (!shouldDelete) {
      closeMenu();
      return;
    }

    try {
      await appCore.accounts.delete(normalizeAccountId(accountId));
      toast.success(resolveText("cabinet.accounts.deleteSuccess", "Account archived!"));
      emit("refresh-requested");
    } catch {
      toast.error(resolveText("cabinet.accounts.deleteError", "Failed to archive account."));
    } finally {
      closeMenu();
    }
  };
</script>

<style scoped>
  .mt4-widget {
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow: hidden;
    border-radius: 14px;
    border: 0;
    background: var(--ui-background-panel);
    padding: 12px;
  }

  .dashboard-side-widget {
    --dashboard-side-widget-height: clamp(360px, 43vh, 440px);
    min-height: var(--dashboard-side-widget-height);
    height: var(--dashboard-side-widget-height);
  }

  .mt4-header-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin: -12px -12px 0;
    padding: 12px;
    box-sizing: border-box;
    border-radius: 0;
    background:
      linear-gradient(136deg, color-mix(in srgb, var(--ui-primary-main) 10%, transparent) 0%, transparent 70.44%),
      var(--ui-background-card);
  }

  .mt4-header-card__copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .mt4-header-card__title {
    font-size: 17px;
    font-weight: 700;
    line-height: 1.1;
  }

  .mt4-header-card__description {
    color: var(--ui-text-secondary);
    line-height: 1.35;
  }

  .mt4-header-card__actions {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 8px;
  }

  .mt4-header-card__cta {
    min-width: 0;
    justify-content: center;
    border-radius: 10px;
    padding-inline: 18px;
    font-weight: 700;
    color: white !important;
  }

  .mt4-header-card__cta--outline {
    color: var(--ui-primary-main) !important;
  }

  .mt4-list-wrap {
    min-height: 0;
    flex: 1;
  }

  .mt4-list {
    height: 100%;
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
    align-content: start;
    overflow-y: auto;
    padding-right: 4px;
  }

  .mt4-empty-state {
    min-height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 10px;
    padding: 18px 12px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--ui-background-card) 72%, transparent);
    border: 1px dashed var(--color-stroke-ui-light);
  }

  .mt4-empty-state__icon-wrap {
    height: 56px;
    width: 56px;
    border-radius: 999px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--ui-primary-main) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 40%, transparent);
  }

  .mt4-empty-state__icon {
    width: 24px;
    height: 24px;
    color: var(--ui-primary-main);
  }

  .mt4-empty-state__title {
    font-size: 16px;
    font-weight: 700;
    color: var(--ui-text-main);
  }

  .mt4-empty-state__subtitle {
    color: var(--ui-text-secondary);
    max-width: 320px;
  }

  .mt4-empty-state__warning {
    color: var(--color-warning);
    max-width: 360px;
  }

  .mt4-card {
    background: var(--ui-background-card);
    border: 1px solid transparent;
    border-radius: 8px;
    padding: 10px 12px;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;
    cursor: pointer;
  }

  .mt4-card:hover {
    background: transparent;
    border-color: var(--color-stroke-ui-light);
  }

  .mt4-grid {
    display: grid;
    grid-template-columns: 44px minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) auto;
    gap: 14px;
    align-items: center;
    grid-template-areas: "star type account balance actions";
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

  .mt4-balance-value {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
  }

  .mt4-account-number {
    letter-spacing: 0.01em;
  }

  .mt4-actions {
    grid-area: actions;
    justify-self: end;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .mt4-menu-trigger {
    height: 30px;
    width: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--ui-text-secondary);
    transition:
      border-color 0.2s ease,
      color 0.2s ease,
      background-color 0.2s ease;
  }

  .mt4-menu-trigger:hover {
    color: var(--ui-text-main);
    border-color: var(--color-stroke-ui-light);
    background: var(--ui-background-card);
  }

  .refresh-balance-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--ui-text-main);
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
  }

  .refresh-balance-btn:hover,
  .refresh-balance-btn:focus-visible {
    color: var(--ui-text-main);
  }

  .refresh-balance-btn:disabled {
    opacity: 0.6;
    cursor: default;
  }

  .balance-highlight-up {
    animation: balance-highlight-up 1s ease;
  }

  .balance-highlight-down {
    animation: balance-highlight-down 1s ease;
  }

  .balance-highlight-same {
    animation: balance-highlight-same 1s ease;
  }

  .verification-item {
    border-radius: 12px;
    background: var(--ui-background-card);
    border: 1px solid transparent;
    padding: 10px 12px;
    min-height: 92px;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;
  }

  .verification-item:hover {
    background: transparent;
    border-color: var(--color-stroke-ui-light);
  }

  .card-menu {
    position: fixed;
    z-index: 9999;
    min-width: 160px;
    width: 180px;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, var(--color-stroke-ui-light) 82%, var(--ui-text-main) 18%);
    background: color-mix(in srgb, var(--ui-background-panel) 94%, var(--ui-background-card) 6%);
    backdrop-filter: blur(20px) saturate(125%);
    opacity: 1;
    pointer-events: auto;
    padding: 8px;
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.24);
  }

  .card-menu__item {
    width: 100%;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 34px;
    padding: 0 8px;
    border-radius: 8px;
    border: 0;
    background: transparent;
    transition: background-color 0.2s ease;
  }

  .card-menu__item:hover {
    background: var(--color-stroke-ui-light);
  }

  @keyframes balance-highlight-up {
    0% {
      color: inherit;
    }
    30% {
      color: var(--ui-sticker-success);
    }
    100% {
      color: inherit;
    }
  }

  @keyframes balance-highlight-down {
    0% {
      color: inherit;
    }
    30% {
      color: var(--ui-sticker-danger);
    }
    100% {
      color: inherit;
    }
  }

  @keyframes balance-highlight-same {
    0%,
    100% {
      opacity: 1;
    }
    20% {
      opacity: 0.35;
    }
    40% {
      opacity: 1;
    }
    60% {
      opacity: 0.35;
    }
    80% {
      opacity: 1;
    }
  }

  @media (max-width: 767px) {
    .mt4-header-card {
      flex-direction: column;
      align-items: flex-start;
    }

    .mt4-grid {
      grid-template-columns: 44px minmax(0, 1fr) auto;
      grid-template-areas:
        "star type actions"
        "star account actions"
        "star balance actions";
      gap: 10px 12px;
      align-items: start;
    }

    .mt4-actions {
      flex-direction: column;
      align-items: flex-end;
    }
  }

  @media (min-width: 640px) {
    .mt4-header-card__actions {
      width: auto;
      flex-direction: row;
      align-items: center;
    }

    .mt4-header-card__cta {
      width: auto;
    }
  }

  @media (min-width: 768px) {
    .mt4-header-card {
      height: 64px;
    }
  }

  @media (max-width: 1023px) {
    .dashboard-side-widget {
      min-height: 0;
      height: auto;
    }

    .mt4-list {
      height: auto;
      overflow: visible;
      padding-right: 0;
    }
  }
</style>
