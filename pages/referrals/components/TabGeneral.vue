<template>
  <div class="flex flex-col gap-5">
    <div class="grid gap-5 lg:grid-cols-[2fr_1fr]">
      <PanelDefault>
        <div class="grid gap-4 p-4 md:grid-cols-[1.4fr_1fr]">
          <div class="flex flex-col gap-3">
            <UiTextH4 class="text-[var(--ui-text-main)]">
              {{ t("cabinet.referrals.general.linkTitle") }}
            </UiTextH4>

            <div class="rounded-xl border border-[var(--color-stroke-ui-light)] bg-[var(--color-stroke-ui-dark)] p-3">
              <UiTextSmall class="text-[var(--ui-text-secondary)]">
                {{ t("cabinet.referrals.general.linkHint") }}
              </UiTextSmall>
              <UiTextH5
                class="mt-2 relative inline-flex w-full items-center rounded-lg bg-[var(--ui-background-sidebar)] px-3 py-2.5 pr-10"
              >
                <UiTextSmall
                  ref="referralText"
                  class="inline-block w-full overflow-hidden text-ellipsis whitespace-nowrap text-[var(--ui-text-main)]"
                >
                  {{ referralLink }}
                </UiTextSmall>
                <button
                  type="button"
                  class="absolute right-2.5 flex items-center justify-center text-[var(--ui-text-main)] transition hover:opacity-80"
                  :title="t('cabinet.referrals.general.copy')"
                  @click="copyReferral"
                >
                  <UiIconCopy :title="t('cabinet.referrals.general.copy')" />
                </button>
              </UiTextH5>

              <div class="mt-3 flex flex-wrap items-center gap-3">
                <UiButtonDefault state="info--small" @click="copyReferral">
                  {{ t("cabinet.referrals.general.copyButton") }}
                </UiButtonDefault>
                <a
                  :href="telegramShareLink"
                  target="_blank"
                  rel="noreferrer"
                  class="inline-flex items-center gap-2 rounded-lg border border-[var(--color-stroke-ui-light)] px-3 py-2 text-sm text-[var(--ui-text-main)] transition hover:bg-[var(--color-stroke-ui-dark)]"
                >
                  <UiIconInfo name="telegram" :title="t('cabinet.referrals.general.share')" />
                  {{ t("cabinet.referrals.general.share") }}
                </a>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-center justify-center gap-3 rounded-xl border border-[var(--color-stroke-ui-light)] bg-[var(--color-stroke-ui-dark)] p-3">
            <UiQRCode :link="referralLink" />
            <UiTextSmall class="text-center text-[var(--ui-text-secondary)]">
              {{ t("cabinet.referrals.general.qrHint") }}
            </UiTextSmall>
          </div>
        </div>
      </PanelDefault>

      <PanelDefault>
        <div class="flex h-full flex-col gap-4 p-4">
          <UiTextH4 class="text-[var(--ui-text-main)]">
            {{ t("cabinet.referrals.general.summaryTitle") }}
          </UiTextH4>
          <div class="grid grid-cols-2 gap-3">
            <div class="stat-card">
              <UiTextSmall class="text-[var(--ui-text-secondary)]">
                {{ t("cabinet.referrals.general.totalEarned") }}
              </UiTextSmall>
              <UiTextH5 class="text-[var(--ui-text-main)]">${{ summary.totalEarned.toLocaleString() }}</UiTextH5>
            </div>
            <div class="stat-card">
              <UiTextSmall class="text-[var(--ui-text-secondary)]">
                {{ t("cabinet.referrals.general.activeReferrals") }}
              </UiTextSmall>
              <UiTextH5 class="text-[var(--ui-text-main)]">{{ summary.active }}</UiTextH5>
            </div>
            <div class="stat-card">
              <UiTextSmall class="text-[var(--ui-text-secondary)]">
                {{ t("cabinet.referrals.general.pendingPayouts") }}
              </UiTextSmall>
              <UiTextH5 class="text-[var(--ui-text-main)]">${{ summary.pendingPayouts.toLocaleString() }}</UiTextH5>
            </div>
            <div class="stat-card">
              <UiTextSmall class="text-[var(--ui-text-secondary)]">
                {{ t("cabinet.referrals.general.conversion") }}
              </UiTextSmall>
              <UiTextH5 class="text-[var(--ui-text-main)]">{{ summary.conversion }}%</UiTextH5>
            </div>
          </div>
        </div>
      </PanelDefault>
    </div>

    <PanelDefault>
      <div class="flex flex-col gap-5 p-4">
        <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <UiTextH4 class="text-[var(--ui-text-main)]">{{ t("cabinet.referrals.general.levelsTitle") }}</UiTextH4>
          <UiTextSmall class="text-[var(--ui-text-secondary)]">
            {{ t("cabinet.referrals.general.levelHint") }}
          </UiTextSmall>
        </div>
        <div class="space-y-2">
          <div
            v-for="level in levels"
            :key="level.id"
            class="flex items-center justify-between rounded-lg border border-[var(--color-stroke-ui-light)] bg-[var(--color-stroke-ui-dark)] px-3 py-2"
          >
            <span class="text-[var(--ui-text-main)]">{{ level.label }}</span>
            <UiTextSmall class="text-[var(--ui-text-secondary)]">{{ level.percent }}%</UiTextSmall>
          </div>
        </div>
        <YourLevelProgress :current="progress.current" :total="progress.total" />
      </div>
    </PanelDefault>

    <PanelDefault>
      <div class="flex flex-col gap-4 p-4">
        <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <UiTextH4 class="text-[var(--ui-text-main)]">{{ t("cabinet.referrals.general.listTitle") }}</UiTextH4>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="tab in filters"
              :key="tab.value"
              type="button"
              class="rounded-lg border px-3 py-1.5 text-sm transition"
              :class="
                tab.value === activeFilter
                  ? 'border-[var(--ui-primary-main)] bg-[var(--ui-primary-main)] text-white'
                  : 'border-[var(--color-stroke-ui-light)] text-[var(--ui-text-main)] hover:bg-[var(--color-stroke-ui-dark)]'
              "
              @click="activeFilter = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <UiInput v-model="search" :placeholder="t('cabinet.referrals.general.searchPlaceholder')">
            <template #icon-left>
              <UiIconSearch />
            </template>
          </UiInput>

          <div class="space-y-2">
            <div
              v-for="referral in filteredReferrals"
              :key="referral.id"
              class="flex flex-col gap-2 rounded-xl border border-[var(--color-stroke-ui-light)] bg-[var(--color-stroke-ui-dark)] px-3 py-3 md:flex-row md:items-center md:justify-between"
            >
              <div class="flex items-center gap-3">
                <UiImageCircle :src="referral.avatar" alt="User" size="36" />
                <div>
                  <div class="text-sm font-semibold text-[var(--ui-text-main)]">{{ referral.name }}</div>
                  <UiTextSmall class="text-[var(--ui-text-secondary)]">{{ referral.email }}</UiTextSmall>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-4 md:justify-end">
                <UiTextSmall class="text-[var(--ui-text-secondary)]">
                  {{ t("cabinet.referrals.general.referralsCount") }}: {{ referral.referralsCount }}
                </UiTextSmall>
                <UiTextSmall class="text-[var(--ui-text-secondary)]">
                  {{ t("cabinet.referrals.general.earned") }}: ${{ referral.amount.toLocaleString() }}
                </UiTextSmall>
                <UiTextSmall class="text-[var(--ui-text-secondary)]">
                  {{ t("cabinet.referrals.general.tier") }}: {{ referral.tier }}
                </UiTextSmall>
                <UiBadge
                  :outline="true"
                  :state="referral.status === 'active' ? 'success' : referral.status === 'pending' ? 'warning' : 'danger'"
                  class="!py-1 !px-2"
                >
                  {{ statusLabel(referral.status) }}
                </UiBadge>
              </div>
            </div>

            <div
              v-if="filteredReferrals.length === 0"
              class="rounded-xl border border-[var(--color-stroke-ui-light)] bg-[var(--color-stroke-ui-dark)] px-4 py-6 text-center text-[var(--ui-text-secondary)]"
            >
              {{ t("cabinet.referrals.general.empty") }}
            </div>
          </div>
        </div>
      </div>
    </PanelDefault>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import UiBadge from "~/components/ui/UiBadge.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconCopy from "~/components/ui/UiIconCopy.vue";
import UiIconInfo from "~/components/ui/UiIconInfo.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";
import UiImageCircle from "~/components/ui/UiImageCircle.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiQRCode from "~/components/ui/UiQRCode.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import YourLevelProgress from "./YourLevelProgress.vue";

const { t } = useI18n({ useScope: "global" });
const toast = useToast();

const referralLink = "https://stage.esterholdings.website?ref=w23dhDf73l4fcs1";
const referralText = ref<HTMLElement | null>(null);

const levels = reactive([
  { id: 1, label: t("cabinet.referrals.general.level", { level: 1 }), percent: 10 },
  { id: 2, label: t("cabinet.referrals.general.level", { level: 2 }), percent: 5 },
  { id: 3, label: t("cabinet.referrals.general.level", { level: 3 }), percent: 3 },
]);

const progress = reactive({ current: 150, total: 200 });

const referrals = reactive([
  {
    id: "2d1223fr23d23ed",
    name: "Anton Andriyenko",
    email: "anton@example.com",
    referralsCount: 3,
    amount: 1249,
    status: "active",
    tier: "Gold",
    avatar: "/images/user1.png",
  },
  {
    id: "32dij239dij239di",
    name: "Victor Dolgiy",
    email: "victor@example.com",
    referralsCount: 1,
    amount: 145,
    status: "pending",
    tier: "Silver",
    avatar: "/images/user1.png",
  },
  {
    id: "34v3443v23j3dkk3f",
    name: "Nick Naumenko",
    email: "nick@example.com",
    referralsCount: 8,
    amount: 45249,
    status: "active",
    tier: "Platinum",
    avatar: "/images/user1.png",
  },
  {
    id: "34v3443v23j3dkk3g",
    name: "Anna Abramova",
    email: "anna@example.com",
    referralsCount: 5,
    amount: 5541,
    status: "active",
    tier: "Silver",
    avatar: "/images/user1.png",
  },
  {
    id: "f34f43jg34gg3kk333",
    name: "Igor Baystryuk",
    email: "igor@example.com",
    referralsCount: 2,
    amount: 750,
    status: "blocked",
    tier: "Bronze",
    avatar: "/images/user1.png",
  },
]);

const filters = computed(() => [
  { value: "all", label: t("cabinet.referrals.general.filter.all") },
  { value: "active", label: t("cabinet.referrals.general.filter.active") },
  { value: "pending", label: t("cabinet.referrals.general.filter.pending") },
  { value: "blocked", label: t("cabinet.referrals.general.filter.blocked") },
]);
const activeFilter = ref("all");
const search = ref("");

const filteredReferrals = computed(() => {
  const term = search.value.toLowerCase();
  return referrals.filter((item) => {
    const matchesFilter = activeFilter.value === "all" ? true : item.status === activeFilter.value;
    const matchesSearch = [item.name, item.email, item.tier].some((field) => field.toLowerCase().includes(term));
    return matchesFilter && matchesSearch;
  });
});

const summary = computed(() => {
  const totalEarned = referrals.reduce((acc, r) => acc + r.amount, 0);
  const active = referrals.filter((r) => r.status === "active").length;
  const pendingPayouts = referrals.filter((r) => r.status === "pending").reduce((acc, r) => acc + r.amount, 0);
  const conversion = referrals.length ? Math.min(100, Math.round((active / referrals.length) * 100)) : 0;
  return { totalEarned, active, pendingPayouts, conversion };
});

const copyReferral = async () => {
  const text = referralText.value?.textContent ?? referralLink;
  try {
    await navigator.clipboard.writeText(text);
    toast.success(t("cabinet.referrals.general.copied"));
  } catch (err) {
    toast.error(t("cabinet.referrals.general.copyError"));
  }
};

const telegramShareLink = computed(() => {
  const url = encodeURIComponent(referralLink);
  const text = encodeURIComponent(t("cabinet.referrals.general.shareText"));
  return `https://t.me/share/url?url=${url}&text=${text}`;
});

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    active: t("cabinet.referrals.general.status.active"),
    pending: t("cabinet.referrals.general.status.pending"),
    blocked: t("cabinet.referrals.general.status.blocked"),
  };
  return map[status] ?? status;
};
</script>

<style scoped>
.stat-card {
  border: 1px solid var(--color-stroke-ui-light);
  border-radius: 10px;
  padding: 12px;
  background: var(--color-stroke-ui-dark);
}
</style>
