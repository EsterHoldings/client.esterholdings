<template>
  <div class="admin-referrals-tab flex flex-col gap-3 text-[var(--ui-text-main)]">
    <div class="flex flex-col gap-2">
      <UiTextH5>{{ t("cabinet.referrals.general.listTitle") }}</UiTextH5>
      <div class="flex flex-wrap items-center gap-2">
        <UiInput v-model="search" :placeholder="t('cabinet.referrals.general.searchPlaceholder')" class="min-w-[200px] flex-1">
          <template #icon-left>
            <UiIconSearch />
          </template>
        </UiInput>
        <UiButtonDefault state="info--small" class="!w-[44px]" @click="reloadReferrals">
          <UiIconUpdate />
        </UiButtonDefault>
      </div>
      <div class="flex flex-wrap items-center gap-2 text-sm text-[var(--ui-text-secondary)] w-full lg:flex-nowrap">
        <div class="flex flex-wrap items-center gap-2 lg:flex-nowrap">
          <button
            v-for="opt in sortOptions"
            :key="opt.value"
            type="button"
            class="rounded-lg border px-3 py-1.5 transition truncate"
            :class="sortBy === opt.value ? 'border-[var(--ui-primary-main)] bg-[var(--ui-primary-main)] text-white' : 'border-[var(--color-stroke-ui-light)] text-[var(--ui-text-main)] hover:bg-[var(--color-stroke-ui-dark)]'"
            @click="sortBy = opt.value"
          >
            {{ opt.text }}
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2 lg:flex-nowrap">
          <button
            v-for="lvl in levelFilters"
            :key="lvl.value"
            type="button"
            class="rounded-lg border px-3 py-1.5 transition truncate"
            :class="activeLevel === lvl.value ? 'border-[var(--ui-primary-main)] bg-[var(--ui-primary-main)] text-white' : 'border-[var(--color-stroke-ui-light)] text-[var(--ui-text-main)] hover:bg-[var(--color-stroke-ui-dark)]'"
            @click="activeLevel = lvl.value"
          >
            {{ lvl.text }}
          </button>
        </div>
      </div>
    </div>

    <div class="relative flex flex-col gap-2">
      <div
        v-if="isLoadingList"
        class="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[2px] bg-black/20 rounded-2xl"
      >
        <UiIconSpinnerDefault />
      </div>
      <div v-for="item in paginatedReferrals" :key="item.id" class="referral-card-full">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3 min-w-0">
            <div class="h-10 w-10 rounded-full bg-[var(--color-stroke-ui-dark)] grid place-items-center text-sm font-semibold">
              {{ item.initials }}
            </div>
            <div class="min-w-0">
              <div class="font-semibold truncate">{{ item.name }}</div>
              <UiTextSmall class="text-[var(--ui-text-secondary)] truncate">{{ item.email }}</UiTextSmall>
              <UiTextSmall class="text-[var(--ui-text-secondary)]">
                {{ t("cabinet.referrals.general.levelLabel", { level: item.level }) }}
              </UiTextSmall>
            </div>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <UiBadge :state="statusMap[item.status]" outline class="!px-2 !py-1">{{ statusLabel(item.status) }}</UiBadge>
            <div class="text-[var(--ui-text-secondary)]">
              {{ t("cabinet.referrals.general.earned") }}: ${{ item.earned.toLocaleString() }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="sortedReferrals.length === 0" class="referral-card-full text-center text-[var(--ui-text-secondary)]">
        {{ t("cabinet.referrals.general.empty") }}
      </div>

      <PaginationDefault
        :isLoading="isLoadingList"
        :perPage="perPage"
        :page="page"
        :totalRows="sortedReferrals.length"
        @pageChange="handlePageChange"
        @perPageChange="handlePerPageChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiBadge from "~/components/ui/UiBadge.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";

const props = defineProps({
  userData: {
    type: Object,
    default: {}
  },
  clientId: {
    type: String,
    default: ""
  }
})

const { t } = useI18n({ useScope: "global" });

const referrals = ref(
  Array.from({ length: 40 }).map((_, idx) => {
    const names = [
      ["Anna", "Kovalenko", 1, "active"],
      ["John", "Doe", 2, "pending"],
      ["Mei", "Lin", 3, "inactive"],
      ["Carlos", "Ruiz", 1, "active"],
    ];
    const [first, last, level, status] = names[idx % names.length];
    const name = `${first} ${last}`;
    const initials = `${first[0]}${last[0]}`.toUpperCase();
    return {
      id: idx + 1,
      name,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${idx}@example.com`,
      level,
      status,
      earned: 50 + (idx % 10) * 120,
      initials,
    };
  }),
);

const statusMap: Record<string, string> = { active: "success", pending: "warning", inactive: "info" };
const statusLabel = (status: string) =>
  ({
    active: t("cabinet.referrals.general.status.active", "Active"),
    pending: t("cabinet.referrals.general.status.pending", "Pending"),
    inactive: t("cabinet.referrals.general.status.inactive", "Inactive"),
  }[status] || status);

const search = ref("");
const sortBy = ref("earned");
const activeLevel = ref("all");

const sortOptions = [
  { id: "earned", value: "earned", text: t("cabinet.referrals.general.sortEarned", "By earnings") },
  { id: "name", value: "name", text: t("cabinet.referrals.general.sortName", "By name") },
  { id: "active", value: "active", text: t("cabinet.referrals.general.sortActive", "Active") },
  { id: "pending", value: "pending", text: t("cabinet.referrals.general.sortPending", "Pending") },
  { id: "inactive", value: "inactive", text: t("cabinet.referrals.general.sortInactive", "Inactive") },
];

const levelFilters = [
  { id: "all", value: "all", text: t("cabinet.referrals.general.filterAll") },
  { id: "level1", value: "level1", text: t("cabinet.referrals.general.filterLevel1") },
  { id: "level2", value: "level2", text: t("cabinet.referrals.general.filterLevel2") },
  { id: "level3", value: "level3", text: t("cabinet.referrals.general.filterLevel3") },
];

const isLoadingList = ref(false);

const sortedReferrals = computed(() => {
  const term = search.value.toLowerCase();
  const filtered = referrals.value.filter((r) => {
    const levelMatch = activeLevel.value === "all" || `level${r.level}` === activeLevel.value;
    const searchMatch = !term || r.name.toLowerCase().includes(term) || r.email.toLowerCase().includes(term);
    return levelMatch && searchMatch;
  });
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy.value === "name") return a.name.localeCompare(b.name);
    if (sortBy.value === "active" || sortBy.value === "pending" || sortBy.value === "inactive") {
      const order = (status: string) => (status === sortBy.value ? 0 : 1);
      return order(a.status) - order(b.status);
    }
    return b.earned - a.earned;
  });
  return sorted;
});

const page = ref(1);
const perPage = ref(5);

const paginatedReferrals = computed(() => {
  const start = (page.value - 1) * perPage.value;
  return sortedReferrals.value.slice(start, start + perPage.value);
});

watch(sortedReferrals, () => {
  if (page.value > Math.ceil(sortedReferrals.value.length / perPage.value)) page.value = 1;
});

const reloadReferrals = () => {
  isLoadingList.value = true;
  setTimeout(() => {
    isLoadingList.value = false;
  }, 1000);
};

watch([search, sortBy, activeLevel], () => {
  isLoadingList.value = true;
  setTimeout(() => {
    isLoadingList.value = false;
  }, 500);
});

const handlePageChange = (next: number) => {
  if (next < 1) return;
  page.value = next;
};

const handlePerPageChange = (next: number) => {
  if (!next || next <= 0) return;
  perPage.value = next;
  page.value = 1;
};
</script>

<style lang="scss" scoped>
.referral-card-full {
  width: 100%;
  border-radius: 12px;
  background: var(--ui-background-panel);
  border: 1px solid var(--color-stroke-ui-light);
  padding: 12px 14px;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.referral-card-full:hover {
  background: var(--color-stroke-ui-dark);
}
</style>
