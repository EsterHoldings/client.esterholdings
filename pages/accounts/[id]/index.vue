<template>
  <UiContainer>
    <div class="account-page">
      <div class="account-page__header">
        <div class="min-w-0">
          <UiTextH4 class="account-page__title text-[var(--ui-text-main)]">
            {{ accountTitle }}
          </UiTextH4>
          <UiTextSmall class="account-page__subtitle">
            {{ accountSubtitle }}
          </UiTextSmall>
        </div>
      </div>

      <PanelDefault
        ref="panelRef"
        class="account-page__panel"
        :style="{ minHeight: panelMinHeight }">
        <div class="account-layout">
          <aside class="account-layout__tabs">
            <TabsAsList
              :tabsList="tabsList"
              @selectTab="handleActiveTab"
              :activeTabIndex="activeTabIndex" />
          </aside>

          <section class="account-layout__content">
            <transition
              enter-active-class="transition ease-linear duration-100"
              enter-from-class="opacity-0 translate-x-4"
              enter-to-class="opacity-100 translate-x-0"
              leave-active-class="transition ease-linear duration-100"
              leave-from-class="opacity-100 translate-x-0"
              leave-to-class="opacity-0 -translate-x-4"
              mode="out-in">
              <component
                :is="tabsList[activeTabIndex].component"
                :id="id"
                :type="accountData.type"
                :number="accountData.number"
                :balance="accountData.balance"
                :key="activeTabIndex"
                :isLoading="isLoading"
                :is-balance-refreshing="isBalanceRefreshing"
                @refresh-balance="refreshAccountBalance" />
            </transition>
          </section>
        </div>
      </PanelDefault>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
  import UiContainer from "~/components/ui/UiContainer.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";

  import { definePageMeta } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
  import { useRoute } from "vue-router";
  import TabGeneral from "~/pages/accounts/[id]/components/TabGeneral.vue";

  import useAppCore from "~/composables/useAppCore";
  import TabHistory from "~/pages/accounts/[id]/components/TabHistory.vue";
  import TabTradeHistory from "~/pages/accounts/[id]/components/TabTradeHistory.vue";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import TabsAsList from "~/components/block/tabs/TabsAsList.vue";
  import UiIconUser from "~/components/ui/UiIconUser.vue";
  import UiIconHistory from "~/components/ui/UiIconHistory.vue";
  import UiIconTime from "~/components/ui/UiIconTime.vue";

  definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });

  const { t } = useI18n({ useScope: "global" });

  const route = useRoute();
  const appCore = useAppCore();

  const activeTabIndex = ref(0);
  const isLoading = ref(false);
  const isBalanceRefreshing = ref(false);
  const panelRef = ref<any>(null);
  const panelMinHeight = ref("auto");

  const getPanelElement = (): HTMLElement | null => {
    const target = panelRef.value;
    if (!target) return null;
    if (target instanceof HTMLElement) return target;
    if (target?.$el instanceof HTMLElement) return target.$el;
    return null;
  };

  const updatePanelMinHeight = () => {
    if (!import.meta.client) return;

    const panelEl = getPanelElement();
    if (!panelEl) return;

    const top = panelEl.getBoundingClientRect().top;
    const cabinetMain = panelEl.closest(".cabinet-main") as HTMLElement | null;
    const mainPaddingBottom = cabinetMain ? Number.parseFloat(getComputedStyle(cabinetMain).paddingBottom || "0") : 0;

    // On mobile/tablet cabinet layout reserves bottom padding for fixed nav menu.
    const mobileMenuReserve = mainPaddingBottom >= 40 ? mainPaddingBottom : 0;
    const minHeightPx = Math.max(0, Math.floor(window.innerHeight - top - 20 - mobileMenuReserve));
    panelMinHeight.value = `${minHeightPx}px`;
  };

  const tabsList = computed(() => {
    return [
      {
        icon: UiIconUser,
        label: resolveText("cabinet.accounts.tabs.card", "Карта счета"),
        component: TabGeneral,
      },
      {
        icon: UiIconHistory,
        label: resolveText("cabinet.accounts.tabs.history", "Транзакции"),
        component: TabHistory,
      },
      {
        icon: UiIconTime,
        label: resolveText("cabinet.accounts.tabs.tradeHistory", "История торгов"),
        component: TabTradeHistory,
      },
    ];
  });

  const resolveText = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const id = computed(() => String(route.params.id));

  const tabSlugByIndex = ["general", "history", "trade-history"] as const;

  const tabIndexBySlug: Record<string, number> = {
    general: 0,
    card: 0,
    "0": 0,
    history: 1,
    "1": 1,
    "trade-history": 2,
    trades: 2,
    "2": 2,
  };

  const getTabIndexFromQuery = (value: unknown): number | null => {
    const rawValue = Array.isArray(value) ? value[0] : value;
    const normalized = String(rawValue ?? "")
      .trim()
      .toLowerCase();

    if (!normalized) return null;

    const index = tabIndexBySlug[normalized];
    if (typeof index !== "number") return null;
    if (index < 0 || index >= tabsList.value.length) return null;

    return index;
  };

  const getTabSlugByIndex = (tabIndex: number): string => tabSlugByIndex[tabIndex] ?? tabSlugByIndex[0];

  const syncUrlTabSlug = (tabIndex: number) => {
    if (!import.meta.client) return;

    const nextSlug = getTabSlugByIndex(tabIndex);
    const params = new URLSearchParams(window.location.search);

    if (params.get("tab") === nextSlug) return;

    params.set("tab", nextSlug);
    const query = params.toString();
    const nextUrl = query
      ? `${window.location.pathname}?${query}${window.location.hash}`
      : `${window.location.pathname}${window.location.hash}`;

    window.history.replaceState(window.history.state, "", nextUrl);
  };

  const handleActiveTab = (tabIndex: number) => {
    if (tabIndex !== 0 && tabIndex !== 1 && tabIndex !== 2) return;
    if (activeTabIndex.value === tabIndex) return;

    activeTabIndex.value = tabIndex;
    syncUrlTabSlug(tabIndex);
  };

  watch(
    () => route.query.tab,
    value => {
      const nextIndex = getTabIndexFromQuery(value);
      if (nextIndex === null || nextIndex === activeTabIndex.value) return;
      activeTabIndex.value = nextIndex;
    },
    { immediate: true, flush: "post" }
  );

  watch(activeTabIndex, async () => {
    await nextTick();
    updatePanelMinHeight();
  });

  const accountData = reactive({
    type: "",
    number: "",
    balance: 0,
  });

  const accountTitle = computed(() => {
    const label = resolveText("cabinet.accounts.account.title", "Account");
    return `${label}: ${accountData.number || id.value}`;
  });

  const accountSubtitle = computed(() => {
    if (accountData.type) {
      const typeLabel = resolveText("cabinet.accounts.columns.type", "Type");
      return `${typeLabel}: ${accountData.type}`;
    }

    return resolveText("cabinet.accounts.account.subtitle", "Trading account details and history");
  });
  const refreshAccountBalance = async () => {
    if (isLoading.value || isBalanceRefreshing.value) return;

    isBalanceRefreshing.value = true;
    try {
      const response = await appCore.accounts.refreshBalance(id.value);
      const balance = response?.data?.data?.balance;

      if (balance !== undefined && balance !== null) {
        accountData.balance = Number(balance);
      } else {
        await loadData();
      }
    } catch {
      await loadData();
    } finally {
      isBalanceRefreshing.value = false;
    }
  };

  const loadData = async () => {
    isLoading.value = true;

    try {
      const accountId = String(route.params.id);
      const response = await appCore.accounts.getById(accountId);
      const account = response?.data?.data ?? {};

      accountData.type = String(account?.account_type?.name ?? "");
      accountData.balance = Number(account?.balance ?? 0);
      accountData.number = String(account?.number ?? "");
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(async () => {
    const queryIndex = getTabIndexFromQuery(route.query.tab);
    activeTabIndex.value = queryIndex ?? 0;
    syncUrlTabSlug(activeTabIndex.value);

    await loadData();
    await nextTick();
    updatePanelMinHeight();

    window.addEventListener("resize", updatePanelMinHeight);
    window.addEventListener("orientationchange", updatePanelMinHeight);
  });

  onBeforeUnmount(() => {
    if (!import.meta.client) return;
    window.removeEventListener("resize", updatePanelMinHeight);
    window.removeEventListener("orientationchange", updatePanelMinHeight);
  });
</script>

<style lang="scss" scoped>
  .account-page {
    display: flex;
    min-height: 0;
    flex-direction: column;
    gap: 14px;
    padding-bottom: 6px;
  }

  .account-page__header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 10px 14px;
  }

  .account-page__title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .account-page__subtitle {
    margin-top: 4px;
    color: var(--ui-text-secondary);
  }

  .account-page__panel {
    overflow: hidden;
    display: flex;
  }

  .account-layout {
    display: grid;
    min-height: inherit;
    height: 100%;
    width: 100%;
    flex: 1 1 auto;
    grid-template-columns: minmax(210px, 260px) minmax(0, 1fr);
  }

  .account-layout__tabs {
    min-height: 100%;
    height: 100%;
    align-self: stretch;
    border-right: 1px solid var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--ui-background-card) 60%, transparent);
    padding: 12px;
  }

  .account-layout__content {
    min-width: 0;
    padding: 12px;
  }

  @media (max-width: 1023px) {
    .account-layout {
      grid-template-columns: 1fr;
    }

    .account-layout__tabs {
      border-right: 0;
      border-bottom: 1px solid var(--color-stroke-ui-light);
      padding: 8px;
    }

    .account-layout__content {
      padding: 10px;
    }
  }

  @media (max-width: 640px) {
    .account-page {
      gap: 10px;
    }

    .account-layout__content {
      padding: 8px;
    }
  }
</style>
