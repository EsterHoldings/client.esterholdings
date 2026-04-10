<!-- pages/accounts/index.vue -->
<template>
  <PageStructureDefault>
    <template #header>
      <div class="accounts-header">
        <UiTextH4 class="accounts-header__title text-[var(--ui-text-main)]">
          {{ t("cabinet.accounts.title") }}
        </UiTextH4>

        <div class="accounts-header__actions">
          <UiButtonDefault
            v-if="canCreateAccount"
            state="info--small"
            class="new-account-btn"
            @click="handleClickCreateNewAccount">
            <UiIconPlus class="mr-2 fill-[var(--ui-text-main)]" />
            <span class="whitespace-nowrap">{{ createAccountLabel }}</span>
          </UiButtonDefault>
          <UiButtonDefault
            v-else
            state="info--outline"
            class="new-account-btn"
            @click="handleClickGoToVerification">
            <span class="whitespace-nowrap">{{ verifyActionLabel }}</span>
          </UiButtonDefault>
        </div>
      </div>
    </template>

    <template #content>
      <AccountsPanel
        :can-create-account="canCreateAccount"
        :account-creation-blocked-reason="accountCreationBlockedReason"
        :is-eligibility-loaded="isEligibilityLoaded" />
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

  import { definePageMeta, navigateTo, useLocalePath, useRoute, useRouter } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";
  import { computed, inject, onMounted } from "vue";
  import useAccountCreationEligibility from "~/composables/useAccountCreationEligibility";

  definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });

  const { t } = useI18n({ useScope: "global" });
  const { openModal } = inject("modalControl") as { openModal: Function };
  const { canCreateAccount, isEligibilityLoaded, refreshAccountCreationEligibility } = useAccountCreationEligibility();
  const localePath = useLocalePath();
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

    if (canCreateAccount.value) {
      handleClickCreateNewAccount();
    } else {
      await handleClickGoToVerification();
    }

    await clearOpenCreateQuery();
  };

  onMounted(async () => {
    await refreshAccountCreationEligibility();
    await maybeOpenCreateFromQuery();
  });

  const handleClickCreateNewAccount = () => {
    if (!canCreateAccount.value) return;
    openModal(AccountsCreateNew, {
      title: t("cabinet.accounts.accounts-form.title"),
    });
  };

  const handleClickGoToVerification = async () => {
    await navigateTo(profileVerificationLink.value);
  };

  const resolveText = (key: string, fallback: string): string => {
    const translated = t(key);
    return translated === key ? fallback : translated;
  };

  const createAccountLabel = computed(() => resolveText("cabinet.accounts.openNew", "Open new account"));
  const verifyActionLabel = computed(() =>
    resolveText("cabinet.dashboard.accountVerification.goToVerification", "Перейти к верификации")
  );
  const profileVerificationLink = computed(() => localePath({ path: "/profile", query: { tab: "verification" } }));

  const accountCreationBlockedReason = computed(() =>
    resolveText(
      "cabinet.accounts.openBlocked",
      "Открытие счета будет доступно после верификации данных профиля и документов."
    )
  );
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
</style>

<!--<template>-->
<!--  <UiContainer>-->
<!--    <div class="mb-5 mt-5 flex items-center justify-between">-->
<!--      <UiTextH4 class="text-[var(&#45;&#45;ui-text-main)]">{{ t('cabinet.accounts.title') }}</UiTextH4>-->
<!--      <UiButtonDefault state="info" @click="handleClickCreateNewAccount">-->
<!--        <UiIconPlus class="mr-2 fill-[var(&#45;&#45;ui-text-main)]" />-->
<!--        <span>New account</span>-->
<!--      </UiButtonDefault>-->
<!--    </div>-->
<!--    <div>-->
<!--      <AccountsPanel />-->
<!--    </div>-->
<!--  </UiContainer>-->
<!--</template>-->

<!--<script lang="ts" setup>-->
<!--import AccountsCreateNew from "~/pages/accounts/components/AccountsCreateNew.vue";-->
<!--import AccountsPanel from '~/pages/accounts/components/AccountsPanel.vue'-->
<!--import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";-->
<!--import UiContainer from '~/components/ui/UiContainer.vue'-->
<!--import UiIconPlus from "~/components/ui/UiIconPlus.vue";-->
<!--import UiTextH4 from '~/components/ui/UiTextH4.vue'-->
<!--import { definePageMeta } from '~/.nuxt/imports'-->
<!--import { useI18n } from 'vue-i18n'-->
<!--import {inject} from "vue";-->

<!--definePageMeta({ layout: 'cabinet', middleware: ['auth-client', 'client-check-auth'] })-->

<!--const { t } = useI18n({ useScope: 'global' })-->
<!--const { openModal } = inject("modalControl") as { openModal: Function };-->

<!--const handleClickCreateNewAccount = () =>-->
<!--    openModal(AccountsCreateNew, {-->
<!--      title: t("cabinet.accounts.accounts-form.title"),-->
<!--    });-->
<!--</script>-->

<!--<style scoped>-->
<!--.icon-update {-->
<!--  @apply h-[14px] w-[14px] mr-[10px] cursor-pointer transition-transform duration-200;-->
<!--}-->
<!--.icon-update:hover {-->
<!--  @apply animate-[wiggle_.2s_ease];-->
<!--}-->
<!--.icon-update.spinning {-->
<!--  @apply animate-spin;-->
<!--}-->

<!--.balance-sum { @apply cursor-pointer; }-->
<!--.wiggle:hover { @apply animate-[wiggle_.3s_ease]; }-->

<!--@keyframes wiggle {-->
<!--  0%   { transform: translateX(0); }-->
<!--  20%  { transform: translateX(-2px); }-->
<!--  40%  { transform: translateX(2px); }-->
<!--  60%  { transform: translateX(-2px); }-->
<!--  80%  { transform: translateX(2px); }-->
<!--  100% { transform: translateX(0); }-->
<!--}-->
<!--</style>-->
