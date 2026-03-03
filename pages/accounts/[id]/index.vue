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

        <div class="account-page__balance-card">
          <UiTextSmall class="account-page__balance-label">
            {{ t("cabinet.accounts.columns.balance") }}
          </UiTextSmall>
          <div class="account-page__balance-value">
            <UiIconSpinnerDefault
              v-if="isLoading"
              class="!h-4 !w-4" />
            <span v-else>$ {{ formattedBalance }}</span>
          </div>
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
                :isLoading="isLoading" />
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
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";

  import { definePageMeta } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";
  import { computed, onMounted, reactive, ref, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import TabGeneral from "~/pages/accounts/[id]/components/TabGeneral.vue";

  import useAppCore from "~/composables/useAppCore";
  import TabHistory from "~/pages/accounts/[id]/components/TabHistory.vue";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import TabsAsList from "~/components/block/tabs/TabsAsList.vue";
  import UiIconUser from "~/components/ui/UiIconUser.vue";
  import UiIconHistory from "~/components/ui/UiIconHistory.vue";

  definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });

  const { t } = useI18n({ useScope: "global" });

  const route = useRoute();
  const router = useRouter();

  const appCore = useAppCore();

  const activeTabIndex = ref(0);
  const isLoading = ref(false);

  const tabsList = computed(() => {
    return [
      {
        icon: UiIconUser,
        label: "Карта счета",
        component: TabGeneral,
      },
      {
        icon: UiIconHistory,
        label: "История",
        component: TabHistory,
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

    if (normalized === "1" || normalized === "history") return 1;
    return 0;
  };

  const handleActiveTab = async (tabIndex: number) => {
    if (tabIndex !== 0 && tabIndex !== 1) return;

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

  const formattedBalance = computed(() => {
    const parsedBalance = Number(accountData.balance);

    if (Number.isFinite(parsedBalance)) {
      return parsedBalance.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    return String(accountData.balance ?? "0.00");
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

  .account-page__balance-card {
    border-radius: 12px;
    border: 1px solid var(--color-stroke-ui-light);
    background: color-mix(in srgb, var(--ui-background-card) 74%, transparent);
    padding: 10px 12px;
    min-width: 180px;
  }

  .account-page__balance-label {
    color: var(--ui-text-secondary);
  }

  .account-page__balance-value {
    margin-top: 4px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--ui-text-main);
    font-size: 22px;
    font-weight: 700;
    line-height: 1.1;
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

    .account-page__balance-card {
      width: 100%;
      min-width: 0;
    }
  }

  @media (max-width: 640px) {
    .account-page {
      gap: 10px;
    }

    .account-page__balance-value {
      font-size: 18px;
    }

    .account-layout__content {
      padding: 8px;
    }
  }
</style>
