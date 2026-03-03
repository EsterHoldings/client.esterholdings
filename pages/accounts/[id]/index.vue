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

      <PanelDefault class="account-page__panel">
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
  import { computed, onMounted, reactive, ref, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";
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
  const router = useRouter();

  const appCore = useAppCore();

  const activeTabIndex = ref(0);
  const isLoading = ref(false);
  const isBalanceRefreshing = ref(false);

  const tabsList = computed(() => {
    return [
      {
        icon: UiIconUser,
        label: resolveText("cabinet.accounts.tabs.card", "Карта счета"),
        component: TabGeneral,
      },
      {
        icon: UiIconHistory,
        label: resolveText("cabinet.accounts.tabs.history", "История"),
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

  const getTabIndexFromQuery = (value: unknown): number => {
    const rawValue = Array.isArray(value) ? value[0] : value;
    const normalized = String(rawValue ?? "")
      .trim()
      .toLowerCase();

    if (normalized === "2" || normalized === "trade-history" || normalized === "trades") return 2;
    if (normalized === "1" || normalized === "history") return 1;
    return 0;
  };

  const handleActiveTab = async (tabIndex: number) => {
    if (tabIndex !== 0 && tabIndex !== 1 && tabIndex !== 2) return;

    activeTabIndex.value = tabIndex;

    if (String(route.query.tab ?? "0") === String(tabIndex)) {
      return;
    }

    await router.replace({
      query: {
        ...route.query,
        tab: String(tabIndex),
      },
    });
  };

  watch(
    () => route.query.tab,
    value => {
      activeTabIndex.value = getTabIndexFromQuery(value);
    },
    { immediate: true }
  );

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
    await loadData();
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
  }

  .account-layout {
    display: grid;
    min-height: 0;
    grid-template-columns: minmax(210px, 260px) minmax(0, 1fr);
  }

  .account-layout__tabs {
    min-height: 0;
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
