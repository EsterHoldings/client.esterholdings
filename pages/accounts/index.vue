<template>
  <PageStructureDefault>
    <template #header>
      <div class="accounts-header">
        <UiTextH4 class="accounts-header__title text-[var(--ui-text-main)]">
          {{ t("cabinet.accounts.title") }}
        </UiTextH4>

        <div class="accounts-header__actions">
          <UiButtonDefault
            state="success--outline"
            class="new-account-btn"
            @click="handleClickCreateNewAccount">
            <UiIconPlus class="mr-2 fill-[var(--ui-text-main)]" />
            <span class="whitespace-nowrap">{{ createAccountLabel }}</span>
          </UiButtonDefault>
        </div>
      </div>
    </template>

    <template #content>
      <AccountsPanel />
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
  import AccountsCreateNew from "~/pages/accounts/components/AccountsCreateNew.vue";
  import AccountsPanel from "~/pages/accounts/components/AccountsPanel.vue";

  import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";

  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconPlus from "~/components/ui/UiIconPlus.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";

  import { definePageMeta, useRoute, useRouter } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";
  import { computed, inject, onMounted, watch } from "vue";

  definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });

  const { t } = useI18n({ useScope: "global" });
  const { openModal } = inject("modalControl") as { openModal: Function };
  const route = useRoute();
  const router = useRouter();

  const queryValueToBoolean = (value: unknown): boolean => {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
  };

  const clearOpenCreateQuery = async () => {
    if (route.query?.openCreate === undefined) return;
    const nextQuery = { ...route.query };
    delete nextQuery.openCreate;
    await router.replace({ query: nextQuery });
  };

  const maybeOpenCreateFromQuery = async () => {
    if (!queryValueToBoolean(route.query?.openCreate)) return;

    handleClickCreateNewAccount();
    await clearOpenCreateQuery();
  };

  onMounted(async () => {
    await maybeOpenCreateFromQuery();
  });

  watch(
    () => route.query?.openCreate,
    async () => {
      await maybeOpenCreateFromQuery();
    }
  );

  const handleClickCreateNewAccount = () => {
    openModal(AccountsCreateNew, {
      title: t("cabinet.accounts.accounts-form.title"),
    });
  };

  const resolveText = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const createAccountLabel = computed(() => resolveText("cabinet.accounts.openNew", "Open new account"));
</script>

<style scoped>
  .accounts-header {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 12px;
  }

  .accounts-header__title {
    min-width: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .accounts-header__actions {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .new-account-btn {
    flex-shrink: 0;
  }

  @media (min-width: 640px) {
    .accounts-header {
      padding: 0;
    }
  }

  @media (max-width: 639px) {
    .accounts-header {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
      padding: 8px 4px 4px;
    }

    .accounts-header__actions,
    .new-account-btn {
      width: 100%;
    }

    .new-account-btn {
      min-height: 44px;
      justify-content: center;
    }
  }
</style>
