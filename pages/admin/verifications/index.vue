<template>
  <PageStructureDefault>
    <template #header>
      <div class="flex flex-col gap-1 text-[var(--ui-text-main)]">
        <UiTextH4>{{ t("admin.verifications.index.title") }}</UiTextH4>
        <UiTextParagraph>{{ t("admin.verifications.index.subtitle") }}</UiTextParagraph>
      </div>
    </template>

    <template #content>
      <PageStructureContent>
        <template #top>
          <div class="flex w-full flex-col gap-2 md:flex-row md:items-center">
            <div class="flex w-full flex-1 min-w-[260px] items-center gap-2">
              <UiInput
                class="w-full"
                @input="handleInputSearch"
                :value="searchInput"
                :placeholder="t('admin.verifications.searchPlaceholder')"
              >
                <template #icon-left>
                  <UiIconSearch />
                </template>
              </UiInput>

              <UiButtonDefault
                state="info--small"
                class="!w-[44px]"
                @click="handleClickUpdate"
              >
                <UiIconUpdate :spinning="isLoading" />
              </UiButtonDefault>
            </div>

            <div class="flex w-full flex-1 items-center gap-2 md:w-auto md:flex-none md:justify-end">
              <ViewModeToggle
                class="w-full sm:w-auto"
                bordered
                :modelValue="viewMode"
                :options="viewOptions"
                @update:modelValue="viewMode = $event"
              />
            </div>
          </div>
        </template>
        <template #content>
          <VerificationsPanel ref="panelRef" :search-filter="searchApplied" :view-mode="viewMode" @loading="isLoading = $event" />
        </template>
      </PageStructureContent>
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
import {useI18n} from "vue-i18n";
import {definePageMeta} from "~/.nuxt/imports";

import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import VerificationsPanel from "~/pages/admin/verifications/components/VerificationsPanel.vue";
import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
import PageStructureContent from "~/components/block/pages/PageStructureContent.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import ViewModeToggle from "~/components/block/controls/ViewModeToggle.vue";
import { ref, h, watch } from "vue";

definePageMeta({
  middleware: ["admin-middleware"],
});

const {t} = useI18n({useScope: "global"});

const panelRef = ref<InstanceType<typeof VerificationsPanel> | null>(null);
const isLoading = ref(false);

const searchInput = ref("");
const searchApplied = ref("");
let searchTimer: number | undefined;

const viewMode = ref<"table" | "cards" | "full">("table");
const viewOptions = [
  {
    value: "table" as const,
    label: t("cabinet.billing.view.list") || "List",
    icon: {
      render() {
        return h(
          "svg",
          {
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          },
          [
            h("line", { x1: "8", y1: "6", x2: "21", y2: "6" }),
            h("line", { x1: "3", y1: "6", x2: "4", y2: "6" }),
            h("line", { x1: "8", y1: "12", x2: "21", y2: "12" }),
            h("line", { x1: "3", y1: "12", x2: "4", y2: "12" }),
            h("line", { x1: "8", y1: "18", x2: "21", y2: "18" }),
            h("line", { x1: "3", y1: "18", x2: "4", y2: "18" }),
          ]
        );
      },
    },
  },
  {
    value: "cards" as const,
    label: t("cabinet.billing.view.cards") || "Cards",
    icon: {
      render() {
        return h(
          "svg",
          {
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          },
          [
            h("rect", { x: "3", y: "3", width: "7", height: "7", rx: "1" }),
            h("rect", { x: "14", y: "3", width: "7", height: "7", rx: "1" }),
            h("rect", { x: "3", y: "14", width: "7", height: "7", rx: "1" }),
            h("rect", { x: "14", y: "14", width: "7", height: "7", rx: "1" }),
          ]
        );
      },
    },
  },
  {
    value: "full" as const,
    label: t("cabinet.billing.view.full") || "Full width",
    icon: {
      render() {
        return h(
          "svg",
          {
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          },
          [
            h("rect", { x: "3", y: "6", width: "18", height: "4", rx: "1" }),
            h("rect", { x: "3", y: "14", width: "18", height: "4", rx: "1" }),
          ]
        );
      },
    },
  },
];

const handleInputSearch = (value: string) => {
  searchInput.value = value;
};

watch(searchInput, (val) => {
  clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    searchApplied.value = val.trim();
  }, 400);
});

const handleClickUpdate = () => {
  panelRef.value?.reload();
};
</script>

<style lang="scss" scoped></style>
